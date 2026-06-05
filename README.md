# Polyglot Devbox

A reusable Ubuntu development container so the whole team — including Windows
developers — gets the same Linux toolchain. Installs **Go, Node.js
(React/Next), Python + uv**, the **Postgres** client, plus `git`, `gh`,
`golangci-lint`, and build tools. A Postgres server runs as a sibling
container.

No Nix, no Tailscale — just the tools, installed directly.

## What's inside

| Tool | Provided by | Default version |
|---|---|---|
| Go | official tarball | 1.25.7 |
| Node.js + npm/corepack (yarn/pnpm) | NodeSource | 24.x (LTS) |
| Python 3 + venv + `uv` | Ubuntu + Astral | 3.12 |
| Postgres **server** | `postgres` image (compose service) | 16 |
| Postgres **client** (`psql`) | Ubuntu | matches host |
| `git`, `gh`, `golangci-lint`, `ripgrep`, `jq`, `make`, build-essential | apt / installers | — |

Versions are build args — change them in `.env` and rebuild. See `.env.example`.

## Requirements

- **Docker Desktop** (on Windows: the WSL2 backend) or Docker Engine + compose v2.
- That's it. Everything else is in the image.

## Quick start

> **Windows tip:** clone into **WSL2** (e.g. `\\wsl$\Ubuntu\home\you\...`) and run
> from a WSL2 shell. Bind-mount performance is far better than from a `C:\` path.

```bash
cp .env.example .env          # optional: tweak versions, ports, DB creds
./devbox build                # build the image (one-time, a few minutes)
./devbox up                   # start the dev container + Postgres
./devbox shell                # open a shell inside the box

# inside the box:
go version && node --version && python3 --version && psql --version
```

On Windows use the PowerShell helper instead: `.\devbox.ps1 build`, `.\devbox.ps1 up`, `.\devbox.ps1 shell`.

Prefer to work in your editor? See [VS Code Dev Containers](#vs-code-dev-containers).

## VS Code Dev Containers

This repo works out of the box with Microsoft's **Dev Containers** extension
(the same mechanism Cursor and GitHub Codespaces use), so a teammate can get
the full environment without touching the command line.

**Prerequisites**

- Docker Desktop installed and **running** (WSL2 backend on Windows).
- The **Dev Containers** extension: `ms-vscode-remote.remote-containers`
  (Cursor ships the same capability built in).

**Open it**

1. Open the `devbox/` folder in VS Code / Cursor.
2. Command Palette → **"Dev Containers: Reopen in Container"** (or click the
   prompt that pops up bottom-right).

**What happens** — the extension reads
[.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) and:

- brings up the **same Compose stack** as `./devbox up` — the `dev` container
  *and* the `db` (Postgres) service together (not a separate one-off container);
- attaches the editor to the `dev` container as the non-root **`dev`** user,
  opened at **`/workspace`**;
- auto-installs the Go, Python, ESLint, Prettier, Tailwind, and Docker
  extensions **inside** the container — your host editor stays untouched;
- builds the image on first launch (slow once, cached afterward);
- runs `docker compose stop` when you close the window, so nothing is left
  running.

The integrated terminal, language servers, and `psql` / `DATABASE_URL` all work
exactly as they do from `./devbox shell`.

**Using it with a real project** — opening the `devbox/` folder mounts the
devbox folder *itself* at `/workspace`. To develop **your** code instead, use
one of the two approaches in
[Developing your project in here](#developing-your-project-in-here): point
`WORKSPACE` at your repo, or copy `.devcontainer/` (plus `Dockerfile` and
`docker-compose.yml`) into your repo so "Reopen in Container" works there.

## Developing your project in here

By default the container mounts **this folder** at `/workspace`. Two ways to
work on an actual project:

1. **Point the box at your repo** — set `WORKSPACE` in `.env`:
   ```ini
   WORKSPACE=../my-app                       # relative to this folder
   WORKSPACE=/home/you/github/my-app         # Linux / WSL2 absolute
   WORKSPACE=C:/Users/you/github/my-app      # native Windows
   ```
   Then `./devbox up && ./devbox shell` drops you into your code at `/workspace`.

2. **Embed it** — copy the `.devcontainer/` folder (and `docker-compose.yml` +
   `Dockerfile`) into your repo so teammates get "Reopen in Container" there.

## Database

A Postgres server runs as the `db` service. From inside the dev container it's
reachable at host **`db:5432`**, and the environment already exposes:

- `DATABASE_URL=postgres://dev:dev@db:5432/app?sslmode=disable`
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` (so bare `psql` just connects)

From your host machine it's on `127.0.0.1:5432` (change via `POSTGRES_PORT`).

```bash
./devbox db                   # psql shell into the app database
./devbox tools                # optional Adminer web UI at http://localhost:8090
```

Data persists in the `devbox-pgdata` volume. `./devbox down` keeps it;
`./devbox nuke` deletes it.

## Reaching your dev servers from the host

Ports **3000** (web) and **8080** (api) are published. Bind your servers to
`0.0.0.0` so the host can reach them:

- Next.js: `npm run dev -- -H 0.0.0.0` (or `next dev -H 0.0.0.0`)
- Go: listen on `:8080` (all interfaces)

Add more ports under the `dev` service in `docker-compose.yml`.

## Notes

- **Python installs:** Ubuntu blocks system-wide `pip install` (PEP 668). Use a
  venv — `uv venv && source .venv/bin/activate`, or `python3 -m venv .venv`.
- **Caches persist:** Go module/build caches and the npm cache live in named
  volumes, so re-installs are fast across rebuilds.
- **File ownership:** the in-container `dev` user is uid 1000, matching most
  host users, so files you create stay owned by you on the host.
- `./devbox versions` prints the exact installed versions.

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | the toolchain image |
| `profile.d-devbox.sh` | shell PATH/env (Go, Node, Python, local bins) |
| `docker-compose.yml` | `dev` + `db` (+ optional `adminer`) services |
| `.env.example` | versions, ports, DB creds, workspace path |
| `.devcontainer/devcontainer.json` | VS Code / Cursor integration |
| `devbox` / `devbox.ps1` | helper wrappers (bash / PowerShell) |
