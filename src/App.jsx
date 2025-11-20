import { useState } from 'react';
import './App.css';

// ⚠️ IMPORTANT: Ensure this matches your Vercel Backend URL
const API_URL = 'https://section-swap-backend.vercel.app/api'; 
// ^ If you haven't switched to the main domain yet, use your specific one:
// const API_URL = 'https://section-swap-backend-9y6q6gmz7-yowitsdwins-projects.vercel.app/api';

function App() {
  const [step, setStep] = useState(1);
  
  // Added 'email' to state
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    yearLevel: '',
    currentSection: '',
    desiredSection: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // Added error state for Rate Limiting messages
  const [errorMessage, setErrorMessage] = useState('');

  const yearLevels = ['1st Year', '2nd Year', '3rd Year'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Clear previous errors
    
    try {
      const response = await fetch(`${API_URL}/swap-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // 🛑 HANDLE 429 (RATE LIMIT) ERROR HERE
      if (response.status === 429) {
        const errorData = await response.json();
        setErrorMessage("⏳ " + (errorData.error || "Too many requests. Please wait 15 minutes."));
        setLoading(false);
        return; // Stop execution here
      }
      
      const data = await response.json();

      // Handle generic backend errors
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      setStep(4);
    } catch (error) {
      console.error(error);
      // Set the error message state instead of using alert()
      setErrorMessage(error.message || 'Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      yearLevel: '',
      currentSection: '',
      desiredSection: ''
    });
    setResult(null);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>📚 Section Swap</h1>
        <p className="subtitle">Trade class sections with fellow students</p>

        {/* STEP 1: Enter Name & Email */}
        {step === 1 && (
          <div className="form-step">
            <h2>Let's get started</h2>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Email (for notifications)</label>
              <input
                type="email"
                placeholder="you@student.cec.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button 
              onClick={() => setStep(2)}
              // Disable if name is empty OR email doesn't contain '@'
              disabled={!formData.name.trim() || !formData.email.includes('@')}
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
                  placeholder="eg, 1"
                  value={formData.currentSection}
                  onChange={(e) => setFormData({...formData, currentSection: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Section You Want:</label>
                <input
                  type="text"
                  placeholder="e.g., 2"
                  value={formData.desiredSection}
                  onChange={(e) => setFormData({...formData, desiredSection: e.target.value})}
                  required
                />
              </div>

              {/* 🔴 ERROR MESSAGE DISPLAY */}
              {errorMessage && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  border: '1px solid #ffcdd2'
                }}>
                  {errorMessage}
                </div>
              )}

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
                  We sent an email to <strong>{formData.email}</strong> with the details!
                </p>
              </>
            ) : (
              <>
                <div className="pending-icon">⏳</div>
                <h2>Request Submitted!</h2>
                <p>We'll notify you at <strong>{formData.email}</strong> when someone with section <strong>{formData.desiredSection}</strong> wants to swap to <strong>{formData.currentSection}</strong>.</p>
                <p className="info-text">
                  You can close this page. We'll email you when a match is found.
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