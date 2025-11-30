import './ResultsDisplay.css'

function ResultsDisplay({ result }) {
  const isPotable = result.prediction === 1 || result.prediction === true
  
  return (
    <div className={`results-display ${isPotable ? 'potable' : 'not-potable'}`}>
      <div className="results-header">
        <h2>Water Quality Analysis Results</h2>
        <div className="result-status">
          <span className={`status-badge ${isPotable ? 'safe' : 'unsafe'}`}>
            {isPotable ? '✓ POTABLE' : '✗ NOT POTABLE'}
          </span>
        </div>
      </div>

      <div className="result-message">
        <p>
          {isPotable
            ? '🟢 This water is safe for consumption.'
            : '🔴 This water is not recommended for consumption without treatment.'}
        </p>
      </div>

      <div className="results-details">
        <h3>Analysis Details</h3>
        <div className="details-grid">
          {result.parameters && Object.entries(result.parameters).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-label">{key}</span>
              <span className="detail-value">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {result.confidence && (
        <div className="confidence-section">
          <h3>Prediction Confidence</h3>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
          <p className="confidence-text">
            {(result.confidence * 100).toFixed(1)}% confidence
          </p>
        </div>
      )}

      {result.recommendation && (
        <div className="recommendation">
          <h3>Recommendations</h3>
          <p>{result.recommendation}</p>
        </div>
      )}
    </div>
  )
}

export default ResultsDisplay
