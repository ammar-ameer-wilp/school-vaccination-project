import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { InputLabel } from '../components/InputLabel';
import './styles.css';
import SelectInput from '../components/SelectInput';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    studentClass: '',
    studentId: '',
    age: 0,
    gender: '',
    vaccinationStatus: '',
  });
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    studentClass: '',
    studentId: '',
    vaccinationStatus: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const vaccinationStatusOptions = ['vaccinated', 'notVaccinated'];
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: filters });
      console.log(res.status, 'resssssssssss');
      if (res.status === 200) {
        setStudents(res.data.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !form.age ||
      !form.gender ||
      !form.name ||
      !form.studentClass ||
      !form.studentId ||
      !form.vaccinationStatus
    ) {
      setError('Missing Required details');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/students/${editId}`, form);
      } else {
        await api.post('/students/register', form);
      }

      setShowModal(false);
      setForm({
        name: '',
        studentClass: '',
        studentId: '',
        age: 0,
        gender: '',
        vaccinationStatus: '',
      });
      setIsEditing(false);
      setEditId(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError('Failed to save student.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-container">
      <div className="content-box">
        <div className="header">
          <h2 className="heading">Students</h2>
          <div className="nav-buttons">
            <Button
              type="button"
              children="Dashboard"
              onClick={() => {
                navigate('/dashboard');
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

        <Button onClick={() => setShowModal(true)}>Add Student</Button>
        {/* Search Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Search by student ID"
            name="studentId"
            value={filters.studentId}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Search by class"
            name="studentClass"
            value={filters.studentClass}
            onChange={handleFilterChange}
          />
          <SelectInput
            label="Vaccination Status"
            name="vaccinationStatus"
            value={filters.vaccinationStatus}
            onChange={handleFilterChange}
            options={vaccinationStatusOptions}
          />
        </div>

        {loading ? (
          <Loader />
        ) : students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Student ID</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Vaccination Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.class}</td>
                  <td>{s.studentId}</td>
                  <td>{s.age}</td>
                  <td>{s.gender}</td>
                  <td>{s.vaccinationStatus}</td>
                  <td>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setEditId(s.id);
                        setForm({
                          name: s.name,
                          studentClass: s.class,
                          studentId: s.studentId,
                          age: s.age,
                          gender: s.gender,
                          vaccinationStatus: s.vaccinationStatus,
                        });
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Modal
          title={isEditing ? 'Edit Student' : 'Add Student'}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setIsEditing(false);
            setEditId(null);
          }}
        >
          <form onSubmit={handleAddOrUpdateStudent}>
            <InputLabel
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <InputLabel
              label="Class"
              name="studentClass"
              value={form.studentClass}
              onChange={handleChange}
            />
            <InputLabel
              label="Student ID"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
            />
            <InputLabel
              label="Age"
              name="age"
              value={form.age}
              onChange={handleChange}
            />
            <InputLabel
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            />
            <SelectInput
              label="Vaccination Status"
              name="vaccinationStatus"
              value={form.vaccinationStatus}
              onChange={handleChange}
              options={vaccinationStatusOptions}
            />
            {error && <p className="error-text">{error}</p>}
            <Button type="submit" className="w-full">
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Students;
