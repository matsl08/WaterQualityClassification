import { useState } from 'react'
import './App.css'
import Potability_Form from './components/Potability_Form.jsx'
import Results from './components/Result.jsx'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFormSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      // Ensure all values are numbers
      const cleanedData = {}
      for (const [key, value] of Object.entries(formData)) {
        cleanedData[key] = typeof value === 'string' ? parseFloat(value) : value
      }

      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get prediction')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the prediction')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>💧 Water Potability Predictor</h1>
        <p>Check water quality and potability classification</p>
      </header>

      <main className="container">
        <div className="form-section">
          <Potability_Form onSubmit={handleFormSubmit} loading={loading} onClear={handleClear} />
        </div>

        {error && (
          <div className="error-message">
            <span>❌ Error: {error}</span>
          </div>
        )}

        {result && (
          <div className="result-section">
            <Results result={result} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Water Quality Classification System</p>
      </footer>
    </div>
  )
}

export default App