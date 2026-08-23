import { useState } from 'react';
import { Link } from 'react-router-dom';
import posts from '../posts.json';

function encodeSlug(slug) {
  return slug
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function buildTree(postsList) {
  const root = { children: {}, posts: [] };
  for (const post of postsList) {
    let node = root;
    for (let i = 0; i < post.path.length - 1; i++) {
      const name = post.path[i];
      if (!node.children[name]) {
        node.children[name] = { children: {}, posts: [] };
      }
      node = node.children[name];
    }
    node.posts.push(post);
  }
  return root;
}

function PostLink({ post }) {
  return (
    <Link
      to={`/post/${encodeSlug(post.slug)}`}
      className="block py-2 px-3 rounded-lg transition hover:bg-[#f0eee9]"
    >
      <span className="font-medium" style={{ color: '#1a1a1a' }}>
        {post.title}
      </span>
      <time
        className="block text-xs mt-0.5"
        style={{ color: '#8a8680' }}
      >
        {post.date}
      </time>
    </Link>
  );
}

function MenuNode({ name, node, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const childMenus = Object.entries(node.children);
  const hasChildren = childMenus.length > 0 || node.posts.length > 0;

  return (
    <div className="mb-2">
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`flex items-center w-full text-left font-semibold py-2 px-3 rounded-lg transition ${
          hasChildren ? 'hover:bg-[#f0eee9]' : ''
        }`}
        style={{ color: '#1a1a1a' }}
      >
        {hasChildren && (
          <span className="mr-2 text-xs" style={{ color: '#8a8680' }}>
            {open ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="mr-2 text-xs">•</span>}
        {name}
      </button>
      {open && hasChildren && (
        <div className="ml-4 border-l pl-3" style={{ borderColor: '#e5e2dc' }}>
          {childMenus.map(([childName, childNode]) => (
            <MenuNode
              key={childName}
              name={childName}
              node={childNode}
              defaultOpen={false}
            />
          ))}
          {node.posts.map((post) => (
            <PostLink key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const tree = buildTree(posts);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-serif font-semibold mb-4"
        style={{ color: '#1a1a1a' }}
      >
        文章目录
      </h1>
      <p className="mb-2" style={{ color: '#5a5752' }}>
        按菜单层级浏览所有内容。
      </p>
      <Link
        to="/archive"
        className="text-sm hover:underline mb-10 inline-block"
        style={{ color: '#2563eb' }}
      >
        按时间归档 →
      </Link>

      {posts.length === 0 ? (
        <p style={{ color: '#8a8680' }}>
          暂无文章，请在 posts/ 目录按照 一级菜单/二级菜单/帖子文件夹/ 的结构添加内容。
        </p>
      ) : (
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: '#fffefb',
            border: '1px solid #e5e2dc',
          }}
        >
          {Object.entries(tree.children).map(([name, node]) => (
            <MenuNode key={name} name={name} node={node} defaultOpen={true} />
          ))}
        </div>
      )}
    </div>
  );
}
