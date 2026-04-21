param(
    [string]$inPath,
    [string]$outPath
)

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $doc = $word.Documents.Open($inPath, $false, $true) # read-only
    $doc.SaveAs([ref] $outPath, [ref] 17) # 17 = wdFormatPDF
    
    $doc.Close([ref] 0) # 0 = wdDoNotSaveChanges
    $word.Quit()
    exit 0
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
    exit 1
}
