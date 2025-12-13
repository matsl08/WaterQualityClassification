import { useState } from 'react';
import './App.css'
import Potability_Form from './components/Potability_Form.jsx';
import ResultsDisplay from './components/Result.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';
import HomePage from './components/HomePage.jsx';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'form' | 'result'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = () => {
    setView('form');
    setResult(null);
    setError(null);
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const cleanedData = {};
      for (const [key, value] of Object.entries(formData)) {
        cleanedData[key] = typeof value === 'string' ? parseFloat(value) : value;
      }

      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get prediction');
      }

      const data = await response.json();

      // Wait for the loading animation to finish (5s default)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setResult(data);
      setView('result');
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the prediction');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setView('home');
  };

  return (
    <div className="app">
      <header className="header">
          <div className="text-container">
          <h1>AquaSense</h1>
          <p>Predict water potability using machine learning</p>
    </div>
      </header>
      <main className="container">
        {/* Homepage */}
        {view === 'home' && <HomePage onStart={handleStart} />}

        {/* Form View */}
        {view === 'form' && !loading && (
          <div className="form-view view">
            <Potability_Form
              onSubmit={handleFormSubmit}
              loading={loading}
              onClear={handleClear}
            />
          </div>
        )}

        {/* Loading Skeleton with water rising */}
        {loading && (
          <div className="loading-view view">
            <LoadingSkeleton duration={5000} />
          </div>
        )}

        {/* Results View */}
        {view === 'result' && !loading && result && (
          <div className="results-view view">
            <ResultsDisplay result={result} onClear={handleClear} />
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>❌ Error: {error}</span>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Water Quality Classification System</p>
      </footer>
    </div>
  );
}

export default App;