import Giscus from '@giscus/react';

// Giscus 配置
// 请先在仓库 Settings → General → Features 中开启 Discussions，
// 并访问 https://giscus.app 获取 categoryId，然后替换下面的占位值。
const GISCUS_CONFIG = {
  repo: 'Yue021130/Yue021130',
  repoId: '1342977581',
  category: 'General',
  categoryId: 'YOUR_CATEGORY_ID_HERE',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
  loading: 'lazy',
};

export default function GiscusComments() {
  if (GISCUS_CONFIG.categoryId === 'YOUR_CATEGORY_ID_HERE') {
    return (
      <div className="mt-12 p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-800">
        Giscus 尚未配置完成：请在 src/components/Giscus.jsx 中填入正确的 categoryId。
      </div>
    );
  }

  return (
    <div className="mt-12">
      <Giscus {...GISCUS_CONFIG} />
    </div>
  );
}
