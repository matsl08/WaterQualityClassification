import { useState } from 'react'
import '../styles/Potability_Form.css'

function PotabilityForm({ onSubmit, loading, onClear }) {
  const [formData, setFormData] = useState({
    PH: '',
    Hardness: '',
    Solids: '',
    Chloramines: '',
    Sulfate: '',
    Conductivity: '',
    Organic_carbon: '',
    Trihalomethanes: '',
    Turbidity: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate that all fields are filled
    const allFilled = Object.values(formData).every((val) => val !== '')
    if (!allFilled) {
      alert('Please fill in all fields')
      return
    }

    onSubmit(formData)
  }

  const handleReset = () => {
    setFormData({
      PH: '',
      Hardness: '',
      Solids: '',
      Chloramines: '',
      Sulfate: '',
      Conductivity: '',
      Organic_carbon: '',
      Trihalomethanes: '',
      Turbidity: '',
    })
    onClear()
  }

  const fieldDescriptions = {
    PH: 'pH value (0-14)',
    Hardness: 'Water hardness in mg/L',
    Solids: 'Total dissolved solids in mg/L',
    Chloramines: 'Chloramines level in ppm',
    Sulfate: 'Sulfate level in mg/L',
    Conductivity: 'Electrical conductivity in µS/cm',
    Organic_carbon: 'Organic carbon level in mg/L',
    Trihalomethanes: 'Trihalomethanes level in µg/L',
    Turbidity: 'Turbidity in NTU',
  }

  return (
    <form className="potability-form" onSubmit={handleSubmit}>
      <h2>Water Quality Parameters</h2>
      <p className="form-description">
        Enter the water quality measurements to predict potability
      </p>

      <div className="form-grid">
        {Object.keys(formData).map((key) => (
          <div key={key} className="form-group">
            <label htmlFor={key}>{key}</label>
            <input
              type="number"
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={`Enter ${key}`}
              step="0.01"
              disabled={loading}
            />
            <small className="field-description">{fieldDescriptions[key]}</small>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Predict Potability'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </form>
  )
}

export default PotabilityForm