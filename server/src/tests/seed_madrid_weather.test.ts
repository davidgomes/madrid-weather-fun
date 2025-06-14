import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { seedMadridWeather } from '../handlers/seed_madrid_weather';
import { eq, gte, lte, and } from 'drizzle-orm';

describe('seedMadridWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create 7 weather forecast records for Madrid', async () => {
    const results = await seedMadridWeather();

    expect(results).toHaveLength(7);
    
    // Verify all records are for Madrid
    results.forEach(forecast => {
      expect(forecast.city).toBe('Madrid');
      expect(forecast.id).toBeDefined();
      expect(forecast.created_at).toBeInstanceOf(Date);
      expect(forecast.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should save all forecasts to database', async () => {
    await seedMadridWeather();

    const savedForecasts = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.city, 'Madrid'))
      .execute();

    expect(savedForecasts).toHaveLength(7);
    savedForecasts.forEach(forecast => {
      expect(forecast.city).toBe('Madrid');
      expect(forecast.date).toBeInstanceOf(Date);
      expect(forecast.created_at).toBeInstanceOf(Date);
      expect(forecast.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should generate forecasts for consecutive days starting from today', async () => {
    const results = await seedMadridWeather();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Sort results by date for proper ordering
    const sortedResults = results.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < 7; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + i);
      
      const forecastDate = new Date(sortedResults[i].date);
      forecastDate.setHours(0, 0, 0, 0);

      expect(forecastDate.getTime()).toBe(expectedDate.getTime());
    }
  });

  it('should generate realistic weather data for Madrid', async () => {
    const results = await seedMadridWeather();

    results.forEach(forecast => {
      // Temperature validation
      expect(forecast.temperature_high).toBeGreaterThanOrEqual(15);
      expect(forecast.temperature_high).toBeLessThanOrEqual(35);
      expect(forecast.temperature_low).toBeGreaterThanOrEqual(5);
      expect(forecast.temperature_low).toBeLessThanOrEqual(30);
      expect(forecast.temperature_low).toBeLessThan(forecast.temperature_high);

      // Humidity validation (0-100%)
      expect(forecast.humidity).toBeGreaterThanOrEqual(0);
      expect(forecast.humidity).toBeLessThanOrEqual(100);

      // Wind speed validation (non-negative)
      expect(forecast.wind_speed).toBeGreaterThanOrEqual(0);

      // Valid weather conditions
      expect(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'partly_cloudy'])
        .toContain(forecast.condition);

      // Description should be a non-empty string
      expect(forecast.description).toBeTruthy();
      expect(typeof forecast.description).toBe('string');
    });
  });

  it('should clear existing Madrid data before inserting new data', async () => {
    // First seeding
    const firstResults = await seedMadridWeather();
    expect(firstResults).toHaveLength(7);

    // Second seeding should replace the data, not add to it
    const secondResults = await seedMadridWeather();
    expect(secondResults).toHaveLength(7);

    // Verify total records in database is still 7
    const allForecasts = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.city, 'Madrid'))
      .execute();

    expect(allForecasts).toHaveLength(7);
  });

  it('should query forecasts by date range correctly', async () => {
    await seedMadridWeather();

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const filteredForecasts = await db.select()
      .from(weatherForecastsTable)
      .where(
        and(
          eq(weatherForecastsTable.city, 'Madrid'),
          gte(weatherForecastsTable.date, today),
          lte(weatherForecastsTable.date, threeDaysFromNow)
        )
      )
      .execute();

    expect(filteredForecasts.length).toBeGreaterThan(0);
    expect(filteredForecasts.length).toBeLessThanOrEqual(4);

    filteredForecasts.forEach(forecast => {
      expect(forecast.city).toBe('Madrid');
      expect(forecast.date).toBeInstanceOf(Date);
      expect(forecast.date >= today).toBe(true);
      expect(forecast.date <= threeDaysFromNow).toBe(true);
    });
  });
});