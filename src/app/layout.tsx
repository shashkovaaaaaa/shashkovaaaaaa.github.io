import type { ReactNode } from 'react';

import '@/styles/globals.css';

// <html> и <body> рендерят дочерние layout: [locale]/layout.tsx и корневой page.tsx,
// потому что lang зависит от локали.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
