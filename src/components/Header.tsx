
import { Cloud, CloudSun, Sun } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-6 flex justify-center items-center">
      <div className="flex items-center gap-2">
        <div className="animate-float">
          <CloudSun size={40} className="text-weather-blue" />
        </div>
        <h1 className="text-3xl font-bold text-weather-blue-dark">
          ClimaPred<span className="text-weather-gray">ictor</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
