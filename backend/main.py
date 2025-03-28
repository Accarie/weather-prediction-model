
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import weather_model
import forecast_generator
import uvicorn

app = FastAPI(title="Weather Prediction API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model when the API starts
model = weather_model.load_model()

class WeatherInput(BaseModel):
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    precipitation: float

class WeatherPrediction(BaseModel):
    weatherType: str
    probability: float
    temperature: float
    conditions: dict
    forecast: list

@app.get("/")
def root():
    return {"message": "Weather Prediction API is running"}

@app.post("/predict")
def predict_weather(inputs: WeatherInput):
    try:
        # Make the prediction
        weather_type, probability = weather_model.predict_weather(
            inputs.temperature,
            inputs.humidity,
            inputs.pressure,
            inputs.wind_speed,
            inputs.precipitation
        )
        
        # Generate forecast
        forecast = forecast_generator.generate_forecast(
            weather_type,
            inputs.temperature,
            inputs.humidity,
            inputs.precipitation
        )
        
        # Prepare response
        response = WeatherPrediction(
            weatherType=weather_type,
            probability=float(probability),
            temperature=inputs.temperature,
            conditions={
                "humidity": inputs.humidity,
                "precipitation": inputs.precipitation,
                "windSpeed": inputs.wind_speed
            },
            forecast=forecast
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/train")
def train_model():
    """Endpoint to retrain the model"""
    try:
        _, accuracy = weather_model.train_weather_model()
        return {"message": "Model successfully trained", "accuracy": accuracy}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

if __name__ == "__main__":
    # Train the model on startup if needed
    weather_model.train_weather_model()
    
    # Start the API server
    uvicorn.run(app, host="0.0.0.0", port=8000)
