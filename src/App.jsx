import { useState } from 'react';
import './App.css';

// ⚠️ IMPORTANT: Replace this with YOUR Vercel backend URL ⚠️
const API_URL = 'https://section-swap-backend.vercel.app/api';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
  name: '',
  email: '', // Add this
  yearLevel: '',
  currentSection: '',
  desiredSection: ''
});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const yearLevels = ['1st Year', '2nd Year', '3rd Year'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/swap-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setResult(data);
      setStep(4);
    } catch (error) {
      alert('Error submitting request. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      yearLevel: '',
      currentSection: '',
      desiredSection: ''
    });
    setResult(null);
  };

  return (
    <div className="app">
      <div className="container">
        {/* 👇 THIS WAS THE FIXED PART 👇 */}
        <h1>📚 Section Swap</h1>
        <p className="subtitle">Trade class sections with fellow students</p>

        {/* STEP 1: Enter Name */}
        {step === 1 && (
  <div className="form-step">
    <h2>Let's get started</h2>
    
    <label>Full Name</label>
    <input
      type="text"
      placeholder="Enter your full name"
      value={formData.name}
      onChange={(e) => setFormData({...formData, name: e.target.value})}
      autoFocus
    />
    
    <label style={{marginTop: '10px', display: 'block'}}>Email (for notifications)</label>
    <input
      type="email"
      placeholder="email@gmail.com"
      value={formData.email}
      onChange={(e) => setFormData({...formData, email: e.target.value})}
    />
    
    <button 
      onClick={() => setStep(2)}
      disabled={!formData.name.trim() || !formData.email.includes('@')}
      style={{marginTop: '20px'}}
    >
      Next →
    </button>
  </div>
)}

        {/* STEP 2: Select Year Level */}
        {step === 2 && (
          <div className="form-step">
            <h2>What year level are you?</h2>
            <div className="year-buttons">
              {yearLevels.map((year) => (
                <button
                  key={year}
                  className="year-btn"
                  onClick={() => {
                    setFormData({...formData, yearLevel: year});
                    setStep(3);
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
            <button className="back-btn" onClick={() => setStep(1)}>
              ← Back
            </button>
          </div>
        )}

        {/* STEP 3: Enter Sections */}
        {step === 3 && (
          <div className="form-step">
            <h2>Section Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Current Section:</label>
                <input
                  type="text"
                  placeholder="e.g., A, B, C, CS-1A"
                  value={formData.currentSection}
                  onChange={(e) => setFormData({...formData, currentSection: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Section You Want:</label>
                <input
                  type="text"
                  placeholder="e.g., A, B, C, CS-1A"
                  value={formData.desiredSection}
                  onChange={(e) => setFormData({...formData, desiredSection: e.target.value})}
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? '🔍 Finding Match...' : 'Find Match'}
              </button>
              <button 
                type="button" 
                className="back-btn" 
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Show Result */}
        {step === 4 && result && (
          <div className="form-step result">
            {result.matched ? (
              <>
                <div className="success-icon">🎉</div>
                <h2>Match Found!</h2>
                <p>You've been matched with:</p>
                <div className="match-card">
                  <p><strong>{result.matchedWith.name}</strong></p>
                  <p>Has section: {result.matchedWith.currentSection}</p>
                  <p>Wants your section: {formData.currentSection}</p>
                </div>
                <p className="info-text">
                  Contact them to coordinate the swap!
                </p>
              </>
            ) : (
              <>
                <div className="pending-icon">⏳</div>
                <h2>Request Submitted!</h2>
                <p>We'll notify you when someone with section <strong>{formData.desiredSection}</strong> wants to swap to <strong>{formData.currentSection}</strong>.</p>
                <p className="info-text">
                  Keep checking back or wait for a match!
                </p>
              </>
            )}
            <button onClick={resetForm}>Make Another Request</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
