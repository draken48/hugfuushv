const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db } = require('../config/firebase');

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const doc = await db.collection('workspaces').doc(userId).get();
    
    if (!doc.exists) {
      return res.json({ workspace: null, message: 'No workspace found' });
    }
    
    res.json({ workspace: doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    await db.collection('workspaces').doc(userId).set({ ...req.body, updatedAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
