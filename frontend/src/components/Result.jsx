import '../styles/Result.css'

function ResultsDisplay({ result }) {
  const isPotable = result.prediction === 1 || result.prediction === true
  // Accept either `parameters` (new) or `input` (older backend)
  const parameters = result.parameters || result.input || {};

  // If backend didn't provide an `analysis` object, compute minimal derived features for display
  const computeClientDerived = (p) => {
    try {
      const Chloramines = parseFloat(p.Chloramines ?? p.chloramines ?? 0) || 0;
      const Sulfate = parseFloat(p.Sulfate ?? p.sulfate ?? 0) || 0;
      const Trihalomethanes = parseFloat(p.Trihalomethanes ?? p.trihalomethanes ?? 0) || 0;
      const ph = parseFloat(p.ph ?? p.PH ?? 0) || 0;
      const Solids = parseFloat(p.Solids ?? p.solids ?? 0) || 0;
      const Conductivity = parseFloat(p.Conductivity ?? p.conductivity ?? 0) || 0;

      const Total_Contaminants = Chloramines + Sulfate + Trihalomethanes;
      const pH_Ratio = Sulfate !== 0 ? ph / Sulfate : 0;
      const Stability_Index = Conductivity !== 0 ? Solids / Conductivity : 0;

      return { Total_Contaminants, pH_Ratio, Stability_Index };
    } catch (e) {
      return null;
    }
  };

  const clientDerived = computeClientDerived(parameters);

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
          {Object.keys(parameters).length === 0 && (
            <div className="detail-item">
              <span className="detail-label">No input parameters</span>
              <span className="detail-value">No data sent from server</span>
            </div>
          )}

          {Object.entries(parameters).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-label">{key}</span>
              <span className="detail-value">
                {typeof value === 'number' ? value.toFixed(2) : (Number(value) || value) }
              </span>
            </div>
          ))}

          {/* show client-side derived features when server analysis missing */}
          {!result.analysis && clientDerived && (
            <>
              <div className="detail-item">
                <span className="detail-label">Total Contaminants</span>
                <span className="detail-value">{clientDerived.Total_Contaminants.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">pH Ratio</span>
                <span className="detail-value">{clientDerived.pH_Ratio.toFixed(4)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Stability Index</span>
                <span className="detail-value">{clientDerived.Stability_Index.toFixed(4)}</span>
              </div>
            </>
          )}
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