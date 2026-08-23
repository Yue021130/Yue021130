import { Link } from 'react-router-dom';
import posts from '../posts.json';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-serif font-semibold mb-4"
        style={{ color: '#1a1a1a' }}
      >
        文章列表
      </h1>
      <p className="mb-10" style={{ color: '#5a5752' }}>
        welcome to my blog.
      </p>

      {posts.length === 0 ? (
        <p style={{ color: '#8a8680' }}>暂无文章，请在 posts/ 目录添加 .md 文件。</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug} className="group">
              <Link to={`/post/${post.slug}`} className="block">
                <article
                  className="rounded-xl p-6 transition hover:shadow-md"
                  style={{
                    backgroundColor: '#fffefb',
                    border: '1px solid #e5e2dc',
                  }}
                >
                  <h2
                    className="text-xl font-semibold mb-2 group-hover:opacity-80"
                    style={{ color: '#1a1a1a' }}
                  >
                    {post.title}
                  </h2>
                  <time
                    className="text-sm block mb-3"
                    style={{ color: '#8a8680' }}
                  >
                    {post.date}
                  </time>
                  <p className="line-clamp-2" style={{ color: '#5a5752' }}>
                    {post.excerpt}
                  </p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
