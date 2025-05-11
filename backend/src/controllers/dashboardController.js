const pool = require('../db');

const getDashboardOverview = async (req, res) => {
  try {
    const [totalStudentsRes, vaccinatedRes, upcomingDrivesRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(DISTINCT student_id) FROM student_vaccination_drives'),
      pool.query(`
          SELECT id, vaccine_name, date_of_drive, available_doses
          FROM vaccination_drives
          WHERE date_of_drive >= CURRENT_DATE AND date_of_drive <= CURRENT_DATE + INTERVAL '30 days'
          ORDER BY date_of_drive ASC
        `)
    ]);

    const totalStudents = parseInt(totalStudentsRes.rows[0].count, 10);
    const vaccinated = parseInt(vaccinatedRes.rows[0].count, 10);
    const percentageVaccinated =
      totalStudents === 0 ? 0 : ((vaccinated / totalStudents) * 100).toFixed(2);

    res.json({
      totalStudents,
      vaccinated,
      percentageVaccinated: `${percentageVaccinated}%`,
      upcomingDrives: upcomingDrivesRes.rows
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardOverview };
