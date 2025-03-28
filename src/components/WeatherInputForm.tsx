
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

export type WeatherInputs = {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  precipitation: number;
};

type WeatherInputFormProps = {
  onSubmit: (data: WeatherInputs) => void;
  isLoading: boolean;
};

const defaultValues: WeatherInputs = {
  temperature: 25,
  humidity: 60,
  pressure: 1013,
  windSpeed: 10,
  precipitation: 0,
};

const WeatherInputForm = ({ onSubmit, isLoading }: WeatherInputFormProps) => {
  const [formData, setFormData] = useState<WeatherInputs>(defaultValues);
  const { toast } = useToast();

  const handleInputChange = (field: keyof WeatherInputs, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.humidity < 0 || formData.humidity > 100) {
      toast({
        title: "Invalid input",
        description: "Humidity must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-none">
      <CardHeader className="bg-weather-blue text-white rounded-t-lg">
        <CardTitle>Weather Conditions</CardTitle>
        <CardDescription className="text-weather-cloud">
          Enter current weather parameters for prediction
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <span className="text-sm font-medium">{formData.temperature}°C</span>
            </div>
            <Slider
              id="temperature"
              min={-20}
              max={50}
              step={0.1}
              value={[formData.temperature]}
              onValueChange={(value) => handleInputChange("temperature", value[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <span className="text-sm font-medium">{formData.humidity}%</span>
            </div>
            <Slider
              id="humidity"
              min={0}
              max={100}
              step={1}
              value={[formData.humidity]}
              onValueChange={(value) => handleInputChange("humidity", value[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pressure">Pressure (hPa)</Label>
            <Input
              id="pressure"
              type="number"
              value={formData.pressure}
              onChange={(e) => handleInputChange("pressure", Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
              <span className="text-sm font-medium">{formData.windSpeed} km/h</span>
            </div>
            <Slider
              id="windSpeed"
              min={0}
              max={150}
              step={1}
              value={[formData.windSpeed]}
              onValueChange={(value) => handleInputChange("windSpeed", value[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="precipitation">Precipitation (mm)</Label>
              <span className="text-sm font-medium">{formData.precipitation} mm</span>
            </div>
            <Slider
              id="precipitation"
              min={0}
              max={100}
              step={0.1}
              value={[formData.precipitation]}
              onValueChange={(value) => handleInputChange("precipitation", value[0])}
              className="py-2"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-weather-blue hover:bg-weather-blue-dark"
            disabled={isLoading}
          >
            {isLoading ? "Predicting..." : "Predict Weather"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeatherInputForm;
