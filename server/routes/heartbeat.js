const express = require('express');
const router = express.Router();

const activeDevices = new Map();

router.post('/', async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ message: 'Device ID is required' });
  }

  activeDevices.set(deviceId, Date.now());
  res.json({ message: 'Heartbeat received' });
});

router.get('/active-devices', async (req, res) => {
  const now = Date.now();
  const activeThreshold = 10000;

  for (const [deviceId, lastSeen] of activeDevices) {
    if (now - lastSeen > activeThreshold) {
      activeDevices.delete(deviceId);
    }
  }

  res.json({ activeDevices: activeDevices.size });
});

module.exports = router;
