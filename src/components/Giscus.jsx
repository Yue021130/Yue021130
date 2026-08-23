import Giscus from '@giscus/react';

const GISCUS_CONFIG = {
  repo: 'Yue021130/Yue021130',
  repoId: 'R_kgDOUAw2LQ',
  category: 'Show and tell',
  categoryId: 'DIC_kwDOUAw2Lc4DD9P-',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
  loading: 'lazy',
};

export default function GiscusComments() {
  return (
    <div className="mt-12">
      <Giscus {...GISCUS_CONFIG} />
    </div>
  );
}
