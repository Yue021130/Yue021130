import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';

function encodeSlug(slug) {
  return slug
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function groupByDate(postsList) {
  const groups = {};
  for (const post of postsList) {
    const [year, month] = post.date.split('-');
    if (!groups[year]) groups[year] = {};
    if (!groups[year][month]) groups[year][month] = [];
    groups[year][month].push(post);
  }
  return groups;
}

export default function Archive() {
  const posts = usePosts();

  if (posts === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12" style={{ color: '#8a8680' }}>
        加载中……
      </div>
    );
  }

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const groups = groupByDate(sortedPosts);
  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-serif font-semibold mb-4"
        style={{ color: '#1a1a1a' }}
      >
        时间归档
      </h1>
      <p className="mb-10" style={{ color: '#5a5752' }}>
        按发布日期查找文章。
      </p>

      {years.length === 0 ? (
        <p style={{ color: '#8a8680' }}>暂无文章。</p>
      ) : (
        <div className="space-y-10">
          {years.map((year) => {
            const months = Object.keys(groups[year]).sort(
              (a, b) => Number(b) - Number(a)
            );
            return (
              <section key={year}>
                <h2
                  className="text-2xl font-serif font-semibold mb-4 pb-2 border-b"
                  style={{ color: '#1a1a1a', borderColor: '#e5e2dc' }}
                >
                  {year} 年
                </h2>
                <div className="space-y-6">
                  {months.map((month) => (
                    <div key={month}>
                      <h3
                        className="text-lg font-semibold mb-3"
                        style={{ color: '#5a5752' }}
                      >
                        {Number(month)} 月
                      </h3>
                      <ul className="space-y-3">
                        {groups[year][month].map((post) => (
                          <li key={post.slug}>
                            <Link
                              to={`/post/${encodeSlug(post.slug)}`}
                              className="block rounded-lg p-3 transition hover:bg-[#f0eee9]"
                            >
                              <div className="flex items-baseline justify-between gap-4">
                                <span
                                  className="font-medium"
                                  style={{ color: '#1a1a1a' }}
                                >
                                  {post.title}
                                </span>
                                <span
                                  className="text-sm shrink-0"
                                  style={{ color: '#8a8680' }}
                                >
                                  {post.date}
                                </span>
                              </div>
                              {post.path && post.path.length > 0 && (
                                <div
                                  className="text-xs mt-1"
                                  style={{ color: '#8a8680' }}
                                >
                                  {post.path.join(' / ')}
                                </div>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
