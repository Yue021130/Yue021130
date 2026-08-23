# Yue's Blog — 项目说明

> 基于 **React 19 + Vite + GitHub Actions + GitHub Pages** 的 Markdown/HTML 静态博客。

## 核心设计

- 用户日常只操作 `posts/` 目录，push 后全自动构建、部署。
- `posts/` 采用**三级菜单目录结构**：一级菜单 / 二级菜单 / 帖子文件夹。
- Markdown 在**构建时**解析为 HTML；也支持直接放 `.html` 文件。
- 构建脚本生成 `src/posts.json`，首页据此渲染可展开的三级菜单树。
- 评论系统基于 **Giscus**（GitHub Discussions）。
- 代码高亮基于 **highlight.js**。
- 自动生成 **RSS feed**（`public/feed.xml`）。
- 帖子文件夹内的图片/资源会自动复制并重写路径。
- 文章页支持目录（TOC）、标题锚点、面包屑、高亮文字（`==text==`）。

## 仓库结构

```
.
├── .github/workflows/deploy.yml   # CI/CD：构建并部署到 gh-pages 分支
├── posts/                         # 用户只操作这个目录
│   ├── 一级菜单/
│   │   ├── 二级菜单/
│   │   │   ├── 帖子标题 1/
│   │   │   │   ├── index.md       # 或任意 .md / .html
│   │   │   │   └── 图片.png
│   │   │   └── 帖子标题 2/
│   │   │       ├── index.md
│   │   │       └── 截图.jpg
│   │   └── ...
│   └── ...
├── public/                        # 静态资源
│   └── images/posts/              # 构建产物：从 posts/ 复制过来的图片
├── scripts/
│   └── build-posts.js             # 解析 posts/，生成 src/posts.json 和 public/feed.xml
├── src/
│   ├── App.jsx
│   ├── components/
│   │   └── Giscus.jsx             # 原生 script 注入 Giscus 评论
│   ├── index.css                  # 全局 + 文章排版样式
│   ├── main.jsx
│   ├── pages/
│   │   ├── Home.jsx               # 三级菜单树首页
│   │   └── Post.jsx               # 文章详情（含面包屑、目录）
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

### 目录结构

每个帖子必须是一个**三级目录下的叶子文件夹**，文件夹名字就是展示标题：

```
posts/
├── React/                         # 一级菜单
│   ├── 基础/                       # 二级菜单
│   │   └── JSX 入门/               # 三级：帖子文件夹
│   │       ├── index.md
│   │       └── 截图.png
│   └── Hooks/
│       └── useRef 详解/
│           ├── index.md
│           └── 流程图.png
└── 生活/
    └── 随笔/
        └── 2026 年总结/
            └── index.md
```

### 内容文件规则

叶子文件夹里可以有：

- `index.md`（最优先）
- 任意 `.md` 文件（没有 `index.md` 时取第一个）
- 任意 `.html` 文件（没有 Markdown 时支持纯 HTML）
- 帖子用到的图片、附件等

### Markdown 示例

```md
---
title: useRef 详解
date: 2026-08-22
excerpt: 掌握 useRef 的用法与注意事项。
---

# useRef

==这是重点内容==，会高亮显示。

```js
const ref = useRef(null);
```

![流程图](./流程图.png)
```

### 静态 HTML

直接把 `.html` 文件放进叶子文件夹即可。标题优先读取 `<title>` 标签，否则使用文件夹名。

### 图片

图片放在帖子文件夹内，用相对路径引用：

```md
![流程图](./流程图.png)
```

构建时会自动复制到 `public/images/posts/<slug>/`，并重写为线上可用路径。

### 高亮文字

```md
==这是重点==
```

### 提交与部署

```bash
git add posts/
git commit -m "2026年08月22日12点00分 新增文章：useRef 详解"
git push origin main
```

GitHub Actions 会自动构建并推送到 `gh-pages` 分支。

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
