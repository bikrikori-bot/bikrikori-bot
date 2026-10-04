const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "bikrikori123";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const PORT = process.env.PORT || 10000;

app.get('/', (req,res) => res.send('BikriKori Bot is Live!'));

app.get('/webhook', (req,res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req,res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      if (event.message && event.message.text) {
        const userMsg = event.message.text;
        try {
          const botRes = await axios.post(GOOGLE_SCRIPT_URL, { message: userMsg });
          const reply = botRes.data.reply;
          const image = botRes.data.image;

          if (image) {
            await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
              recipient: { id: senderId },
              message: { attachment: { type: "image", payload: { url: image } } }
            });
          }
          await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: senderId },
            message: { text: reply }
          });
        } catch (e) {
          console.log(e.message);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => console.log("Bot running"));
