const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost/url_shortener', { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Url = mongoose.model('Url', urlSchema);

app.get('/urls', async (req, res) => {
  const urls = await Url.find({}, { updatedAt: 0, _id: 0 });
  res.json(urls);
});

app.post('/urls', async (req, res) => {
  const { originalUrl, customPath } = req.body;
  const shortUrl = customPath || nanoid(6);
  const url = new Url({ originalUrl, shortUrl });
  await url.save();
  res.json({ shortUrl: `http://localhost:3000/${shortUrl}` });
});

app.get('/urls/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  res.redirect(url.originalUrl);
});

app.patch('/urls/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const { newOriginalUrl } = req.body;
  await Url.findOneAndUpdate({ shortUrl }, { originalUrl: newOriginalUrl, updatedAt: Date.now() });
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
