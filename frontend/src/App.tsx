import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import Home from './components/Home';
import CourseManagement from './components/CourseManagement';
import KnowledgePoints from './components/KnowledgePoints';
import ExerciseFeedback from './components/ExerciseFeedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-management" element={<CourseManagement />} />
        <Route path="/knowledge-points" element={<KnowledgePoints />} />
        <Route path="/exercise-feedback" element={<ExerciseFeedback />} />
      </Routes>
    </Router>
  );
}

export default App;
