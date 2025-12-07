from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ===============================
#       CONFIGURATION
# ===============================
MODEL_PATH = "water_quality_model.pkl"
SCALER_PATH = "scaler.pkl"

# Only classify as "Potable" if model is >= 65% confident
SAFETY_THRESHOLD = 0.65

# ===============================
#       MODEL LOADING
# ===============================
model, scaler = None, None

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file missing: {MODEL_PATH}")

    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler file missing: {SCALER_PATH}")

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    print("\n✔ Model and Scaler Loaded Successfully!")
    print("✔ Flask server ready on port 5000.\n")

except Exception as e:
    print(f"\n❌ Critical Error Loading Model: {e}\n")

# ===============================
#       BASIC HEALTH CHECK
# ===============================
@app.route('/api/data')
def health_check():
    return jsonify({
        "message": "Flask API is running",
        "status": "ok"
    })

# ===============================
#   FEATURE PROCESSING HELPERS
# ===============================
BASE_FEATURES = [
    'ph', 'hardness', 'solids', 'chloramines', 'sulfate',
    'conductivity', 'organic_carbon', 'trihalomethanes', 'turbidity'
]

MODEL_FEATURE_ORDER = [
    'ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate',
    'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity',
    'Total_Contaminants', 'pH_Ratio', 'Stability_Index'
]

def validate_input(data):
    """Ensure all required base features are present."""
    missing = [f for f in BASE_FEATURES if f not in data]
    if missing:
        raise ValueError(f"Missing fields: {missing}")

def compute_derived_features(d):
    """Compute the engineered features used during training."""
    d['Total_Contaminants'] = (
        d['Chloramines'] + d['Sulfate'] + d['Trihalomethanes']
    )

    d['pH_Ratio'] = (d['ph'] / d['Sulfate']) if d['Sulfate'] != 0 else 0.0
    d['Stability_Index'] = (
        d['Solids'] / d['Conductivity']
    ) if d['Conductivity'] != 0 else 0.0

    return d

# ===============================
#       PREDICTION ENDPOINT
# ===============================
@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded."}), 500

    try:
        # --- Extract JSON data ---
        raw = request.get_json(force=True)
        data = {str(k).lower(): v for k, v in raw.items()}

        # --- Validate required fields ---
        validate_input(data)

        # --- Build proper feature dictionary with case-sensitive names ---
        sample = {
            'ph': float(data['ph']),
            'Hardness': float(data['hardness']),
            'Solids': float(data['solids']),
            'Chloramines': float(data['chloramines']),
            'Sulfate': float(data['sulfate']),
            'Conductivity': float(data['conductivity']),
            'Organic_carbon': float(data['organic_carbon']),
            'Trihalomethanes': float(data['trihalomethanes']),
            'Turbidity': float(data['turbidity']),
        }

        # --- Add engineered features ---
        sample = compute_derived_features(sample)

        # --- Convert to DataFrame in correct order ---
        df = pd.DataFrame([sample], columns=MODEL_FEATURE_ORDER)

        # --- Scale input data ---
        scaled = scaler.transform(df.astype(float))

        # --- Predict probabilities ---
        proba = model.predict_proba(scaled)[0][1]  # Probability of Class 1

        # --- Apply safety threshold ---
        prediction = 1 if proba >= SAFETY_THRESHOLD else 0

        return jsonify({
            "prediction": prediction,
            "potable": bool(prediction),
            "confidence": float(proba),
            "threshold": SAFETY_THRESHOLD,
            "input": raw,
            "message": f"Water is {'POTABLE' if prediction == 1 else 'NOT POTABLE'}"
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        import traceback
        print("\n❌ Prediction Error:", e)
        print(traceback.format_exc())
        return jsonify({"error": "Internal prediction error."}), 500

# ===============================
#       RUN SERVER
# ===============================
if __name__ == '__main__':
    if model is None:
        print("❌ Server cannot start — model loading failed.")
    else:
        app.run(port=5000, debug=True)
