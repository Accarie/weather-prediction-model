
import { useState } from "react";
import Header from "@/components/Header";
import WeatherInputForm, { WeatherInputs } from "@/components/WeatherInputForm";
import WeatherPredictionResult, { PredictionResult } from "@/components/WeatherPredictionResult";
import WeatherChart from "@/components/WeatherChart";
import { predictWeather, prepareChartData } from "@/services/weatherApi";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: WeatherInputs) => {
    setIsLoading(true);
    try {
      // In a production app, this would call your backend Python API
      const result = await predictWeather(data);
      setPrediction(result);
      
      // Prepare chart data
      const formattedChartData = prepareChartData(result);
      setChartData(formattedChartData);
      
      toast({
        title: "Prediction Complete",
        description: `Weather forecast: ${result.weatherType}`,
      });
    } catch (error) {
      console.error("Prediction failed:", error);
      toast({
        title: "Prediction Failed",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-weather-blue-dark mb-2">
              Weather Prediction Model
            </h2>
            <p className="text-weather-gray max-w-xl mx-auto">
              Enter current weather parameters, and our ML model will predict the likely weather outcome. 
              View detailed forecasts and graphical representations of the data.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <WeatherInputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            <div>
              <WeatherPredictionResult result={prediction} />
            </div>
          </div>
          
          <WeatherChart data={chartData} />
          
          {!prediction && (
            <div className="mt-12 text-center opacity-70">
              <p className="text-weather-blue-dark italic">
                Enter weather parameters and click "Predict Weather" to see results.
              </p>
            </div>
          )}

          <div className="mt-12 text-center text-xs text-weather-gray">
            <p>
              Note: This demo uses a mock prediction model. In a real implementation, 
              predictions would be made by connecting to a Python ML model API.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
