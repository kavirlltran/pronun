// pages/api/evaluate.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { audio, text } = req.body;
  if (!audio || !text) {
    res.status(400).json({ error: 'Missing audio or text data' });
    return;
  }
  
  // API key đã được URL-encode
  const apiKey = "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv%2FfcvLKGaWgcsQkEivJ4D%2Bt9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m%2FYYHA";
  // Giả sử endpoint SpeechAce như sau (thay đổi nếu cần theo tài liệu)
  const apiUrl = `https://api.speechace.com/api/scoring/text/v0.1/json/?key=${apiKey}&dialect=general`;
  
  const payload = {
    audio_data: audio,
    reference_text: text
    // Thêm các tham số khác nếu cần theo tài liệu SpeechAce
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error calling SpeechAce API:", error);
    res.status(500).json({ error: "Error calling SpeechAce API" });
  }
}
