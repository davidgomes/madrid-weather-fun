
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type CreateWeatherForecastInput, type UpdateWeatherForecastInput } from '../schema';
import { updateWeatherForecast } from '../handlers/update_weather_forecast';
import { eq } from 'drizzle-orm';

// Test data for creating initial weather forecast
const testCreateInput: CreateWeatherForecastInput = {
  city: 'New York',
  date: new Date('2024-01-01'),
  temperature_high: 25,
  temperature_low: 15,
  condition: 'sunny',
  description: 'Clear skies with sunshine',
  humidity: 60,
  wind_speed: 10
};

describe('updateWeatherForecast', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a weather forecast with all fields', async () => {
    // Create initial weather forecast
    const created = await db.insert(weatherForecastsTable)
      .values({
        ...testCreateInput,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const createdForecast = created[0];

    // Update input with all fields
    const updateInput: UpdateWeatherForecastInput = {
      id: createdForecast.id,
      city: 'Los Angeles',
      date: new Date('2024-01-02'),
      temperature_high: 30,
      temperature_low: 20,
      condition: 'partly_cloudy',
      description: 'Partly cloudy with some sun',
      humidity: 70,
      wind_speed: 15
    };

    const result = await updateWeatherForecast(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(createdForecast.id);
    expect(result.city).toEqual('Los Angeles');
    expect(result.date).toEqual(new Date('2024-01-02'));
    expect(result.temperature_high).toEqual(30);
    expect(result.temperature_low).toEqual(20);
    expect(result.condition).toEqual('partly_cloudy');
    expect(result.description).toEqual('Partly cloudy with some sun');
    expect(result.humidity).toEqual(70);
    expect(result.wind_speed).toEqual(15);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdForecast.updated_at).toBe(true);
  });

  it('should update a weather forecast with partial fields', async () => {
    // Create initial weather forecast
    const created = await db.insert(weatherForecastsTable)
      .values({
        ...testCreateInput,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const createdForecast = created[0];

    // Update input with only some fields
    const updateInput: UpdateWeatherForecastInput = {
      id: createdForecast.id,
      temperature_high: 28,
      condition: 'cloudy',
      humidity: 75
    };

    const result = await updateWeatherForecast(updateInput);

    // Verify only specified fields were updated
    expect(result.id).toEqual(createdForecast.id);
    expect(result.city).toEqual(testCreateInput.city); // Should remain unchanged
    expect(result.date).toEqual(testCreateInput.date); // Should remain unchanged
    expect(result.temperature_high).toEqual(28); // Should be updated
    expect(result.temperature_low).toEqual(testCreateInput.temperature_low); // Should remain unchanged
    expect(result.condition).toEqual('cloudy'); // Should be updated
    expect(result.description).toEqual(testCreateInput.description); // Should remain unchanged
    expect(result.humidity).toEqual(75); // Should be updated
    expect(result.wind_speed).toEqual(testCreateInput.wind_speed); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdForecast.updated_at).toBe(true);
  });

  it('should save updated weather forecast to database', async () => {
    // Create initial weather forecast
    const created = await db.insert(weatherForecastsTable)
      .values({
        ...testCreateInput,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const createdForecast = created[0];

    // Update the forecast
    const updateInput: UpdateWeatherForecastInput = {
      id: createdForecast.id,
      city: 'Chicago',
      temperature_high: 22
    };

    const result = await updateWeatherForecast(updateInput);

    // Query database to verify changes were persisted
    const forecasts = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.id, result.id))
      .execute();

    expect(forecasts).toHaveLength(1);
    expect(forecasts[0].city).toEqual('Chicago');
    expect(forecasts[0].temperature_high).toEqual(22);
    expect(forecasts[0].temperature_low).toEqual(testCreateInput.temperature_low); // Should remain unchanged
    expect(forecasts[0].updated_at).toBeInstanceOf(Date);
    expect(forecasts[0].updated_at > createdForecast.updated_at).toBe(true);
  });

  it('should throw error when weather forecast does not exist', async () => {
    const updateInput: UpdateWeatherForecastInput = {
      id: 999, // Non-existent ID
      city: 'Miami'
    };

    await expect(updateWeatherForecast(updateInput)).rejects.toThrow(/weather forecast with id 999 not found/i);
  });
});
