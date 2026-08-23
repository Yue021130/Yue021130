import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import usePosts from '../hooks/usePosts';

function encodeSlug(slug) {
  return slug
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  if (!query.trim() || !text) return text;
  const terms = query
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map(escapeRegExp);
  if (terms.length === 0) return text;
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="rounded px-0.5"
        style={{ backgroundColor: '#fef08a', color: '#1a1a1a' }}
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

function extractSnippet(text, query, maxLength = 160) {
  if (!text) return '';
  const terms = query
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map(escapeRegExp);
  if (terms.length === 0) return text.slice(0, maxLength).replace(/\s+$/, '');

  const regex = new RegExp(terms.join('|'), 'i');
  const match = text.match(regex);
  if (!match) return text.slice(0, maxLength).replace(/\s+$/, '');

  const start = Math.max(0, match.index - Math.floor(maxLength / 2));
  const end = Math.min(text.length, start + maxLength);
  let snippet = text.slice(start, end).replace(/^\s+|\s+$/g, '');
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';
  return snippet;
}

function searchPosts(posts, query) {
  if (!query.trim()) return [];
  const terms = query.split(/\s+/).filter((t) => t.length > 0);
  if (terms.length === 0) return [];

  const termRegexes = terms.map((t) => new RegExp(escapeRegExp(t), 'i'));

  return posts
    .map((post) => {
      const text = [post.title, post.excerpt, post.content || ''].join('\n');
      let score = 0;
      let matchCount = 0;

      for (const re of termRegexes) {
        const titleMatches = (post.title || '').match(re)?.length || 0;
        const excerptMatches = (post.excerpt || '').match(re)?.length || 0;
        const contentMatches = (post.content || '').match(re)?.length || 0;

        if (titleMatches > 0) score += titleMatches * 10;
        if (excerptMatches > 0) score += excerptMatches * 4;
        if (contentMatches > 0) score += contentMatches * 1;

        if (titleMatches + excerptMatches + contentMatches > 0) {
          matchCount += 1;
        }
      }

      // 只有命中所有关键词才返回
      if (matchCount < terms.length) return null;

      return { post, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post);
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const posts = usePosts();

  const results = useMemo(() => {
    if (!posts || !initialQuery.trim()) return [];
    return searchPosts(posts, initialQuery);
  }, [posts, initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  if (posts === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12" style={{ color: '#8a8680' }}>
        加载中……
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-serif font-semibold mb-6"
        style={{ color: '#1a1a1a' }}
      >
        搜索
      </h1>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="flex gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入关键词，多个词用空格分隔"
            className="flex-1 px-4 py-3 rounded-lg border outline-none transition focus:ring-2"
            style={{
              backgroundColor: '#fffefb',
              borderColor: '#e5e2dc',
              color: '#1a1a1a',
            }}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}
          >
            搜索
          </button>
        </div>
      </form>

      {!initialQuery && (
        <p style={{ color: '#8a8680' }}>输入关键词开始搜索文章标题、摘要和正文。</p>
      )}

      {initialQuery && (
        <p className="mb-6 text-sm" style={{ color: '#5a5752' }}>
          {results.length > 0 ? `找到 ${results.length} 篇相关文章` : '没有找到相关文章'}
        </p>
      )}

      <div className="space-y-6">
        {results.map((post) => {
          const snippet = extractSnippet(post.content || post.excerpt, initialQuery);
          return (
            <article
              key={post.slug}
              className="rounded-xl p-6 transition hover:shadow-sm"
              style={{
                backgroundColor: '#fffefb',
                border: '1px solid #e5e2dc',
              }}
            >
              <Link
                to={`/post/${encodeSlug(post.slug)}`}
                className="block text-xl font-medium mb-2 hover:underline"
                style={{ color: '#1a1a1a' }}
              >
                {highlightText(post.title, initialQuery)}
              </Link>
              <time className="block text-xs mb-3" style={{ color: '#8a8680' }}>
                {post.date}
              </time>
              <p className="text-sm leading-relaxed" style={{ color: '#5a5752' }}>
                {highlightText(snippet, initialQuery)}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
