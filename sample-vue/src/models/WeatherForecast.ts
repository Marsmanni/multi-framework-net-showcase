/**
 * WeatherForecast model class
 */
export default class WeatherForecast {
	public date: string;
	public temperatureC: number;
	public temperatureF: number;
	public summary: string | null;
	public humidity: number;

	constructor(data?: Partial<WeatherForecast>) {
		this.date = data?.date ?? "";
		this.temperatureC = data?.temperatureC ?? 0;
		this.temperatureF = data?.temperatureF ?? 32;
		this.summary = data?.summary ?? null;
		this.humidity = data?.humidity ?? 0;
	}

	/**
	 * Converts temperature from Celsius to Fahrenheit
	 */
	public static celsiusToFahrenheit(celsius: number): number {
		return 32 + Math.floor(celsius / 0.5556);
	}

	/**
	 * Creates WeatherForecast instances from API response
	 */
	public static fromApiResponse(apiData: unknown[]): WeatherForecast[] {
		return apiData.map(item => {
			if (typeof item !== "object" || item === null) {
				throw new Error("Invalid weather forecast response");
			}

			const forecast = item as Record<string, unknown>;
			if (typeof forecast.date !== "string"
				|| typeof forecast.temperatureC !== "number"
				|| typeof forecast.temperatureF !== "number"
				|| typeof forecast.humidity !== "number") {
				throw new Error("Invalid weather forecast response");
			}

			return new WeatherForecast({
				date: forecast.date,
				temperatureC: forecast.temperatureC,
				temperatureF: forecast.temperatureF,
				summary: typeof forecast.summary === "string" ? forecast.summary : null,
				humidity: forecast.humidity
			});
		});
	}
}
