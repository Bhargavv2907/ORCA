// Server-side TTS proxy — bypasses CORS restrictions for Google Translate TTS
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'en';

  if (!text) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  // Truncate to 200 chars for Google TTS limit
  const truncatedText = text.slice(0, 200);
  const encodedText = encodeURIComponent(truncatedText);

  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;

  try {
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'TTS service unavailable' }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[TTS Proxy] Error:', error);
    return NextResponse.json({ error: 'TTS proxy failed' }, { status: 500 });
  }
}
