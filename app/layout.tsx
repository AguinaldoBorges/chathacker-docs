import './styles.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatHacker Docs',
  description: 'RAG simples para consulta de documentos e links com IA.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
