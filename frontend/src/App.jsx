import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Homepage } from './pages/homepage';
import LoginPage from './pages/Login';
import RegistationPage from './pages/registration';
import Dashboard from './pages/dashboard';
import Students from './pages/students';
import Drives from './pages/drives';
import StudentVaccination from './pages/studentVaccination';
import './App.css';
import Report from './pages/report';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistationPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/drives" element={<Drives />} />
        <Route path="/vaccinations" element={<StudentVaccination />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
