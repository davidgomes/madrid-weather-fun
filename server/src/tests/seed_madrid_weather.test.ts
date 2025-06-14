
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { seedMadridWeather } from '../handlers/seed_madrid_weather';
import { eq } from 'drizzle-orm';

describe('seedMadridWeather', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create 7 weather forecasts for Madrid', async () => {
    const result = await seedMadridWeather();

    expect(result).toHaveLength(7);
    
    // Verify all forecasts are for Madrid
    result.forEach(forecast => {
      expect(forecast.city).toEqual('Madrid');
      expect(forecast.id).toBeDefined();
      expect(forecast.created_at).toBeInstanceOf(Date);
      expect(forecast.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should save all forecasts to database', async () => {
    await seedMadridWeather();

    const forecasts = await db.select()
      .from(weatherForecastsTable)
      .where(eq(weatherForecastsTable.city, 'Madrid'))
      .execute();

    expect(forecasts).toHaveLength(7);
    
    // Verify data structure and types
    forecasts.forEach(forecast => {
      expect(forecast.city).toEqual('Madrid');
      expect(forecast.date).toBeInstanceOf(Date);
      expect(typeof forecast.temperature_high).toBe('number');
      expect(typeof forecast.temperature_low).toBe('number');
      expect(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'partly_cloudy']).toContain(forecast.condition);
      expect(typeof forecast.description).toBe('string');
      expect(typeof forecast.humidity).toBe('number');
      expect(forecast.humidity).toBeGreaterThanOrEqual(0);
      expect(forecast.humidity).toBeLessThanOrEqual(100);
      expect(typeof forecast.wind_speed).toBe('number');
      expect(forecast.wind_speed).toBeGreaterThanOrEqual(0);
    });
  });

  it('should create forecasts for consecutive days', async () => {
    const result = await seedMadridWeather();

    // Sort by date to check sequence
    const sortedForecasts = result.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    for (let i = 1; i < sortedForecasts.length; i++) {
      const prevDate = sortedForecasts[i - 1].date;
      const currentDate = sortedForecasts[i].date;
      
      // Check that dates are consecutive (24 hours apart)
      const timeDiff = currentDate.getTime() - prevDate.getTime();
      const dayInMs = 24 * 60 * 60 * 1000;
      expect(timeDiff).toEqual(dayInMs);
    }
  });

  it('should include variety of weather conditions', async () => {
    const result = await seedMadridWeather();

    const conditions = result.map(forecast => forecast.condition);
    const uniqueConditions = [...new Set(conditions)];
    
    // Should have at least 3 different weather conditions
    expect(uniqueConditions.length).toBeGreaterThanOrEqual(3);
    
    // Should include some specific conditions we know are in the seed data
    expect(conditions).toContain('sunny');
    expect(conditions).toContain('rainy');
    expect(conditions).toContain('partly_cloudy');
  });
});
