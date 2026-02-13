import type { VercelRequest, VercelResponse } from '@vercel/node';

// Liste des robots de reseaux sociaux
const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'LinkedInBot',
  'Twitterbot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Applebot',
  'iMessageLinkPreview',
];

// URL de votre Edge Function Supabase
const CARD_META_URL = 'https://esruhhqykblyucymblzq.supabase.co/functions/v1/card-meta';

// URL de votre SPA (le vrai site)
const SPA_ORIGIN = 'https://app.smartcarte.pro';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '/';
  const userAgent = req.headers['user-agent'] || '';

  // Verifier si c'est un robot
  const isBot = BOT_USER_AGENTS.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  if (isBot && path !== '/' && path !== '/favicon.ico') {
    // C'est un robot : on lui sert le HTML avec les bonnes meta tags
    try {
      const metaResponse = await fetch(`${CARD_META_URL}${path}`);
      const html = await metaResponse.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(metaResponse.status).send(html);
    } catch {
      // En cas d'erreur, rediriger vers le SPA
      res.redirect(302, `${SPA_ORIGIN}${path}`);
    }
  } else {
    // C'est un humain : on le redirige vers le SPA
    res.redirect(302, `${SPA_ORIGIN}${path}`);
  }
}
