import request from "supertest";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { createApp } from "../../src/server/app";
import { weatherService } from "../../src/server/weatherService";
import { NotFoundError } from "../../src/server/errors";

const app = createApp();

beforeEach(() => {
  delete process.env.USE_FAKE_WEATHER;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/weather", () => {
  it("returns weather data when the service resolves", async () => {
    const mockResult = {
      location: {
        name: "Berlin",
        country: "Deutschland",
        latitude: 52.52,
        longitude: 13.41
      },
      current: {
        temperatureC: 14,
        feelsLikeC: 13,
        windSpeedKmh: 10,
        description: "Klarer Himmel",
        observedAt: "2024-01-01T10:00:00Z"
      }
    };

    vi.spyOn(weatherService, "getWeatherByCity").mockResolvedValueOnce(mockResult);

    const response = await request(app).get("/api/weather").query({ city: "Berlin" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
  });

  it("returns 400 if city is missing", async () => {
    const response = await request(app).get("/api/weather");

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Parameter 'city' wird benoetigt/);
  });

  it("maps service errors to the correct status code", async () => {
    vi.spyOn(weatherService, "getWeatherByCity").mockRejectedValueOnce(
      new NotFoundError("Keine Daten gefunden")
    );

    const response = await request(app).get("/api/weather").query({ city: "Nowhere" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Keine Daten gefunden");
  });
});
