import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import Home from './components/Home';
import CourseManagement from './components/CourseManagement';
import KnowledgePoints from './components/KnowledgePoints';
import ExerciseFeedback from './components/ExerciseFeedback';
import Login from './components/Login';
import Register from './components/Register';
import MyExercises from './components/MyExercises';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-management" element={<CourseManagement />} />
        <Route path="/knowledge-points" element={<KnowledgePoints />} />
        <Route path="/exercise-feedback" element={<ExerciseFeedback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-exercises" element={<MyExercises />} />
        <Route path="/user" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
