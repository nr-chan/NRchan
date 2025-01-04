const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Reply = require('../models/reply');
const Thread = require('../models/thread');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  created: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

AdminSchema.pre('save', async function (next) {
  if (!this._id) {
    let id;
    let exists;
    do {
      id = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
      exists = await Admin.findById(id);
    } while (exists);
    this._id = id;
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  next();
});

const Admin = mongoose.model('Admin', AdminSchema);

// Middleware to verify admin JWT token
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, String(JWT_SECRET));
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ error: err });
  }
};

// Middleware to verify super admin role
const superAdminAuth = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin privileges required' });
  }
  next();
};

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    admin.lastLogin = Date.now();
    await admin.save();

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      String(JWT_SECRET),
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new admin (super_admin only)
router.post('/admin/create', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const admin = new Admin({
      username,
      password,
      role: role || 'admin',
      createdBy: req.admin._id
    });

    await admin.save();

    res.json({
      id: admin._id,
      username: admin.username,
      role: admin.role,
      created: admin.created
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all admins (admin+ only)
router.get('/admin/list', adminAuth, async (_, res) => {
  try {
    const admins = await Admin.find({}, '-password')
      .sort({ created: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete admin (super_admin only)
router.delete('/admin/:id', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const adminToDelete = await Admin.findById(req.params.id);

    if (!adminToDelete) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (adminToDelete._id === req.admin._id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await Admin.findByIdAndDelete(adminToDelete._id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update admin role (super_admin only)
router.patch('/admin/:id/role', adminAuth, superAdminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const adminToUpdate = await Admin.findById(req.params.id);

    if (!adminToUpdate) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (adminToUpdate._id === req.admin._id) {
      return res.status(400).json({ error: 'Cannot modify your own role' });
    }

    adminToUpdate.role = role;
    await adminToUpdate.save();

    res.json({
      id: adminToUpdate._id,
      username: adminToUpdate.username,
      role: adminToUpdate.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change admin password
router.patch('/admin/password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const validPassword = await bcrypt.compare(currentPassword, req.admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    req.admin.password = newPassword;
    await req.admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-specific board management routes
router.delete('/admin/thread/:id', adminAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    await Reply.deleteMany({ threadID: thread._id });
    await Thread.findByIdAndDelete(thread._id);

    res.json({
      message: 'Thread deleted successfully',
      adminAction: {
        type: 'thread_delete',
        admin: req.admin._id,
        threadId: thread._id,
        timestamp: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/lock/:id', adminAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const updatedThread = await Thread.findByIdAndUpdate(
      thread._id,
      { $set: { locked: !thread.locked } },
      { new: true }
    );

    res.json({
      message: `Thread ${updatedThread.locked ? 'locked' : 'unlocked'} successfully`,
      adminAction: {
        type: 'thread_lock_toggle',
        admin: req.admin._id,
        threadId: thread._id,
        newStatus: updatedThread.locked,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('Error toggling thread lock:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/pin/:id', adminAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const updatedThread = await Thread.findByIdAndUpdate(
      thread._id,
      { $set: { sticky: !thread.sticky } },
      { new: true }
    );

    res.json({
      message: `Thread ${updatedThread.sticky ? 'Pinned' : 'Unpinned'} successfully`,
      adminAction: {
        type: 'thread_pin_toggle',
        admin: req.admin._id,
        threadId: thread._id,
        newStatus: updatedThread.locked,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('Error toggling thread pin:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/admin/reply/:id', adminAuth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    await Thread.findByIdAndUpdate(reply.threadID, {
      $pull: { replies: reply._id }
    });

    await Reply.findByIdAndDelete(reply._id);
    await Reply.deleteMany({ parentReply: reply._id });

    res.json({
      message: 'Reply deleted successfully',
      adminAction: {
        type: 'reply_delete',
        admin: req.admin._id,
        replyId: reply._id,
        threadId: reply.threadID,
        timestamp: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
