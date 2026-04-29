const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let currentQR = '';
let isConnected = false;
let client = null;

function startClient() {
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './whatsapp_auth' }),
    puppeteer: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
      headless: true,
    },
  });

  client.on('qr', (qr) => {
    console.log('QR Code généré — scanne-le dans WhatsApp.');
    currentQR = qr;
    isConnected = false;
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp connecté avec succès !');
    isConnected = true;
    currentQR = '';
  });

  client.on('authenticated', () => {
    console.log('Authentification réussie.');
  });

  client.on('auth_failure', (msg) => {
    console.error('Échec d\'authentification:', msg);
    isConnected = false;
  });

  client.on('disconnected', (reason) => {
    console.log('Déconnecté:', reason);
    isConnected = false;
    currentQR = '';
    client.destroy().then(() => {
      setTimeout(startClient, 3000);
    });
  });

  client.initialize().catch((err) => {
    console.error('Erreur d\'initialisation:', err.message);
    setTimeout(startClient, 5000);
  });
}

startClient();

app.get('/status', (req, res) => {
  res.json({ connected: isConnected, qr: currentQR });
});

app.get('/qr', (req, res) => {
  res.json({ qr: currentQR, connected: isConnected });
});

app.post('/send', async (req, res) => {
  const { phone, message, audioBase64 } = req.body;

  if (!isConnected || !client) {
    return res.status(503).json({ error: 'WhatsApp n\'est pas connecté' });
  }

  try {
    const digits = phone.replace(/\D/g, '');
    const chatId = digits.startsWith('212')
      ? `${digits}@c.us`
      : `212${digits.slice(1)}@c.us`;

    if (audioBase64) {
      const media = new MessageMedia(
        'audio/ogg; codecs=opus',
        audioBase64,
        'voice.ogg'
      );
      await client.sendMessage(chatId, media, { sendAudioAsVoice: true });
    } else if (message) {
      await client.sendMessage(chatId, message);
    } else {
      return res.status(400).json({ error: 'message ou audioBase64 requis' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur d\'envoi:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', connected: isConnected });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur WhatsApp en écoute sur le port ${PORT}`);
});
