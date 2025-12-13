import '../styles/HomePage.css';


function HomePage({ onStart }) {
  const parameters = [
    { name: 'pH', description: 'Measures acidity or alkalinity (0-14)' },
    { name: 'Hardness', description: 'Mineral content in water (mg/L)' },
    { name: 'Solids', description: 'Total dissolved solids (mg/L)' },
    { name: 'Chloramines', description: 'Disinfectant level (ppm)' },
    { name: 'Sulfate', description: 'Sulfate content (mg/L)' },
    { name: 'Conductivity', description: 'Water’s ability to conduct electricity (µS/cm)' },
    { name: 'Organic Carbon', description: 'Organic matter in water (mg/L)' },
    { name: 'Trihalomethanes', description: 'Byproducts from disinfection (µg/L)' },
    { name: 'Turbidity', description: 'Water clarity (NTU)' },
  ];

  return (
    <div className="homepage-container">
      {/* Water wave background */}
      <div className="wave-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
      </div>

      <div className="homepage-content">
        <div className="grid-left">
          <h2>Water Quality Parameters</h2>
          <div className="parameters-grid">
            {parameters.map((param) => (
              <div key={param.name} className="parameter-card">
                <h3>{param.name}</h3>
                <p>{param.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-right">
          <h2>About This Project</h2>
          <p>
            AquaSense is a water classifier that analyzes key water quality parameters to determine if water is safe for
            consumption. Using advanced machine learning algorithms, it evaluates chemical and physical properties,
            providing clear potability results and recommendations.
          </p>
          <p>
            Input the measured values, and the predictor will instantly classify water safety, helping households,
            industries, and environmental monitoring projects make informed decisions.
          </p>
          <button className="start-btn" onClick={onStart}>
            Start Predicting
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;