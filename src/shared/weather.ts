export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number;
  feelsLikeC: number;
  windSpeedKmh: number;
  description: string;
  observedAt: string;
}

export interface WeatherResult {
  location: WeatherLocation;
  current: CurrentWeather;
}
