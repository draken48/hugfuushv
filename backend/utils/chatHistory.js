const { db } = require('../config/firebase');

async function saveChatMessage(userId, sessionId, role, content) {
  try {
    await db.collection('chatHistory').add({
      userId,
      sessionId,
      role,
      content,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

async function getChatHistory(userId, sessionId, limit = 50) {
  try {
    const snapshot = await db.collection('chatHistory')
      .where('userId', '==', userId)
      .where('sessionId', '==', sessionId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data()).reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

module.exports = { saveChatMessage, getChatHistory };
