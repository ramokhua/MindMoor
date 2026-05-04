import { Link } from 'react-router-dom'

export default function Exercises() {
  return (
    <div className="page-container">
      <h1 className="page-title">Therapy Exercises</h1>
      <p className="page-subtitle">Science-backed tools to manage anxiety, stress, and negative thought patterns.</p>

      <div className="grid-2 mt-3">
        <div className="card">
          <h2>📋 Thought Record</h2>
          <p className="text-muted mt-1">Challenge negative thinking with a structured CBT worksheet.</p>
          <Link to="/journal" className="btn btn-primary mt-2">Open Journal</Link>
        </div>

        <div className="card">
          <h2>🌿 5-4-3-2-1 Grounding</h2>
          <p className="text-muted mt-1">A sensory technique to interrupt anxiety and panic attacks.</p>
          <Link to="/exercises/grounding" className="btn btn-primary mt-2">Start Exercise</Link>
        </div>

        <div className="card">
          <h2>🌬️ Breathing Techniques</h2>
          <p className="text-muted mt-1">Regulated breathing to calm the nervous system.</p>
          <Link to="/breathing" className="btn btn-primary mt-2">Practice Now</Link>
        </div>

        <div className="card">
          <h2>🧘 Mindfulness Meditation</h2>
          <p className="text-muted mt-1">Free guided audio resources from Mindful.org.</p>
          <a href="https://www.mindful.org/free-mindfulness-resources/" target="_blank" rel="noreferrer" className="btn btn-primary mt-2">Access Free Audio</a>
        </div>
      </div>
    </div>
  )
}