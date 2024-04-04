const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

// POST fetch users by emails
router.post('/fetchUsers', async (req, res) => {
    try {
        const userEmails = req.body.emails;
        const users = await User.find({ email: { $in: userEmails } });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
