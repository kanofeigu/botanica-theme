> ⚠️ **已废弃 / SUPERSEDED（2026-06-27）**
> 本计划基于 Dawn 二开，已被官方拒绝（Dawn 派生主题不再允许提交）。权威计划见 **`docs/botanica-v3/02-PLAN.md`**。
> 下面内容仅作历史参考，**勿照此操作**。

# Botanica — 室内观叶/盆栽 Shopify 主题开发计划

## 定位
- 子赛道：室内观叶/盆栽，Z世代向（Monstera/龟背竹/豆瓣绿/琴叶榕/虎尾兰等）
- 首发渠道：官方 Theme Store（审核通过后再铺 ThemeForest）
- MVP：1 套主题 + 1 个 HomePage 预设
- 起点骨架：Shopify 官方基准主题 Dawn 二次开发

## 差异化策略（vs 同质化竞品）
竞品普遍「绿色调 + 功能堆砌」。本主题的三个差异化抓手：
1. **设计grammar**: ins-m极简 + 植物科普插画风，文案与UI像 "植物百科" 而非 "杂货店"
2. **CRO互动**: 照护难度标签 + 光照/水分需求可视化 + 尺寸对照 + 快速查看，提升加购率
3. **合规性能**: Dawn地基 + Lighthouse ≥80 + 完整i18n/en/fr/zh + 0 Theme Check error

## 视觉调性参考
- 配色: 主sage绿 #4A6B4F / 背景奶油 #F5F1E8 / 强调陶土 #C97D5A / 文字深褐 #2E2A24
- 字体: display 用衬线(Playfair Display / DM Serif)，body 用无衬线(Inter)，UI 用小写英文+宽松字间距
- 图片: 大量留白, 木质背景/亚麻布, 柔光, 真实室内场景

## 开发阶段

### Phase 0 — 骨架与合规地基（先做）
- [ ] 0.1 下载 Dawn 最新版到 workspace 作为基础
- [ ] 0.2 清理 Dawn demo 内容, 重命名主题为 Botanica（locales/config/section presets 改名）
- [ ] 0.3 安装 Shopify CLI 并跑 `theme check` 确认零 error 基线
- [ ] 0.4 与 dev store 连接（需你提供 Partner dev store 域名 + 密码）

### Phase 1 — 设计系统层（token 注入）
- [ ] 1.1 改 `config/settings_schema.json` 全局色板/字体/间距/圆角/阴影
- [ ] 1.2 替换 `assets/base.css` 与 `assets/theme.css` CSS 变量层
- [ ] 1.3 配置 3 套配色预设（默认sage / 苔藓深绿 / 极简白）供 merchant 切换
- [ ] 1.4 设置字体与字体加载策略

### Phase 2 — HomePage sections（核心）
按 Z Gen 植物店节奏排列, 全部做成 section + blocks, merchant 可拖动调序:
- [ ] 2.1 **hero-lookbook** — 大图 + 干花式文字叠加, 速通 CTA（核心吸睛）
- [ ] 2.2 **shop-by-care** — 按照护难度入口(易养/中等/挑战) 3 卡片
- [ ] 2.3 **featured-collection** — 当季精选, 产品卡(含难度徽章/光照icon)
- [ ] 2.4 **plant-spotlight** — 单品聚焦, 大图 + 养护要点表 + 起源故事
- [ ] 2.5 **care-blog-teaser** — 3 篇养护指南博卡（建立信任）
- [ ] 2.6 **size-guide-interactive** — "拿到手多大?" 尺寸与盆器对照可视化
- [ ] 2.7 **values-bar** — 配送安全/30天保活/换盆服务/icon 特库ل
- [ ] 2.8 **testimonials** — 客户真实晒 plant-in-home 照片模式
- [ ] 2.9 **newsletter-perk** — 订阅送养护手册, 软引流
- [ ] 2.10 组装 `templates/index.json` 默认顺序

### Phase 3 — 关键模板
- [ ] 3.1 `sections/main-product.liquid` 重设计: 照护需求面板 + 360度/场景图对照 + 起源/毒性提示
- [ ] 3.2 `sections/main-collection.liquid` 重设计: 按 照护难度/光照/空间 三维筛选
- [ ] 3.3 `snippets/product-card.liquid` 增加难度徽章 + 光照icon + 存活badge
- [ ] 3.4 `templates/cart.liquid` / `sections/main-cart.liquid` — 微调保留 Dawn 逻辑

### Phase 4 — CRO互动
- [ ] 4.1 快速查看 modal（不跳页查看产品 + 加车）
- [ ] 4.2 ⚠ 注: 官方商店要求功能必须基于原生 OS2 capability 或免费公开 app. 嵌入式增强需慎重, 优先用 section block 实现而非额外 JS 依赖服务端
- [ ] 4.3 sticky 加车栏 (移动端)
- [ ] 4.4 size-guide 可视化用纯 CSS/SVG 不引入外部库

### Phase 5 — 合规与上架包
- [ ] 5.1 locales 完整 en/fr/zh-CN 三语 + 编校
- [ ] 5.2 Lighthouse 跑分移动端 ≥80 (基准称Dawn本身能达标)
- [ ] 5.3 axe-core 可访问性扫描 0 critical
- [ ] 5.4 Theme Check 0 error
- [ ] 5.5 截图模板(3张) + 预览视频脚本
- [ ] 5.6 上架文案: 商业描述 / pricing 选项($180~$320) / 支持条款
- [ ] 5.7 提交审核 + 修复rounds

## 节奏
Phase 0-1 先跑通（约 1-2 个工作单位）, Phase 2 是最重头戏（HomePage 决定转化与上架观感）。每个 Phase 完成给你预览一次, 你反馈视觉/交互调整。

## 你需要提供的
- Shopify Partner 账户 / dev store 域名 + API 密码（用于 `shopify theme dev` 本地预览）
- 视觉反馈在每个 checkpoint 时给出
- 上架账户归属于你