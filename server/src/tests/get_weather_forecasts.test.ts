
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type GetWeatherForecastsInput, type CreateWeatherForecastInput } from '../schema';
import { getWeatherForecasts } from '../handlers/get_weather_forecasts';

// Helper to create test forecast data
const createTestForecast = async (overrides: Partial<CreateWeatherForecastInput> = {}) => {
  const baseInput: CreateWeatherForecastInput = {
    city: 'Test City',
    date: new Date(),
    temperature_high: 25,
    temperature_low: 15,
    condition: 'sunny',
    description: 'Clear sunny day',
    humidity: 60,
    wind_speed: 10,
    ...overrides
  };
  
  return await db.insert(weatherForecastsTable)
    .values({
      city: baseInput.city,
      date: baseInput.date,
      temperature_high: baseInput.temperature_high,
      temperature_low: baseInput.temperature_low,
      condition: baseInput.condition,
      description: baseInput.description,
      humidity: baseInput.humidity,
      wind_speed: baseInput.wind_speed
    })
    .returning()
    .execute();
};

describe('getWeatherForecasts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no forecasts exist', async () => {
    const result = await getWeatherForecasts({ days: 7 });
    expect(result).toEqual([]);
  });

  it('should return forecasts with default 7 day limit', async () => {
    // Create forecasts for different dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    await createTestForecast({ date: today });
    await createTestForecast({ date: tomorrow });

    const result = await getWeatherForecasts({ days: 7 });
    expect(result).toHaveLength(2);
    expect(result[0].city).toEqual('Test City');
    expect(result[0].date).toBeInstanceOf(Date);
  });

  it('should filter by city when specified', async () => {
    const today = new Date();
    
    // Create forecasts for different cities
    await createTestForecast({ city: 'New York', date: today });
    await createTestForecast({ city: 'London', date: today });

    const result = await getWeatherForecasts({ city: 'New York', days: 7 });
    expect(result).toHaveLength(1);
    expect(result[0].city).toEqual('New York');
  });

  it('should respect custom days limit', async () => {
    const today = new Date();
    
    // Create multiple forecasts
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      await createTestForecast({ date });
    }

    const result = await getWeatherForecasts({ days: 3 });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('should return forecasts ordered by date', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    // Insert in reverse order
    await createTestForecast({ date: dayAfter, description: 'Day 3' });
    await createTestForecast({ date: today, description: 'Day 1' });
    await createTestForecast({ date: tomorrow, description: 'Day 2' });

    const result = await getWeatherForecasts({ days: 7 });
    expect(result).toHaveLength(3);
    expect(result[0].description).toEqual('Day 1');
    expect(result[1].description).toEqual('Day 2');
    expect(result[2].description).toEqual('Day 3');
  });

  it('should handle both city filter and days limit together', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Create forecasts for different cities
    await createTestForecast({ city: 'New York', date: today });
    await createTestForecast({ city: 'New York', date: tomorrow });
    await createTestForecast({ city: 'London', date: today });

    const result = await getWeatherForecasts({ city: 'New York', days: 1 });
    expect(result.length).toBeLessThanOrEqual(1);
    expect(result[0].city).toEqual('New York');
  });

  it('should return all required forecast fields', async () => {
    const today = new Date();
    await createTestForecast({ date: today });

    const result = await getWeatherForecasts({ days: 7 });
    expect(result).toHaveLength(1);
    
    const forecast = result[0];
    expect(forecast.id).toBeDefined();
    expect(forecast.city).toEqual('Test City');
    expect(forecast.date).toBeInstanceOf(Date);
    expect(forecast.temperature_high).toEqual(25);
    expect(forecast.temperature_low).toEqual(15);
    expect(forecast.condition).toEqual('sunny');
    expect(forecast.description).toEqual('Clear sunny day');
    expect(forecast.humidity).toEqual(60);
    expect(forecast.wind_speed).toEqual(10);
    expect(forecast.created_at).toBeInstanceOf(Date);
    expect(forecast.updated_at).toBeInstanceOf(Date);
  });

  it('should handle date range filtering correctly', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create forecast for today
    await createTestForecast({ date: today, description: 'Today' });
    
    // Create forecast for 10 days from now (should be excluded with 7 day limit)
    const farFuture = new Date(today);
    farFuture.setDate(today.getDate() + 10);
    await createTestForecast({ date: farFuture, description: 'Far future' });

    const result = await getWeatherForecasts({ days: 7 });
    expect(result).toHaveLength(1);
    expect(result[0].description).toEqual('Today');
  });
});
