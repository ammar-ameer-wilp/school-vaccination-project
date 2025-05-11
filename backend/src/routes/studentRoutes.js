const express = require('express');
const {
  createStudent,
  getStudentbyId,
  getStudents,
  updateStudent,
  importStudentsFromCSV
} = require('../controllers/studentController');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/register', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentbyId);
router.put('/:id', updateStudent);
router.post('/import', upload.single('file'), importStudentsFromCSV);

module.exports = router;
