from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Load and preprocess data
def load_data():
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset', 'water_potability.csv')
    df = pd.read_csv(dataset_path)
    
    # Drop rows with missing target
    df = df.dropna(subset=['Potability'])
    
    # Separate features and target
    X = df.drop('Potability', axis=1)
    y = df['Potability']
    
    # Fill missing values with median
    for column in X.columns:
        X[column] = X[column].fillna(X[column].median())
    
    return X, y

# Train model
def train_model():
    X, y = load_data()
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    return model, scaler

# Initialize model and scaler
model, scaler = train_model()

# Feature names for validation
feature_names = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 
                 'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Handle both lowercase and original case field names
        # Convert PH to ph for processing
        if 'PH' in data:
            data['ph'] = data.pop('PH')
        
        # Extract features in the correct order
        features = []
        for feature in feature_names:
            if feature not in data:
                return jsonify({'error': f'Missing feature: {feature}'}), 400
            
            try:
                value = float(data[feature])
                features.append(value)
            except (ValueError, TypeError):
                return jsonify({'error': f'Invalid value for {feature}'}), 400
        
        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # Scale features
        features_scaled = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        prediction_proba = model.predict_proba(features_scaled)[0]
        
        # Prepare response
        response = {
            'prediction': int(prediction),
            'potable': bool(prediction == 1),
            'confidence': float(max(prediction_proba)),
            'probabilities': {
                'not_potable': float(prediction_proba[0]),
                'potable': float(prediction_proba[1])
            },
            'parameters': {
                'PH': float(data.get('ph', data.get('PH'))),
                'Hardness': float(data['Hardness']),
                'Solids': float(data['Solids']),
                'Chloramines': float(data['Chloramines']),
                'Sulfate': float(data['Sulfate']),
                'Conductivity': float(data['Conductivity']),
                'Organic_carbon': float(data['Organic_carbon']),
                'Trihalomethanes': float(data['Trihalomethanes']),
                'Turbidity': float(data['Turbidity'])
            }
        }
        
        # Add recommendation
        if prediction == 1:
            response['recommendation'] = 'This water is safe for consumption and meets quality standards.'
        else:
            response['recommendation'] = 'This water requires treatment before consumption. Consider filtration or purification methods.'
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'Water Potability API is running'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
