
import numpy as np
from datetime import datetime, timedelta

def get_day_names():
    """Get the next 5 day names starting from tomorrow"""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today = datetime.now().weekday()
    return [days[(today + i + 1) % 7] for i in range(5)]

def generate_forecast(current_weather, current_temp, current_humidity, current_precipitation):
    """Generate a 5-day forecast based on current weather conditions"""
    days = get_day_names()
    forecast = []
    
    # Weather transition probabilities (simplified)
    # More likely to stay similar for a couple days then gradually change
    weather_types = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorm", "Snowy", "Drizzle", "Foggy"]
    
    # Find the index of the current weather
    try:
        current_idx = weather_types.index(current_weather)
    except ValueError:
        # Default to cloudy if weather type not found
        current_idx = 2
    
    # Temperature trends (random walk with mean reversion)
    temp = current_temp
    humidity = current_humidity
    precipitation = current_precipitation
    
    for i, day in enumerate(days):
        # Weather type has some persistence but can change
        # The further in the future, the more uncertainty
        if np.random.random() > 0.7 + 0.3/(i+1):
            # Decide if weather gets better or worse
            direction = np.random.choice([-1, 0, 1], p=[0.3, 0.4, 0.3])
            new_idx = max(0, min(len(weather_types)-1, current_idx + direction))
            weather_type = weather_types[new_idx]
            current_idx = new_idx
        else:
            weather_type = weather_types[current_idx]
        
        # Add some random variation to temperature (more variation further out)
        variation = np.random.normal(0, 1 + i*0.5)
        temp_high = round(temp + variation + i*0.2, 1)
        temp_low = round(temp_high - (3 + np.random.random() * 5), 1)
        
        # Update for next day (mean reversion to seasonal normal)
        temp = temp * 0.8 + 20 * 0.2 + np.random.normal(0, 1)
        
        forecast.append({
            "day": day,
            "weatherType": weather_type,
            "tempHigh": temp_high,
            "tempLow": temp_low
        })
    
    return forecast
