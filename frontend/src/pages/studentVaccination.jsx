import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SelectInput from '../components/SelectInput';
import './styles.css';
import './SelectInput.css';

const StudentVaccination = () => {
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '' });
  const [loading, setLoading] = useState(true);
  const [regError, setRegError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [driveRes, studentRes] = await Promise.all([
          api.get('/vaccination'),
          api.get('/students'),
        ]);
        setDrives(driveRes.data.drives || driveRes.data);
        setStudents(studentRes.data.students);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDriveSelect = async (e) => {
    const driveId = e.target.value;
    setSelectedDrive(driveId);
    if (!driveId) return;

    try {
      const res = await api.get(`/drives/${driveId}`);
      setRegisteredStudents(res.data.students || res.data);
    } catch (err) {
      console.error('Error fetching students for drive:', err);
      setRegisteredStudents([]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!selectedDrive || !form.studentId) {
      setRegError('Drive and student are required.');
      return;
    }

    try {
      await api.post('/drives', {
        studentId: parseInt(form.studentId),
        driveId: parseInt(selectedDrive),
      });
      setShowModal(false);
      setForm({ student_id: '' });
      handleDriveSelect({ target: { value: selectedDrive } });
    } catch (err) {
      console.error(err);
      setRegError('Student already registered or drive full.');
    }
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="content-box">
        <div className="header">
          <h2 className="heading">Student Vaccination</h2>
          <Button
            type="button"
            children="Dashboard"
            onClick={() => {
              navigate('/dashboard');
            }}
          />
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
        </div>

        <div>
          <label className="select-label">Select Drive:</label>
          <select
            className="select-field"
            value={selectedDrive}
            onChange={handleDriveSelect}
          >
            <option value="">Select</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {new Date(d.date).toLocaleDateString()}
              </option>
            ))}
          </select>
          {selectedDrive && (
            <Button onClick={() => setShowModal(true)}>Register Student</Button>
          )}
        </div>

        {selectedDrive && (
          <>
            <h3>Registered Students</h3>
            {registeredStudents.length === 0 ? (
              <p>No students registered for this drive.</p>
            ) : (
              <ul>
                {registeredStudents.map((s) => (
                  <li key={s.id}>
                    {s.name} - Class {s.class} ({s.studentId})
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <Modal
          title="Register Student"
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setRegError('');
            setForm('');
          }}
        >
          <form onSubmit={handleRegister}>
            <SelectInput
              label="Select Student"
              name="studentId"
              value={form.studentId}
              onChange={handleFormChange}
              options={students.map((s) => ({
                label: `${s.name} (${s.studentId})`,
                value: s.id,
              }))}
            />
            {regError && <p style={{ color: 'red' }}>{regError}</p>}
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default StudentVaccination;
