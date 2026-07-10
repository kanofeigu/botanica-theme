# Botanica v3 — Git 项目管理指南

> 生成时间：2026-07-10（首次备份完成）

---

## GitHub 仓库

| 项目 | 值 |
|------|-----|
| URL | `https://github.com/kanofeigu/botanica-theme` |
| 可见性 | 私有（Private） |
| 账号 | `kanofeigu` |
| 本地路径 | `E:\ccfold\shopify` |
| 远程名称 | `origin` |
| 默认分支 | `main` |

---

## 基础操作

### 首次克隆（换电脑后恢复）

```bash
git clone https://github.com/kanofeigu/botanica-theme.git
cd botanica-theme
```

### 日常拉取更新

```bash
cd E:\ccfold\shopify
git pull origin main
```

### 日常提交推送

```bash
cd E:\ccfold\shopify
git add -A
git commit -m "描述你改了什么"
git push origin main
```

### 查看状态

```bash
git status          # 哪些文件改过
git log --oneline   # 提交历史
git diff            # 具体改了什么
```

### 撤销

```bash
git reset HEAD <文件>    # 取消暂存
git checkout -- <文件>    # 丢弃修改
git revert <commit_id>    # 撤销某次提交（安全，产生新提交）
```

---

## Git 配置信息

| 项目 | 值 |
|------|-----|
| 用户名 | `1364745992` |
| 邮箱 | `1364745992@qq.com` |
| GitHub CLI 账号 | `kanofeigu`（已登录） |
| Git 版本 | 2.52.0 |
| GH CLI 版本 | 2.94.0 |

---

## 注意事项

- `.gitignore` 已排除 `node_modules/`、`*.log`、`check*.json`、`.env` 等
- GitHub CLI 已认证，可直接使用 `gh` 命令
- 首次提交包含 442 个文件，约 55 万行
- 参考文件（Hey Rooted 网站抓取）也纳入了版本管理
