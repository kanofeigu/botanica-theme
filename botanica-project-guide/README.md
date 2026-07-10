# Botanica 主题项目总结

## 一句话概述

基于 Shopify Dawn 参考主题，打造「植物图鉴」编辑风格的室内植物店主题，已提交 Shopify Theme Store 审核。

## 项目成果

- **主题名称**：Botanica
- **定位**：室内植物店 / 观叶植物精品店
- **价格**：$240 USD（首次提交）
- **商店**：kano-u93kwgf9.myshopify.com
- **文件**：`E:\ccfold\shopify\botanica\`（源码）、`E:\ccfold\shopify\botanica-theme.zip`（打包）

## 如何快速复制一个类似主题

### 第 0 步：准备工作
```bash
shopify theme init --clone-url https://github.com/Shopify/dawn.git 新主题名
cd 新主题名
```

### 第 1 步：改品牌基础（30 分钟）
1. `config/settings_schema.json` → 改 `theme_name`、`theme_author`、配色默认值
2. `assets/botanica.css`（换成你的品牌 CSS）→ 改 CSS 变量、字体、色板
3. `layout/theme.liquid` → 改加载的 CSS/JS 文件名

### 第 2 步：写自定义 Section（每个 1-2 小时）
每个 section 三件套：
```
sections/新section.liquid    ← HTML + schema + 预设
assets/新section.css          ← 样式
snippets/新section-xxx.liquid ← 可复用片段（可选）
```

### 第 3 步：组装首页
编辑 `templates/index.json`，按顺序排列 section。

### 第 4 步：验证 → 提交
```powershell
.\verify.ps1                          # 主题检查 + CSS 一致性 + JSON 合法性
node makezip.cjs                      # 打包（正斜杠路径！）
```
上传到 Partner Dashboard → 模板 → 提交。

## 关键约束（必读）

1. **永远用 `.\verify.ps1` 检查**，零错误才能预览/提交
2. **图片设置用 `image_picker`**，只能填 Shopify CDN 引用（`shopify://shop_images/xxx.png`），不能填外部 URL
3. **zip 必须用 Node.js 打包**（adm-zip），PowerShell `Compress-Archive` 生成反斜杠路径，Shopify 不识别
4. **JSON 文件不能有 BOM 和注释**
5. **`shopify theme push` 会覆盖远程设置**，改完 Theme Editor 记得先 `pull`
