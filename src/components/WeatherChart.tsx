
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";

type ChartPoint = {
  day: string;
  temperature: number;
  humidity: number;
  precipitation: number;
};

type WeatherChartProps = {
  data: ChartPoint[] | null;
};

const WeatherChart = ({ data }: WeatherChartProps) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (data) {
      // Add a slight delay for a smoother entrance after results appear
      const timer = setTimeout(() => {
        setVisible(true);
      }, 400);
      
      return () => clearTimeout(timer);
    }
  }, [data]);
  
  if (!data) return null;
  
  return (
    <div className={`transition-all duration-500 ease-in-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-none mt-8">
        <CardHeader className="bg-gradient-to-r from-weather-blue to-weather-blue-dark text-white rounded-t-lg">
          <CardTitle>Weather Forecast Chart</CardTitle>
          <CardDescription className="text-weather-cloud">
            5-day temperature, humidity and precipitation forecast
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }} />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#0EA5E9" 
                  fill="#C5E7FF" 
                  activeDot={{ r: 8 }}
                  name="Temperature (°C)"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#8E9196" 
                  fill="#F1F0FB" 
                  name="Humidity (%)"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="precipitation" 
                  stroke="#075985" 
                  fill="#0EA5E924" 
                  name="Precipitation (mm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherChart;
