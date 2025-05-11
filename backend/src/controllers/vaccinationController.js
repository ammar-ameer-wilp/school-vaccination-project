const pool = require('../db');

const createDrive = async (req, res) => {
  const { name, vaccineName, date, availableDoses, classes } = req.body;

  if (!name || !vaccineName || !date || !availableDoses || availableDoses <= 0 || !classes.length) {
    return res
      .status(400)
      .json({ status: 'nok', message: 'Incomplete/missing/invalid vaccination drive details' });
  }
  const scheduledDate = new Date(date);
  const now = new Date();
  const diffDays = (scheduledDate - now) / (1000 * 60 * 60 * 24);

  if (diffDays < 15) {
    return res
      .status(400)
      .json({ status: 'nok', message: 'Drive must be scheduled at least 15 days in advance' });
  }
  try {
    const conflictCheck = await pool.query(
      `SELECT * FROM vaccination_drives 
             WHERE date_of_drive = $1 AND applicable_classes && $2::int[]`,
      [date, classes]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        status: 'nok',
        message: 'Another drive already exists on this date for overlapping classes'
      });
    }

    const drives = await pool.query(
      'INSERT INTO vaccination_drives(name, vaccine_name, date_of_drive, available_doses, applicable_classes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, vaccineName, date, availableDoses, classes]
    );
    const result = drives.rows.map((data) => ({
      id: data.id,
      name: data.name,
      vaccineName: data.vaccine_name,
      date: data.date_of_drive,
      availableDoses: data.available_doses,
      applicableClasses: data.applicable_classes
    }));

    res
      .status(200)
      .json({ status: 'ok', message: 'Vaccination drive created successfully', drives: result });
  } catch (error) {
    console.error('Create vaccine drive failed:', error);
    res.status(500).json({ status: 'nok', message: 'Internal server error' });
  }
};

const updateDrive = async (req, res) => {
  const { id } = req.params;
  const { name, vaccineName, date, availableDoses, classes } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM vaccination_drives WHERE id = $1', [id]);

    if (!existing.rows.length) {
      return res.status(404).json({ status: 'nok', message: 'Drive not found' });
    }

    const drive = existing.rows[0];
    if (new Date(drive.date) < new Date()) {
      return res.status(400).json({ status: 'nok', message: 'Cannot edit past drives' });
    }

    if (date) {
      const diffDays = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
      if (diffDays < 15) {
        return res
          .status(400)
          .json({ status: 'nok', message: 'Drive must be scheduled at least 15 days in advance' });
      }
    }

    const result = await pool.query(
      `UPDATE vaccination_drives SET 
         name = $1, vaccine_name = $2, date_of_drive = $3, 
         available_doses = $4, applicable_classes = $5 
         WHERE id = $6 RETURNING *`,
      [name || existing.rows[0].name, vaccineName || existing.rows[0].vaccine_name, date || existing.rows[0].date_of_drive, availableDoses || existing.rows[0].available_doses, classes || existing.rows[0].applicable_classes, id]
    );

    res.json({ status: 'ok', message: 'Drive updated', drive: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'nok', message: 'Internal Server error' });
  }
};

const getDrives = async (req, res) => {
  const { fromDate, toDate, applicableClass, vaccineName } = req.query;
  const conditions = [];
  const values = [];

  if (fromDate) {
    values.push(fromDate);
    conditions.push(`date_of_drive >= $${values.length}`);
  }

  if (toDate) {
    values.push(toDate);
    conditions.push(`date_of_drive <= $${values.length}`);
  }

  if (applicableClass) {
    values.push(parseInt(applicableClass));
    conditions.push(`$${values.length} = ANY(applicable_classes)`);
  }

  if (vaccineName) {
    values.push(vaccineName);
    conditions.push(`vaccine_name ILIKE $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT * FROM vaccination_drives ${whereClause} ORDER BY date_of_drive ASC`,
      values
    );
    const data = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      date: row.date_of_drive,
      vaccineName: row.vaccine_name,
      availableDoses: row.available_doses,
      classes: row.applicable_classes
    }));
    res.status(200).json({ status: 'ok', message: 'Fetched drives successfully', drives: data });
  } catch (err) {
    console.error('Error fetching drives:', err);
    res.status(500).json({ status: 'nok', message: 'Internal Server error' });
  }
};

module.exports = { createDrive, updateDrive, getDrives };
