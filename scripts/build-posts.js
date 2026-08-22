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
const siteUrl = 'https://yue021130.github.io/Yue021130';

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

function walk(dir) {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      entries.push(...walk(full));
    } else if (stat.isFile() && name.endsWith('.md')) {
      entries.push(full);
    }
  }
  return entries;
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

const files = walk(postsDir);

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = matter(raw);
    const relative = path.relative(postsDir, file);
    const slug = relative.replace(/\.md$/i, '').replace(/\\/g, '/');
    const html = marked.parse(parsed.content, { async: false });
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
