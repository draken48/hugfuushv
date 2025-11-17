const express = require('express');
const router = express.Router();

router.post('/scan', async (req, res) => {
  res.json({ message: 'Receipt scanner - implement OCR logic here' });
});

module.exports = router;
