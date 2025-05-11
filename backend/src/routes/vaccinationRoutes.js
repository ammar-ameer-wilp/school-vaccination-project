const express = require('express');
const router = express.Router();
const { createDrive, updateDrive, getDrives } = require('../controllers/vaccinationController');

router.post('/', createDrive);
router.put('/:id', updateDrive);
router.get('/', getDrives);

module.exports = router;
