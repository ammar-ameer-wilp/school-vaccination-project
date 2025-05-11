import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './homepage.css';

export const Homepage = () => {
  const navigate = useNavigate();
  return (
    <div className="wrapper">
      <h1 className="text">School Vaccination Project</h1>
      <div className="button-container">
        <Button
          type="button"
          children="Login"
          onClick={() => {
            navigate('/login');
          }}
        />
        <Button
          type="button"
          children="Register User"
          onClick={() => {
            navigate('/register');
          }}
        />
      </div>
    </div>
  );
};
