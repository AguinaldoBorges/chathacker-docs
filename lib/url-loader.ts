import * as cheerio from 'cheerio';

export async function loadUrlContent(url: string) {
  const response = await fetch(url, { headers: { 'User-Agent': 'ChatHackerDocs/1.0' } });
  if (!response.ok) throw new Error('Não foi possível carregar a URL informada.');
  const html = await response.text();
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}
