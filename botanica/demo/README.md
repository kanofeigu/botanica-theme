# Botanica Demo Data Setup

快速给 dev store 填充样板间数据，用于：
- Theme Store 截图（6 张）
- Lighthouse 跑分
- 给审核团队看真实效果

**预估时间：30 分钟**

---

## Step 1: 下载植物图片

在 Unsplash 搜索以下关键词，下载 800px 宽的图 → 上传到 Shopify Admin → Settings → Files：

| 植物 | 搜索关键词 | 建议图片 ID |
|------|-----------|-------------|
| Monstera | "monstera indoor" | `1614594975525-e45190c55d0b` |
| Fiddle Leaf Fig | "fiddle leaf fig living room" | `1597055181308-54ef08a5ed04` |
| Snake Plant | "snake plant minimal" | `1593482892290-f5427c2a1e11` |
| ZZ Plant | "zz plant pot" | — |
| Calathea | "calathea orbifolia" | — |
| Pothos | "pothos hanging" | — |
| Peace Lily | "peace lily white bloom" | — |
| Rubber Plant | "rubber plant ficus elastica" | — |
| Maidenhair Fern | "maidenhair fern" | — |
| Alocasia | "alocasia polly" | — |
| Spider Plant | "spider plant babies" | — |
| Philodendron Birkin | "philodendron birkin" | — |

> CSV 里已经填了 Unsplash 直链（`images.unsplash.com/photo-xxx?w=800`），你可以直接用它们。但为了稳定，建议下载后上传到 Shopify Files。

---

## Step 2: 导入产品

1. Shopify Admin → **Products** → **Import**
2. 选择 `demo/products.csv`
3. 勾选 "Override existing products with same handle" → **Upload**
4. 等待导入完成（12 个产品）

**CSV 包含的数据：**
- 12 个植物产品，覆盖全部 3 个养护难度 + 3 个光照等级
- 每个产品有植物学描述、养护提示
- Tags 已设置：`care-easy/medium/expert`, `light-low/medium/bright`, `pet-toxic/safe`, `air-purifying`, `humidity-loving`
- 价格范围 $20-$58

---

## Step 3: 创建 Collection

1. Shopify Admin → **Products** → **Collections** → **Create collection**
2. 创建以下 collection：

| Collection Title | Condition | Value | 用途 |
|-----------------|-----------|-------|------|
| All Plants | Product type is equal to `Indoor Plant` | — | featured-collection section |
| Easy Care | Product tag is equal to `care-easy` | — | shop-by-care entry |
| Statement Plants | Product tag is equal to `care-expert` | — | plant-spotlight feature |

---

## Step 4: 创建 Blog + 文章

1. Shopify Admin → **Online Store** → **Blog posts** → **Create blog** (命名为 "Plant Care Journal")
2. 创建 3 篇文章：

### Article 1: "How to Not Kill Your Monstera"
- **Author**: Botanica Team
- **Excerpt**: From watering rhythms to the perfect support pole — everything you need to turn your Swiss cheese plant into a cathedral of fenestrated leaves.
- **Content**: (随便写几段，审核团队不会细看文字内容)

### Article 2: "The Low-Light Survival Guide"
- **Author**: Botanica Team
- **Excerpt**: No south-facing windows? No problem. These 5 plants thrive in dim corners and windowless bathrooms — and actually prefer it that way.
- **Content**: (同上)

### Article 3: "Understanding Humidity: The Secret to Lush Foliage"
- **Author**: Botanica Team
- **Excerpt**: Brown leaf tips aren't a watering problem — they're a humidity cry for help. How to create a tropical microclimate without turning your apartment into a sauna.
- **Content**: (同上)

---

## Step 5: 配置 Metafield（可选，Tag 已有 fallback）

如果想让养护数据走 metafield（更正规），在 Shopify Admin → Settings → Custom data → Products 添加：

| Namespace | Key | Type |
|-----------|-----|------|
| `botanica` | `care_level` | Single line text |
| `botanica` | `light_level` | Single line text |

然后给每个产品填上对应值（Easy/Medium/Expert 和 Low/Medium/Bright）。

> **但这不是必须的** — card-product.liquid 已经做了 tag fallback，没有 metafield 也能正常显示养护徽章。

---

## Step 6: 配置首页 Sections

在 Theme Editor 中给各 section 分配数据：

| Section | 需要的数据 |
|---------|-----------|
| hero-lookbook | 一张大图 (上传到 Files) |
| shop-by-care | 3 个 collection 链接 |
| plant-spotlight | 选一个产品 (推荐 Monstera 或 Fiddle Leaf Fig) |
| care-blog-teaser | 选 Plant Care Journal 博客 |
| featured-collection | 选 "All Plants" collection |
| testimonials | 已预填 3 条假评价，可以保留 |
| newsletter-perk | 随便填 |

---

## Step 7: 验证

全部配置好后：
```bash
shopify theme push --path botanica --theme 153130598591
```

然后打开预览 URL 确认：
- 首页所有 section 都有真实数据
- 产品卡片显示养护徽章
- product 页面显示 care_panel + care_story
- 移动端 sticky ATC bar 能正常显示

---

## 图片资源速查

| 植物 | Unsplash 直链 (800px) |
|------|----------------------|
| Monstera | https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800 |
| Fiddle Leaf Fig | https://images.unsplash.com/photo-1597055181308-54ef08a5ed04?w=800 |
| Snake Plant | https://images.unsplash.com/photo-1593482892290-f5427c2a1e11?w=800 |
| ZZ Plant | https://images.unsplash.com/photo-1632207686063-68f9acf95f82?w=800 |
| Pothos | https://images.unsplash.com/photo-1621751676147-4c8e2b6b16e1?w=800 |
| Peace Lily | https://images.unsplash.com/photo-1593694232674-3d73d3a9a87e?w=800 |
| Spider Plant | https://images.unsplash.com/photo-1572688484438-313aa0e04e7e?w=800 |
| Alocasia | https://images.unsplash.com/photo-1631217868264-e5b90bbde161?w=800 |
| Philodendron Birkin | https://images.unsplash.com/photo-1630304727072-b8c2659a12a0?w=800 |
