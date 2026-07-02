# Pitch do projeto

## Resumo de 30 segundos

O ChatHacker Docs é uma aplicação Full Stack que permite cadastrar textos e links e fazer perguntas sobre esse conteúdo usando IA. O sistema não responde livremente: ele primeiro recupera trechos relevantes da base cadastrada e só então envia esse contexto para o modelo. Isso reduz alucinação e torna a resposta rastreável.

## Problema resolvido

Empresas têm documentos, páginas, contratos, manuais e bases internas que são difíceis de consultar. O projeto transforma esses conteúdos em uma base pesquisável por linguagem natural.

## Stack defendida

- Next.js para entregar produto completo com front e backend.
- TypeScript para reduzir bugs e facilitar manutenção.
- Prisma para modelagem de dados clara.
- SQLite no MVP para simplificar setup.
- IA via API compatível com Gemini para evitar lock-in.
- RAG para respostas baseadas em contexto.

## Trade-offs

Comecei com SQLite e busca lexical porque o objetivo do MVP é provar valor rapidamente. Para produção, eu evoluiria para PostgreSQL, pgvector e embeddings, além de autenticação, filas e observabilidade.

## Evolução técnica

1. Trocar SQLite por PostgreSQL.
2. Criar tabela de embeddings.
3. Processar documentos em background com filas.
4. Adicionar upload de PDF.
5. Criar autenticação e separação por usuário.
6. Criar testes automatizados.
7. Fazer deploy com pipeline CI/CD.
