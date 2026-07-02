import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { chunkText } from '@/lib/chunk';
import { loadUrlContent } from '@/lib/url-loader';

const bodySchema = z.object({
  title: z.string().min(2),
  text: z.string().optional(),
  url: z.string().url().optional()
});

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { chunks: true } } }
  });
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    let content = body.url ? await loadUrlContent(body.url) : body.text?.trim();
    if (!content || content.length < 30) {
      return NextResponse.json({ error: 'Envie um texto maior ou uma URL com conteúdo válido.' }, { status: 400 });
    }

    // Sanitizar conteúdo removendo caracteres de controle
    content = content
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const chunks = chunkText(content);
    const document = await prisma.document.create({
      data: {
        title: body.title,
        sourceUrl: body.url,
        content,
        chunks: { create: chunks.map((chunk: string, index: number) => ({ content: chunk, index })) }
      },
      include: { _count: { select: { chunks: true } } }
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar documento';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'ID do documento é obrigatório' }, { status: 400 });
    }

    await prisma.document.delete({
      where: { id: documentId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar documento';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
