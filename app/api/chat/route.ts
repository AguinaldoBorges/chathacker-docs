import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { scoreChunks } from '@/lib/retrieval';
import { answerWithLLM } from '@/lib/ai';

const bodySchema = z.object({ question: z.string().min(3) });

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const chunks = await prisma.chunk.findMany({
      include: { document: true },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    const matches = scoreChunks(body.question, chunks, 6);
    const context = matches.map((item, i) => `Fonte ${i + 1}: ${item.chunk.content}`).join('\n\n');

    if (!matches.length) {
      return NextResponse.json({
        answer: 'Não encontrei contexto suficiente nos documentos cadastrados para responder com segurança.',
        sources: []
      });
    }

    let answer: string;
    try {
      answer = await answerWithLLM([
        {
          role: 'system',
          content:
            'Você é o ChatHacker Docs. Responda em português do Brasil. Use somente o contexto fornecido. Se o contexto não sustentar a resposta, diga claramente que não há informação suficiente. Seja direto e cite as fontes pelo número.'
        },
        { role: 'user', content: `Pergunta: ${body.question}\n\nContexto:\n${context}` }
      ]);
    } catch (llmError) {
      // Se IA falhar, retornar mensagem genérica
      answer = 'Desculpe, o serviço de IA está indisponível no momento. Consulte os trechos de contexto abaixo para informações relevantes.';
      console.error('Erro na IA:', llmError);
    }

    return NextResponse.json({
      answer,
      sources: matches.map((item, i) => ({
        number: i + 1,
        documentTitle: item.chunk.document.title,
        documentId: item.chunk.documentId,
        excerpt: item.chunk.content.slice(0, 280) + '...'
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar pergunta';
    console.error('Erro no chat:', error);
    return NextResponse.json({ error: message, answer: null, sources: [] }, { status: 400 });
  }
}
