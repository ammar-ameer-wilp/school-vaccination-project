const express = require('express');
const {
  registerStudentForDrive,
  getStudentsForDrive
} = require('../controllers/studentVaccinationController');

const router = express.Router();

router.post('/', registerStudentForDrive);
router.get('/:driveId', getStudentsForDrive);

module.exports = router;
