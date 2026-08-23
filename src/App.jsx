import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Post from './pages/Post';

function RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = searchParams.get('p');
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f5f0' }}>
      <RedirectHandler />
      <header className="border-b" style={{ borderColor: '#e5e2dc' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-serif font-semibold hover:opacity-80"
            style={{ color: '#1a1a1a' }}
          >
            Yue's Blog
          </Link>
          <nav>
            <a
              href="https://github.com/Yue021130/Yue021130"
              target="_blank"
              rel="noreferrer"
              className="text-sm hover:underline"
              style={{ color: '#5a5752' }}
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug/*" element={<Post />} />
          <Route
            path="*"
            element={
              <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-serif font-semibold mb-4" style={{ color: '#1a1a1a' }}>
                  404
                </h1>
                <p className="mb-6" style={{ color: '#5a5752' }}>
                  页面不存在
                </p>
                <Link to="/" className="hover:underline" style={{ color: '#2563eb' }}>
                  返回首页
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer
        className="border-t py-6 text-center text-sm"
        style={{ borderColor: '#e5e2dc', color: '#8a8680' }}
      >
        © {new Date().getFullYear()} Yue's Blog. Powered by React + Vite + GitHub Pages.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/Yue021130">
      <Layout />
    </BrowserRouter>
  );
}
