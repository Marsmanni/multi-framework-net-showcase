/**
 * WeatherForecast model class
 * @namespace com.24steps.ui5sample.model
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
	public static fromApiResponse(apiData: any[]): WeatherForecast[] {
		return apiData.map(item => new WeatherForecast({
			date: item.date,
			temperatureC: item.temperatureC,
			temperatureF: item.temperatureF,
			summary: item.summary,
			humidity: item.humidity
		}));
	}
}
