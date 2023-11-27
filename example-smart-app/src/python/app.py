from flask import Flask, request, jsonify
from joblib import load

app = Flask(__name__)

# Load the trained model
model = load('trained_model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()  # Get user inputs as JSON

    # Prepare user inputs for prediction
    user_data = [data['income'], data['education'], data['marital_status'], data['employment']]

    # Perform prediction
    prediction = model.predict([user_data])[0]

    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app