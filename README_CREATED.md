# Yue's Blog — 项目说明

> 基于 **React 18/19 + Vite + GitHub Actions + GitHub Pages** 的自研 Markdown 博客。

## 核心设计

- 用户日常只操作 `posts/` 目录，push `.md` 后全自动构建、部署。
- Markdown 在**构建时**解析为 HTML，生成 `src/posts.json`。
- 评论系统基于 **Giscus**（GitHub Discussions）。
- 代码高亮基于 **highlight.js**。
- 自动生成 **RSS feed**（`public/feed.xml`）。
- 支持 `posts/` 目录内图片自动复制与路径重写。
- 文章页支持目录（TOC）、标题锚点、高亮文字（`==text==`）。

## 仓库结构

```
.
├── .github/workflows/deploy.yml   # CI/CD：构建并部署到 gh-pages 分支
├── posts/                         # 用户只操作这个目录
│   ├── hello-world.md
│   ├── hello-world-cover.png
│   └── e2e-test.md
├── public/                        # 静态资源
│   └── images/                    # 直接提交的图片，或构建时从 posts/ 复制过来的图片
├── scripts/
│   └── build-posts.js             # 解析 Markdown，生成 src/posts.json 和 public/feed.xml
├── src/
│   ├── App.jsx
│   ├── components/
│   │   └── Giscus.jsx             # 原生 script 注入 Giscus 评论
│   ├── index.css                  # 全局 + 文章排版样式
│   ├── main.jsx
│   ├── pages/
│   │   ├── Home.jsx               # 文章列表
│   │   └── Post.jsx               # 文章详情（含目录）
│   └── posts.json                 # 构建产物，gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── .npmrc                         # 锁定 npmjs 官方源
```

## 本地开发

```bash
npm install
node scripts/build-posts.js
npm run dev
```

## 写作规范

### 新建文章

1. 在 `posts/` 下新建 `.md` 文件，文件名即为 URL slug。
2. 文件开头必须包含 frontmatter：

```md
---
title: 文章标题
date: 2026-08-22
excerpt: 显示在首页列表的摘要。
---

# 正文

这里写 Markdown。
```

3. 提交并 push：

```bash
git add posts/xxx.md
git commit -m "2026年08月22日12点00分 新增文章：xxx"
git push origin main
```

### 图片

#### 方式一：与文章放在一起（推荐）

把图片放在 `posts/` 目录下，和 `.md` 文件同级或子目录中，用相对路径引用：

```md
![封面](./hello-world-cover.png)
![截图](./images/screenshot.png)
```

构建脚本会自动复制到 `public/images/posts/` 并重写路径。

#### 方式二：直接放在 public/images/

适合全站共用的图片：

```md
![logo](/Yue021130/images/logo.png)
```

### 高亮文字

使用 `==高亮内容==` 语法，会渲染成黄色高亮背景。

```md
==这是重点==
```

### 代码块

支持 `highlight.js` 自动识别语言，推荐显式标注：

```js
console.log('hello');
```

## 构建生产版本

```bash
node scripts/build-posts.js
REPOSITORY_NAME=Yue021130 npm run build
```

## GitHub Pages 部署

当前使用 `gh-pages` 分支部署方案：

1. 仓库 `Settings → Pages → Source` 选择 **Deploy from a branch**。
2. 分支选择 **`gh-pages`**，保存。
3. push 到 `main` 后，GitHub Actions 会自动构建并推送到 `gh-pages` 分支。

## Giscus 评论配置

当前配置：

- repo: `Yue021130/Yue021130`
- repoId: `R_kgDOUAw2LQ`
- category: `Show and tell`
- categoryId: `DIC_kwDOUAw2Lc4DD9P-`
- mapping: `pathname`

如需修改，编辑 `src/components/Giscus.jsx` 中的 `GISCUS_CONFIG`。

## RSS 订阅

`https://yue021130.github.io/Yue021130/feed.xml`

## 技术栈

- React 19
- Vite 8
- react-router-dom
- Tailwind CSS 3
- gray-matter
- marked
- highlight.js
- GitHub Actions + GitHub Pages
- Giscus

## 注意事项

- `src/posts.json`、`public/feed.xml`、`public/images/posts/` 是构建产物，已被 `.gitignore` 忽略，不需要手动提交。
- 如果切换 GitHub Pages Source，请确保与 `.github/workflows/deploy.yml` 中的部署方式一致。
