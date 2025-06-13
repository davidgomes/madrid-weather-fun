
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Define weather condition enum
export const weatherConditionEnum = pgEnum('weather_condition', [
  'sunny', 
  'cloudy', 
  'rainy', 
  'stormy', 
  'snowy', 
  'partly_cloudy'
]);

export const weatherForecastsTable = pgTable('weather_forecasts', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  temperature_high: integer('temperature_high').notNull(),
  temperature_low: integer('temperature_low').notNull(),
  condition: weatherConditionEnum('condition').notNull(),
  description: text('description').notNull(),
  humidity: integer('humidity').notNull(),
  wind_speed: integer('wind_speed').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type WeatherForecast = typeof weatherForecastsTable.$inferSelect;
export type NewWeatherForecast = typeof weatherForecastsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  weatherForecasts: weatherForecastsTable 
};
