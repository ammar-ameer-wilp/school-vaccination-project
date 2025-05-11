const pool = require('../db');

const createStudent = async (req, res) => {
  const { name, studentClass, studentId, age, gender, vaccinationStatus } = req.body;
  if (!name || !studentClass || !studentId || !age || !gender || !vaccinationStatus) {
    return res.status(400).json({ status: 'nok', message: 'Student details missing' });
  }

  try {
    const checkStudent = await pool.query('SELECT * FROM students WHERE student_id=$1', [
      studentId
    ]);
    if (checkStudent.rows.length) {
      return res.status(409).json({ status: 'nok', message: 'Student already exists' });
    }

    const addStudent = await pool.query(
      'INSERT INTO students (name, class, student_id, age, gender, vaccination_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, studentClass, studentId, age, gender, vaccinationStatus]
    );
    res.status(200).json({
      status: 'ok',
      message: 'student added successfully',
      student: {
        id: addStudent.rows[0].id,
        name,
        studentClass,
        studentId,
        age,
        gender,
        vaccinationStatus
      }
    });
  } catch (error) {
    console.error('Adding student failed', error);
    res.status(500).json({ status: 'nok', message: 'Internal Server Error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { name, studentClass, studentId, vaccinationStatus } = req.query;

    let baseQuery = 'SELECT * FROM students';
    const conditions = [];
    const values = [];

    if (name) {
      conditions.push(`name ILIKE $${values.length + 1}`);
      values.push(`%${name}%`);
    }

    if (studentClass) {
      conditions.push(`class = $${values.length + 1}`);
      values.push(studentClass);
    }

    if (studentId) {
      conditions.push(`student_id = $${values.length + 1}`);
      values.push(studentId);
    }

    if (vaccinationStatus) {
      conditions.push(`vaccination_status = $${values.length + 1}`);
      values.push(vaccinationStatus);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY created_at DESC';

    const students = await pool.query(baseQuery, values);

    if (!students.rows.length) {
      return res.status(404).json({ status: 'nok', message: 'No students found' });
    }

    const result = students.rows.map((student) => ({
      id: student.id,
      name: student.name,
      class: student.class,
      studentId: student.student_id,
      age: student.age,
      gender: student.gender,
      vaccinationStatus: student.vaccination_status,
    }));

    return res.status(200).json({
      status: 'ok',
      message: 'students list fetched',
      students: result,
    });
  } catch (error) {
    console.error('Fetching students failed', error);
    res.status(500).json({ status: 'nok', message: 'Internal Server Error' });
  }
};


const getStudentbyId = async (req, res) => {
  const id = req.params.id;
  console.log("id", id)

  try {
    const students = await pool.query('SELECT * FROM students WHERE id=$1', [id]);
    if (!students.rows.length) {
      return res.status(404).json({ status: 'nok', message: 'No student found' });
    }
    const result = students.rows.map((student) => ({
      id: student.id,
      name: student.name,
      class: student.class,
      studentId: student.student_id,
      age: student.age,
      gender: student.gender,
      vaccinationStatus: student.vaccination_status
    }));

    return res
      .status(200)
      .json({ status: 'ok', message: 'student data fetched', students: result });
  } catch (error) {
    console.error('Fetching student by id failed', error);
    res.status(500).json({ status: 'nok', message: 'Internal Server Error' });
  }
};

const updateStudent = async (req, res) => {
  const id = req.params.id;
  const { name, studentClass, studentId, age, gender, vaccinationStatus } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ status: 'nok', message: 'Student not found' });
    }

    // Check if studentId is being changed and is already taken
    if (studentId && studentId !== existing.rows[0].student_id) {
      const check = await pool.query('SELECT * FROM students WHERE student_id = $1', [studentId]);
      if (check.rows.length > 0) {
        return res.status(409).json({ status: 'nok', message: 'Student ID already in use' });
      }
    }

    const updated = await pool.query(
      `
          UPDATE students
          SET name = $1, class = $2, student_id = $3, age = $4, gender = $5, vaccination_status = $6
          WHERE id = $7
          RETURNING *
          `,
      [
        name || existing.rows[0].name,
        studentClass || existing.rows[0].class,
        studentId || existing.rows[0].student_id,
        age || existing.rows[0].age,
        gender || existing.rows[0].gender,
        vaccinationStatus || existing.rows[0].vaccination_status,
        id
      ]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Student updated successfully',
      student: updated.rows[0]
    });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ status: 'nok', message: 'Internal server error' });
  }
};

const fs = require('fs');
const csv = require('csv-parser');

const importStudentsFromCSV = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ status: 'nok', message: 'CSV file is required' });

  const students = [];
  const errors = [];

  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (row) => {
      const { name, studentClass, studentId, age, gender, vaccinationStatus } = row;
      if (name && studentClass && studentId && age && gender && vaccinationStatus) {
        students.push({ name, studentClass, studentId, age, gender, vaccinationStatus });
      } else {
        errors.push({ row, error: 'Missing required field(s)' });
      }
    })
    .on('end', async () => {
      try {
        for (const student of students) {
          const exists = await pool.query('SELECT 1 FROM students WHERE student_id = $1', [
            student.studentId
          ]);

          if (exists.rows.length === 0) {
            await pool.query(
              'INSERT INTO students (name, class, student_id, age, gender, vaccination_status) VALUES ($1, $2, $3, $4, $5, $6)',
              [
                student.name,
                student.studentClass,
                student.studentId,
                student.age,
                student.gender,
                student.vaccinationStatus
              ]
            );
          } else {
            errors.push({ student, error: 'Duplicate studentId' });
          }
        }

        fs.unlinkSync(file.path);

        res.status(200).json({
          status: 'ok',
          message: 'Import completed',
          imported: students.length - errors.length,
          errors
        });
      } catch (err) {
        console.error('CSV import error:', err);
        res.status(500).json({ status: 'nok', message: 'Server error' });
      }
    });
};

module.exports = {
  createStudent,
  getStudents,
  getStudentbyId,
  updateStudent,
  importStudentsFromCSV
};
