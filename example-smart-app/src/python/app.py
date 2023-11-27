from flask import Flask, request, jsonify
from joblib import load
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = load('trained_model.joblib')

@app.route('/predict', methods=['POST'])
def classify(data):
    data = request.get_json()  # Get user inputs as JSON
    df = pd.DataFrame([data])
    df = pd.get_dummies(df, columns=['MaritalStatus', 'Education', 'Employment'])

    result = model.predict(df)
    return result[0]
    # Return the classification result 
    

@app.route('/classify', methods=['POST'])
def handle_classification():
    data = request.get_json()
    result = classify(data)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)