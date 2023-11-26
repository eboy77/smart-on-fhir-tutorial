from flask import Flask, request, jsonify
from joblib import load

app = Flask(__name__)

# Load the trained model
model = load('trained_model.joblib')
