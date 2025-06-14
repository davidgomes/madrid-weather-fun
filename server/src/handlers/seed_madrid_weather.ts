
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type WeatherForecast } from '../schema';

export const seedMadridWeather = async (): Promise<WeatherForecast[]> => {
  try {
    // Create 7 days of sample weather data for Madrid
    const baseDate = new Date();
    const weatherData = [
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime()),
        temperature_high: 25,
        temperature_low: 15,
        condition: 'sunny' as const,
        description: 'Clear skies with plenty of sunshine',
        humidity: 35,
        wind_speed: 8
      },
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
        temperature_high: 28,
        temperature_low: 18,
        condition: 'partly_cloudy' as const,
        description: 'Partly cloudy with some sun breaks',
        humidity: 45,
        wind_speed: 12
      },
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        temperature_high: 23,
        temperature_low: 16,
        condition: 'cloudy' as const,
        description: 'Overcast with thick cloud cover',
        humidity: 60,
        wind_speed: 10
      },
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        temperature_high: 20,
        temperature_low: 12,
        condition: 'rainy' as const,
        description: 'Light rain throughout the day',
        humidity: 80,
        wind_speed: 15
      },
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000),
        temperature_high: 22,
        temperature_low: 14,
        condition: 'partly_cloudy' as const,
        description: 'Clearing up with intermittent clouds',
        humidity: 55,
        wind_speed: 9
      },
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        temperature_high: 26,
        temperature_low: 17,
        condition: 'sunny' as const,
        description: 'Bright and sunny day',
        humidity: 40,
        wind_speed: 6
      },
      {
        city: 'Madrid',
        date: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000),
        temperature_high: 29,
        temperature_low: 19,
        condition: 'sunny' as const,
        description: 'Hot and sunny weather',
        humidity: 30,
        wind_speed: 5
      }
    ];

    // Insert all weather forecasts
    const results = await db.insert(weatherForecastsTable)
      .values(weatherData)
      .returning()
      .execute();

    return results;
  } catch (error) {
    console.error('Madrid weather seeding failed:', error);
    throw error;
  }
};
