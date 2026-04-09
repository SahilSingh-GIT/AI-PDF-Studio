/**
 * routes/index.jsx — Centralized route definitions.
 *
 * All application routes are declared here.
 * Import this into App.jsx — never define routes inline in components.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/index.js';
import UploadPage             from '../pages/UploadPage.jsx';
import WorkspacePage          from '../pages/WorkspacePage.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME}        element={<UploadPage />} />
      <Route path={ROUTES.WORKSPACE}   element={<WorkspacePage />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
