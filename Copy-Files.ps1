<#
.SYNOPSIS
    Copies script files from node_modules into script directory.
#>

$files = $(".\node_modules\requirejs\require.js", ".\node_modules\whatwg-fetch\fetch.js", ".\node_modules\babel-polyfill\dist\polyfill.min.js")

foreach ($file in $files) {
    Copy-Item $file ".\script\" -Force
}
