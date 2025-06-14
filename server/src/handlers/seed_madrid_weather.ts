// NOTE: This handler requires axios to be added to server/package.json dependencies:
// "axios": "^1.7.2"
// 
// Also requires OPENWEATHER_API_KEY environment variable:
// 1. Sign up at https://openweathermap.org/api
// 2. Subscribe to "One Call API 3.0" 
// 3. Set environment variable: OPENWEATHER_API_KEY=your_api_key_here

import { db } from '../db';
import { weatherForecastsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type WeatherForecast } from '../schema';

// For now, we'll generate realistic mock data until axios is added to dependencies
// Once axios is available, this can be replaced with real API calls

// OpenWeatherMap condition mapping to our enum values
const mapWeatherCondition = (weatherMain: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly_cloudy' => {
  const condition = weatherMain.toLowerCase();
  
  switch (condition) {
    case 'clear':
      return 'sunny';
    case 'clouds':
      return 'cloudy';
    case 'rain':
    case 'drizzle':
      return 'rainy';
    case 'thunderstorm':
      return 'stormy';
    case 'snow':
      return 'snowy';
    default:
      return 'partly_cloudy';
  }
};

export const seedMadridWeather = async (): Promise<WeatherForecast[]> => {
  try {
    const apiKey = process.env['OPENWEATHER_API_KEY'];
    
    if (!apiKey) {
      console.warn('OPENWEATHER_API_KEY not found. Using mock data. To use real data:');
      console.warn('1. Add "axios": "^1.7.2" to server/package.json');
      console.warn('2. Sign up at https://openweathermap.org/api');
      console.warn('3. Set OPENWEATHER_API_KEY environment variable');
    }

    // Madrid coordinates for future API integration
    const lat = 40.4168;
    const lon = -3.7038;

    console.log('Generating weather data for Madrid...');

    // Clear existing Madrid weather data before inserting new data
    await db.delete(weatherForecastsTable)
      .where(eq(weatherForecastsTable.city, 'Madrid'))
      .execute();

    console.log('Cleared existing Madrid weather data');

    // For now, generate realistic mock data based on Madrid's climate
    // TODO: Replace with real API call once axios is added
    const weatherForecasts = [];
    
    for (let i = 0; i < 7; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);

      // Generate realistic weather data for Madrid
      const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'] as const;
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      // Temperature ranges typical for Madrid (varies by condition)
      let tempHigh, tempLow, humidity, windSpeed;
      let description;

      switch (condition) {
        case 'sunny':
          tempHigh = Math.floor(Math.random() * 10) + 25; // 25-34°C
          tempLow = tempHigh - Math.floor(Math.random() * 8) - 8; // 8-15° lower
          humidity = Math.floor(Math.random() * 20) + 30; // 30-49%
          windSpeed = Math.floor(Math.random() * 10) + 5; // 5-14 km/h
          description = 'Clear skies with bright sunshine';
          break;
        case 'partly_cloudy':
          tempHigh = Math.floor(Math.random() * 8) + 22; // 22-29°C
          tempLow = tempHigh - Math.floor(Math.random() * 7) - 6; // 6-12° lower
          humidity = Math.floor(Math.random() * 20) + 40; // 40-59%
          windSpeed = Math.floor(Math.random() * 12) + 8; // 8-19 km/h
          description = 'Partly cloudy with some sunshine';
          break;
        case 'cloudy':
          tempHigh = Math.floor(Math.random() * 6) + 18; // 18-23°C
          tempLow = tempHigh - Math.floor(Math.random() * 6) - 5; // 5-10° lower
          humidity = Math.floor(Math.random() * 25) + 55; // 55-79%
          windSpeed = Math.floor(Math.random() * 15) + 10; // 10-24 km/h
          description = 'Overcast skies with thick cloud cover';
          break;
        case 'rainy':
          tempHigh = Math.floor(Math.random() * 5) + 15; // 15-19°C
          tempLow = tempHigh - Math.floor(Math.random() * 5) - 4; // 4-8° lower
          humidity = Math.floor(Math.random() * 20) + 70; // 70-89%
          windSpeed = Math.floor(Math.random() * 20) + 15; // 15-34 km/h
          description = 'Rainy conditions with moderate precipitation';
          break;
      }

      weatherForecasts.push({
        city: 'Madrid',
        date: forecastDate,
        temperature_high: tempHigh,
        temperature_low: tempLow,
        condition,
        description,
        humidity,
        wind_speed: windSpeed
      });
    }

    /* TODO: Uncomment and use this code once axios is added to dependencies:
    
    // Make API request to OpenWeatherMap One Call API
    const axios = require('axios');
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'metric', // Get temperatures in Celsius
          exclude: 'minutely,hourly,alerts' // Only get daily forecasts
        }
      }
    );

    const { daily } = response.data;

    if (!daily || daily.length < 7) {
      throw new Error('Insufficient weather data received from OpenWeatherMap API');
    }

    // Map API response to our schema format
    const weatherForecasts = daily.slice(0, 7).map((day: any, index: number) => {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + index);
      
      // Extract weather data from API response
      const weatherMain = day.weather?.[0]?.main || 'Clear';
      const weatherDescription = day.weather?.[0]?.description || 'Clear skies';
      
      return {
        city: 'Madrid',
        date: forecastDate,
        temperature_high: Math.round(day.temp?.max || 20),
        temperature_low: Math.round(day.temp?.min || 10),
        condition: mapWeatherCondition(weatherMain),
        description: weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1),
        humidity: Math.round(day.humidity || 50),
        wind_speed: Math.round(day.wind_speed || 0)
      };
    });
    */

    // Insert new weather forecasts
    const results = await db.insert(weatherForecastsTable)
      .values(weatherForecasts)
      .returning()
      .execute();

    console.log(`Successfully seeded ${results.length} days of Madrid weather data`);
    
    return results;
  } catch (error: unknown) {
    console.error('Madrid weather seeding failed:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred during weather seeding');
  }
};