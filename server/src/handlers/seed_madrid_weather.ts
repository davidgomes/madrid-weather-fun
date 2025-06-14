
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type WeatherForecast } from '../schema';

export const seedMadridWeather = async (): Promise<WeatherForecast[]> => {
  try {
    // Generate 7 days of weather forecast data for Madrid
    const today = new Date();
    const madridForecasts = [];

    for (let i = 0; i < 7; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);

      // Generate realistic weather data for Madrid
      const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'] as const;
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      // Temperature ranges typical for Madrid (varies by condition)
      let tempHigh, tempLow, humidity, windSpeed;
      let description;

      switch (condition) {
        case 'sunny':
          tempHigh = Math.floor(Math.random() * 10) + 25; // 25-34°C
          tempLow = tempHigh - Math.floor(Math.random() * 8) - 8; // 8-15° lower
          humidity = Math.floor(Math.random() * 20) + 30; // 30-49%
          windSpeed = Math.floor(Math.random() * 10) + 5; // 5-14 km/h
          description = 'Clear skies with bright sunshine';
          break;
        case 'partly_cloudy':
          tempHigh = Math.floor(Math.random() * 8) + 22; // 22-29°C
          tempLow = tempHigh - Math.floor(Math.random() * 7) - 6; // 6-12° lower
          humidity = Math.floor(Math.random() * 20) + 40; // 40-59%
          windSpeed = Math.floor(Math.random() * 12) + 8; // 8-19 km/h
          description = 'Partly cloudy with some sunshine';
          break;
        case 'cloudy':
          tempHigh = Math.floor(Math.random() * 6) + 18; // 18-23°C
          tempLow = tempHigh - Math.floor(Math.random() * 6) - 5; // 5-10° lower
          humidity = Math.floor(Math.random() * 25) + 55; // 55-79%
          windSpeed = Math.floor(Math.random() * 15) + 10; // 10-24 km/h
          description = 'Overcast skies with thick cloud cover';
          break;
        case 'rainy':
          tempHigh = Math.floor(Math.random() * 5) + 15; // 15-19°C
          tempLow = tempHigh - Math.floor(Math.random() * 5) - 4; // 4-8° lower
          humidity = Math.floor(Math.random() * 20) + 70; // 70-89%
          windSpeed = Math.floor(Math.random() * 20) + 15; // 15-34 km/h
          description = 'Rainy conditions with moderate precipitation';
          break;
      }

      madridForecasts.push({
        city: 'Madrid',
        date: forecastDate,
        temperature_high: tempHigh,
        temperature_low: tempLow,
        condition,
        description,
        humidity,
        wind_speed: windSpeed
      });
    }

    // Insert all forecasts
    const results = await db.insert(weatherForecastsTable)
      .values(madridForecasts)
      .returning()
      .execute();

    return results;
  } catch (error) {
    console.error('Madrid weather seeding failed:', error);
    throw error;
  }
};
