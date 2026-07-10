$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Output '============================================================'
Write-Output '  Botanica theme verification'
Write-Output '============================================================'

$root = 'E:\ccfold\shopify\botanica'
$fail = $false

# -------------- 1. theme check --------------
Write-Output ''
Write-Output '[1/3] Running shopify theme check...'
& shopify theme check --path botanica -o json --no-color 2>$null |
  Out-File -FilePath 'check_tmp.json' -Encoding utf8
$cj = Get-Content 'check_tmp.json' -Raw -Encoding utf8 | ConvertFrom-Json
$errs = ($cj | Measure-Object -Property errorCount -Sum).Sum
$warns = ($cj | Measure-Object -Property warningCount -Sum).Sum
Write-Output ("  files with offenses: " + $cj.Count + " | errors: " + $errs + " | warnings: " + $warns)
if ($errs -gt 0) {
  Write-Output '  >>> ERROR detail:'
  $cj | Where-Object { $_.errorCount -gt 0 } | ForEach-Object {
    Write-Output ("    " + $_.path)
    $_.offenses | Where-Object { $_.severity -eq 'error' } | ForEach-Object {
      Write-Output ("      L" + $_.start_row + ": " + $_.check + " - " + $_.message)
    }
  }
  $fail = $true
} else {
  Write-Output '  OK: 0 errors'
}
Remove-Item 'check_tmp.json' -ErrorAction SilentlyContinue

# -------------- 2. CSS link consistency --------------
Write-Output ''
Write-Output '[2/3] Checking CSS link consistency...'

$liquidFiles = @()
$liquidFiles += Get-ChildItem -Path "$root\sections" -Filter '*.liquid' -File
$liquidFiles += Get-ChildItem -Path "$root\snippets" -Filter '*.liquid' -File -Recurse

$cssIssues = @()

# Whitelist: Dawn core components loaded globally in theme.liquid, not per-snippet.
# These are safe to skip (do NOT count as missing).
$globalWhitelist = @(
  'component-cart-drawer.css',
  'component-cart-notification.css',
  'component-cart-items.css',
  'component-cart.css',
  'component-totals.css',
  'component-price.css',
  'component-discounts.css',
  'component-disclosures.css',
  'component-facets.css',
  'component-pickup-availability.css',
  'component-predictive-search.css',
  'component-article-card.css',
  'component-progress-bar.css',
  'component-swatch-input.css',
  'component-swatch.css',
  'component-product-variant-picker.css',
  'quick-order-list.css',
  'quick-add.css',
  'quantity-popover.css',
  'component-rating.css',
  'component-search.css',
  'component-predictive-search.css',
  'component-modal-video.css',
  'component-deferred-media.css',
  'component-complementary-products.css',
  'collapsible-content.css',
  'component-accordion.css',
  'component-volume-pricing.css',
  'customer.css',
  'mask-blobs.css',
  'newsletter-section.css',
  'video-section.css'
)

# Confirm whitelist files actually are linked somewhere in the theme (sections/snippets/lazy).
# Dawn lazy-loads many component CSS via <link media="print" onload>, not layout — count those too.
$allLiquidContent = ''
Get-ChildItem -Path "$root\sections","$root\snippets","$root\layout" -Filter '*.liquid' -File -Recurse | ForEach-Object {
  $allLiquidContent += (Get-Content $_.FullName -Raw -Encoding utf8) + "`n"
}
$globalLinkedSet = [regex]::Matches($allLiquidContent, "'([a-zA-Z0-9_\-]+\.css)'\s*\|\s*asset_url") |
  ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

foreach ($w in $globalWhitelist) {
  if ($globalLinkedSet -notcontains $w) {
    Write-Output ("  WARN: whitelist item not linked anywhere: " + $w + " — verify whether it still exists")
  }
}

foreach ($f in $liquidFiles) {
  $base = [IO.Path]::GetFileNameWithoutExtension($f.Name)

  # candidate own-css files
  $ownCss = @()
  $ownCss += "$base.css"
  $ownCss += "section-$base.css"
  $ownCss += "component-$base.css"

  $existingOwn = @()
  foreach ($c in $ownCss) {
    if (Test-Path -LiteralPath "$root\assets\$c") { $existingOwn += $c }
  }

  if ($existingOwn.Count -eq 0) { continue }

  $content = Get-Content -LiteralPath $f.FullName -Raw -Encoding utf8

  # find every css basename referenced via stylesheet_tag in this file
  $referenced = [regex]::Matches($content, "'([a-zA-Z0-9_\-]+\.css)'\s*\|\s*asset_url") |
    ForEach-Object { $_.Groups[1].Value }
  $refSet = @($referenced | Sort-Object -Unique)

  foreach ($c in $existingOwn) {
    if ($globalWhitelist -contains $c) { continue }
    if ($refSet -notcontains $c) {
      $cssIssues += [PSCustomObject]@{
        Liquid = $f.Name
        CssMissing = $c
        Hint = "Add: {{ '" + $c + "' | asset_url | stylesheet_tag }} near top of " + $f.Name
      }
    }
  }
}

if ($cssIssues.Count -gt 0) {
  $fail = $true
  Write-Output ("  >>> " + $cssIssues.Count + " css link issue(s):")
  $cssIssues | Format-Table -AutoSize
} else {
  Write-Output '  OK: all own css files are referenced'
}

# -------------- 3. JSON validity + BOM check --------------
Write-Output ''
Write-Output '[3/3] Checking JSON files + BOM...'

$jsonFiles = @()
$jsonFiles += Get-ChildItem -Path "$root\config" -Filter '*.json' -File -Recurse
$jsonFiles += Get-ChildItem -Path "$root\templates" -Filter '*.json' -File -Recurse
$jsonFiles += Get-ChildItem -Path "$root\sections" -Filter '*.json' -File -Recurse

$jsonIssues = @()
foreach ($f in $jsonFiles) {
  $bytes = [IO.File]::ReadAllBytes($f.FullName)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $jsonIssues += [PSCustomObject]@{ File = $f.FullName; Problem = 'BOM detected' }
  }
  try {
    $null = Get-Content -LiteralPath $f.FullName -Raw -Encoding utf8 | ConvertFrom-Json
  } catch {
    $jsonIssues += [PSCustomObject]@{ File = $f.FullName; Problem = ('JSON parse error: ' + $_.Exception.Message) }
  }
}

if ($jsonIssues.Count -gt 0) {
  $fail = $true
  Write-Output ("  >>> " + $jsonIssues.Count + " JSON issue(s):")
  $jsonIssues | Format-Table -AutoSize
} else {
  Write-Output '  OK: all JSON files valid + no BOM'
}

# -------------- Result --------------
Write-Output ''
Write-Output '============================================================'
if ($fail) {
  Write-Output '  FAIL — fix above before asking user to preview.'
} else {
  Write-Output '  PASS — safe to let user refresh preview.'
}
Write-Output '============================================================'