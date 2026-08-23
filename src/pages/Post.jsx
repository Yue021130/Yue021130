import { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import posts from '../posts.json';
import GiscusComments from '../components/Giscus';

function TableOfContents({ content }) {
  const headings = useMemo(() => {
    const list = [];
    const regex = /<h([1-3]) id="([^"]+)">([^<]+)<\/h[1-3]>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      list.push({
        depth: Number(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]+>/g, ''),
      });
    }
    return list;
  }, [content]);

  if (headings.length === 0) return null;

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-24 p-4 bg-white/60 backdrop-blur rounded-xl border border-[#e5e2dc]">
        <h3 className="text-sm font-semibold mb-3 text-[#5a5752]">目录</h3>
        <ul className="space-y-2 text-sm">
          {headings.map((h) => (
            <li
              key={h.id}
              style={{ paddingLeft: `${(h.depth - 1) * 0.75}rem` }}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className="block text-[#5a5752] hover:text-[#1a1a1a] leading-snug"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function Breadcrumb({ path }) {
  return (
    <nav className="text-sm mb-6" style={{ color: '#8a8680' }}>
      <Link to="/" className="hover:underline" style={{ color: '#2563eb' }}>
        首页
      </Link>
      {path.map((part, index) => (
        <span key={index}>
          <span className="mx-2">/</span>
          <span style={{ color: '#5a5752' }}>{part}</span>
        </span>
      ))}
    </nav>
  );
}

export default function Post() {
  const routeParams = useParams();
  const location = useLocation();

  // routeParams['*'] is URL-decoded path after /post/
  const routePath = (routeParams['*'] || '').replace(/\/$/, '');
  const pathnameSlug = decodeURIComponent(
    location.pathname.replace(/^.*\/post\//, '').replace(/\/$/, '')
  );

  const post =
    posts.find((p) => p.slug === routePath) ||
    posts.find((p) => p.slug === pathnameSlug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-[#5a5752] mb-6">文章不存在</p>
        <Link to="/" className="text-[#2563eb] hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex gap-10">
      <TableOfContents content={post.content} />
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb path={post.path} />
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#1a1a1a] mb-4">
          {post.title}
        </h1>
        <time className="text-sm text-[#8a8680] block mb-10">{post.date}</time>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <GiscusComments />
      </article>
    </div>
  );
}
