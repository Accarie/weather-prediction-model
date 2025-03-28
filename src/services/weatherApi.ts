
import { WeatherInputs } from "@/components/WeatherInputForm";
import { PredictionResult } from "@/components/WeatherPredictionResult";

// API URL - change this to your deployed API URL
const API_URL = "http://localhost:8000";

// Fallback to mock data if API is unavailable
const USE_MOCK_FALLBACK = true;

// Weather types
const weatherTypes = [
  "Sunny", 
  "Partly Cloudy", 
  "Cloudy", 
  "Rainy", 
  "Thunderstorm", 
  "Snowy",
  "Drizzle",
  "Foggy"
];

// Days of the week
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = new Date().getDay();
const futureDays = [...days.slice(today), ...days.slice(0, today)].slice(1, 6);

// Call the real ML API for predictions
export const predictWeather = async (inputs: WeatherInputs): Promise<PredictionResult> => {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature: inputs.temperature,
        humidity: inputs.humidity,
        pressure: inputs.pressure,
        wind_speed: inputs.windSpeed,
        precipitation: inputs.precipitation,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch from ML API:", error);
    
    // If enabled, fall back to mock data
    if (USE_MOCK_FALLBACK) {
      console.log("Using mock prediction as fallback");
      return generateMockPrediction(inputs);
    }
    
    throw error;
  }
};

// Mock prediction function (same as before for fallback)
const generateMockPrediction = (inputs: WeatherInputs): PredictionResult => {
  // Mock logic to determine weather type based on inputs
  let predictedType = "Cloudy"; // default
  let tempModifier = 0;
  
  if (inputs.temperature > 30 && inputs.humidity < 50) {
    predictedType = "Sunny";
    tempModifier = 2;
  } else if (inputs.precipitation > 5) {
    predictedType = "Rainy";
    tempModifier = -2;
  } else if (inputs.precipitation > 1 && inputs.precipitation <= 5) {
    predictedType = "Drizzle";
    tempModifier = -1;
  } else if (inputs.humidity > 80 && inputs.temperature < 5) {
    predictedType = "Snowy";
    tempModifier = -4;
  } else if (inputs.humidity > 90 && inputs.windSpeed < 5) {
    predictedType = "Foggy";
    tempModifier = -1;
  } else if (inputs.precipitation > 10 && inputs.windSpeed > 30) {
    predictedType = "Thunderstorm";
    tempModifier = -3;
  } else if (inputs.humidity > 60 && inputs.temperature > 20) {
    predictedType = "Partly Cloudy";
    tempModifier = 0;
  }
  
  // Generate mock forecast data
  const forecast = futureDays.map((day, index) => {
    // Create some variation in the forecast
    const variance = Math.sin(index) * 3;
    const tempHigh = Math.round(inputs.temperature + tempModifier + variance + index * 0.5);
    const tempLow = Math.round(tempHigh - (3 + Math.random() * 5));
    
    // Sometimes change the weather type for the forecast
    const weatherIndex = (weatherTypes.indexOf(predictedType) + index) % weatherTypes.length;
    const weatherType = Math.random() > 0.7 ? weatherTypes[weatherIndex] : predictedType;
    
    return {
      day,
      weatherType,
      tempHigh,
      tempLow
    };
  });
  
  // Generate a confidence score between 0.7 and 0.99
  const confidence = 0.7 + Math.random() * 0.29;
  
  return {
    weatherType: predictedType,
    probability: confidence,
    temperature: Math.round(inputs.temperature + tempModifier),
    conditions: {
      humidity: inputs.humidity,
      precipitation: inputs.precipitation,
      windSpeed: inputs.windSpeed
    },
    forecast
  };
};

// Function to prepare chart data from prediction results
export const prepareChartData = (result: PredictionResult) => {
  if (!result) return null;
  
  return result.forecast.map((day, index) => ({
    day: day.day,
    temperature: (day.tempHigh + day.tempLow) / 2,
    humidity: result.conditions.humidity + (Math.sin(index) * 10),
    precipitation: result.conditions.precipitation * (Math.cos(index) * 0.5 + 0.5)
  }));
};
