import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

def train_model():
    # Define paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(os.path.dirname(BASE_DIR), 'data', 'dataset.csv')
    MODEL_DIR = os.path.join(BASE_DIR, 'models')
    MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')

    # Ensure models directory exists
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    print(f"Loading data from: {DATA_PATH}")
    # Load dataset
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print("Error: dataset.csv not found!")
        return

    # Prepare features and target
    # Features: duration, tags_count, description_length, category, upload_time
    features = ['duration', 'tags_count', 'description_length', 'category', 'upload_time']
    X = df[features]
    y = df['views']

    print("Training RandomForestRegressor...")
    # Initialize and train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Save the trained model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Model successfully trained and saved to: {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
