import axios from "axios";
import { BadRequestError, NotFoundError } from "./errors";
import type { WeatherResult } from "../shared/weather";

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}

interface ForecastResponse {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

const weatherCodeDescriptions: Record<number, string> = {
  0: "Klarer Himmel",
  1: "Ueberwiegend klar",
  2: "Teilweise bewoelkt",
  3: "Bedeckt",
  45: "Nebel",
  48: "Reifnebel",
  51: "Leichter Nieselregen",
  53: "Maessiger Nieselregen",
  55: "Starker Nieselregen",
  56: "Leichter gefrierender Nieselregen",
  57: "Starker gefrierender Nieselregen",
  61: "Leichter Regen",
  63: "Maessiger Regen",
  65: "Starker Regen",
  66: "Leichter gefrierender Regen",
  67: "Starker gefrierender Regen",
  71: "Leichter Schneefall",
  73: "Maessiger Schneefall",
  75: "Starker Schneefall",
  77: "Schneekoerner",
  80: "Leichter Regenschauer",
  81: "Maessiger Regenschauer",
  82: "Heftiger Regenschauer",
  85: "Leichter Schneeschauer",
  86: "Starker Schneeschauer",
  95: "Gewitter",
  96: "Gewitter mit leichtem Hagel",
  99: "Gewitter mit starkem Hagel"
};

function shouldUseMockData() {
  const flag = process.env.USE_FAKE_WEATHER?.toLowerCase();
  return flag === "1" || flag === "true";
}

function buildMockWeather(city: string): WeatherResult {
  const baseTemp = 12 + (city.toLowerCase().charCodeAt(0) % 10);

  return {
    location: {
      name: city,
      country: "Testland",
      latitude: 0,
      longitude: 0
    },
    current: {
      temperatureC: baseTemp,
      feelsLikeC: baseTemp - 1,
      windSpeedKmh: 8,
      description: "Beispielwetter",
      observedAt: new Date().toISOString()
    }
  };
}

export class WeatherService {
  async getWeatherByCity(city: string): Promise<WeatherResult> {
    const trimmedCity = city?.trim();

    if (!trimmedCity) {
      throw new BadRequestError("Bitte einen Stadtnamen angeben.");
    }

    if (shouldUseMockData()) {
      return buildMockWeather(trimmedCity);
    }

    const geocodingUrl = "https://geocoding-api.open-meteo.com/v1/search";
    const geoResponse = await axios.get<GeocodingResponse>(geocodingUrl, {
      params: {
        name: trimmedCity,
        count: 1,
        language: "de",
        format: "json"
      }
    });

    const geoResult = geoResponse.data.results?.[0];
    if (!geoResult) {
      throw new NotFoundError(`Keine Ergebnisse fuer "${trimmedCity}" gefunden.`);
    }

    const forecastUrl = "https://api.open-meteo.com/v1/forecast";
    const forecastResponse = await axios.get<ForecastResponse>(forecastUrl, {
      params: {
        latitude: geoResult.latitude,
        longitude: geoResult.longitude,
        current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
        timezone: "auto"
      }
    });

    const current = forecastResponse.data.current;
    if (!current) {
      throw new NotFoundError("Keine aktuellen Wetterdaten verfuegbar.");
    }

    const description =
      weatherCodeDescriptions[current.weather_code] ?? "Keine Beschreibung verfuegbar";

    return {
      location: {
        name: geoResult.name,
        country: geoResult.country,
        latitude: geoResult.latitude,
        longitude: geoResult.longitude
      },
      current: {
        temperatureC: current.temperature_2m,
        feelsLikeC: current.apparent_temperature,
        windSpeedKmh: current.wind_speed_10m,
        description,
        observedAt: current.time
      }
    };
  }
}

export const weatherService = new WeatherService();
