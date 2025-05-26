const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/visa-rate', async (req, res) => {
  const visaUrl = 'https://www.visa.com.au/cmsapi/fx/rates';

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US'); // MM/DD/YYYY

    const params = {
    amount: '1000',
    fee: '0',
    utcConvertedDate: formattedDate,
    exchangedate: formattedDate,
    fromCurr: 'ARS',
    toCurr: 'USD'
    };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.visa.com.au/travel-with-visa/exchange-rate-calculator.html',
    'Origin': 'https://www.visa.com.au',
    'Connection': 'keep-alive'
  };

  try {
    const response = await axios.get(visaUrl, { params, headers });
    const amount = response.data.originalValues.toAmountWithVisaRate;
    res.json({ toAmountWithVisaRate: amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
