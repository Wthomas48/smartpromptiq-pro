# Fix CacheManagementDashboard.tsx syntax errors
$filePath = "src\components\CacheManagementDashboard.tsx"

# Read the file content
$content = Get-Content $filePath -Raw

# Fix the first error: Comment out the orphaned return statement and closing brace
# Find the problematic section around line 85-87
$content = $content -replace '// const calculateMonthlySavings = \(costSavings: number\): number => \{ // Unused\s*\n\s*return costSavings \* 30;\s*\n\s*\};', `
'// const calculateMonthlySavings = (costSavings: number): number => {
  //   return costSavings * 30;
  // };'

# Fix the second error: The file is missing proper dollar sign display
# Fix the cost savings display (around line 157)
$content = $content -replace '\\\s*\n', '$'
$content = $content -replace '~\\/month est\.', '~$((cacheStats?.costSavings || 0) * 30).toFixed(0)}/month est.'

# Ensure the file ends with a proper closing brace
if ($content -notmatch '\}\s*$') {
    $content += "`n}"
}

# Write the fixed content back to the file
Set-Content -Path $filePath -Value $content -Encoding UTF8

Write-Host "Fixed syntax errors in CacheManagementDashboard.tsx" -ForegroundColor Green
Write-Host "Running TypeScript check..." -ForegroundColor Yellow

# Run TypeScript check
npx tsc --noEmit
