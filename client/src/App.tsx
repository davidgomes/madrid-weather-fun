
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { WeatherForecast } from '../../server/src/schema';

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Weather condition to emoji mapping
  const getWeatherEmoji = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️';
      case 'partly_cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  // Format temperature with degree symbol
  const formatTemp = (temp: number) => `${Math.round(temp)}°C`;

  // Format date to show day of week and date
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Get background color based on condition
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'bg-gradient-to-br from-yellow-100 to-orange-100';
      case 'partly_cloudy': return 'bg-gradient-to-br from-blue-50 to-yellow-50';
      case 'cloudy': return 'bg-gradient-to-br from-gray-100 to-blue-100';
      case 'rainy': return 'bg-gradient-to-br from-blue-100 to-gray-200';
      case 'stormy': return 'bg-gradient-to-br from-gray-200 to-purple-200';
      case 'snowy': return 'bg-gradient-to-br from-blue-50 to-white';
      default: return 'bg-gradient-to-br from-blue-50 to-green-50';
    }
  };

  const loadMadridWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getMadridWeather.query();
      setForecasts(result);
    } catch (error) {
      console.error('Failed to load Madrid weather:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const seedWeatherData = async () => {
    setIsSeeding(true);
    try {
      const result = await trpc.seedMadridWeather.mutate();
      setForecasts(result);
    } catch (error) {
      console.error('Failed to seed weather data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    loadMadridWeather();
  }, [loadMadridWeather]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <div className="text-2xl font-bold">Loading Madrid Weather...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌤️</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Madrid Weather
          </h1>
          <p className="text-lg text-white/90 mb-4">
            ¡Hola! Here's your 7-day forecast for beautiful Madrid 🇪🇸
          </p>
          
          {forecasts.length === 0 && (
            <div className="mb-4">
              <p className="text-white/80 mb-4">
                No weather data available yet. Would you like to generate some sample data?
              </p>
              <Button 
                onClick={seedWeatherData}
                disabled={isSeeding}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isSeeding ? '🌱 Seeding...' : '🌱 Generate Sample Data'}
              </Button>
            </div>
          )}
        </div>

        {/* Weather Cards */}
        {forecasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {forecasts.map((forecast: WeatherForecast) => (
              <Card 
                key={forecast.id} 
                className={`${getConditionColor(forecast.condition)} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="text-4xl mb-2">
                    {getWeatherEmoji(forecast.condition)}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {formatDate(forecast.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-gray-800">
                      {formatTemp(forecast.temperature_high)}
                    </span>
                    <span className="text-lg text-gray-600">
                      {formatTemp(forecast.temperature_low)}
                    </span>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className="mb-2 bg-white/50 text-gray-700 capitalize"
                  >
                    {forecast.condition.replace('_', ' ')}
                  </Badge>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {forecast.description}
                  </p>
                  
                  <Separator className="my-3 bg-white/50" />
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>💧 {forecast.humidity}%</span>
                    <span>💨 {forecast.wind_speed} km/h</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {forecasts.length > 0 && (
          <div className="text-center">
            <Button 
              onClick={loadMadridWeather}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Weather'}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/70">
          <p className="text-sm">
            🌟 Stay sunny, Madrid! 🌟
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
