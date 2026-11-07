import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Achievements from './components/pages/Achievements'
import Articles from './components/pages/Articles'
import Breathing from './components/pages/Breathing'
import Dashboard from './components/pages/Dashboard'
import Exercises from './components/pages/Exercises'
import Grounding from './components/pages/Grounding'
import Home from './components/pages/Home'
import Journal from './components/pages/Journal'
import Moira from './components/pages/Moira'
import MoodTracker from './components/pages/Moodtracker'
import Privacy from './components/pages/Privacy'
import Quizzes from './components/pages/Quizzes'
import Reminders from './components/pages/Reminders'
import Resources from './components/pages/Resources'
import SafetyPlan from './components/pages/SafetyPlan'
import Videos from './components/pages/Videos'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="mood" element={<MoodTracker />} />
        <Route path="journal" element={<Journal />} />
        <Route path="breathing" element={<Breathing />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="grounding" element={<Grounding />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="videos" element={<Videos />} />
        <Route path="articles" element={<Articles />} />
        <Route path="moira" element={<Moira />} />
        <Route path="resources" element={<Resources />} />
        <Route path="safety-plan" element={<SafetyPlan />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
