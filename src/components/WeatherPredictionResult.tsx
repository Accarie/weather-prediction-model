
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudDrizzle, CloudRain, Cloud as Cloudy, CloudFog, CloudLightning, CloudSnow, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export type PredictionResult = {
  weatherType: string;
  probability: number;
  temperature: number;
  conditions: {
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
  forecast: {
    day: string;
    weatherType: string;
    tempHigh: number;
    tempLow: number;
  }[];
};

type WeatherPredictionResultProps = {
  result: PredictionResult | null;
};

const WeatherIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "sunny":
      return <Sun className="h-10 w-10 text-yellow-400" />;
    case "cloudy":
      return <Cloud className="h-10 w-10 text-gray-400" />;
    case "partly cloudy":
      return <div className="relative h-10 w-10">
        <Sun className="h-10 w-10 text-yellow-400 absolute" />
        <Cloud className="h-7 w-7 text-blue-400 absolute bottom-0 right-0" />
      </div>;
    case "rainy":
      return <CloudRain className="h-10 w-10 text-blue-500" />;
    case "drizzle":
      return <CloudDrizzle className="h-10 w-10 text-blue-300" />;
    case "thunderstorm":
      return <CloudLightning className="h-10 w-10 text-purple-500" />;
    case "snowy":
      return <CloudSnow className="h-10 w-10 text-blue-100" />;
    case "foggy":
      return <CloudFog className="h-10 w-10 text-gray-300" />;
    default:
      return <Cloud className="h-10 w-10 text-gray-400" />;
  }
};

const WeatherPredictionResult = ({ result }: WeatherPredictionResultProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
    }
  }, [result]);

  if (!result) return null;

  return (
    <div className={`transition-all duration-500 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className="w-full max-w-md mx-auto shadow-lg border-none">
        <CardHeader className="bg-gradient-to-r from-weather-blue to-weather-blue-dark text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {result.weatherType}
              </CardTitle>
              <CardDescription className="text-weather-cloud">
                Current forecast with {(result.probability * 100).toFixed(0)}% confidence
              </CardDescription>
            </div>
            <WeatherIcon type={result.weatherType} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-weather-blue-light rounded-lg">
              <p className="text-sm font-medium text-weather-blue-dark">Temperature</p>
              <p className="text-xl font-bold">{result.temperature}°C</p>
            </div>
            <div className="text-center p-3 bg-weather-cloud rounded-lg">
              <p className="text-sm font-medium text-weather-blue-dark">Humidity</p>
              <p className="text-xl font-bold">{result.conditions.humidity}%</p>
            </div>
            <div className="text-center p-3 bg-weather-cloud rounded-lg">
              <p className="text-sm font-medium text-weather-blue-dark">Wind Speed</p>
              <p className="text-xl font-bold">{result.conditions.windSpeed} km/h</p>
            </div>
            <div className="text-center p-3 bg-weather-blue-light rounded-lg">
              <p className="text-sm font-medium text-weather-blue-dark">Precipitation</p>
              <p className="text-xl font-bold">{result.conditions.precipitation} mm</p>
            </div>
          </div>

          <h3 className="font-medium text-lg mb-3">5-Day Forecast</h3>
          <div className="space-y-2">
            {result.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                  <WeatherIcon type={day.weatherType} />
                  <span>{day.day}</span>
                </div>
                <div className="font-medium">
                  {day.tempLow}° / {day.tempHigh}°
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherPredictionResult;
