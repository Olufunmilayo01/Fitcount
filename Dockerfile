# syntax=docker/dockerfile:1
#
# Polyglot development container: Ubuntu 24.04 with Go, Node.js (for
# React/Next), Python, and the usual toolbelt installed directly (no Nix).
# Postgres runs as a separate compose service — this image carries the
# client (`psql`) only.
#
# Versions are build ARGs so they're easy to bump (see docker-compose.yml).
FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive
ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=1000
ARG GO_VERSION=1.25.7
ARG NODE_MAJOR=24
ARG GOLANGCI_LINT_VERSION=v1.62.2

# --- Base OS packages (Python 3.12 ships with Ubuntu 24.04) -----------------
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl wget gnupg git sudo openssh-client \
      build-essential make pkg-config \
      python3 python3-pip python3-venv python3-dev \
      postgresql-client \
      jq unzip zip ripgrep less vim-tiny locales \
    && sed -i 's/# en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen && locale-gen \
    && rm -rf /var/lib/apt/lists/*
ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# --- Go ---------------------------------------------------------------------
RUN arch="$(dpkg --print-architecture)" \
    && curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${arch}.tar.gz" -o /tmp/go.tgz \
    && tar -C /usr/local -xzf /tmp/go.tgz \
    && rm /tmp/go.tgz
ENV PATH=/usr/local/go/bin:$PATH

# --- Node.js (NodeSource) + corepack (npm/yarn/pnpm) ------------------------
RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && corepack enable \
    && rm -rf /var/lib/apt/lists/*

# --- uv (fast Python venv/package manager) ----------------------------------
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin sh

# --- GitHub CLI -------------------------------------------------------------
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
       -o /etc/apt/keyrings/githubcli.gpg \
    && chmod go+r /etc/apt/keyrings/githubcli.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli.gpg] https://cli.github.com/packages stable main" \
       > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# --- golangci-lint (best-effort; doesn't fail the build) --------------------
RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/HEAD/install.sh \
      | sh -s -- -b /usr/local/bin "${GOLANGCI_LINT_VERSION}" \
    || echo "WARN: golangci-lint ${GOLANGCI_LINT_VERSION} install skipped"

# --- Non-root developer user ------------------------------------------------
# Ubuntu 24.04 ships a default `ubuntu` user at uid 1000; remove it so `dev`
# can take uid 1000 (keeps bind-mounted file ownership matching the host user).
RUN { userdel -r ubuntu 2>/dev/null || true; } \
    && { groupdel ubuntu 2>/dev/null || true; } \
    && groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m -s /bin/bash ${USERNAME} \
    && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${USERNAME} \
    && chmod 0440 /etc/sudoers.d/${USERNAME}

# --- Shell env + cache dirs (owned by dev so named volumes inherit it) ------
COPY profile.d-devbox.sh /etc/profile.d/10-devbox.sh
RUN chmod 0644 /etc/profile.d/10-devbox.sh \
    && echo '. /etc/profile.d/10-devbox.sh' >> /etc/bash.bashrc \
    && install -d -o ${USERNAME} -g ${USERNAME} \
       /home/${USERNAME}/go/pkg/mod \
       /home/${USERNAME}/.cache/go-build \
       /home/${USERNAME}/.npm

ENV GOPATH=/home/${USERNAME}/go
WORKDIR /workspace
USER ${USERNAME}

# The container stays up; developers `exec` a shell in. Compose overrides this
# with the same command for clarity.
CMD ["sleep", "infinity"]
