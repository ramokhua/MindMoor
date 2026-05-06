import { useState, useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import './SafetyPlan.css'

export default function SafetyPlan() {
  const { addToast } = useToast()
  const [plan, setPlan] = useState(() => 
    JSON.parse(localStorage.getItem('safetyPlan') || 'null')
  )
  const [isEditing, setIsEditing] = useState(!plan)
  const [formData, setFormData] = useState({
    warningSigns: plan?.warningSigns || ['', '', ''],
    copingStrategies: plan?.copingStrategies || ['', '', ''],
    distractionActivities: plan?.distractionActivities || ['', '', ''],
    supportContacts: plan?.supportContacts || [{ name: '', phone: '', relationship: '' }],
    professionalContacts: plan?.professionalContacts || [{ name: '', phone: '', organization: '' }],
    environmentSafety: plan?.environmentSafety || '',
    reasonsToLive: plan?.reasonsToLive || ['', '', '']
  })

  const savePlan = () => {
    const newPlan = {
      id: Date.now(),
      createdAt: plan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData
    }
    localStorage.setItem('safetyPlan', JSON.stringify(newPlan))
    setPlan(newPlan)
    setIsEditing(false)
    addToast('Safety plan saved!', 'success')
  }

  const updateArray = (field, index, value) => {
    const updated = [...formData[field]]
    updated[index] = value
    setFormData({ ...formData, [field]: updated })
  }

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] })
  }

  const removeArrayItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: updated })
  }

  const updateContact = (field, index, key, value) => {
    const updated = [...formData[field]]
    updated[index] = { ...updated[index], [key]: value }
    setFormData({ ...formData, [field]: updated })
  }

  const addContact = (field) => {
    const newContact = field === 'supportContacts' 
      ? { name: '', phone: '', relationship: '' }
      : { name: '', phone: '', organization: '' }
    setFormData({ ...formData, [field]: [...formData[field], newContact] })
  }

  if (!isEditing && plan) {
    return (
      <div className="page-container safety-plan-page">
        <div className="safety-plan-header">
          <h1 className="page-title">My Safety Plan</h1>
          <div className="flex gap-1">
            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
              ✏️ Edit Plan
            </button>
            <button className="btn btn-ghost" onClick={() => {
              localStorage.removeItem('safetyPlan')
              setPlan(null)
              setIsEditing(true)
              addToast('Safety plan deleted', 'info')
            }}>
              🗑️ Delete
            </button>
          </div>
        </div>
        <p className="page-subtitle">Your personalized crisis response plan — created {new Date(plan.createdAt).toLocaleDateString()}</p>

        <div className="safety-plan-view">
          <div className="card">
            <h2>⚠️ Warning Signs</h2>
            <ul>{plan.warningSigns.filter(s => s).map((sign, i) => <li key={i}>{sign}</li>)}</ul>
          </div>

          <div className="card">
            <h2>🧘 Coping Strategies</h2>
            <ul>{plan.copingStrategies.filter(s => s).map((strategy, i) => <li key={i}>{strategy}</li>)}</ul>
          </div>

          <div className="card">
            <h2>🎮 Distraction Activities</h2>
            <ul>{plan.distractionActivities.filter(a => a).map((activity, i) => <li key={i}>{activity}</li>)}</ul>
          </div>

          <div className="card">
            <h2>📞 Support Contacts</h2>
            {plan.supportContacts.filter(c => c.name).map((contact, i) => (
              <div key={i} className="contact-card">
                <strong>{contact.name}</strong> ({contact.relationship})
                <br />
                <a href={`tel:${contact.phone}`} className="contact-link">📞 {contact.phone}</a>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>🏥 Professional Help</h2>
            {plan.professionalContacts.filter(c => c.name).map((contact, i) => (
              <div key={i} className="contact-card">
                <strong>{contact.name}</strong> - {contact.organization}
                <br />
                <a href={`tel:${contact.phone}`} className="contact-link">📞 {contact.phone}</a>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>🔒 Making My Environment Safe</h2>
            <p>{plan.environmentSafety || 'Not specified'}</p>
          </div>

          <div className="card">
            <h2>💖 Reasons to Live</h2>
            <ul>{plan.reasonsToLive.filter(r => r).map((reason, i) => <li key={i}>{reason}</li>)}</ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container safety-plan-page">
      <h1 className="page-title">Create Your Safety Plan</h1>
      <p className="page-subtitle">A personalized plan to help you through difficult moments</p>

      <form onSubmit={(e) => { e.preventDefault(); savePlan() }}>
        <div className="card">
          <h2>⚠️ Warning Signs</h2>
          <p className="text-muted">What thoughts, feelings, or behaviors indicate you might be heading toward a crisis?</p>
          {formData.warningSigns.map((sign, i) => (
            <div key={i} className="array-item">
              <input
                className="input"
                placeholder={`Warning sign ${i + 1}`}
                value={sign}
                onChange={e => updateArray('warningSigns', i, e.target.value)}
              />
              {i > 0 && (
                <button type="button" className="btn-ghost remove-btn" onClick={() => removeArrayItem('warningSigns', i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline add-btn" onClick={() => addArrayItem('warningSigns')}>+ Add Another</button>
        </div>

        <div className="card">
          <h2>🧘 Coping Strategies</h2>
          <p className="text-muted">What healthy coping strategies can you use when distressed?</p>
          {formData.copingStrategies.map((strategy, i) => (
            <div key={i} className="array-item">
              <input
                className="input"
                placeholder={`Strategy ${i + 1} (e.g., deep breathing, call a friend)`}
                value={strategy}
                onChange={e => updateArray('copingStrategies', i, e.target.value)}
              />
              {i > 0 && (
                <button type="button" className="btn-ghost remove-btn" onClick={() => removeArrayItem('copingStrategies', i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline add-btn" onClick={() => addArrayItem('copingStrategies')}>+ Add Another</button>
        </div>

        <div className="card">
          <h2>🎮 Distraction Activities</h2>
          <p className="text-muted">What activities can temporarily distract you from distressing thoughts?</p>
          {formData.distractionActivities.map((activity, i) => (
            <div key={i} className="array-item">
              <input
                className="input"
                placeholder={`Activity ${i + 1} (e.g., watch a movie, go for a walk)`}
                value={activity}
                onChange={e => updateArray('distractionActivities', i, e.target.value)}
              />
              {i > 0 && (
                <button type="button" className="btn-ghost remove-btn" onClick={() => removeArrayItem('distractionActivities', i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline add-btn" onClick={() => addArrayItem('distractionActivities')}>+ Add Another</button>
        </div>

        <div className="card">
          <h2>📞 Support Contacts</h2>
          <p className="text-muted">Friends or family who can support you during difficult times</p>
          {formData.supportContacts.map((contact, i) => (
            <div key={i} className="contact-form">
              <input
                className="input"
                placeholder="Name"
                value={contact.name}
                onChange={e => updateContact('supportContacts', i, 'name', e.target.value)}
              />
              <input
                className="input"
                placeholder="Phone number"
                value={contact.phone}
                onChange={e => updateContact('supportContacts', i, 'phone', e.target.value)}
              />
              <input
                className="input"
                placeholder="Relationship (e.g., sister, best friend)"
                value={contact.relationship}
                onChange={e => updateContact('supportContacts', i, 'relationship', e.target.value)}
              />
              {i > 0 && (
                <button type="button" className="btn-ghost remove-btn" onClick={() => removeArrayItem('supportContacts', i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline add-btn" onClick={() => addContact('supportContacts')}>+ Add Contact</button>
        </div>

        <div className="card">
          <h2>🏥 Professional Help</h2>
          <p className="text-muted">Therapists, counselors, or mental health professionals</p>
          {formData.professionalContacts.map((contact, i) => (
            <div key={i} className="contact-form">
              <input
                className="input"
                placeholder="Name"
                value={contact.name}
                onChange={e => updateContact('professionalContacts', i, 'name', e.target.value)}
              />
              <input
                className="input"
                placeholder="Phone number"
                value={contact.phone}
                onChange={e => updateContact('professionalContacts', i, 'phone', e.target.value)}
              />
              <input
                className="input"
                placeholder="Organization / Practice"
                value={contact.organization}
                onChange={e => updateContact('professionalContacts', i, 'organization', e.target.value)}
              />
              {i > 0 && (
                <button type="button" className="btn-ghost remove-btn" onClick={() => removeArrayItem('professionalContacts', i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline add-btn" onClick={() => addContact('professionalContacts')}>+ Add Professional</button>
        </div>

        <div className="card">
          <h2>🔒 Making My Environment Safe</h2>
          <p className="text-muted">What steps can you take to reduce access to harmful means?</p>
          <textarea
            className="input"
            placeholder="e.g., Remove firearms from home, store medications safely, avoid certain locations..."
            value={formData.environmentSafety}
            onChange={e => setFormData({ ...formData, environmentSafety: e.target.value })}
            rows={3}
          />
        </div>

        <div className="card">
          <h2>💖 Reasons to Live</h2>
          <p className="text-muted">What keeps you going? People, pets, dreams, values?</p>
          {formData.reasonsToLive.map((reason, i) => (
            <div key={i} className="array-item">
              <input
                className="input"
                placeholder={`Reason ${i + 1}`}
                value={reason}
                onChange={e => updateArray('reasonsToLive', i, e.target.value)}
              />
              {i > 0 && (
                <button type="button" className="btn-ghost remove-btn" onClick={() => removeArrayItem('reasonsToLive', i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline add-btn" onClick={() => addArrayItem('reasonsToLive')}>+ Add Another</button>
        </div>

        <div className="safety-plan-actions">
          <button type="button" className="btn btn-ghost" onClick={() => {
            if (plan) setIsEditing(false)
            else window.history.back()
          }}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Safety Plan</button>
        </div>
      </form>
    </div>
  )
}