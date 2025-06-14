
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type CreateWeatherForecastInput } from '../schema';
import { createWeatherForecast } from '../handlers/create_weather_forecast';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateWeatherForecastInput = {
  city: 'New York',
  date: new Date('2024-01-15'),
  temperature_high: 25,
  temperature_low: 15,
  condition: 'sunny',
  description: 'Clear skies with bright sunshine',
  humidity: 60,
  wind_speed: 10
};

describe('createWeatherForecast', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a weather forecast', async () => {
    const result = await createWeatherForecast(testInput);

    // Basic field validation
    expect(result.city).toEqual('New York');
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.temperature_high).toEqual(25);
    expect(result.temperature_low).toEqual(15);
    expect(result.condition).toEqual('sunny');
    expect(result.description).toEqual('Clear skies with bright sunshine');
    expect(result.humidity).toEqual(60);
    expect(result.wind_speed).toEqual(10);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save weather forecast to database', async () => {
    const result = await createWeatherForecast(testInput);

    // Query using proper drizzle syntax
    const forecasts = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.id, result.id))
      .execute();

    expect(forecasts).toHaveLength(1);
    expect(forecasts[0].city).toEqual('New York');
    expect(forecasts[0].date).toEqual(new Date('2024-01-15'));
    expect(forecasts[0].temperature_high).toEqual(25);
    expect(forecasts[0].temperature_low).toEqual(15);
    expect(forecasts[0].condition).toEqual('sunny');
    expect(forecasts[0].description).toEqual('Clear skies with bright sunshine');
    expect(forecasts[0].humidity).toEqual(60);
    expect(forecasts[0].wind_speed).toEqual(10);
    expect(forecasts[0].created_at).toBeInstanceOf(Date);
    expect(forecasts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create weather forecast for different conditions', async () => {
    const rainyInput: CreateWeatherForecastInput = {
      city: 'Seattle',
      date: new Date('2024-01-16'),
      temperature_high: 18,
      temperature_low: 12,
      condition: 'rainy',
      description: 'Heavy rain expected throughout the day',
      humidity: 85,
      wind_speed: 15
    };

    const result = await createWeatherForecast(rainyInput);

    expect(result.city).toEqual('Seattle');
    expect(result.condition).toEqual('rainy');
    expect(result.humidity).toEqual(85);
    expect(result.wind_speed).toEqual(15);
    expect(result.id).toBeDefined();
  });

  it('should handle edge cases for humidity and wind speed', async () => {
    const edgeCaseInput: CreateWeatherForecastInput = {
      city: 'Phoenix',
      date: new Date('2024-01-17'),
      temperature_high: 35,
      temperature_low: 20,
      condition: 'sunny',
      description: 'Hot and dry desert conditions',
      humidity: 0, // Minimum humidity
      wind_speed: 0 // Minimum wind speed
    };

    const result = await createWeatherForecast(edgeCaseInput);

    expect(result.humidity).toEqual(0);
    expect(result.wind_speed).toEqual(0);
    expect(result.temperature_high).toEqual(35);
    expect(result.temperature_low).toEqual(20);
  });
});
