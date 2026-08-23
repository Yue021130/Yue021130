import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import hljs from 'highlight.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.resolve(__dirname, '../posts');
const outputPath = path.resolve(__dirname, '../src/posts.json');
const feedPath = path.resolve(__dirname, '../public/feed.xml');
const assetsDestDir = path.resolve(__dirname, '../public/images/posts');
const basePath = '/Yue021130';
const siteUrl = `https://yue021130.github.io${basePath}`;

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {
        // fall through to plain escape
      }
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
});

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toISOString().split('T')[0];
}

function toRfc822(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(text) {
  return (
    stripHtml(text)
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '') || 'heading'
  );
}

function applyHighlightSyntax(content) {
  return content.replace(/==([^=]+)==/g, '<mark>$1</mark>');
}

function isExternalUrl(href) {
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function rewriteImageHref(href, postDirRel) {
  if (!href || isExternalUrl(href) || href.startsWith('/')) {
    return href;
  }
  const assetRel = path.posix.normalize(`${postDirRel}/${href}`);
  return `${basePath}/images/posts/${assetRel}`;
}

function createRenderer(postDirRel) {
  const defaultImage = marked.Renderer.prototype.image;
  const renderer = new marked.Renderer();
  renderer.image = function (token) {
    token.href = rewriteImageHref(token.href, postDirRel);
    return defaultImage.call(this, token);
  };
  renderer.heading = function (token) {
    const id = slugify(token.text);
    return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>`;
  };
  return renderer;
}

function findContentFile(dir) {
  const files = fs.readdirSync(dir).filter((name) => {
    const full = path.join(dir, name);
    return fs.statSync(full).isFile();
  });

  const indexMd = files.find((f) => f.toLowerCase() === 'index.md');
  if (indexMd) return indexMd;

  const md = files.find((f) => f.toLowerCase().endsWith('.md'));
  if (md) return md;

  const html = files.find((f) => f.toLowerCase().endsWith('.html'));
  if (html) return html;

  return null;
}

function findPostFolders(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;

  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (!stat.isDirectory()) continue;

    const contentFile = findContentFile(full);
    if (contentFile) {
      result.push({ dir: full, contentFile });
    } else {
      result.push(...findPostFolders(full));
    }
  }

  return result;
}

function copyPostAssets(postDir, slug) {
  const files = fs.readdirSync(postDir);
  const copied = [];

  for (const name of files) {
    const full = path.join(postDir, name);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;

    // 不复制内容文件本身
    const lower = name.toLowerCase();
    if (lower.endsWith('.md') || lower.endsWith('.html')) continue;

    const rel = toPosix(path.relative(postsDir, postDir));
    const dest = path.join(assetsDestDir, rel, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(full, dest);
    copied.push(dest);
  }

  return copied;
}

function parseTitleFromHtml(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '';
}

// Clean generated assets
if (fs.existsSync(assetsDestDir)) {
  fs.rmSync(assetsDestDir, { recursive: true, force: true });
}

const postFolders = findPostFolders(postsDir);

const posts = postFolders
  .map(({ dir, contentFile }) => {
    const contentPath = path.join(dir, contentFile);
    const relativeDir = path.relative(postsDir, dir);
    const slug = toPosix(relativeDir);
    const pathParts = slug.split('/');
    const folderName = pathParts[pathParts.length - 1];
    const isHtml = contentFile.toLowerCase().endsWith('.html');

    let title;
    let date;
    let excerpt;
    let html;

    if (isHtml) {
      const raw = fs.readFileSync(contentPath, 'utf-8');
      html = raw;
      title = parseTitleFromHtml(raw) || folderName;
      date = formatDate(fs.statSync(contentPath).mtime);
      excerpt = stripHtml(raw).slice(0, 160).replace(/\s+$/, '') + '…';
    } else {
      const raw = fs.readFileSync(contentPath, 'utf-8');
      const parsed = matter(raw);
      const renderer = createRenderer(slug);
      const contentWithHighlights = applyHighlightSyntax(parsed.content);
      html = marked.parse(contentWithHighlights, { renderer, async: false });
      title = parsed.data.title || folderName;
      date = formatDate(parsed.data.date || fs.statSync(contentPath).mtime);
      excerpt =
        parsed.data.excerpt || stripHtml(html).slice(0, 160).replace(/\s+$/, '') + '…';
    }

    copyPostAssets(dir, slug);

    return {
      slug,
      title,
      date,
      excerpt,
      content: html,
      path: pathParts,
      type: isHtml ? 'html' : 'md',
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf-8');

// Generate RSS feed
const lastBuildDate = posts.length > 0 ? toRfc822(posts[0].date) : toRfc822(new Date());
const items = posts
  .map((post) => {
    const url = `${siteUrl}/post/${post.slug}`;
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
  })
  .join('');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Yue's Blog</title>
    <link>${siteUrl}/</link>
    <description>基于 React + GitHub Pages 的自研 Markdown 博客</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>
`;

fs.mkdirSync(path.dirname(feedPath), { recursive: true });
fs.writeFileSync(feedPath, feed, 'utf-8');

console.log(`Generated ${outputPath} with ${posts.length} post(s).`);
console.log(`Generated ${feedPath}.`);
