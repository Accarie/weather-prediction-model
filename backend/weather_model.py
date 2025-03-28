
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import os
from dataset_loader import load_weather_data
import matplotlib.pyplot as plt

# Weather types we want to predict
WEATHER_TYPES = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorm", "Snowy", "Drizzle", "Foggy"]

def train_weather_model():
    """Train a RandomForest model on the real dataset"""
    # Load the real data
    print("Loading real weather dataset...")
    df = load_weather_data()
    
    # Report dataset statistics
    print(f"Dataset loaded with {len(df)} samples")
    print(f"Weather type distribution:\n{df['weather_type'].value_counts()}")
    
    # Visualize the data (for development purposes)
    create_feature_plots(df)
    
    # Split features and target
    X = df[['temperature', 'humidity', 'pressure', 'wind_speed', 'precipitation']]
    y = df['weather_type']
    
    # Split into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create a pipeline with preprocessing and model
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train the model
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate the model
    accuracy = pipeline.score(X_test, y_test)
    print(f"Model accuracy: {accuracy:.2f}")
    
    # Create directory if it doesn't exist
    if not os.path.exists('models'):
        os.makedirs('models')
    
    # Save the model
    model_path = 'models/weather_model.joblib'
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")
    
    return pipeline, accuracy

def create_feature_plots(df):
    """Create visualizations of the dataset features"""
    try:
        # Create plots directory
        if not os.path.exists('plots'):
            os.makedirs('plots')
            
        # Plot temperature distribution by weather type
        plt.figure(figsize=(12, 6))
        for weather in WEATHER_TYPES:
            subset = df[df['weather_type'] == weather]['temperature']
            if len(subset) > 0:
                plt.hist(subset, alpha=0.5, label=weather, bins=15)
        
        plt.title('Temperature Distribution by Weather Type')
        plt.xlabel('Temperature (°C)')
        plt.ylabel('Count')
        plt.legend()
        plt.savefig('plots/temperature_by_weather.png')
        
        # Plot humidity vs temperature colored by weather type
        plt.figure(figsize=(12, 6))
        for weather in WEATHER_TYPES:
            subset = df[df['weather_type'] == weather]
            if len(subset) > 0:
                plt.scatter(subset['temperature'], subset['humidity'], 
                           alpha=0.5, label=weather)
        
        plt.title('Humidity vs Temperature by Weather Type')
        plt.xlabel('Temperature (°C)')
        plt.ylabel('Humidity (%)')
        plt.legend()
        plt.savefig('plots/humidity_vs_temperature.png')
        
        print("Created feature plots in 'plots' directory")
    except Exception as e:
        print(f"Error creating plots: {e}")

def load_model():
    """Load the trained model or train if it doesn't exist"""
    model_path = 'models/weather_model.joblib'
    try:
        if os.path.exists(model_path):
            print(f"Loading model from {model_path}")
            model = joblib.load(model_path)
            return model
        else:
            print("Model not found. Training new model...")
            model, _ = train_weather_model()
            return model
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Training new model...")
        model, _ = train_weather_model()
        return model

def predict_weather(temperature, humidity, pressure, wind_speed, precipitation):
    """Make a prediction using the trained model"""
    model = load_model()
    
    # Create a feature array
    features = np.array([[temperature, humidity, pressure, wind_speed, precipitation]])
    
    # Get the predicted weather type
    weather_type = model.predict(features)[0]
    
    # Get probability scores
    probabilities = model.predict_proba(features)[0]
    probability = max(probabilities) 
    
    return weather_type, probability

if __name__ == "__main__":
    # Train the model when script is run directly
    train_weather_model()
