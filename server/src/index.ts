
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createWeatherForecastInputSchema, 
  updateWeatherForecastInputSchema,
  getWeatherForecastsInputSchema 
} from './schema';
import { createWeatherForecast } from './handlers/create_weather_forecast';
import { getWeatherForecasts } from './handlers/get_weather_forecasts';
import { getMadridWeather } from './handlers/get_madrid_weather';
import { updateWeatherForecast } from './handlers/update_weather_forecast';
import { seedMadridWeather } from './handlers/seed_madrid_weather';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Main endpoint for Madrid weather (next 7 days)
  getMadridWeather: publicProcedure
    .query(() => getMadridWeather()),
  
  // Seed Madrid weather data
  seedMadridWeather: publicProcedure
    .mutation(() => seedMadridWeather()),
  
  // Generic weather forecast endpoints
  createWeatherForecast: publicProcedure
    .input(createWeatherForecastInputSchema)
    .mutation(({ input }) => createWeatherForecast(input)),
  
  getWeatherForecasts: publicProcedure
    .input(getWeatherForecastsInputSchema)
    .query(({ input }) => getWeatherForecasts(input)),
  
  updateWeatherForecast: publicProcedure
    .input(updateWeatherForecastInputSchema)
    .mutation(({ input }) => updateWeatherForecast(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`🌤️ Weather TRPC server listening at port: ${port}`);
}

start();
