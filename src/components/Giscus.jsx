import { useEffect, useRef } from 'react';

const GISCUS_CONFIG = {
  src: 'https://giscus.app/client.js',
  'data-repo': 'Yue021130/Yue021130',
  'data-repo-id': 'R_kgDOUAw2LQ',
  'data-category': 'Show and tell',
  'data-category-id': 'DIC_kwDOUAw2Lc4DD9P-',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'top',
  'data-theme': 'preferred_color_scheme',
  'data-lang': 'zh-CN',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
  async: true,
};

export default function GiscusComments() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous giscus element to avoid duplicates on route changes
    container.innerHTML = '';

    const script = document.createElement('script');
    Object.entries(GISCUS_CONFIG).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="giscus mt-12" />;
}
