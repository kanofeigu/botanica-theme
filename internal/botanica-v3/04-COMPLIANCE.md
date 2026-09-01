# Botanica v3 — 提交前合规门禁清单（04-COMPLIANCE）

> 用途：提交 Shopify Theme Store 前的**逐条自审**，对齐官方 5 阶段审核。任一项不过 = 不提交。
> 你只剩 **2 次**提交机会（第 3 次被拒封 90 天），这份清单是你的安全网。
> 来源：2026-06 对 shopify.dev 官方要求的核实（详见 `00-AUDIT.md`）。

---

## ⛔ 红线（任一触犯=必拒，先查这 8 条）

- [ ] **底座是 Skeleton，零 Dawn/Horizon 代码**（无 component-*.css、无 Dawn 原生 section、无 Dawn JS 模块）。
- [ ] **任何提交的 `.json` / schema default 里没有** `botanica.*`、`custom.` metafield、`shopify://` URL。
- [ ] **没有** `config/markets.json` 在 zip 里。
- [ ] **配色商家可改**（`color_palette`），对比敏感元素无硬编码颜色。
- [ ] **theme_info 的文档/支持 URL 是作者自有**（非 help/support.shopify.com）。
- [ ] **核心功能不依赖任何 app 或自定义 metafield**，空店开箱即用。
- [ ] **无假紧迫**（倒计时/假库存/假浏览数）、**无心愿单**、**无作者署名/外链/联盟链接**。
- [ ] **无外部 script/分析/追踪/CDN/JS 库；无 Sass；无预压缩 css·js；无 BOM**。

---

## Stage 1 — 主题功能 & OS 2.0

- [ ] 所有必需模板为 JSON 且支持 section：`index, product, collection, list-collections, cart, search, page, page.contact, blog, article, 404, password, gift_card` + `customers/*`。
- [ ] header / footer 通过 **section group** 渲染（header-group.json / footer-group.json）。
- [ ] **每个 JSON 模板支持 `@app` blocks**；main-product 与 featured-product section 支持 `@app`。
- [ ] **产品主区元素拆成独立 block**（price / vendor / description / variant-picker / quantity / buy-buttons …）。
- [ ] **Custom Liquid section 存在**（含 `type: "liquid"` 设置），在所有支持 section 的模板可用。
- [ ] `sections/apps.liquid`（`@app` + preset，无 `templates` 属性）存在。
- [ ] theme-blocks 架构：`blocks/` 目录 + `{% content_for "blocks" %}` 组装。
- [ ] logo 上传能处理任意宽高比；favicon 设置存在。

## Stage 2 — 性能 & 无障碍（自动 + 人工）

- [ ] **Lighthouse 性能 ≥ 60**（home+product+collection 平均，**桌面 AND 移动**，Shopify 基准数据集 / Lighthouse CI GitHub Action）。
- [ ] **Lighthouse 无障碍 ≥ 90**（同上口径）。
- [ ] 性能测试时 section **含真实图片与内容**（不能空）。
- [ ] 图片：responsive `srcset`/`sizes` + 显式 width/height 或 `aspect-ratio`（防 CLS）+ 下方 `loading="lazy"` + LCP 图 `fetchpriority="high"`。
- [ ] **手动键盘走通** home → product → add to cart → checkout，无焦点陷阱、焦点顺序=DOM 顺序、焦点环可见。
- [ ] **读屏（NVDA/VoiceOver）**：导航、产品图 alt、变体价/库存 `aria-live` 播报、弹层/抽屉开合播报正常。
- [ ] 对比度：正文 **4.5:1**、大字(≥24px/18.5px bold)与非文字(边框/图标) **3:1**。
- [ ] 触控目标 **≥24×24** CSS px（主 CTA/移动开关做 44×44）。
- [ ] 动效 reduced-motion 三层守卫；轮播/slideshow **不自动播放或可暂停**（Space + 前后按钮）；媒体不自动有声播放。
- [ ] 表单：每字段有标签、`required`、`autocomplete`、错误 `aria-live`+`aria-describedby`，颜色非唯一错误指示。

## Stage 3 — 技术要求

