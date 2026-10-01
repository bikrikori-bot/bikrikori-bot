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

app.get('/', (req,res) => res.send('BikriKori Bot is Live!'));
app.get('/webhook', (req,res) => {
  if(req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
    res.send(req.query['hub.challenge']);
  } else res.sendStatus(403);
});
app.post('/webhook', async (req,res) => {
  const messaging = req.body.entry?.[0]?.messaging?.[0];
  if(!messaging) return res.sendStatus(200);
  const senderId = messaging.sender.id;
  const text = messaging.message?.text?.toLowerCase() || "";
  let reply = "";
  if(text.includes("hi") || text.includes("হাই")){
    reply = `স্বাগতম! 😊\n\n1. টর্চ লাইট - 500 টাকা\n2. পাওয়ার ব্যাংক - 600 টাকা\n3. হেডফোন - 700 টাকা\n\nনাম লিখুন`;
  } else if(text.includes("টর্চ") || text.includes("1")){
    orders[senderId] = { product: "টর্চ লাইট", price: 500 };
    reply = "টর্চ লাইট 500 টাকা। আপনার নাম, ঠিকানা ও মোবাইল দিন";
  } else if(text.includes("পাওয়ার") || text.includes("2")){
    orders[senderId] = { product: "পাওয়ার ব্যাংক", price: 600 };
    reply = "পাওয়ার ব্যাংক 600 টাকা। আপনার নাম, ঠিকানা ও মোবাইল দিন";
  } else if(text.includes("হেডফোন") || text.includes("3")){
    orders[senderId] = { product: "হেডফোন", price: 700 };
    reply = "হেডফোন 700 টাকা। আপনার নাম, ঠিকানা ও মোবাইল দিন";
  } else if(text.length > 10){
    const lastOrder = orders[senderId];
    if(lastOrder){
      console.log("NEW ORDER:", senderId, lastOrder, text);
      reply = `ধন্যবাদ! অর্ডার পেয়েছি ✅\nপ্রোডাক্ট: ${lastOrder.product}\nতথ্য: ${text}\nশীঘ্রই কল করবো।`;
    } else {
      reply = "প্রোডাক্টের নাম লিখুন: টর্চ লাইট / পাওয়ার ব্যাংক / হেডফোন";
    }
  } else {
    reply = "Hi লিখুন";
  }
  await axios.post(`https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
    recipient: { id: senderId },
    message: { text: reply }
  });
  res.sendStatus(200);
});
app.listen(process.env.PORT || 10000, () => console.log("Running"));
