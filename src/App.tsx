import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityProfilePage from './pages/UniversityProfilePage';
import StudentProfilePage from './pages/StudentProfilePage';
import ProfileCalculatorPage from './pages/ProfileCalculatorPage';
import DashboardPage from './pages/DashboardPage';
import ConsultingPage from './pages/ConsultingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ComparePage from './pages/ComparePage';
import HousingPage from './pages/HousingPage';
import { AuthProvider } from './context/AuthContext';
import { StudentProfileProvider } from './context/StudentProfileContext';

function App() {
  return (
    <AuthProvider>
      <StudentProfileProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/universities" element={<UniversitiesPage />} />
              <Route path="/university/:id" element={<UniversityProfilePage />} />
              <Route path="/student-profile" element={<StudentProfilePage />} />
              <Route path="/profile-calculator" element={<ProfileCalculatorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/consulting" element={<ConsultingPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/housing" element={<HousingPage />} />
            </Routes>
          </div>
        </Router>
      </StudentProfileProvider>
    </AuthProvider>
  );
}

export default App;