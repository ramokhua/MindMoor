import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './components/pages/Home'
import MoodTracker from './components/pages/MoodTracker'
import Journal from './components/pages/Journal'
import Breathing from './components/pages/Breathing'
import Exercises from './components/pages/Exercises'
import Grounding from './components/pages/Grounding'
import Resources from './components/pages/Resources'
import Moira from './components/pages/Moira'
import Dashboard from './components/pages/Dashboard'
import SafetyPlan from './components/pages/SafetyPlan'
import Privacy from './components/pages/Privacy'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mood" element={<MoodTracker />} />
        <Route path="journal" element={<Journal />} />
        <Route path="breathing" element={<Breathing />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="exercises/grounding" element={<Grounding />} />
        <Route path="resources" element={<Resources />} />
        <Route path="moira" element={<Moira />} />
        <Route path="safety-plan" element={<SafetyPlan />} />
        <Route path="privacy" element={<Privacy />} />
      </Route>
    </Routes>
  )
}