const express = require('express');
const {
  registerStudentForDrive,
  getStudentsForDrive,
  getVaccinationReport
} = require('../controllers/studentVaccinationController');

const router = express.Router();

router.post('/', registerStudentForDrive);
router.get('/report', getVaccinationReport)
router.get('/:driveId', getStudentsForDrive);

module.exports = router;
