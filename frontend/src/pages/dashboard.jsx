import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/overview');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="content-box">
        <div className="nav-buttons">
          <h2 className="heading">Dashboard</h2>
          <div className="nav-buttons">
            <Button
              type="button"
              children="Students"
              onClick={() => {
                navigate('/students');
              }}
            />
            <Button
              type="button"
              children="Drives"
              onClick={() => {
                navigate('/drives');
              }}
            />
            <Button
              type="button"
              children="Student Vaccination"
              onClick={() => {
                navigate('/vaccinations');
              }}
            />
          </div>
        </div>

        <div className="metrics-container">
          <div className="metrics">
            <p className="metrics-label">Total Students</p>
            <p className="metrics-value">{metrics.totalStudents}</p>
          </div>
          <div className="metrics">
            <p className="metrics-label">Vaccinated</p>
            <p className="metrics-value">{metrics.vaccinated}</p>
          </div>
          <div className="metrics">
            <p className="metrics-label">Vaccination %</p>
            <p className="metrics-value">{metrics.percentageVaccinated}</p>
          </div>
        </div>

        <h3 className="section-heading">Upcoming Drives (Next 30 Days)</h3>
        {metrics.upcomingDrives.length === 0 ? (
          <p>No upcoming drives scheduled.</p>
        ) : (
          <div className="drives-container">
            {metrics.upcomingDrives.map((drive) => (
              <div key={drive.id} className="drive-card">
                <p className="drive-name">{drive.vaccine_name}</p>
                <p className="drive-info">
                  on {new Date(drive.date_of_drive).toLocaleDateString()} —{' '}
                  <strong>{drive.available_doses}</strong> slots
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
