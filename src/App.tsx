import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage/AuthPage';
import { HomePage } from './pages/HomePage/HomePage';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <HomePage /> : <AuthPage />}
        />
        <Route
          path="/auth"
          element={currentUser ? <HomePage /> : <AuthPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;