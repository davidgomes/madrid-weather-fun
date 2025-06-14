
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type CreateWeatherForecastInput, type UpdateWeatherForecastInput } from '../schema';
import { updateWeatherForecast } from '../handlers/update_weather_forecast';
import { eq } from 'drizzle-orm';

// Test input for creating initial weather forecast
const testCreateInput: CreateWeatherForecastInput = {
  city: 'New York',
  date: new Date('2024-01-15'),
  temperature_high: 75,
  temperature_low: 60,
  condition: 'sunny',
  description: 'Clear sunny day',
  humidity: 45,
  wind_speed: 8
};

describe('updateWeatherForecast', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a weather forecast', async () => {
    // Create initial weather forecast
    const initialResult = await db.insert(weatherForecastsTable)
      .values({
        city: testCreateInput.city,
        date: testCreateInput.date,
        temperature_high: testCreateInput.temperature_high,
        temperature_low: testCreateInput.temperature_low,
        condition: testCreateInput.condition,
        description: testCreateInput.description,
        humidity: testCreateInput.humidity,
        wind_speed: testCreateInput.wind_speed
      })
      .returning()
      .execute();

    const forecastId = initialResult[0].id;

    // Update input
    const updateInput: UpdateWeatherForecastInput = {
      id: forecastId,
      temperature_high: 80,
      temperature_low: 65,
      condition: 'partly_cloudy',
      description: 'Partly cloudy with some sun'
    };

    const result = await updateWeatherForecast(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(forecastId);
    expect(result.temperature_high).toEqual(80);
    expect(result.temperature_low).toEqual(65);
    expect(result.condition).toEqual('partly_cloudy');
    expect(result.description).toEqual('Partly cloudy with some sun');
    
    // Verify unchanged fields
    expect(result.city).toEqual('New York');
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.humidity).toEqual(45);
    expect(result.wind_speed).toEqual(8);
    
    // Verify updated_at was updated
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > result.created_at).toBe(true);
  });

  it('should update weather forecast in database', async () => {
    // Create initial weather forecast
    const initialResult = await db.insert(weatherForecastsTable)
      .values({
        city: testCreateInput.city,
        date: testCreateInput.date,
        temperature_high: testCreateInput.temperature_high,
        temperature_low: testCreateInput.temperature_low,
        condition: testCreateInput.condition,
        description: testCreateInput.description,
        humidity: testCreateInput.humidity,
        wind_speed: testCreateInput.wind_speed
      })
      .returning()
      .execute();

    const forecastId = initialResult[0].id;

    // Update weather forecast
    const updateInput: UpdateWeatherForecastInput = {
      id: forecastId,
      city: 'Los Angeles',
      condition: 'cloudy'
    };

    await updateWeatherForecast(updateInput);

    // Query database to verify update
    const updatedForecasts = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.id, forecastId))
      .execute();

    expect(updatedForecasts).toHaveLength(1);
    expect(updatedForecasts[0].city).toEqual('Los Angeles');
    expect(updatedForecasts[0].condition).toEqual('cloudy');
    expect(updatedForecasts[0].temperature_high).toEqual(75); // Unchanged
    expect(updatedForecasts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent weather forecast', async () => {
    const updateInput: UpdateWeatherForecastInput = {
      id: 99999,
      temperature_high: 85
    };

    await expect(updateWeatherForecast(updateInput)).rejects.toThrow(/weather forecast.*not found/i);
  });

  it('should update only specified fields', async () => {
    // Create initial weather forecast
    const initialResult = await db.insert(weatherForecastsTable)
      .values({
        city: testCreateInput.city,
        date: testCreateInput.date,
        temperature_high: testCreateInput.temperature_high,
        temperature_low: testCreateInput.temperature_low,
        condition: testCreateInput.condition,
        description: testCreateInput.description,
        humidity: testCreateInput.humidity,
        wind_speed: testCreateInput.wind_speed
      })
      .returning()
      .execute();

    const forecastId = initialResult[0].id;

    // Update only humidity
    const updateInput: UpdateWeatherForecastInput = {
      id: forecastId,
      humidity: 70
    };

    const result = await updateWeatherForecast(updateInput);

    // Verify only humidity was updated
    expect(result.humidity).toEqual(70);
    expect(result.city).toEqual(testCreateInput.city);
    expect(result.temperature_high).toEqual(testCreateInput.temperature_high);
    expect(result.temperature_low).toEqual(testCreateInput.temperature_low);
    expect(result.condition).toEqual(testCreateInput.condition);
    expect(result.description).toEqual(testCreateInput.description);
    expect(result.wind_speed).toEqual(testCreateInput.wind_speed);
  });
});
