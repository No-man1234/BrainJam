const express = require('express');
const router = express.Router();
const db = require('../config/database'); 

// Test route
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Practice route works!' });
});

// Fetch all public problems
router.get('/problems', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, title, slug, difficulty, body_md, input_format, output_format 
             FROM problems 
             WHERE is_public = 1`
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Database query failed' });
    }
});


module.exports = router;
