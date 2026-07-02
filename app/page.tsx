'use client';

import { FormEvent, useEffect, useState } from 'react';

type Source = { number: number; documentTitle: string; excerpt: string };
type DocumentItem = { id: string; title: string; sourceUrl?: string; _count: { chunks: number } };

export default function Home() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadDocuments() {
    const response = await fetch('/api/documents');
    const data = await response.json();
    setDocuments(data.documents ?? []);
  }

  useEffect(() => { void loadDocuments(); }, []);

  async function createDocument(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url: url || undefined, text: text || undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao cadastrar documento');
      setTitle(''); setUrl(''); setText('');
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally { setLoading(false); }
  }

  async function deleteDocument(docId: string) {
    if (!confirm('Tem certeza que deseja remover este documento?')) return;

    setDeleting(docId);
    try {
      const response = await fetch(`/api/documents?id=${docId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Falha ao deletar documento');
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally { setDeleting(null); }
  }

  async function ask(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setAnswer(''); setSources([]);
    setError('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao processar pergunta');
      setAnswer(data.answer || 'Sem resposta');
      setSources(data.sources ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally { setLoading(false); }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="badge">Full Stack + IA + RAG</p>
          <h1>ChatHacker Docs</h1>
          <p>Consulte documentos e links com respostas contextualizadas por IA, mantendo rastreabilidade das fontes.</p>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="grid">
        <form className="card" onSubmit={createDocument}>
          <h2>1. Cadastrar conhecimento</h2>
          <input placeholder="Título do documento" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="URL opcional" value={url} onChange={(e) => setUrl(e.target.value)} />
          <textarea placeholder="Ou cole um texto aqui" value={text} onChange={(e) => setText(e.target.value)} rows={8} />
          <button disabled={loading}>{loading ? 'Processando...' : 'Salvar e indexar'}</button>
        </form>

        <form className="card" onSubmit={ask}>
          <h2>2. Perguntar aos documentos</h2>
          <textarea placeholder="Ex: quais são os principais pontos deste material?" value={question} onChange={(e) => setQuestion(e.target.value)} rows={5} required />
          <button disabled={loading}>{loading ? 'Consultando...' : 'Perguntar'}</button>
          {answer && <div className="answer"><strong>Resposta</strong><p>{answer}</p></div>}
          {sources.map((source) => (
            <div className="source" key={`${source.number}-${source.documentTitle}`}>
              <strong>Fonte {source.number}: {source.documentTitle}</strong>
              <p>{source.excerpt}</p>
            </div>
          ))}
        </form>
      </section>

      <section className="card">
        <h2>Documentos indexados</h2>
        {documents.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>Nenhum documento cadastrado ainda.</p>}
        <div className="docs">
          {documents.map((doc) => (
            <div className="doc" key={doc.id}>
              <strong>{doc.title}</strong>
              <span>{doc._count.chunks} chunks</span>
              <div className="doc-actions">
                <button
                  className="danger"
                  onClick={() => deleteDocument(doc.id)}
                  disabled={deleting === doc.id}
                >
                  {deleting === doc.id ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
