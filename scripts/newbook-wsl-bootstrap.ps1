# NewBook no-USB bootstrap: Windows 11 -> Debian WSL2 (non-destructive)
# Run in an elevated PowerShell. Does not remove Windows or alter disk partitions.
$ErrorActionPreference = "Stop"
Write-Host "NewBook: checking WSL state (Windows remains installed)."
wsl.exe --status
if ($LASTEXITCODE -ne 0) { Write-Host "WSL may need enabling or a restart." }
Write-Host "Installing Debian through Microsoft's WSL distribution mechanism."
wsl.exe --install -d Debian
if ($LASTEXITCODE -ne 0) { throw "WSL install failed; inspect Windows output. No disk wipe attempted." }
Write-Host "If prompted, reboot, then launch Debian from Start or run: wsl -d Debian"
Write-Host "Inside Debian, use docs/NEWBOOK_NO_USB.md to install and test the Swarm node."
