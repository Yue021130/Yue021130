---
title: 端到端测试文章
date: 2026-08-23
excerpt: 这是用于端到端测试的文章，验证 push 后 CI 能自动构建并部署到 GitHub Pages。
---

# 端到端测试文章

如果你在线上看到了这篇文章，说明整个 CI/CD 流程已经跑通！

## 测试内容

- Markdown 构建脚本正确生成 `src/posts.json`
- GitHub Actions 成功构建并部署到 `gh-pages`
- 文章列表按日期倒序排列
- 代码高亮正常工作：

```python
print("Hello, CI/CD!")
```

> 自动化部署让写作回归纯粹。
