// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./User/AuthPage";
import PrivateRoute from "././utils/PrivateRoute";
import UserTrips from "./User/UserTrips";
import Trip from "./User/Trip";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/trips_planner/" element={<AuthPage />} />
        <Route
          path="/userTrip"
          element={
            <PrivateRoute>
               <UserTrips />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:id"
          element={
            <PrivateRoute>
               <Trip />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
