param(
    [string]$inPath,
    [string]$outPath
)

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    
    # 0 = msoFalse (WithWindow)
    $presentation = $ppt.Presentations.Open($inPath, $true, $false, 0)
    
    # 32 = ppSaveAsPDF
    $presentation.SaveAs($outPath, 32)
    
    $presentation.Close()
    $ppt.Quit()
    exit 0
} catch {
    Write-Error $_.Exception.Message
    if ($ppt) { $ppt.Quit() }
    exit 1
}
