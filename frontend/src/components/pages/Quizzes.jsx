import { useState, useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import { 
  PHQ9_QUESTIONS, GAD7_QUESTIONS, SCORE_OPTIONS, 
  calculatePHQ9, calculateGAD7 
} from '../../utils/quizScoring'
import './Quizzes.css'
import { useGamification } from '../../hooks/useGamification'

export default function Quizzes() {
  const { addToast } = useToast()
  const [activeQuiz, setActiveQuiz] = useState(null) // 'phq9' or 'gad7'
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(() => 
    JSON.parse(localStorage.getItem('quizHistory') || '[]')
  )

  const { recordAction, syncAndCheck } = useGamification()

  const startQuiz = (quizId) => {
    const questions = quizId === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS
    const defaultAnswers = {}
    questions.forEach(q => { defaultAnswers[q.id] = 0 })
    setAnswers(defaultAnswers)
    setActiveQuiz(quizId)
    setResult(null)
  }

  const updateAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }))
  }

  const submitQuiz = () => {
    const scores = Object.values(answers)
    let calculation
    let quizName
    
    if (activeQuiz === 'phq9') {
      calculation = calculatePHQ9(scores)
      quizName = 'PHQ-9 (Depression)'
    } else {
      calculation = calculateGAD7(scores)
      quizName = 'GAD-7 (Anxiety)'
    }
    
    const resultData = {
      id: Date.now(),
      date: new Date().toISOString(),
      quiz: quizName,
      total: calculation.total,
      severity: calculation.severity,
      recommendation: calculation.recommendation,
      answers: { ...answers }
    }
    
    const updatedHistory = [resultData, ...history]
    setHistory(updatedHistory)
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory))
    setResult(calculation)
    addToast(`${quizName} completed!`, 'success')

    recordAction('quiz')
    syncAndCheck()
  }

  const resetQuiz = () => {
    setActiveQuiz(null)
    setAnswers({})
    setResult(null)
  }

  if (activeQuiz && !result) {
    const questions = activeQuiz === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS
    const quizTitle = activeQuiz === 'phq9' ? 'Depression Screening (PHQ-9)' : 'Anxiety Screening (GAD-7)'
    
    return (
      <div className="page-container quizzes-page">
        <div className="quiz-header">
          <button className="btn btn-ghost" onClick={resetQuiz}>← Back</button>
          <h1 className="page-title">{quizTitle}</h1>
          <p className="page-subtitle">Over the last 2 weeks, how often have you been bothered by the following?</p>
        </div>
        
        <div className="quiz-questions">
          {questions.map((q, idx) => (
            <div key={q.id} className="card quiz-question">
              <p className="question-text">{idx + 1}. {q.text}</p>
              <div className="question-options">
                {SCORE_OPTIONS.map(opt => (
                  <label key={opt.value} className="quiz-option">
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="quiz-actions">
          <button className="btn btn-primary" onClick={submitQuiz}>
            See Results
          </button>
        </div>
      </div>
    )
  }
  
  if (result) {
    return (
      <div className="page-container quizzes-page">
        <div className="quiz-result card fade-up">
          <div className="result-icon">
            {result.total <= 9 ? '🌿' : result.total <= 14 ? '⚠️' : '💙'}
          </div>
          <h2>Your Score: {result.total}</h2>
          <p className="result-severity">{result.severity}</p>
          <div className="result-recommendation">
            <p>{result.recommendation}</p>
          </div>
          <div className="result-actions">
            <button className="btn btn-outline" onClick={resetQuiz}>Take Another Quiz</button>
            <button className="btn btn-primary" onClick={() => {
              resetQuiz()
              setActiveQuiz(null)
            }}>Back to Library</button>
          </div>
          <p className="result-disclaimer text-muted">
            This is not a medical diagnosis. Please consult a mental health professional for proper evaluation.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="page-container quizzes-page">
      <h1 className="page-title">Self-Assessment Quizzes</h1>
      <p className="page-subtitle">Evidence-based screening tools to better understand your mental health</p>
      
      <div className="quiz-cards">
        <div className="card quiz-card">
          <div className="quiz-icon">📋</div>
          <h2>PHQ-9</h2>
          <p>Patient Health Questionnaire — 9 questions screening for depression symptoms</p>
          <p className="quiz-time">⏱️ ~2 minutes</p>
          <button className="btn btn-primary" onClick={() => startQuiz('phq9')}>Start Quiz →</button>
        </div>
        
        <div className="card quiz-card">
          <div className="quiz-icon">😰</div>
          <h2>GAD-7</h2>
          <p>Generalized Anxiety Disorder — 7 questions screening for anxiety symptoms</p>
          <p className="quiz-time">⏱️ ~1.5 minutes</p>
          <button className="btn btn-primary" onClick={() => startQuiz('gad7')}>Start Quiz →</button>
        </div>
      </div>
      
      {history.length > 0 && (
        <div className="card quiz-history">
          <h2>Previous Results</h2>
          <div className="history-list">
            {history.slice(0, 5).map(entry => (
              <div key={entry.id} className="history-item">
                <div>
                  <strong>{entry.quiz}</strong>
                  <p className="text-muted">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <div className="history-score">
                  Score: {entry.total} ({entry.severity})
                </div>
              </div>
            ))}
          </div>
          {history.length > 5 && (
            <p className="text-muted">+ {history.length - 5} more results</p>
          )}
        </div>
      )}
    </div>
  )
}