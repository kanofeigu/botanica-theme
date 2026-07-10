# 快速生成新主题（3 步）

## 第 1 步：Fork Dawn + 换品牌皮

```bash
shopify theme init --clone-url https://github.com/Shopify/dawn.git 新主题名
cd 新主题名
```

修改三个文件：
```
config/settings_schema.json     → theme_name、theme_author、配色默认值
assets/botanica.css             → CSS 变量、字体、工具类名称
layout/theme.liquid              → 引用你的 CSS 文件名
```

## 第 2 步：加自定义 Section

复制模板开始：
```
botanica-project-guide/templates/section.liquid  →  sections/新section名.liquid
botanica-project-guide/templates/section.css     →  assets/新section名.css
```

每个 section 三件事：
1. Liquid 顶部加 `{{ 'section名.css' | asset_url | stylesheet_tag }}`
2. Schema 里定义 settings + blocks + presets
3. 用 `botanica-eyebrow` / `botanica-badge` / `botanica-lift` 工具类

添加到首页：编辑 `templates/index.json`，在 `sections` 和 `order` 里加上。

## 第 3 步：验证 + 打包 + 提交

```bash
# 验证
.\verify.ps1
shopify theme check --path .

# 打包（正斜杠路径，用 Node.js）
npm install adm-zip
node makezip.cjs

# 提交
# Partner Dashboard → 模板 → 上传 zip → 填表 → 提交
```

## 踩坑速查

| 问题 | 答案 |
|------|------|
| 图片怎么配 | 上传到 Shopify Files，用 `shopify://shop_images/xxx.png` 格式 |
| 配色怎么改 | `config/settings_data.json` 的 presets 里改 scheme 值 |
| 怎么打包 | 用 `makezip.cjs`，不用 PowerShell Compress-Archive |
| 提交报文件缺失 | zip 用了反斜杠路径，换 adm-zip 重打 |
| settings_data 格式错误 | 去掉了 JSON 注释头 `/* */` |
| 截图画质差 | 用 Puppeteer 精确 750×1334，dev server 截图 |

## 关键文件索引

```
botanica/
├── config/
│   ├── settings_schema.json    ← 全局设置（logo/颜色/字体/布局/按钮/卡片/...）
│   └── settings_data.json      ← 预设值（4 个 color scheme + 全局参数）
├── layout/
│   └── theme.liquid            ← HTML 骨架（head/header/main/footer）
├── sections/                   ← 所有 section liquid
├── assets/
│   ├── botanica.css            ← 品牌 CSS 核心（变量/工具类/卡片）
│   └── 每个-section.css         ← section 独立样式
├── snippets/                   ← 可复用 Liquid 片段
├── templates/
│   └── index.json              ← 首页组装（section 顺序 + 设置值）
├── locales/                    ← 20+ 语言翻译
└── customers/                  ← 客户模板
```
