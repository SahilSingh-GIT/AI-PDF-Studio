param(
    [string]$inPath,
    [string]$outPath
)

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $workbook = $excel.Workbooks.Open($inPath, $null, $true) # read-only
    
    # 0 = xlTypePDF
    $workbook.ExportAsFixedFormat(0, $outPath)
    
    $workbook.Close($false)
    $excel.Quit()
    exit 0
} catch {
    Write-Error $_.Exception.Message
    if ($excel) { $excel.Quit() }
    exit 1
}
