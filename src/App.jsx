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
    <div className="min-h-screen flex flex-col bg-white">
      <RedirectHandler />
      <header className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Yue's Blog
          </Link>
          <nav>
            <a
              href="https://github.com/Yue021130/Yue021130"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
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
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-600 mb-6">页面不存在</p>
                <Link to="/" className="text-blue-600 hover:underline">
                  返回首页
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
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
