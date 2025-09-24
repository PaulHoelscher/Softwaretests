import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import axios from "axios";
import { WeatherService } from "../../src/server/weatherService";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, { deep: true });

const service = new WeatherService();

beforeEach(() => {
  delete process.env.USE_FAKE_WEATHER;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("WeatherService", () => {
  it("returns normalized weather data for a valid city", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          { id: 1, name: "Berlin", country: "Deutschland", latitude: 52.52, longitude: 13.41 }
        ]
      }
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        current: {
          time: "2024-01-01T12:00:00Z",
          temperature_2m: 12.3,
          apparent_temperature: 10.1,
          weather_code: 2,
          wind_speed_10m: 14.3
        }
      }
    });

    const result = await service.getWeatherByCity("Berlin");

    expect(result).toEqual({
      location: {
        name: "Berlin",
        country: "Deutschland",
        latitude: 52.52,
        longitude: 13.41
      },
      current: {
        temperatureC: 12.3,
        feelsLikeC: 10.1,
        windSpeedKmh: 14.3,
        description: "Teilweise bewoelkt",
        observedAt: "2024-01-01T12:00:00Z"
      }
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it("throws a bad request error for empty input", async () => {
    await expect(service.getWeatherByCity("  "))
      .rejects.toThrowError(/Bitte einen Stadtnamen angeben/);
  });

  it("throws a not found error when no geocoding result is returned", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

    await expect(service.getWeatherByCity("Atlantis"))
      .rejects.toThrowError(/Keine Ergebnisse fuer/);
  });

  it("returns mock data when USE_FAKE_WEATHER is enabled", async () => {
    process.env.USE_FAKE_WEATHER = "true";

    const result = await service.getWeatherByCity("Berlin");

    expect(result.location.name).toBe("Berlin");
    expect(result.location.country).toBe("Testland");
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
