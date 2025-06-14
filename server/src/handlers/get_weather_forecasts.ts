
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type GetWeatherForecastsInput, type WeatherForecast } from '../schema';
import { eq, gte, lte, and, asc } from 'drizzle-orm';

export const getWeatherForecasts = async (input: GetWeatherForecastsInput): Promise<WeatherForecast[]> => {
  try {
    // Filter by date range - get forecasts from today onwards for the specified number of days
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + input.days); // Use input.days (guaranteed to exist due to Zod default)

    // Build the where conditions
    const dateConditions = [
      gte(weatherForecastsTable.date, today),
      lte(weatherForecastsTable.date, endDate)
    ];

    // Build final query with conditional city filter
    const query = input.city 
      ? db.select()
          .from(weatherForecastsTable)
          .where(and(eq(weatherForecastsTable.city, input.city), ...dateConditions))
          .orderBy(asc(weatherForecastsTable.date))
          .limit(input.days)
      : db.select()
          .from(weatherForecastsTable)
          .where(and(...dateConditions))
          .orderBy(asc(weatherForecastsTable.date))
          .limit(input.days);

    const results = await query.execute();

    // Return results - no numeric conversions needed as all fields are integers or already proper types
    return results;
  } catch (error) {
    console.error('Get weather forecasts failed:', error);
    throw error;
  }
};
