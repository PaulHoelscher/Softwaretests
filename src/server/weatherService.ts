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

    // Placeholder: WeatherAPI.com API Beispielaufruf
    // Dokumentation: https://www.weatherapi.com/docs/
    // Hier wird nur ein Platzhalter-Request ausgeführt, die Antwort wird nicht verarbeitet
    const apiKey = process.env.WEATHERAPI_KEY || "DEMO_KEY";
    const weatherApiUrl = "https://api.weatherapi.com/v1/current.json";
    const weatherApiResponse = await axios.get(weatherApiUrl, {
      params: {
        key: apiKey,
        q: trimmedCity,
        lang: "de"
      }
    });

    // Die Antwort wird noch nicht ausgewertet, sondern ein Dummy-Objekt zurückgegeben
    return {
      location: {
        name: trimmedCity,
        country: "WeatherAPI.com",
        latitude: 0,
        longitude: 0
      },
      current: {
        temperatureC: 0,
        feelsLikeC: 0,
        windSpeedKmh: 0,
        description: "Platzhalter von WeatherAPI.com API",
        observedAt: new Date().toISOString()
      }
    };
  }
}

export const weatherService = new WeatherService();