- [ ] `shopify theme check` **0 error**（理想 0 warning）。
- [ ] 全文件 **UTF-8 without BOM**；JSON 2 空格缩进、双引号、可 parse。
- [ ] **无 Sass / `.scss`；不预压缩** css·js（Shopify 自动压缩；ES6/第三方库除外，但本主题零外部库）。
- [ ] **theme_info 完整**：`theme_name`、`theme_version`、`theme_author`、`theme_documentation_url`、且 `theme_support_url` **或** `theme_support_email`（二选一，不能都给）。
- [ ] **i18n**：所有可见文本走 `t:` key；动态 URL 用 `routes` 对象（不硬编码 `/cart` 等）；`<html lang>` 已设。
- [ ] `en.default.json`（+ `*.schema.json`）完整精准；其他语言宁缺毋滥（机翻不全是负债）。
- [ ] 字体用 `font_picker`，Fraunces/Inter handle 在 Shopify Font Library 存在。
- [ ] JS ≤ 16KB minified（指南值），ES module + defer。

## Stage 4 — 设计 & UX（v1 死在这里，最高优先）

- [ ] **唯一且刻意的设计**：明显区别于商店现有主题；服务清晰的商家类型；不是 Dawn 套壳。
- [ ] **架构唯一性**：商家无法通过调设置把它变成另一个商店主题的样子；唯一性体现在所有核心模板（PDP/collection/cart/search），非仅首页。
- [ ] **清晰页面结构**：逻辑栅格、刻意的间距与对齐。
- [ ] **清晰内容层级**：大小/颜色/对比/位置区分主次。
- [ ] **内容多变仍不破版**：长标题/30 字符词/超长店名/重复 section/不同图片比例下无尴尬空隙、无溢出、无破版。
- [ ] **字体一致**：不过多字体、搭配协调。
- [ ] **专业级视觉**：无模糊/拉伸/像素化/剪贴画。
- [ ] **无任何未完成感**：无 `***` 计量器、无空占位盒、无未排版图标、动态结账按钮与品牌协调。
- [ ] 表单 error/success 状态完整；变体 `on:change` 更新正常。

## Stage 5 — 预发布 / demo / listing

- [ ] **3 个预设**写进 `settings_data.json` `presets`（≤5、文件 ≤1.5MB），色+字+构图三维显著不同。
- [ ] **每个预设一套真实 demo store**：命名产品、真实养护文案、真实价格、含 on-sale/sold-out/多变体/gift-card 示例；真实博客文章；专业/授权图片；**零 Lorem Ipsum**。
- [ ] demo 图片**版权合规**（Shopify Burst 或授权；AI 图逐张过"专业+无侵权"关并留**版权来源记录**）；图片内无嵌入文字/按钮。
- [ ] 每预设 demo 匹配标签：**≤2 个行业**（共 20 选）+ **1 个目录规模**（4 选）；install 状态镜像 demo（注意 demo 图片不随安装转移→ ship 占位图）。
- [ ] **`/listings/<preset>/`** 结构正确（可选放 `sections/` section-group 覆盖，**无 `templates/`**）；用 `shopify theme package` 打包并确认含 `/listings`。
- [ ] **listing 截图**：桌面 home **1000×1248** 或 **2000×2496**；移动 home **750×1334**（不与桌面重复）；**3 张 highlight 1600×1200**（无动图、无 Shopify logo/名）。
- [ ] **文档站上线**（含 FAQ、语法干净、术语与设置标签一致）+ **公开支持联系表单**（help-desk/CRM，光邮箱不够）。
- [ ] `release-notes.md` 在 zip 根（merchant-facing 语言）；版本号已设。
- [ ] 去除所有作者署名/外链/联盟链接；保留 `powered_by_link`；Bogus Gateway/测试模式开启。
- [ ] demo store 加 **reviewer 密码** 并提供 admin 访问。

## 文案风格（Stage 3/4 常见拒因，单列）

- [ ] 设置 label/info、按钮、提示：**sentence case**（句首大写）。
- [ ] **美式英语**拼写（color 非 colour）。
- [ ] 按钮**动词开头**（"Add to cart" 而非 "Cart"）。
- [ ] **无 `&`**（用 "and"）。
- [ ] **不用** "homepage / slider / CTA / meta-nav / above the fold" 等术语；用商家能懂的词。
- [ ] 描述用陈述句，不用疑问句。

---

## 提交决策（最后一关）

> 仅当**上面全部勾完 + 三道评审门（唯一性/设计/合规）Agent 报告全 pass + Lighthouse CI 性能60·无障碍90 全绿**，才提交。
> 否则停下修。**只剩 2 次机会，宁停勿赌。** 提交前可用邮件渠道就 reviewer 关注点先沟通。

> ⚠ 提交当天**再上 shopify.dev 复核一次**关键数字（性能阈值、`/listings` 结构、Skeleton-only 措辞）——2025-2026 规则仍在演进，本清单基于 2026-06 核实。
