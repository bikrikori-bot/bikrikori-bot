
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const PRODUCTS = [
  { id: 1, name: "টর্চ লাইট", price: 500 },
  { id: 2, name: "পাওয়ার ব্যাংক", price: 600 },
  { id: 3, name: "হেডফোন", price: 700 }
];
let orders = {};

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "bikrikori123";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PORT = process.env.PORT || 10000;

app.get('/', (req,res) => res.send('BikriKori Bot is Running'));

app.get('/webhook', (req,res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req,res) => {
  const messaging = req.body.entry?.[0]?.messaging?.[0];
  if(!messaging) return res.sendStatus(200);

  const senderId = messaging.sender.id;
  const text = messaging.message?.text?.toLowerCase() || "";
  let reply = "";

  if(text.includes("hi") || text.includes("hello") || text.includes("হাই")){
    reply = `আসসালামু আলাইকুম! Bikri Kori তে স্বাগতম 🛒\n\nআমাদের প্রোডাক্ট:\n1. টর্চ লাইট - 500 টাকা\n2. পাওয়ার ব্যাংক - 600 টাকা\n3. হেডফোন - 700 টাকা\n\nঅর্ডার করতে প্রোডাক্টের নাম লিখুন`;
  } else if(text.includes("টর্চ") || text.includes("1")){
    reply = `🔦 টর্চ লাইট - 500 টাকা\nঅর্ডার করতে লিখুন: অর্ডার 1 এবং আপনার ঠিকানা`;
  } else if(text.includes("পাওয়ার") || text.includes("2")){
    reply = `🔋 পাওয়ার ব্যাংক - 600 টাকা\nঅর্ডার করতে লিখুন: অর্ডার 2 এবং আপনার ঠিকানা`;
  } else if(text.includes("হেডফোন") || text.includes("3")){
    reply = `🎧 হেডফোন - 700 টাকা\nঅর্ডার করতে লিখুন: অর্ডার 3 এবং আপনার ঠিকানা`;
  } else if(text.includes("অর্ডার")){
    reply = `ধন্যবাদ! আপনার অর্ডারটি নেওয়া হয়েছে ✅\nআমাদের টিম 2 ঘন্টার মধ্যে কল করবে।`;
  } else {
    reply = `বুঝতে পারিনি। দয়া করে 1, 2, 3 লিখে প্রোডাক্ট দেখুন।`;
  }

  try{
    if(PAGE_ACCESS_TOKEN){
      await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: senderId },
        message: { text: reply }
      });
    }
  } catch(e){
    console.log("Send Error", e.response?.data);
  }

  res.status(200).send('EVENT_RECEIVED');
});

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
