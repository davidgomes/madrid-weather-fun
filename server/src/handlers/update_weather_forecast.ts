
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type UpdateWeatherForecastInput, type WeatherForecast } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWeatherForecast = async (input: UpdateWeatherForecastInput): Promise<WeatherForecast> => {
  try {
    // Build the update data object, excluding the id and only including defined fields
    const { id, ...updateData } = input;
    
    // Filter out undefined values to only update provided fields
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Add updated_at timestamp
    const updateValues = {
      ...fieldsToUpdate,
      updated_at: new Date()
    };

    // Update the weather forecast record
    const result = await db.update(weatherForecastsTable)
      .set(updateValues)
      .where(eq(weatherForecastsTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Weather forecast with id ${id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Weather forecast update failed:', error);
    throw error;
  }
};
