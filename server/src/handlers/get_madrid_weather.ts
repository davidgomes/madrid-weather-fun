
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type WeatherForecast } from '../schema';

export const getMadridWeather = async (): Promise<WeatherForecast[]> => {
  try {
    const results = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.city, 'Madrid'))
      .execute();

    // No numeric conversions needed as all fields are integers or other types
    return results;
  } catch (error) {
    console.error('Failed to get Madrid weather:', error);
    throw error;
  }
};
