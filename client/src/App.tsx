
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { WeatherForecast } from '../../server/src/schema';

// Weather condition emoji mapping
const weatherEmojis = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️'
} as const;

// Fun weather messages
const weatherMessages = {
  sunny: 'Perfect for a picnic! 🧺',
  partly_cloudy: 'Mix of sun and clouds! 🌤️',
  cloudy: 'Cozy cloud blanket! ☁️',
  rainy: 'Perfect for staying cozy inside! 🏠',
  stormy: 'Nature\'s light show! ⚡',
  snowy: 'Winter wonderland! ❄️'
} as const;

function App() {
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadWeatherData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trpc.getMadridWeather.query();
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError('Failed to load weather data. Please try again! 🌈');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const seedWeatherData = async () => {
    try {
      setIsLoading(true);
      await trpc.seedMadridWeather.mutate();
      await loadWeatherData();
    } catch (err) {
      console.error('Failed to seed weather data:', err);
      setError('Failed to generate weather data. Please try again! 🌈');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTemperature = (temp: number) => {
    return Math.round(temp);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌤️</div>
          <p className="text-xl text-gray-700 font-medium">Loading Madrid's weather magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <span>🏰</span>
            Madrid Weather
            <span>🌈</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Your cheerful 7-day weather companion! ✨
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={loadWeatherData}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            🔄 Refresh Weather
          </Button>
          <Button 
            onClick={seedWeatherData}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            🌱 Generate New Data
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center mb-8">
            <div className="bg-red-100 border border-red-300 rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-2">😔</div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Weather Cards */}
        {weatherData.length === 0 && !error ? (
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-8 shadow-lg">
              <div className="text-6xl mb-4">🌞</div>
              <p className="text-yellow-800 font-medium text-lg mb-4">
                No weather data available yet!
              </p>
              <p className="text-yellow-700">
                Click "Generate New Data" to create some magical weather forecasts! ✨
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {weatherData.map((forecast: WeatherForecast) => (
              <Card 
                key={forecast.id} 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-center">
                    <div className="text-4xl mb-2">
                      {weatherEmojis[forecast.condition]}
                    </div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">
                      {formatDate(forecast.date)}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-0 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {forecast.condition.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Temperature */}
                  <div className="text-center mb-4">
                    <div className="flex justify-center items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-red-500">
                        {formatTemperature(forecast.temperature_high)}°
                      </span>
                      <span className="text-lg text-gray-400">/</span>
                      <span className="text-xl font-semibold text-blue-500">
                        {formatTemperature(forecast.temperature_low)}°
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      {weatherMessages[forecast.condition]}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-700 font-medium text-center">
                      {forecast.description}
                    </p>
                  </div>

                  {/* Weather Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <div className="text-blue-600 font-semibold">💧 Humidity</div>
                      <div className="text-blue-800 font-bold">{forecast.humidity}%</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-green-600 font-semibold">💨 Wind</div>
                      <div className="text-green-800 font-bold">{forecast.wind_speed} km/h</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 mb-6">
          <p className="text-gray-600 font-medium">
            Made with 💖 for sunny Madrid days! 🌞
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Weather data updates automatically ✨
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
