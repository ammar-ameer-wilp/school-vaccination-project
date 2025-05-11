import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { InputLabel } from '../components/InputLabel';
import Button from '../components/Button';
import Loader from '../components/Loader';
import './LoginRegistration.css';

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.username === '' || form.password === '') {
      setError('Missing username or password');
      setLoading(false);
    } else {
      try {
        const res = await api.post('/user/login', form);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
        setError('Invalid username or password');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="wrapper">
      <h2 className="text">Login</h2>
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit}>
          <InputLabel
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
          <InputLabel
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {error && <p className="error">{error}</p>}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      )}
    </div>
  );
};

export default Login;
