
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type UpdateWeatherForecastInput, type WeatherForecast } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWeatherForecast = async (input: UpdateWeatherForecastInput): Promise<WeatherForecast> => {
  try {
    // Extract id and build update data
    const { id, ...updateData } = input;
    
    // Only include fields that are defined in the update
    const fieldsToUpdate: any = {};
    if (updateData.city !== undefined) fieldsToUpdate.city = updateData.city;
    if (updateData.date !== undefined) fieldsToUpdate.date = updateData.date;
    if (updateData.temperature_high !== undefined) fieldsToUpdate.temperature_high = updateData.temperature_high;
    if (updateData.temperature_low !== undefined) fieldsToUpdate.temperature_low = updateData.temperature_low;
    if (updateData.condition !== undefined) fieldsToUpdate.condition = updateData.condition;
    if (updateData.description !== undefined) fieldsToUpdate.description = updateData.description;
    if (updateData.humidity !== undefined) fieldsToUpdate.humidity = updateData.humidity;
    if (updateData.wind_speed !== undefined) fieldsToUpdate.wind_speed = updateData.wind_speed;
    
    // Add updated_at timestamp
    fieldsToUpdate.updated_at = new Date();

    // Update the weather forecast record
    const result = await db.update(weatherForecastsTable)
      .set(fieldsToUpdate)
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
