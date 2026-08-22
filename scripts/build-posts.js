import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.resolve(__dirname, '../posts');
const outputPath = path.resolve(__dirname, '../src/posts.json');

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

console.log(`Generated ${outputPath} with ${posts.length} post(s).`);
