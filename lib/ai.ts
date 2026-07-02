import { GoogleGenerativeAI } from '@google/generative-ai';

type CompletionMessage = { role: 'system' | 'user'; content: string };

export async function answerWithLLM(messages: CompletionMessage[]) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return 'IA não configurada. Configure AI_API_KEY no .env para gerar respostas automáticas. Enquanto isso, use os trechos de contexto retornados como base.';
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.AI_MODEL ?? 'gemini-2.0-flash';
    const model = client.getGenerativeModel({ model: modelName });

    // Combinar mensagens system e user no formato esperado pelo Gemini
    const systemInstruction = messages.find((m) => m.role === 'system')?.content ?? '';
    const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content);
    const userContent = userMessages.join('\n\n');

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: systemInstruction ? `${systemInstruction}\n\n${userContent}` : userContent
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    });

    const text = response.response.text();
    return text || 'Não consegui gerar uma resposta.';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido na IA';
    console.error('Erro ao chamar IA Gemini:', message);

    // Fallback: retornar mensagem informativa em caso de erro
    if (message.includes('high demand')) {
      return 'A IA está sobrecarregada neste momento. Tente novamente em alguns segundos. Você ainda pode consultar os trechos de contexto retornados abaixo.';
    }

    return `Erro ao processar com IA: ${message}. Verifique sua API key e modelo configurados no .env`;
  }
}
