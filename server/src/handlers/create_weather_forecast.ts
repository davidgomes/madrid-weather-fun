
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type CreateWeatherForecastInput, type WeatherForecast } from '../schema';

export const createWeatherForecast = async (input: CreateWeatherForecastInput): Promise<WeatherForecast> => {
  try {
    // Insert weather forecast record
    const result = await db.insert(weatherForecastsTable)
      .values({
        city: input.city,
        date: input.date,
        temperature_high: input.temperature_high,
        temperature_low: input.temperature_low,
        condition: input.condition,
        description: input.description,
        humidity: input.humidity,
        wind_speed: input.wind_speed
      })
      .returning()
      .execute();

    const weatherForecast = result[0];
    return weatherForecast;
  } catch (error) {
    console.error('Weather forecast creation failed:', error);
    throw error;
  }
};
