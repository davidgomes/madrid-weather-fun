
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type GetWeatherForecastsInput, type WeatherForecast } from '../schema';
import { eq, gte, and } from 'drizzle-orm';

export const getWeatherForecasts = async (input: GetWeatherForecastsInput = { days: 7 }): Promise<WeatherForecast[]> => {
  try {
    // Filter for future dates (today and forward)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    // Build the query based on whether city filter is provided
    const results = input.city
      ? await db.select()
          .from(weatherForecastsTable)
          .where(and(
            eq(weatherForecastsTable.city, input.city),
            gte(weatherForecastsTable.date, today)
          ))
          .orderBy(weatherForecastsTable.date)
          .limit(input.days)
          .execute()
      : await db.select()
          .from(weatherForecastsTable)
          .where(gte(weatherForecastsTable.date, today))
          .orderBy(weatherForecastsTable.date)
          .limit(input.days)
          .execute();

    return results;
  } catch (error) {
    console.error('Weather forecasts retrieval failed:', error);
    throw error;
  }
};
