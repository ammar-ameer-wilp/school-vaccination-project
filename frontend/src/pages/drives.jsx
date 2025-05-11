import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { InputLabel } from '../components/InputLabel';
import './styles.css';

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    vaccineName: '',
    date: '',
    availableDoses: '',
    classes: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vaccination');
      setDrives(res.data.drives || res.data);
    } catch (err) {
      console.error('Failed to fetch drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (e) => {
    const values = e.target.value.split(',');
    setForm((prev) => ({ ...prev, classes: values }));
  };

  const handleAddDrive = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !form.availableDoses ||
      !form.classes ||
      !form.date ||
      !form.name ||
      !form.vaccineName
    ) {
      setError('Missing required fields');
    } else {
      try {
        const payload = {
          ...form,
          availableDoses: parseInt(form.availableDoses),
          classes: form.classes,
        };
        await api.post('/vaccination', payload);
        setShowModal(false);
        setForm({
          name: '',
          vaccineName: '',
          date: '',
          availableDoses: '',
          classes: [],
        });
        fetchDrives();
      } catch (err) {
        console.error(err);
        setError('Error creating drive.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="content-box">
        <div className="header">
          <h2 className="heading">Vaccination Drives</h2>
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
            children="Student Vaccination"
            onClick={() => {
              navigate('/vaccinations');
            }}
          />
        </div>
        <Button onClick={() => setShowModal(true)}>Add Drive</Button>

        {loading ? (
          <Loader />
        ) : drives.length === 0 ? (
          <p>No drives found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vaccine</th>
                <th>Date</th>
                <th>Slots</th>
                <th>Classes</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.vaccineName}</td>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td>{d.availableDoses}</td>
                  <td>{d.classes?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Modal
          isOpen={showModal}
          title="Add Vaccination Drive"
          onClose={() => {
            setShowModal(false);
            setError('');
            setForm({
              name: '',
              vaccineName: '',
              date: '',
              availableDoses: '',
              classes: [],
            });
          }}
        >
          <form onSubmit={handleAddDrive}>
            <InputLabel
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <InputLabel
              label="Vaccine Name"
              name="vaccineName"
              value={form.vaccineName}
              onChange={handleChange}
            />
            <InputLabel
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
            <InputLabel
              label="Available Slots"
              name="availableDoses"
              type="number"
              value={form.availableDoses}
              onChange={handleChange}
            />
            <InputLabel
              label="Available Classes"
              value={form.classes.map(String)}
              onChange={handleClassChange}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Button type="submit">Create Drive</Button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Drives;
