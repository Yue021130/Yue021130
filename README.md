# Yue's Blog

> 何当共剪西窗烛，却话巴山夜雨时。

基于 **React 18 + Vite + GitHub Actions + GitHub Pages** 的自研 Markdown 博客。
用户只需在 `posts/` 目录下撰写 `.md` 文件并 push，CI 会自动解析 Markdown、构建静态站点并部署上线。

## 线上地址

<https://yue021130.github.io/Yue021130/>

## 启用 GitHub Pages

1. 进入仓库 **Settings → Pages → Source**。
2. 选择 **GitHub Actions**。
3. push 任意改动触发工作流后，站点会自动部署。

> 之前若已生成 `gh-pages` 分支，可前往 **Branches** 将其删除；本方案不再依赖该分支。

## 写作指南

1. 在 `posts/` 目录新建 `.md` 文件，文件名即为 URL slug。
2. 文件开头必须包含 frontmatter：

```md
---
title: 文章标题
date: 2026-08-22
excerpt: 文章摘要，会显示在首页列表中。
---

# 正文

这里开始写 Markdown 内容。
```

3. 提交并 push 到 `main` 分支：

```bash
git add posts/xxx.md
git commit -m "2026年08月22日12点00分 新增文章：xxx"
git push origin main
```

4. GitHub Actions 会自动构建并部署，通常 1–3 分钟后可在首页看到新文章。

## 本地开发

```bash
npm install
node scripts/build-posts.js
npm run dev
```

## 构建生产版本

```bash
node scripts/build-posts.js
REPOSITORY_NAME=Yue021130 npm run build
```

## 评论系统（Giscus）

1. 在仓库 **Settings → General → Features** 中开启 **Discussions**。
2. 访问 <https://giscus.app>，授权仓库 `Yue021130/Yue021130`。
3. 选择映射方式 **pathname**，选择一个 Discussion 分类（如 **General**）。
4. 复制生成的 `categoryId`，替换 `src/components/Giscus.jsx` 中的 `YOUR_CATEGORY_ID_HERE`。
5. 重新 push 部署即可。

## RSS

订阅地址：<https://yue021130.github.io/Yue021130/feed.xml>

## 技术栈

- React 18 / Vite
- react-router-dom
- Tailwind CSS
- gray-matter + marked
- highlight.js
- GitHub Actions + GitHub Pages
- Giscus
