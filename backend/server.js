require('dotenv').config();
const express = require('express');
const cors = require('cors');
const workspaceRoutes = require('./routes/workspace');
const receiptRoutes = require('./routes/receipt');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/workspace', workspaceRoutes);
app.use('/api/receipt', receiptRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
