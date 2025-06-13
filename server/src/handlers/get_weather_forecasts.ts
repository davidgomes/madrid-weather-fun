
import { type GetWeatherForecastsInput, type WeatherForecast } from '../schema';

export declare function getWeatherForecasts(input?: GetWeatherForecastsInput): Promise<WeatherForecast[]>;
