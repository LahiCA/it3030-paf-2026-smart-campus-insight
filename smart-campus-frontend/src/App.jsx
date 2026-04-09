import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import UserResourcesPage from './pages/UserResourcesPage';
import AdminResourcesPage from './pages/AdminResourcesPage';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/userresource' element={<UserResourcesPage />} />
      <Route path='/adminresource' element={<AdminResourcesPage />} />
    </Routes>
  );
}

export default App;