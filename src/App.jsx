import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://section-swap-backend.vercel.app/api'; 

function App() {
  const [step, setStep] = useState(1);
  const [appLoading, setAppLoading] = useState(true); // Initial app load
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    yearLevel: '',
    currentSection: '',
    desiredSection: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const yearLevels = ['1st Year', '2nd Year', '3rd Year'];

  // Simulate initial app loading (check backend health)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Optional: Check if backend is alive
        await fetch(`${API_URL}/health`);
        
        // Minimum loading time for smooth UX (adjust as needed)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setAppLoading(false);
      } catch (error) {
        console.error('Backend health check failed:', error);
        // Still load the app even if health check fails
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_URL}/swap-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.status === 429) {
        const errorData = await response.json();
        setErrorMessage("⏳ " + (errorData.error || "Too many requests. Please wait 5 minutes."));
        setLoading(false);
        return;
      }
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      setStep(4);
    } catch (error) {
      console.error(error);
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

  // 🎨 LOADING SCREEN
  if (appLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">📚 Section Swap</h2>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <h1>📚 Section Swap</h1>
        <p className="subtitle">NOTE: SWAPPING OF SCHEDULE STILL DEPEND ON THE EDP.</p>

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
                  placeholder="e.g., 1"
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

              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? (
                  <span className="button-loading">
                    <span className="button-spinner"></span>
                    Finding Match...
                  </span>
                ) : (
                  'Find Match'
                )}
              </button>
              <button 
                type="button" 
                className="back-btn" 
                onClick={() => setStep(2)}
                disabled={loading}
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