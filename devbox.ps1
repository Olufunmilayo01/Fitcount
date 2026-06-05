# Helper around docker compose for the polyglot devbox (Windows PowerShell).
#   .\devbox.ps1 build     build the image
#   .\devbox.ps1 up        start dev + db (detached)
#   .\devbox.ps1 shell     open a shell in the dev container
#   .\devbox.ps1 db        open psql against the Postgres service
#   .\devbox.ps1 tools     start optional extras (Adminer DB UI on :8090)
#   .\devbox.ps1 stop      stop containers (keeps data)
#   .\devbox.ps1 down      remove containers (keeps DB data)
#   .\devbox.ps1 nuke      remove containers AND volumes (DELETES DB data)
#   .\devbox.ps1 logs      follow logs
#   .\devbox.ps1 versions  print installed tool versions inside the box

param([Parameter(Position = 0)][string]$Command = "help",
      [Parameter(ValueFromRemainingArguments = $true)][string[]]$Rest)

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
$U = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "dev" }
$D = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "app" }

switch ($Command) {
    "build"    { docker compose build @Rest }
    "up"       { docker compose up -d @Rest }
    "shell"    { docker compose exec dev bash -l }
    "db"       { docker compose exec db psql -U $U -d $D }
    "tools"    { docker compose --profile tools up -d }
    "stop"     { docker compose stop }
    "down"     { docker compose down @Rest }
    "nuke"     { docker compose down -v }
    "logs"     { docker compose logs -f }
    "versions" { docker compose exec dev bash -lc 'go version; node --version; python3 --version; uv --version; psql --version; gh --version | head -1' }
    default    { Get-Content $MyInvocation.MyCommand.Path | Select-String '^#( |$)' | ForEach-Object { $_.Line -replace '^# ?', '' } }
}
