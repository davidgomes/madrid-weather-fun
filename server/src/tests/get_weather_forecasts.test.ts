
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { type CreateWeatherForecastInput, type GetWeatherForecastsInput } from '../schema';
import { getWeatherForecasts } from '../handlers/get_weather_forecasts';

describe('getWeatherForecasts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get all weather forecasts when no filters provided', async () => {
    // Create future dates relative to today
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 1);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 2);

    // Create test data - using direct database insert to avoid dependency on create handler
    await db.insert(weatherForecastsTable).values([
      {
        city: 'New York',
        date: futureDate1,
        temperature_high: 25,
        temperature_low: 18,
        condition: 'sunny',
        description: 'Clear sunny day',
        humidity: 45,
        wind_speed: 10
      },
      {
        city: 'New York',
        date: futureDate2,
        temperature_high: 22,
        temperature_low: 15,
        condition: 'cloudy',
        description: 'Overcast conditions',
        humidity: 65,
        wind_speed: 8
      }
    ]).execute();

    const result = await getWeatherForecasts();

    expect(result).toHaveLength(2);
    expect(result[0].city).toEqual('New York');
    expect(result[0].temperature_high).toEqual(25);
    expect(result[0].condition).toEqual('sunny');
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter forecasts by city', async () => {
    // Create future dates relative to today
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 1);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 2);

    // Create test data for multiple cities
    await db.insert(weatherForecastsTable).values([
      {
        city: 'New York',
        date: futureDate1,
        temperature_high: 25,
        temperature_low: 18,
        condition: 'sunny',
        description: 'Clear sunny day',
        humidity: 45,
        wind_speed: 10
      },
      {
        city: 'Los Angeles',
        date: futureDate2,
        temperature_high: 28,
        temperature_low: 20,
        condition: 'partly_cloudy',
        description: 'Partly cloudy afternoon',
        humidity: 55,
        wind_speed: 12
      }
    ]).execute();

    const input: GetWeatherForecastsInput = {
      city: 'Los Angeles',
      days: 7
    };

    const result = await getWeatherForecasts(input);

    expect(result).toHaveLength(1);
    expect(result[0].city).toEqual('Los Angeles');
    expect(result[0].temperature_high).toEqual(28);
    expect(result[0].condition).toEqual('partly_cloudy');
  });

  it('should limit results by days parameter', async () => {
    // Create multiple forecasts for different dates
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 1);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 2);
    
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 3);

    await db.insert(weatherForecastsTable).values([
      {
        city: 'New York',
        date: futureDate1,
        temperature_high: 25,
        temperature_low: 18,
        condition: 'sunny',
        description: 'Day 1',
        humidity: 45,
        wind_speed: 10
      },
      {
        city: 'New York',
        date: futureDate2,
        temperature_high: 22,
        temperature_low: 15,
        condition: 'cloudy',
        description: 'Day 2',
        humidity: 65,
        wind_speed: 8
      },
      {
        city: 'New York',
        date: futureDate3,
        temperature_high: 20,
        temperature_low: 12,
        condition: 'rainy',
        description: 'Day 3',
        humidity: 80,
        wind_speed: 15
      }
    ]).execute();

    const input: GetWeatherForecastsInput = {
      days: 2
    };

    const result = await getWeatherForecasts(input);

    expect(result).toHaveLength(2);
    expect(result[0].description).toEqual('Day 1');
    expect(result[1].description).toEqual('Day 2');
  });

  it('should return forecasts ordered by date', async () => {
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 2);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 1);

    await db.insert(weatherForecastsTable).values([
      {
        city: 'New York',
        date: futureDate1, // Later date inserted first
        temperature_high: 25,
        temperature_low: 18,
        condition: 'sunny',
        description: 'Later day',
        humidity: 45,
        wind_speed: 10
      },
      {
        city: 'New York',
        date: futureDate2, // Earlier date inserted second
        temperature_high: 22,
        temperature_low: 15,
        condition: 'cloudy',
        description: 'Earlier day',
        humidity: 65,
        wind_speed: 8
      }
    ]).execute();

    const result = await getWeatherForecasts();

    expect(result).toHaveLength(2);
    expect(result[0].description).toEqual('Earlier day'); // Should be first due to ordering
    expect(result[1].description).toEqual('Later day');
    expect(result[0].date < result[1].date).toBe(true);
  });

  it('should use default days value when not provided', async () => {
    // Create 10 forecasts for different future dates
    const forecasts = [];
    for (let i = 1; i <= 10; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      forecasts.push({
        city: 'New York',
        date: futureDate,
        temperature_high: 20 + i,
        temperature_low: 15 + i,
        condition: 'sunny' as const,
        description: `Day ${i}`,
        humidity: 50,
        wind_speed: 10
      });
    }

    await db.insert(weatherForecastsTable).values(forecasts).execute();

    const result = await getWeatherForecasts();

    // Should return default 7 days
    expect(result).toHaveLength(7);
    expect(result[0].description).toEqual('Day 1');
    expect(result[6].description).toEqual('Day 7');
  });

  it('should return empty array when no forecasts match criteria', async () => {
    const input: GetWeatherForecastsInput = {
      city: 'Nonexistent City',
      days: 7
    };

    const result = await getWeatherForecasts(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should filter out past dates', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

    await db.insert(weatherForecastsTable).values([
      {
        city: 'New York',
        date: pastDate,
        temperature_high: 20,
        temperature_low: 15,
        condition: 'sunny',
        description: 'Past forecast',
        humidity: 50,
        wind_speed: 10
      },
      {
        city: 'New York',
        date: futureDate,
        temperature_high: 25,
        temperature_low: 18,
        condition: 'cloudy',
        description: 'Future forecast',
        humidity: 60,
        wind_speed: 12
      }
    ]).execute();

    const result = await getWeatherForecasts();

    expect(result).toHaveLength(1);
    expect(result[0].description).toEqual('Future forecast');
  });

  it('should include today in results', async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon today
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.insert(weatherForecastsTable).values([
      {
        city: 'New York',
        date: today,
        temperature_high: 22,
        temperature_low: 16,
        condition: 'sunny',
        description: 'Today forecast',
        humidity: 50,
        wind_speed: 10
      },
      {
        city: 'New York',
        date: tomorrow,
        temperature_high: 25,
        temperature_low: 18,
        condition: 'cloudy',
        description: 'Tomorrow forecast',
        humidity: 60,
        wind_speed: 12
      }
    ]).execute();

    const result = await getWeatherForecasts();

    expect(result).toHaveLength(2);
    expect(result[0].description).toEqual('Today forecast');
    expect(result[1].description).toEqual('Tomorrow forecast');
  });
});
