# Botanica - Contract Verification Script (Shopify theme equivalent)
#
# Purpose: Run at DAG wave barrier points, equivalent to generic framework's verify-contracts.js.
#          Shopify theme "contract verification" = theme check + CSS link consistency + JSON/BOM check.
#          This script wraps the existing verify.ps1 + adds CONTRACTS.md file ownership checking.
#
# Usage: .\scripts\verify-contracts.ps1
#        .\scripts\verify-contracts.ps1 -SkipThemeCheck  (skip theme check for speed)
#        .\scripts\verify-contracts.ps1 -Quick            (CSS link only)
# Exit: 0 = PASS, 1 = FAIL

param(
    [switch]$SkipThemeCheck,
    [switch]$Quick
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$root = 'E:\ccfold\shopify\botanica'
$fail = $false

Write-Output '============================================================'
Write-Output '  Botanica Contract Verification (verify-contracts.ps1)'
Write-Output '============================================================'

# ====== 1. CONTRACTS.md file ownership check ======
Write-Output ''
Write-Output '[1/4] Checking file ownership per CONTRACTS.md...'

$contractWorkers = @{
    'Worker-0' = @(
        'config/settings_schema.json',
        'config/settings_data.json',
        'assets/botanica.css',
        'locales/en.default.json'
    )
    'Worker-hero' = @(
        'sections/hero-lookbook.liquid',
        'assets/hero-lookbook.css',
        'snippets/hero-lookbook-content.liquid',
        'snippets/hero-lookbook-placeholder.liquid'
    )
    'Worker-care' = @(
        'sections/shop-by-care.liquid',
        'assets/shop-by-care.css'
    )
    'Worker-spotlight' = @(
        'sections/plant-spotlight.liquid',
        'assets/plant-spotlight.css',
        'snippets/plant-spotlight-placeholder.liquid'
    )
    'Worker-blog' = @(
        'sections/care-blog-teaser.liquid',
        'assets/care-blog-teaser.css'
    )
    'Worker-size' = @(
        'sections/botanica-size-guide.liquid',
        'assets/botanica-size-guide.css'
    )
    'Worker-values' = @(
        'sections/botanica-values-bar.liquid',
        'assets/botanica-values-bar.css'
    )
}

$allOwnedFiles = @{}
foreach ($worker in $contractWorkers.Keys) {
    foreach ($file in $contractWorkers[$worker]) {
        $allOwnedFiles[$file] = $worker
    }
}

# Check for overlaps (same file owned by multiple workers)
$overlaps = @{}
foreach ($worker in $contractWorkers.Keys) {
    foreach ($file in $contractWorkers[$worker]) {
        if (-not $overlaps.ContainsKey($file)) {
            $overlaps[$file] = @()
        }
        $overlaps[$file] += $worker
    }
}

$overlapIssues = @()
foreach ($file in $overlaps.Keys) {
    if ($overlaps[$file].Count -gt 1) {
        $overlapIssues += "OVERLAP: $file claimed by $($overlaps[$file] -join ', ')"
    }
}

if ($overlapIssues.Count -gt 0) {
    $fail = $true
    Write-Output "  >>> File ownership overlap detected:"
    $overlapIssues | ForEach-Object { Write-Output "    $_" }
} else {
    Write-Output '  OK: no file ownership overlaps'
}

# Check for unowned custom files
$liquidFiles = Get-ChildItem -Path "$root\sections","$root\snippets" -Filter '*.liquid' -File -Recurse
$unowned = @()
foreach ($f in $liquidFiles) {
    $rel = $f.FullName.Replace($root, '').TrimStart('\').Replace('\', '/')
    if (-not $allOwnedFiles.ContainsKey($rel)) {
        $unowned += "UNOWNED: $rel (no Worker assigned in CONTRACTS.md - review if custom)"
    }
}

if ($unowned.Count -gt 0) {
    Write-Output "  INFO: $($unowned.Count) file(s) not assigned to any Worker (likely Dawn originals):"
    $unowned | ForEach-Object { Write-Output "    $_" }
} else {
    Write-Output '  OK: all files assigned to Workers'
}

# ====== 2. CSS link consistency ======
Write-Output ''
Write-Output '[2/4] Checking CSS link consistency...'

$liquidFiles2 = @()
$liquidFiles2 += Get-ChildItem -Path "$root\sections" -Filter '*.liquid' -File
$liquidFiles2 += Get-ChildItem -Path "$root\snippets" -Filter '*.liquid' -File -Recurse

$globalWhitelist = @(
    'component-cart-drawer.css', 'component-cart-notification.css', 'component-cart-items.css',
    'component-cart.css', 'component-totals.css', 'component-price.css', 'component-discounts.css',
    'component-disclosures.css', 'component-facets.css', 'component-pickup-availability.css',
    'component-predictive-search.css', 'component-article-card.css', 'component-progress-bar.css',
    'component-swatch-input.css', 'component-swatch.css', 'component-product-variant-picker.css',
    'quick-order-list.css', 'quick-add.css', 'quantity-popover.css', 'component-rating.css',
    'component-search.css', 'component-modal-video.css', 'component-deferred-media.css',
    'component-complementary-products.css', 'collapsible-content.css', 'component-accordion.css',
    'component-volume-pricing.css', 'customer.css', 'mask-blobs.css', 'newsletter-section.css',
    'video-section.css', 'component-list-payment.css', 'component-list-social.css',
    'component-localization-form.css', 'component-mega-menu.css', 'component-menu-drawer.css',
    'component-newsletter.css', 'component-pagination.css', 'component-product-model.css',
    'component-model-viewer-ui.css', 'component-show-more.css', 'component-slider.css',
    'component-slideshow.css', 'component-collection-hero.css', 'component-image-with-text.css'
)

$cssIssues = @()
foreach ($f in $liquidFiles2) {
    $base = [IO.Path]::GetFileNameWithoutExtension($f.Name)
    $ownCss = @("$base.css", "section-$base.css", "component-$base.css")
    $existingOwn = @()
    foreach ($c in $ownCss) {
        if (Test-Path -LiteralPath "$root\assets\$c") { $existingOwn += $c }
    }
    if ($existingOwn.Count -eq 0) { continue }
    $content = Get-Content -LiteralPath $f.FullName -Raw -Encoding utf8
    $referenced = [regex]::Matches($content, "'([a-zA-Z0-9_\-]+\.css)'\s*\|\s*asset_url") |
        ForEach-Object { $_.Groups[1].Value }
    $refSet = @($referenced | Sort-Object -Unique)
    foreach ($c in $existingOwn) {
        if ($globalWhitelist -contains $c) { continue }
        if ($refSet -notcontains $c) {
            $cssIssues += [PSCustomObject]@{ Liquid = $f.Name; CssMissing = $c }
        }
    }
}

if ($cssIssues.Count -gt 0) {
    $fail = $true
    Write-Output "  >>> $($cssIssues.Count) CSS link issue(s):"
    $cssIssues | Format-Table -AutoSize
} else {
    Write-Output '  OK: all CSS files are referenced'
}

# ====== 3. JSON validity + BOM check ======
Write-Output ''
Write-Output '[3/4] Checking JSON files + BOM...'

$jsonFiles = @()
$jsonFiles += Get-ChildItem -Path "$root\config" -Filter '*.json' -File -Recurse
$jsonFiles += Get-ChildItem -Path "$root\templates" -Filter '*.json' -File -Recurse
$jsonFiles += Get-ChildItem -Path "$root\sections" -Filter '*.json' -File -Recurse
$jsonFiles += Get-ChildItem -Path "$root\locales" -Filter '*.json' -File -Recurse

$jsonIssues = @()
foreach ($f in $jsonFiles) {
    $bytes = [IO.File]::ReadAllBytes($f.FullName)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $jsonIssues += [PSCustomObject]@{ File = $f.Name; Problem = 'BOM detected' }
    }
    try {
        $null = Get-Content -LiteralPath $f.FullName -Raw -Encoding utf8 | ConvertFrom-Json
    } catch {
        $jsonIssues += [PSCustomObject]@{ File = $f.Name; Problem = ('JSON parse error: ' + $_.Exception.Message) }
    }
}

if ($jsonIssues.Count -gt 0) {
    $fail = $true
    Write-Output "  >>> $($jsonIssues.Count) JSON issue(s):"
    $jsonIssues | Format-Table -AutoSize
} else {
    Write-Output '  OK: all JSON files valid + no BOM'
}

# ====== 4. Theme check ======
Write-Output ''
Write-Output '[4/4] Running shopify theme check...'

if (-not $SkipThemeCheck) {
    & shopify theme check --path botanica -o json --no-color 2>$null |
      Out-File -FilePath 'check_tmp.json' -Encoding utf8
    if (Test-Path 'check_tmp.json') {
        $cj = Get-Content 'check_tmp.json' -Raw -Encoding utf8 | ConvertFrom-Json
        $errs = ($cj | Measure-Object -Property errorCount -Sum).Sum
        $warns = ($cj | Measure-Object -Property warningCount -Sum).Sum
        Write-Output "  files with offenses: $($cj.Count) | errors: $errs | warnings: $warns"
        if ($errs -gt 0) {
            Write-Output '  >>> ERROR detail:'
            $cj | Where-Object { $_.errorCount -gt 0 } | ForEach-Object {
                Write-Output "    $($_.path)"
                $_.offenses | Where-Object { $_.severity -eq 'error' } | ForEach-Object {
                    Write-Output "      L$($_.start_row): $($_.check) - $($_.message)"
                }
            }
            $fail = $true
        } else {
            Write-Output '  OK: 0 errors'
        }
        Remove-Item 'check_tmp.json' -ErrorAction SilentlyContinue
    }
} else {
    Write-Output '  SKIPPED (--SkipThemeCheck)'
}

# ====== Result ======
Write-Output ''
Write-Output '============================================================'
if ($fail) {
    Write-Output '  FAIL - fix above before proceeding to next wave.'
    Write-Output '============================================================'
    exit 1
} else {
    Write-Output '  PASS - contract verified. Safe to proceed to next wave.'
    Write-Output '============================================================'
    exit 0
}
