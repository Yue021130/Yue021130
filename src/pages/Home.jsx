import { Link } from 'react-router-dom';
import posts from '../posts.json';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">文章列表</h1>
      <p className="text-gray-600 mb-10"> welcome to my blog.</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">暂无文章，请在 posts/ 目录添加 .md 文件。</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug} className="group">
              <Link to={`/post/${post.slug}`} className="block">
                <article className="border border-gray-200 rounded-xl p-6 transition hover:shadow-md hover:border-blue-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {post.title}
                  </h2>
                  <time className="text-sm text-gray-500 block mb-3">{post.date}</time>
                  <p className="text-gray-700 line-clamp-2">{post.excerpt}</p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
