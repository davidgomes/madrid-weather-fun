
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type CreateWeatherForecastInput } from '../schema';
import { getMadridWeather } from '../handlers/get_madrid_weather';

// Test weather forecast data for Madrid
const madridForecast: CreateWeatherForecastInput = {
  city: 'Madrid',
  date: new Date('2024-01-15'),
  temperature_high: 18,
  temperature_low: 8,
  condition: 'sunny',
  description: 'Clear skies with plenty of sunshine',
  humidity: 45,
  wind_speed: 12
};

// Test weather forecast data for another city
const barcelonaForecast: CreateWeatherForecastInput = {
  city: 'Barcelona',
  date: new Date('2024-01-15'),
  temperature_high: 16,
  temperature_low: 10,
  condition: 'partly_cloudy',
  description: 'Partly cloudy with occasional sunshine',
  humidity: 60,
  wind_speed: 8
};

describe('getMadridWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no Madrid weather data exists', async () => {
    const result = await getMadridWeather();
    expect(result).toEqual([]);
  });

  it('should return Madrid weather forecasts only', async () => {
    // Insert weather data for Madrid and Barcelona
    await db.insert(weatherForecastsTable)
      .values([madridForecast, barcelonaForecast])
      .execute();

    const result = await getMadridWeather();

    expect(result).toHaveLength(1);
    expect(result[0].city).toEqual('Madrid');
    expect(result[0].temperature_high).toEqual(18);
    expect(result[0].temperature_low).toEqual(8);
    expect(result[0].condition).toEqual('sunny');
    expect(result[0].description).toEqual('Clear skies with plenty of sunshine');
    expect(result[0].humidity).toEqual(45);
    expect(result[0].wind_speed).toEqual(12);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple Madrid weather forecasts when they exist', async () => {
    const madridForecast2: CreateWeatherForecastInput = {
      city: 'Madrid',
      date: new Date('2024-01-16'),
      temperature_high: 20,
      temperature_low: 10,
      condition: 'cloudy',
      description: 'Overcast with mild temperatures',
      humidity: 55,
      wind_speed: 15
    };

    // Insert multiple Madrid forecasts and one Barcelona forecast
    await db.insert(weatherForecastsTable)
      .values([madridForecast, madridForecast2, barcelonaForecast])
      .execute();

    const result = await getMadridWeather();

    expect(result).toHaveLength(2);
    result.forEach(forecast => {
      expect(forecast.city).toEqual('Madrid');
      expect(forecast.id).toBeDefined();
      expect(forecast.created_at).toBeInstanceOf(Date);
      expect(forecast.updated_at).toBeInstanceOf(Date);
    });

    // Verify both Madrid forecasts are returned
    const dates = result.map(f => f.date.toISOString().split('T')[0]);
    expect(dates).toContain('2024-01-15');
    expect(dates).toContain('2024-01-16');
  });

  it('should not return forecasts for other cities', async () => {
    const sevilleForecast: CreateWeatherForecastInput = {
      city: 'Sevilla',
      date: new Date('2024-01-15'),
      temperature_high: 22,
      temperature_low: 12,
      condition: 'sunny',
      description: 'Warm and sunny weather',
      humidity: 40,
      wind_speed: 10
    };

    // Insert forecasts for different cities but not Madrid
    await db.insert(weatherForecastsTable)
      .values([barcelonaForecast, sevilleForecast])
      .execute();

    const result = await getMadridWeather();

    expect(result).toHaveLength(0);
  });
});
