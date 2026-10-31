import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import WeatherForecast from "../model/WeatherForecast";
import Core from "sap/ui/core/Core";
import Chart from "chart.js/auto";
import type { Chart as ChartInstance } from "chart.js";

/**
 * @namespace com.24steps.ui5sample.controller
 */
export default class Weather extends BaseController {
	private chartInstance: ChartInstance<"line"> | null = null;
	private lastLanguage: string = "";

	public onInit(): void {
		const sampleData = {
			weatherData: [] as WeatherForecast[]
		};
		
		const oModel = new JSONModel(sampleData);
		this.getView()?.setModel(oModel);
		
		// Store initial language
		this.lastLanguage = Core.getConfiguration().getLanguage();
		
		this.onLoadWeather();

		// Attach route matched event to refresh chart when navigating back
		const oRouter = this.getRouter();
		oRouter.getRoute("weather")?.attachPatternMatched(this.onRouteMatched, this);
	}

	private onRouteMatched(): void {
		// Check if language has changed
		const currentLanguage = Core.getConfiguration().getLanguage();
		const oModel = this.getView()?.getModel() as JSONModel;
		const weatherData = oModel.getProperty("/weatherData") as WeatherForecast[];
		
		if (currentLanguage !== this.lastLanguage && weatherData && weatherData.length > 0) {
			console.log(`Language changed from ${this.lastLanguage} to ${currentLanguage}, redrawing chart`);
			this.lastLanguage = currentLanguage;
			// Delay to ensure i18n model is updated
			setTimeout(() => this.drawChart(weatherData), 100);
		} else if (weatherData && weatherData.length > 0) {
			// Just refresh chart with current data
			this.drawChart(weatherData);
		}
	}

	public async onLoadWeather(): Promise<void> {
		const oModel = this.getView()?.getModel() as JSONModel;
		
		try {
			const response = await fetch(`${this.getApiBaseUrl()}/WeatherForecast`, {
				method: "GET",
				credentials: "include", // Für Windows Authentication
				headers: {
					"Accept": "application/json"
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const weatherForecasts = WeatherForecast.fromApiResponse(data);
			
			oModel.setProperty("/weatherData", weatherForecasts);
			
			// Draw chart after data is loaded
			setTimeout(() => this.drawChart(weatherForecasts), 100);
			
			const oBundle = await this.getResourceBundle();
			MessageToast.show(oBundle.getText("weatherLoadSuccess", [weatherForecasts.length]));
		} catch (error) {
			const oBundle = await this.getResourceBundle();
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			MessageBox.error(oBundle.getText("weatherLoadError", [errorMessage]));
		}
	}

	private async drawChart(data: WeatherForecast[]): Promise<void> {
		const canvas = document.getElementById("weatherCanvas") as HTMLCanvasElement;
		if (!canvas) return;

		// Destroy previous chart instance if exists
		if (this.chartInstance) {
			this.chartInstance.destroy();
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Get i18n translations
		const oBundle = await this.getResourceBundle();
		const tempLabel = oBundle.getText("weatherChartTempLabel");
		const humidityLabel = oBundle.getText("weatherChartHumidityLabel");
		const dateAxis = oBundle.getText("weatherChartDateAxis");

		// Prepare data for Chart.js
		const labels = data.map(d => new Date(d.date).toLocaleDateString("en-US", { 
			month: "short", 
			day: "numeric" 
		}));
		const temperatures = data.map(d => d.temperatureC);
		const humidity = data.map(d => d.humidity);

		// Create Chart.js chart
		this.chartInstance = new Chart(ctx, {
			type: "line",
			data: {
				labels: labels,
				datasets: [
					{
						label: tempLabel,
						data: temperatures,
						borderColor: "#0070f0",
						backgroundColor: "rgba(0, 112, 240, 0.1)",
						borderWidth: 3,
						pointRadius: 5,
						pointBackgroundColor: "#0070f0",
						tension: 0.3,
						yAxisID: "y"
					},
					{
						label: humidityLabel,
						data: humidity,
						borderColor: "#00a6ed",
						backgroundColor: "rgba(0, 166, 237, 0.1)",
						borderWidth: 3,
						pointRadius: 5,
						pointBackgroundColor: "#00a6ed",
						tension: 0.3,
						yAxisID: "y1"
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				interaction: {
					mode: "index",
					intersect: false
				},
				plugins: {
					legend: {
						display: true,
						position: "top"
					},
					tooltip: {
						callbacks: {
							label: function(context: any) {
								const label = context.dataset.label || "";
								const value = context.parsed.y;
								return label + ": " + value + (label.includes("Humidity") || label.includes("Luftfeuchtigkeit") ? "%" : "°C");
							}
						}
					}
				},
				scales: {
					y: {
						type: "linear",
						display: true,
						position: "left",
						title: {
							display: true,
							text: tempLabel
						}
					},
					y1: {
						type: "linear",
						display: true,
						position: "right",
						min: 0,
						max: 100,
						title: {
							display: true,
							text: humidityLabel
						},
						grid: {
							drawOnChartArea: false
						}
					},
					x: {
						title: {
							display: true,
							text: dateAxis
						}
					}
				}
			}
		});
	}
}
