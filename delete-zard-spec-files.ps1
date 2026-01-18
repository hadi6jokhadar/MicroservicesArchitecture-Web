# Delete all spec.ts files from the zard folder
# This aligns with the project's no-testing-infrastructure policy

$zardPath = Join-Path $PSScriptRoot "libs\ui\src\lib\zard"

Write-Host "Searching for .spec.ts files in zard folder..." -ForegroundColor Cyan
Write-Host "Path: $zardPath" -ForegroundColor Gray
Write-Host ""

# Find all spec.ts files
$specFiles = Get-ChildItem -Path $zardPath -Recurse -Filter "*.spec.ts" -File

if ($specFiles.Count -eq 0) {
    Write-Host "No .spec.ts files found." -ForegroundColor Green
    exit 0
}

Write-Host "Found $($specFiles.Count) spec.ts file(s):" -ForegroundColor Yellow
$specFiles | ForEach-Object {
    Write-Host "  - $($_.FullName.Replace($zardPath, '.'))" -ForegroundColor Gray
}

Write-Host ""
$confirmation = Read-Host "Do you want to delete these files? (y/n)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    $deletedCount = 0
    foreach ($file in $specFiles) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "Deleted: $($file.Name)" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "Failed to delete: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Successfully deleted $deletedCount file(s)." -ForegroundColor Green
}
else {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
}
