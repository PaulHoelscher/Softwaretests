import type { WeatherResult } from "../../shared/weather";

interface WeatherDetailsProps {
  data: WeatherResult;
}

const DEGREE_CELSIUS = "\u00B0C";

export function WeatherDetails({ data }: WeatherDetailsProps) {
  const { location, current } = data;

  return (
    <section aria-label={`Wetter fuer ${location.name}`} className="weather-card">
      <header>
        <h2>{location.name}</h2>
        <p className="weather-card__country">{location.country}</p>
      </header>
      <p className="weather-card__temperature">
        {Math.round(current.temperatureC)}{DEGREE_CELSIUS}
        <span className="weather-card__feels-like">
          Gefuehlt {Math.round(current.feelsLikeC)}{DEGREE_CELSIUS}
        </span>
      </p>
      <p className="weather-card__description">{current.description}</p>
      <dl className="weather-card__meta">
        <div>
          <dt>Wind</dt>
          <dd>{Math.round(current.windSpeedKmh)} km/h</dd>
        </div>
        <div>
          <dt>Stand</dt>
          <dd>{new Date(current.observedAt).toLocaleString("de-DE")}</dd>
        </div>
        <div>
          <dt>Koordinaten</dt>
          <dd>
            {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
