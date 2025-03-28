
import os
import urllib.request
import pandas as pd
import numpy as np
from io import StringIO
import gzip
import shutil
import datetime

# URL for NOAA GSOD data
DATASET_URL = "https://www.ncei.noaa.gov/data/global-summary-of-the-day/access/"
DATASET_DIR = "data"
PROCESSED_FILE = "weather_dataset.csv"

def ensure_data_directory():
    """Create data directory if it doesn't exist"""
    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)

def download_station_data(year, station_id):
    """Download data for a specific weather station and year"""
    url = f"{DATASET_URL}{year}/{station_id}-{year}.csv"
    local_file = f"{DATASET_DIR}/{station_id}-{year}.csv"
    
    if not os.path.exists(local_file):
        try:
            print(f"Downloading {station_id} data for {year}...")
            urllib.request.urlretrieve(url, local_file)
            return local_file
        except Exception as e:
            print(f"Failed to download {url}: {e}")
            return None
    return local_file

def load_weather_data(years=3, sample_size=2000):
    """
    Load weather data for specified number of years
    Using a few major US cities with different climate types
    """
    ensure_data_directory()
    
    # Path to processed dataset
    processed_path = os.path.join(DATASET_DIR, PROCESSED_FILE)
    
    # Return processed data if it exists
    if os.path.exists(processed_path):
        print(f"Loading processed dataset from {processed_path}")
        return pd.read_csv(processed_path)
    
    # Major US weather stations (representing different climate types)
    stations = [
        "72295099999",  # New York (JFK)
        "72278099999",  # Miami
        "72494099999",  # Los Angeles
        "72531099999",  # Denver
        "72219099999",  # Chicago
    ]
    
    # Calculate years to download
    current_year = datetime.datetime.now().year
    years_to_download = list(range(current_year - years, current_year))
    
    all_data = []
    
    # Download data for each station and year
    for station in stations:
        for year in years_to_download:
            file_path = download_station_data(year, station)
            if file_path:
                try:
                    df = pd.read_csv(file_path)
                    all_data.append(df)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
    
    if not all_data:
        raise Exception("Failed to download any weather data")
    
    # Combine all data
    combined_df = pd.concat(all_data, ignore_index=True)
    
    # Select relevant columns and rename them
    weather_df = combined_df[['TEMP', 'DEWP', 'SLP', 'STP', 'VISIB', 
                              'WDSP', 'MXSPD', 'GUST', 'PRCP', 
                              'SNDP', 'FRSHTT']].copy()
    
    # Rename columns to more intuitive names
    weather_df.columns = ['temperature', 'dew_point', 'sea_level_pressure',
                         'station_pressure', 'visibility', 'wind_speed',
                         'max_wind_speed', 'gust', 'precipitation',
                         'snow_depth', 'weather_indicators']
    
    # Clean data - remove rows with missing values
    weather_df = weather_df.dropna()
    
    # Convert temperature from Fahrenheit to Celsius
    weather_df['temperature'] = (weather_df['temperature'] - 32) * 5/9
    
    # Derive weather type from weather indicators (FRSHTT: Fog, Rain, Snow, Hail, Thunder, Tornado)
    def determine_weather(row):
        indicators = row['weather_indicators']
        if pd.isna(indicators) or len(str(indicators)) != 6:
            return "Unknown"
            
        fog, rain, snow, hail, thunder, tornado = list(str(indicators))
        
        if tornado == '1':
            return "Severe"
        if thunder == '1':
            return "Thunderstorm"
        if hail == '1':
            return "Hail"
        if snow == '1':
            return "Snowy"
        if rain == '1' and float(row['precipitation']) > 0.1:
            return "Rainy"
        if rain == '1':
            return "Drizzle"
        if fog == '1':
            return "Foggy"
        
        # Use temperature and other factors for clear conditions
        if row['temperature'] > 25:
            return "Sunny"
        elif row['temperature'] > 15:
            return "Partly Cloudy"
        else:
            return "Cloudy"
    
    weather_df['weather_type'] = weather_df.apply(determine_weather, axis=1)
    
    # Filter to only keep the weather types we're interested in
    valid_weather_types = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorm", "Snowy", "Drizzle", "Foggy"]
    weather_df = weather_df[weather_df['weather_type'].isin(valid_weather_types)]
    
    # Select only the columns we need for our model
    final_df = weather_df[['temperature', 'wind_speed', 'sea_level_pressure', 
                          'precipitation', 'dew_point', 'weather_type']].copy()
    
    # Calculate humidity from temperature and dew point
    # Using the Magnus-Tetens formula
    def calculate_humidity(T, Td):
        """Calculate relative humidity from temperature (T) and dew point (Td)"""
        a = 17.27
        b = 237.7
        alpha = ((a * Td) / (b + Td)) - ((a * T) / (b + T))
        return round(100 * np.exp(alpha), 2)
    
    final_df['humidity'] = final_df.apply(
        lambda row: calculate_humidity(row['temperature'], row['dew_point']), 
        axis=1
    )
    
    # Drop dew point as we now have humidity
    final_df = final_df.drop(columns=['dew_point'])
    
    # For simplicity, rename sea_level_pressure to pressure
    final_df = final_df.rename(columns={'sea_level_pressure': 'pressure'})
    
    # Limit to sample size (randomly sampled)
    if len(final_df) > sample_size:
        final_df = final_df.sample(sample_size, random_state=42)
    
    # Save processed dataset
    final_df.to_csv(processed_path, index=False)
    
    print(f"Processed dataset saved to {processed_path}")
    
    return final_df

if __name__ == "__main__":
    # Test loading the dataset
    df = load_weather_data()
    print(f"Loaded dataset with {len(df)} records")
    print(df.head())
    print(f"Weather type distribution:\n{df['weather_type'].value_counts()}")
