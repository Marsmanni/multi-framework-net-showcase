import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import StandardListItem from "sap/m/StandardListItem";
import ComboBox from "sap/m/ComboBox";
import View from "sap/ui/core/mvc/View";
import VBox from "sap/m/VBox";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

interface Location {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	timeZone: string;
}

/**
 * @namespace com.24steps.ui5sample.controller
 */
export default class Home extends BaseController {
	public onInit(): void {
		// Set initial task count
		const oData = {
			taskCount: 0,
			sunTimes: {
				sunrise: "Loading...",
				sunset: "Loading..."
			},
			locations: [] as Location[],
			selectedLocationId: ""
		};
		const oModel = new JSONModel(oData);
		this.getView()?.setModel(oModel);

		// Load TicTacToe card as separate view
		this.loadTicTacToeCard();

		// Load locations and sun times from API
		this.loadLocations();

		// Load task count from backend
		this.loadTaskCount();

		// Attach route matched event to refresh task count when navigating back
		const oRouter = this.getRouter();
		oRouter.getRoute("home")?.attachPatternMatched(this.onRouteMatched, this);

		// Metadaten aus <meta> auslesen
		const versionNumber = document.querySelector('meta[name="app-version"]')?.getAttribute("content") || "";
		const build = document.querySelector('meta[name="app-build"]')?.getAttribute("content") || "";
		const commit = document.querySelector('meta[name="app-commit"]')?.getAttribute("content") || "";

		// Suffix zusammenbauen (z.B. nur Version, kann beliebig erweitert werden)
		const versionSuffix = versionNumber ? ` (${versionNumber})` : "";

		const _this = this;
		this.getResourceBundle().then(oBundle => {
			// Subtitle zusammensetzen
			const welcomeSubtitle = `${oBundle.getText("welcomeSubtitle")}${versionSuffix}`;

			// ViewModel setzen
			const viewModel = new JSONModel({
				welcomeSubtitle
			});
			_this.getView().setModel(viewModel, "view");
		});
	}

	private onRouteMatched(): void {
		// Refresh task count when navigating back to home
		this.loadTaskCount();
	}

	private async loadTicTacToeCard(): Promise<void> {
		const oView = await View.create({
			viewName: "com.24steps.ui5sample.view.TicTacToeCard",
			type: "XML"
		}) as View;

		const oContainer = this.getView()?.byId("idTicTacToeVBox") as VBox;
		if (oContainer) {
			oContainer.addItem(oView);
		}
	}

	private loadLocations(): void {
		fetch(`${this.getApiBaseUrl()}/SunriseSunset/locations`, {
			credentials: "include"
		})
			.then((response) => response.json())
			.then((data) => {
				const oModel = this.getView()?.getModel() as JSONModel;
				oModel.setProperty("/locations", data);
				
				// Preselect first location and load its sun times
				if (data && data.length > 0) {
					const firstLocationId = data[0].id;
					oModel.setProperty("/selectedLocationId", firstLocationId);
					this.loadSunTimes(firstLocationId);
				}
			})
			.catch((error) => {
				console.error("Error loading locations:", error);
			});
	}

	private loadTaskCount(): void {
		fetch(`${this.getApiBaseUrl()}/TaskList`, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then((response) => response.json())
			.then((tasks) => {
				const oModel = this.getView()?.getModel() as JSONModel;
				oModel.setProperty("/taskCount", tasks.length);
			})
			.catch((error) => {
				console.error("Error loading task count:", error);
			});
	}

	private loadSunTimes(locationId: string): void {
		const url = `${this.getApiBaseUrl()}/SunriseSunset?location=${encodeURIComponent(locationId)}`;
		fetch(url, {
			credentials: "include"
		})
			.then((response) => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.json();
			})
			.then((data) => {
				const sunrise = new Date(data.sunrise);
				const sunset = new Date(data.sunset);
				
				const sunTimes = {
					sunrise: sunrise,
					sunset: sunset
				};

				const oModel = this.getView()?.getModel() as JSONModel;
				oModel.setProperty("/sunTimes", sunTimes);
			})
			.catch((error) => {
				console.error("Error loading sun times:", error);
				const oModel = this.getView()?.getModel() as JSONModel;
				oModel.setProperty("/sunTimes", {
					sunrise: "Error",
					sunset: "Error"
				});
			});
	}

	public onStandardListItemPress(oEvent: Event): void {
		const oSource = oEvent.getSource() as StandardListItem;
		const sId = oSource.getId();
		
		if (sId?.includes("Home")) {
			this.getRouter().navTo("home");
		} else if (sId?.includes("Weather")) {
			this.getRouter().navTo("weather");
		} else if (sId?.includes("Tasks")) {
			this.getRouter().navTo("tasks");
		}
	}

	public onViewAllTasksButtonPress(): void {
		this.getRouter().navTo("tasks");
	}

	public onLocationsComboBoxChange(oEvent: Event): void {
		const oComboBox = oEvent.getSource() as ComboBox;
		const sSelectedKey = oComboBox.getSelectedKey();
		
		if (sSelectedKey) {
			console.log(`Location changed to: ${sSelectedKey}`);
			this.loadSunTimes(sSelectedKey);
		}
	}

	public formatTime24(timeStr: string): string {
		if (!timeStr || timeStr === 'Loading...' || timeStr === 'N/A' || timeStr === 'Error') return timeStr;
		const date = new Date(timeStr);
		if (isNaN(date.getTime())) return timeStr;
  		var hhmm = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    	var tz = date.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();
    	return hhmm + ' ' + tz;
	}
}
