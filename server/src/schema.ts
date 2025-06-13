
import { z } from 'zod';

// Weather forecast schema
export const weatherForecastSchema = z.object({
  id: z.number(),
  city: z.string(),
  date: z.coerce.date(),
  temperature_high: z.number(),
  temperature_low: z.number(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'partly_cloudy']),
  description: z.string(),
  humidity: z.number().min(0).max(100),
  wind_speed: z.number().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type WeatherForecast = z.infer<typeof weatherForecastSchema>;

// Input schema for creating weather forecasts
export const createWeatherForecastInputSchema = z.object({
  city: z.string(),
  date: z.coerce.date(),
  temperature_high: z.number(),
  temperature_low: z.number(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'partly_cloudy']),
  description: z.string(),
  humidity: z.number().min(0).max(100),
  wind_speed: z.number().nonnegative()
});

export type CreateWeatherForecastInput = z.infer<typeof createWeatherForecastInputSchema>;

// Input schema for updating weather forecasts
export const updateWeatherForecastInputSchema = z.object({
  id: z.number(),
  city: z.string().optional(),
  date: z.coerce.date().optional(),
  temperature_high: z.number().optional(),
  temperature_low: z.number().optional(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'partly_cloudy']).optional(),
  description: z.string().optional(),
  humidity: z.number().min(0).max(100).optional(),
  wind_speed: z.number().nonnegative().optional()
});

export type UpdateWeatherForecastInput = z.infer<typeof updateWeatherForecastInputSchema>;

// Query schema for getting weather forecasts
export const getWeatherForecastsInputSchema = z.object({
  city: z.string().optional(),
  days: z.number().int().positive().max(30).optional().default(7)
});

export type GetWeatherForecastsInput = z.infer<typeof getWeatherForecastsInputSchema>;
