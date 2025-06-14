
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type WeatherForecast } from '../schema';
import { eq } from 'drizzle-orm';

export const getMadridWeather = async (): Promise<WeatherForecast[]> => {
  try {
    const results = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.city, 'Madrid'))
      .execute();

    // No numeric conversions needed - all numeric fields are integers in this schema
    return results;
  } catch (error) {
    console.error('Failed to get Madrid weather:', error);
    throw error;
  }
};
