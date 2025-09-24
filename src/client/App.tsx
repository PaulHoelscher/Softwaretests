import { useState } from "react";
import type { WeatherResult } from "../shared/weather";
import { WeatherDetails } from "./components/WeatherDetails";

const DEFAULT_CITIES = ["Berlin", "Hamburg", "Muenchen", "Koeln", "Frankfurt"];

type FetchState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [city, setCity] = useState("Berlin");
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [status, setStatus] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  async function loadWeather(selectedCity: string) {
    const nextCity = selectedCity.trim();
    if (!nextCity) {
      setErrorMessage("Bitte eine Stadt eingeben.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(nextCity)}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Unbekannter Fehler");
      }

      const payload = (await response.json()) as WeatherResult;
      setWeather(payload);
      setHistory((prev) => {
        const nextHistory = [payload.location.name, ...prev.filter((item) => item !== payload.location.name)];
        return nextHistory.slice(0, 5);
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unbekannter Fehler");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadWeather(city);
  }

  function handleCityClick(presetCity: string) {
    setCity(presetCity);
    void loadWeather(presetCity);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Wetter Dashboard</h1>
        <p>Suche nach aktuellen Wetterdaten fuer deutsche Staedte.</p>
      </header>

      <main>
        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="city">Stadt</label>
          <div className="search-form__controls">
            <input
              id="city"
              name="city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="z. B. Berlin"
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Lade..." : "Suchen"}
            </button>
          </div>
        </form>

        <section className="preset-cities" aria-label="Beliebte Staedte">
          <h2>Beliebte Staedte</h2>
          <div className="preset-cities__list">
            {DEFAULT_CITIES.map((preset) => (
              <button key={preset} onClick={() => handleCityClick(preset)} type="button">
                {preset}
              </button>
            ))}
          </div>
        </section>

        {status === "error" && errorMessage && (
          <p role="alert" className="error-message">
            {errorMessage}
          </p>
        )}

        {status === "success" && weather && <WeatherDetails data={weather} />}

        {history.length > 0 && (
          <section className="history" aria-label="Letzte Suchen">
            <h2>Letzte Suchen</h2>
            <ul>
              {history.map((item) => (
                <li key={item}>
                  <button type="button" onClick={() => handleCityClick(item)}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
