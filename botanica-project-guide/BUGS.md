# 历史 Bug 清单（避坑指南）

## 1. PowerShell `Compress-Archive` 路径反斜杠 ⚠️ 最坑

**症状**：提交后 Shopify 报所有文件缺失（settings_schema.json missing 等）

**原因**：PowerShell `Compress-Archive` 在 Windows 上生成反斜杠路径（`config\settings_data.json`），Shopify Linux 服务器只识别正斜杠（`config/settings_data.json`）

**修复**：
```javascript
// 用 Node.js adm-zip 打包（路径自带正斜杠）
const AdmZip = require('adm-zip');
const zip = new AdmZip();
zip.addFile('config/settings_data.json', content);
zip.writeZip('theme.zip');
```

## 2. JSON 文件 BOM + 注释

**症状**：theme check 报 `ValidJSON` 错误

**原因**：
- PowerShell `ConvertTo-Json + Out-File` 写入 UTF-8 BOM
- Shopify Theme Editor 拉下来的 JSON 顶部有 `/* auto-generated */` 注释

**修复**：
```powershell
# 写入无 BOM JSON
[System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))

# 去除注释
$content = $content -replace '/\*[\s\S]*?\*/\s*', ''
```

## 3. `shopify theme push` 覆盖远程设置

**症状**：push 后 Theme Editor 里配的图片/collection 全没了

**原因**：push 是单向覆盖，本地 `settings_data.json` 会覆盖远程

**修复**：
```bash
# 先在本地改完再 push
# 或者先拉远程再改
shopify theme pull --only templates/index.json config/settings_data.json
```

## 4. `image_picker` 不接受外部 URL

**症状**：JSON 里填了 `https://images.unsplash.com/...`，Theme Editor 里图片不显示

**原因**：Shopify `image_picker` 只接受 Shopify CDN 引用格式

**修复**：用 `shopify://shop_images/xxx.png` 格式，或先上传到 Settings → Files

## 5. 字体句柄不在 Shopify Font Library

**症状**：`settings_data.json` 上传静默失败

**原因**：用了 Shopify Font Library 里没有的字体句柄

**修复**：只使用 Shopify Font Library 中的字体：`fraunces_n4`、`inter_n4` 等

## 6. API 版本不匹配

**症状**：Admin API 返回 401/422

**原因**：用的 API 版本和用户安装的 App 版本不一致

**修复**：先确认 App 的 API 版本再调用，用 `X-Shopify-Access-Token` header 而不是 `shpss_` token

## 7. CSS 文件创建但未链接

**症状**：section 在分屏模式下塌陷成纯文本堆叠

**原因**：创建了 `assets/xxx.css` 但 section `.liquid` 文件里没加 `stylesheet_tag`

**修复**：每个 section 顶部必须加：
```liquid
{{ 'section-name.css' | asset_url | stylesheet_tag }}
```

`verify.ps1` 脚本会自动检查这个。

## 8. 商店密码保护影响截图

**症状**：截图全是密码输入页

**原因**：商店开了密码保护

**修复**：用 `shopify theme dev` 本地服务器 `http://127.0.0.1:9292` 截图

## 9. 截图尺寸不符合 Theme Store 要求

| 类型 | 要求尺寸 |
|------|---------|
| 主展示图 | 1000×1248 或 2000×2496 |
| Highlight | 1600×1200 |
| 手机截图 | 750×1334 |
| 商家示例 | 779×1000 |

## 10. release-notes.md 不能出现在未发布主题中

**修复**：打包时排除 `release-notes.md`
