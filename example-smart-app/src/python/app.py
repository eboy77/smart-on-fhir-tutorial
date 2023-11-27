from flask import Flask, request, jsonify
from joblib import load
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load the trained model
model = load('trained_model.joblib')

def classify(data):
    df = pd.DataFrame([data])
    df = pd.get_dummies(df, columns=['MaritalStatus', 'Education', 'Employment'])

    result = model.predict(df)
    return result[0]
    # Return the classification result 
    

@app.route('/classify', methods=['POST'])
def handle_classification():
    data = request.get_json()
    result = classify(data)
    print(result)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)