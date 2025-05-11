import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { InputLabel } from '../components/InputLabel';
import SelectInput from '../components/SelectInput';
import Button from '../components/Button';
import Loader from '../components/Loader';
import './LoginRegistration.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'coordinator',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = ['coordinator', 'admin'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.username || !form.password) {
      setError('Missing username or password');
      setLoading(false);
    } else {
      try {
        await api.post('/user/register', form);
        navigate('/login');
      } catch (err) {
        console.error(err);
        setError('Failed to register. Username might already be taken.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="wrapper">
      <h2 className="text">Register</h2>
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit}>
          <InputLabel
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter a username"
          />
          <InputLabel
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter a password"
          />
          <SelectInput
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={roles}
          />
          <Button type="submit">Register</Button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default Register;
