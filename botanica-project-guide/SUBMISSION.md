# Theme Store 提交清单

## 提交前自检

```bash
# 1. 语法检查
shopify theme check --path <theme-dir>

# 2. 完整验证（CSS 链接 + JSON/BOM + theme check）
.\verify.ps1

# 3. Lighthouse（目标 ≥80 Mobile, ≥90 Desktop）
# Chrome DevTools → Lighthouse → 勾选 Performance
```

## 打包命令

```bash
node makezip.cjs    # 用 adm-zip，正斜杠路径
```

排除文件清单：
```
demo/
screenshots/
SUBMISSION.md
CLAUDE.md
LOOP.md
PLAN.md
CONTRACTS.md
AGENTS.md
STATE.md / STATE.json
release-notes.md
.DS_Store / Thumbs.db
.vscode / .git
```

## 填表速查

| 字段 | 值 | 备注 |
|------|-----|------|
| Theme name | `Botanica` | |
| Tagline | `A botanical field-guide theme for indoor plant shops` | |
| Industry | `Garden` | |
| Catalog size | `Medium (50–500)` | |
| Price | `$240` | 首次提交偏低 |
| Demo URL | `https://kano-u93kwgf9.myshopify.com?preview_theme_id=153130598591` | |
| Support email | 你的真实邮箱 | |
| Contact form | Tally.so / mailto:邮箱 | 需要真实 HTTPS URL |
| Documentation | `https://help.shopify.com/manual/online-store/themes` | 可用 Dawn 文档顶 |

## 截图要求

| # | 类型 | 尺寸 | 页面对应 |
|---|------|------|---------|
| 1 | 主展示图 | 2000×2496 | 首页 |
| 2 | 手机首页 | 750×1334 | 首页 |
| 3 | 手机产品 | 750×1334 | 产品详情 |
| 4 | 手机合集 | 750×1334 | Collection |
| 5 | 桌面首页 | 1440×900 | 首页 |
| 6 | 桌面产品 | 1440×900 | 产品详情 |

## Highlight 三件套（均为 1600×1200）

1. **Editorial botanical layout** → Hero 分屏布局 + 杂志标签
2. **Care-level shopping guide** → 养护等级卡片
3. **Plant encyclopedia detail** → 植物 Spotlight + 养护表格

## Features 勾选（实际有才勾）

Cart: Quick buy, Slide-out cart, Sticky cart, Cart notes
Conversion: Cross-selling, Quick view, Recommended products, Customizable contact form
Content: Blogs, Product badges, FAQ page
International: EU translations
Images: High-resolution, Image galleries, Image rollover, Image zoom, Lookbooks, Slideshow
Product: Color swatches, Product options, Size chart
Visual: Animation
Navigation: Breadcrumbs, Enhanced search, Mega menu, Product filtering, Sticky header

## 审核周期

通常 2–6 周。关键：保持 dev store 运行 + demo 数据完整。
