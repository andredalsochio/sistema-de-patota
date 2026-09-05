import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import PatotaList from "./pages/PatotaList/PatotaList";
import CreatePatota from "./pages/CreatePatota/CreatePatota";
import EditPatota from "./pages/EditPatota/EditPatota";
import PatotaDetails from "./pages/PatotaDetails/PatotaDetails";
import { isAuthenticated } from "./helpers/auth";

function ProtectedRoute({ children }: { children: ReactElement }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function GuestRoute({ children }: { children: ReactElement }) {
  if (isAuthenticated()) {
    return <Navigate to="/patotas" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        ></Route>
        <Route
          path="/patotas"
          element={
            <ProtectedRoute>
              <PatotaList />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/nova-patota"
          element={
            <ProtectedRoute>
              <CreatePatota />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/patotas/:patotaId"
          element={
            <ProtectedRoute>
              <PatotaDetails />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/patotas/:patotaId/editar"
          element={
            <ProtectedRoute>
              <EditPatota />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
