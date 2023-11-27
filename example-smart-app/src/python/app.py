from flask import Flask, request, jsonify
from joblib import load
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load the trained model
model = load('trained_model.joblib')

def classify(data):
    columns = [
    'Income', 'MaritalStatus_M', 'MaritalStatus_S',
    'Education_H', 'Education_L', 'Education_M', 'Education_U',
    'Employment_F', 'Employment_N', 'Employment_P', 'Employment_U'
    ]

    # Create an empty DataFrame with defined columns
    df = pd.DataFrame(columns=columns)
    
    entry = {
        'Income': data['Income'],
        'MaritalStatus_M': data['MaritalStatus'] == 'M',
        'MaritalStatus_S': data['MaritalStatus'] == 'S',
        'Education_H': data['Education'] == 'H',
        'Education_L': data['Education'] == 'L',
        'Education_M': data['Education'] == 'M',
        'Education_U': data['Education'] == 'U',
        'Employment_F': data['Employment'] == 'F',
        'Employment_N': data['Employment'] == 'N',
        'Employment_P': data['Employment'] == 'P',
        'Employment_U': data['Employment'] == 'U'   
    }
    entry_df = pd.DataFrame(entry, index=[0])  # Create a DataFrame from the entry with index 0
    result_df = pd.concat([df, entry_df], ignore_index=True)

    print(result_df)

    result = model.predict(result_df)
    return result[0]
    # Return the classification result 
    

@app.route('/classify', methods=['POST'])
def handle_classification():
    data = request.get_json()
    result = classify(data)
    print(result)

    response = jsonify({'result': str(result)})
    response.headers.add('Access-Control-Allow-Origin', 'https://eboy77.github.io')
    return response

if __name__ == '__main__':
    app.run(debug=True)