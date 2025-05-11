const pool = require('../db');

const registerStudentForDrive = async (req, res) => {
  const { studentId, driveId } = req.body;

  if (!studentId || !driveId) {
    return res.status(400).json({ status: 'nok', message: 'studentId and driveId are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the drive row
    const driveRes = await client.query(
      'SELECT date_of_drive, available_doses FROM vaccination_drives WHERE id = $1 FOR UPDATE',
      [driveId]
    );

    if (driveRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'nok', message: 'Vaccination drive not found' });
    }

    const studentRes = await client.query(`SELECT * FROM students WHERE id=$1`, [studentId]);
    if (!studentRes.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'nok', message: 'Student not found' });
    }

    const { date_of_drive: driveDate, available_doses } = driveRes.rows[0];

    if (new Date(driveDate) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'nok', message: 'Cannot register for past drives' });
    }

    if (available_doses <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'nok', message: 'No slots available' });
    }

    // Check for duplicate registration
    const exists = await client.query(
      `SELECT 1 FROM student_vaccination_drives WHERE student_id = $1 AND drive_id = $2`,
      [studentId, driveId]
    );

    if (exists.rowCount > 0) {
      await client.query('ROLLBACK');
      return res
        .status(409)
        .json({ status: 'nok', message: 'Student already registered for this drive' });
    }

    // Register student
    await client.query(
      `INSERT INTO student_vaccination_drives (student_id, drive_id) VALUES ($1, $2)`,
      [studentId, driveId]
    );

    if(studentRes.rows[0].vaccination_status === 'notVaccinated') {
      await client.query(`UPDATE students SET vaccination_status='vaccinated' WHERE id=$1`, [studentId])
    }

    // Decrease available_doses
    await client.query(
      `UPDATE vaccination_drives SET available_doses = available_doses - 1 WHERE id = $1`,
      [driveId]
    );

    await client.query('COMMIT');
    res.status(201).json({ status: 'ok', message: 'Student registered and slot reserved' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Registration error:', err);
    res.status(500).json({ status: 'nok', message: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getStudentsForDrive = async (req, res) => {
  const { driveId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT s.id, s.name, s.age, s.gender, s.class, s.student_id
        FROM student_vaccination_drives svd
        JOIN students s ON svd.student_id = s.id
        WHERE svd.drive_id = $1
        ORDER BY s.name ASC
        `,
      [driveId]
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      class: row.class,
      studentId: row.student_id
    }));

    res.status(200).json({ status: 'ok', students: data });
  } catch (err) {
    console.error('Error fetching students for drive:', err);
    res.status(500).json({ status: 'nok', message: 'Internal server error' });
  }
};

const getVaccinationReport = async (req, res) => {
  try {
    const { vaccineName, offset = 0, limit = 10 } = req.query;

    const filters = [];
    const values = [];

    if (vaccineName) {
      values.push(vaccineName);
      filters.push(`vd.vaccine_name = $${values.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const dataQuery = `
      SELECT s.id as student_id, s.name, s.class, vd.vaccine_name, vd.date_of_drive
      FROM student_vaccination_drives sv
      JOIN students s ON sv.student_id = s.id
      JOIN vaccination_drives vd ON sv.drive_id = vd.id
      ${whereClause}
      ORDER BY vd.date_of_drive DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM student_vaccination_drives sv
      JOIN students s ON sv.student_id = s.id
      JOIN vaccination_drives vd ON sv.drive_id = vd.id
      ${whereClause}
    `;

    const data = await pool.query(dataQuery, [...values, limit, offset]);
    const count = await pool.query(countQuery, values);

    res.json({
      status:"ok",
      data: data.rows.map((r) => ({
        student_id: r.student_id,
        name: r.name,
        class: r.class,
        vaccineName: r.vaccine_name,
        status: 'Vaccinated',
        date: r.date_of_drive,
      })),
      pagination: {
        total: parseInt(count.rows[0].total),
        offset: parseInt(offset),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({status:"nok", message: 'Error generating report' });
  }
};

module.exports = { registerStudentForDrive, getStudentsForDrive, getVaccinationReport };
