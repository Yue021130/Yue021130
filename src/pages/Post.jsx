import { useParams, Link, useLocation } from 'react-router-dom';
import posts from '../posts.json';
import GiscusComments from '../components/Giscus';

export default function Post() {
  const { slug } = useParams();
  const location = useLocation();
  // react-router v7 may keep nested slug in :slug/*
  const fullSlug = location.pathname.replace(/^.*\/post\//, '').replace(/\/$/, '');
  const post = posts.find((p) => p.slug === slug || p.slug === fullSlug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-6">文章不存在</p>
        <Link to="/" className="text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← 返回列表
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
      <time className="text-sm text-gray-500 block mb-10">{post.date}</time>
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <GiscusComments />
    </article>
  );
}
