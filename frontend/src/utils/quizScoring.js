// PHQ-9 Depression Screening
export const PHQ9_QUESTIONS = [
  { id: 1, text: "Little interest or pleasure in doing things", scores: [0, 1, 2, 3] },
  { id: 2, text: "Feeling down, depressed, or hopeless", scores: [0, 1, 2, 3] },
  { id: 3, text: "Trouble falling/staying asleep, sleeping too much", scores: [0, 1, 2, 3] },
  { id: 4, text: "Feeling tired or having little energy", scores: [0, 1, 2, 3] },
  { id: 5, text: "Poor appetite or overeating", scores: [0, 1, 2, 3] },
  { id: 6, text: "Feeling bad about yourself — or that you're a failure", scores: [0, 1, 2, 3] },
  { id: 7, text: "Trouble concentrating on things", scores: [0, 1, 2, 3] },
  { id: 8, text: "Moving or speaking slowly — or fidgety/restless", scores: [0, 1, 2, 3] },
  { id: 9, text: "Thoughts that you'd be better off dead", scores: [0, 1, 2, 3] },
]

export const SCORE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
]

export function calculatePHQ9(scores) {
  const total = scores.reduce((sum, s) => sum + s, 0)
  let severity = ""
  let recommendation = ""
  
  if (total <= 4) {
    severity = "Minimal depression"
    recommendation = "Continue practicing self-care and monitoring your mood."
  } else if (total <= 9) {
    severity = "Mild depression"
    recommendation = "Consider stress management techniques. Regular exercise and sleep schedule may help."
  } else if (total <= 14) {
    severity = "Moderate depression"
    recommendation = "Consider speaking with a mental health professional. Therapy can be very effective."
  } else if (total <= 19) {
    severity = "Moderately severe depression"
    recommendation = "We strongly recommend speaking with a mental health professional soon."
  } else {
    severity = "Severe depression"
    recommendation = "Please reach out to a mental health professional as soon as possible."
  }
  
  return { total, severity, recommendation }
}

// GAD-7 Anxiety Screening
export const GAD7_QUESTIONS = [
  { id: 1, text: "Feeling nervous, anxious, or on edge", scores: [0, 1, 2, 3] },
  { id: 2, text: "Not being able to stop or control worrying", scores: [0, 1, 2, 3] },
  { id: 3, text: "Worrying too much about different things", scores: [0, 1, 2, 3] },
  { id: 4, text: "Trouble relaxing", scores: [0, 1, 2, 3] },
  { id: 5, text: "Being so restless that it's hard to sit still", scores: [0, 1, 2, 3] },
  { id: 6, text: "Becoming easily annoyed or irritable", scores: [0, 1, 2, 3] },
  { id: 7, text: "Feeling afraid as if something awful might happen", scores: [0, 1, 2, 3] },
]

export function calculateGAD7(scores) {
  const total = scores.reduce((sum, s) => sum + s, 0)
  let severity = ""
  let recommendation = ""
  
  if (total <= 4) {
    severity = "Minimal anxiety"
    recommendation = "Continue practicing self-care and stress management."
  } else if (total <= 9) {
    severity = "Mild anxiety"
    recommendation = "Consider relaxation techniques like deep breathing or meditation."
  } else if (total <= 14) {
    severity = "Moderate anxiety"
    recommendation = "Consider speaking with a mental health professional about coping strategies."
  } else {
    severity = "Severe anxiety"
    recommendation = "We strongly recommend speaking with a mental health professional."
  }
  
  return { total, severity, recommendation }
}