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

function walk(dir, predicate = () => true) {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      entries.push(...walk(full, predicate));
    } else if (stat.isFile() && predicate(full)) {
      entries.push(full);
    }
  }
  return entries;
}

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

function isExternalUrl(href) {
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function slugify(text) {
  return stripHtml(text)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '')
    || 'heading';
}

function applyHighlightSyntax(content) {
  return content.replace(/==([^=]+)==/g, '<mark>$1</mark>');
}

function rewriteImageHref(href, postRelPosix) {
  if (!href || isExternalUrl(href) || href.startsWith('/')) {
    return href;
  }
  const postDir = path.posix.dirname(postRelPosix);
  const assetRel = path.posix.normalize(`${postDir}/${href}`);
  return `${basePath}/images/posts/${assetRel}`;
}

function createRenderer(postRelPosix) {
  const defaultImage = marked.Renderer.prototype.image;
  const renderer = new marked.Renderer();
  renderer.image = function (token) {
    token.href = rewriteImageHref(token.href, postRelPosix);
    return defaultImage.call(this, token);
  };
  renderer.heading = function (token) {
    const id = slugify(token.text);
    return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>`;
  };
  return renderer;
}

// Copy post assets to public/images/posts/
if (fs.existsSync(assetsDestDir)) {
  fs.rmSync(assetsDestDir, { recursive: true, force: true });
}

const assetFiles = walk(
  postsDir,
  (file) => !file.toLowerCase().endsWith('.md')
);

for (const file of assetFiles) {
  const rel = toPosix(path.relative(postsDir, file));
  const dest = path.join(assetsDestDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}

if (assetFiles.length > 0) {
  console.log(`Copied ${assetFiles.length} asset(s) to ${toPosix(path.relative(__dirname, assetsDestDir))}.`);
}

const mdFiles = walk(postsDir, (file) => file.toLowerCase().endsWith('.md'));

const posts = mdFiles
  .map((file) => {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = matter(raw);
    const relative = path.relative(postsDir, file);
    const relPosix = toPosix(relative);
    const slug = relPosix.replace(/\.md$/i, '');
    const renderer = createRenderer(relPosix);
    const contentWithHighlights = applyHighlightSyntax(parsed.content);
    const html = marked.parse(contentWithHighlights, { renderer, async: false });
    const title = parsed.data.title || slug;
    const date = formatDate(parsed.data.date || fs.statSync(file).mtime);
    const excerpt =
      parsed.data.excerpt || stripHtml(html).slice(0, 160).replace(/\s+$/, '') + '…';

    return {
      slug,
      title,
      date,
      excerpt,
      content: html,
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
