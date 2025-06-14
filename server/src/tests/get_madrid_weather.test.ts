
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { getMadridWeather } from '../handlers/get_madrid_weather';
import { type CreateWeatherForecastInput } from '../schema';

// Test data for Madrid weather
const madridWeatherData: CreateWeatherForecastInput = {
  city: 'Madrid',
  date: new Date('2024-12-20'),
  temperature_high: 18,
  temperature_low: 8,
  condition: 'sunny',
  description: 'Clear sunny day in Madrid',
  humidity: 45,
  wind_speed: 12
};

// Test data for another city
const barcelonaWeatherData: CreateWeatherForecastInput = {
  city: 'Barcelona',
  date: new Date('2024-12-20'),
  temperature_high: 16,
  temperature_low: 10,
  condition: 'cloudy',
  description: 'Cloudy day in Barcelona',
  humidity: 60,
  wind_speed: 8
};

describe('getMadridWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no Madrid weather data exists', async () => {
    const results = await getMadridWeather();
    expect(results).toEqual([]);
  });

  it('should return Madrid weather forecasts only', async () => {
    // Insert weather data for Madrid and Barcelona
    await db.insert(weatherForecastsTable)
      .values([
        {
          ...madridWeatherData,
          date: madridWeatherData.date
        },
        {
          ...barcelonaWeatherData,
          date: barcelonaWeatherData.date
        }
      ])
      .execute();

    const results = await getMadridWeather();

    expect(results).toHaveLength(1);
    expect(results[0].city).toEqual('Madrid');
    expect(results[0].temperature_high).toEqual(18);
    expect(results[0].temperature_low).toEqual(8);
    expect(results[0].condition).toEqual('sunny');
    expect(results[0].description).toEqual('Clear sunny day in Madrid');
    expect(results[0].humidity).toEqual(45);
    expect(results[0].wind_speed).toEqual(12);
    expect(results[0].id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
    expect(results[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple Madrid weather forecasts', async () => {
    // Insert multiple Madrid weather entries
    const madridWeather2: CreateWeatherForecastInput = {
      city: 'Madrid',
      date: new Date('2024-12-21'),
      temperature_high: 20,
      temperature_low: 10,
      condition: 'partly_cloudy',
      description: 'Partly cloudy day in Madrid',
      humidity: 50,
      wind_speed: 10
    };

    await db.insert(weatherForecastsTable)
      .values([
        {
          ...madridWeatherData,
          date: madridWeatherData.date
        },
        {
          ...madridWeather2,
          date: madridWeather2.date
        },
        {
          ...barcelonaWeatherData,
          date: barcelonaWeatherData.date
        }
      ])
      .execute();

    const results = await getMadridWeather();

    expect(results).toHaveLength(2);
    results.forEach(forecast => {
      expect(forecast.city).toEqual('Madrid');
      expect(forecast.id).toBeDefined();
      expect(forecast.created_at).toBeInstanceOf(Date);
      expect(forecast.updated_at).toBeInstanceOf(Date);
    });

    // Check that we have both Madrid forecasts
    const temperatures = results.map(r => r.temperature_high).sort();
    expect(temperatures).toEqual([18, 20]);
  });
});
