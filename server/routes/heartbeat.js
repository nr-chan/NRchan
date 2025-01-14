const express = require('express');
const webSocket = require('ws');
const activeDevices = new Map();
const activeThreshold = 10000;


const wss = new webSocket.Server({ noServer: true });



wss.on('connection', (ws, req) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    try {
      const { deviceId } = JSON.parse(message);
      if (deviceId) {
        activeDevices.set(deviceId, Date.now());
        ws.send(JSON.stringify({ message: activeDevices.size }));
      } else {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    } catch (err) {
      console.error('NACK error: ', err);
      ws.send(JSON.stringify({ error: 'Invalid JSON format' }));
    }
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [deviceId, lastSeen] of activeDevices) {
    if (now - lastSeen > activeThreshold) {
      activeDevices.delete(deviceId);
    }
  }
}, activeThreshold);

module.exports = { wss };
