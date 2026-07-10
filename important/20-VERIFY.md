# Botanica 主题 - 写完功能必跑的验证流程

## 何时执行
**每次新增 / 修改 section 或 snippet 后，提交预览给用户之前必须执行。**

## 一步到位的命令
```powershell
cd E:\ccfold\shopify
.\verify.ps1
```

## 脚本三大检查

### 1. theme check 零 error
跑 `shopify theme check --path botanica -o json` 解析，错误数 > 0 → FAIL 并列出所有 error 详情。

### 2. CSS 引用一致性（防止漏 link 样式表）
扫所有 `sections/*.liquid` 和 `snippets/*.liquid`：
- 提取所有 `render 'xxx'` 引用的 snippet
- 提取所有 `{% stylesheet %}` 块或 `asset_url | stylesheet_tag` 引用的 css
- 对每个 section/snippet 自身的同名 css 文件（如 `hero-lookbook.liquid` → `hero-lookbook.css` 或 `section-hero-lookbook.css`）做存在性检查：**如果某个 liquid 有同名 css 但没引用，WARN**（让开发者确认是否漏 link）

### 3. JSON 合法性 + BOM 检查
- `config/settings_data.json`、`config/settings_schema.json`、`templates/*.json` 全部能 `ConvertFrom-Json` 解析
- 所有文件首 3 字节不是 BOM（`EF BB BF`），theme check 服务端拒绝 BOM

## FAIL 后处置流程
1. 不要让用户去看预览
2. 修完再跑 verify，全 PASS 才报告用户刷新

## 快速复检
如果只改了 css 文件 → 只跑 step 2 css 一致性即可，theme check 跳过更快。
全量改动 → 跑全脚本。

## 历史 bug 备忘
- CSS 文件创建了却没在 section liquid 顶部 `stylesheet_tag` 引用 → split 模式塌成文字堆
- settings_data 数值字段 step 不对齐 → 服务端拒绝上传
- PowerShell ConvertTo-Json + Out-File 默认带 BOM → theme check 报 ValidJSON error
- font handle 未在 Shopify 字体库 → settings_data 上传失败