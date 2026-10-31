import BaseController from "./BaseController";
import Event from "sap/ui/base/Event";
import Menu from "sap/m/Menu";
import MenuItem from "sap/m/MenuItem";
import Button from "sap/m/Button";
import JSONModel from "sap/ui/model/json/JSONModel";
import Core from "sap/ui/core/Core";

/**
 * @namespace com.24steps.ui5sample.controller
 */
export default class App extends BaseController {
	private oMenu: Menu;

	public onInit(): void {
		// apply content density mode to root view
		this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		
		// Set up language model
		// Check localStorage for saved language preference
		const sSavedLanguage = localStorage.getItem("ui5-language");
		let sCurrentLanguage: string;
		
		if (sSavedLanguage) {
			sCurrentLanguage = sSavedLanguage;
			// Apply saved language to configuration
			const oConfiguration = Core.getConfiguration();
			oConfiguration.setLanguage(sCurrentLanguage);
		} else {
			const oConfiguration = Core.getConfiguration();
			sCurrentLanguage = oConfiguration.getLanguage().split("-")[0]; // Get 'en' from 'en-US'
		}
		
		const oLanguageModel = new JSONModel({
			selectedLanguage: (sCurrentLanguage === "de" ? "de" : "en").toUpperCase(),
			backendVersion: "Loading...",
			currentApplication: "ui5"
		});
		this.getView().setModel(oLanguageModel);
		
		// Create navigation menu
		this.oMenu = new Menu({
			items: [
				new MenuItem({
					text: "{i18n>homeTitle}",
					icon: "sap-icon://home",
					press: () => this.getRouter().navTo("home")
				}),
				new MenuItem({
					text: "{i18n>weatherTitle}",
					icon: "sap-icon://weather-proofing",
					press: () => this.getRouter().navTo("weather")
				}),
				new MenuItem({
					text: "{i18n>taskListTitle}",
					icon: "sap-icon://task",
					press: () => this.getRouter().navTo("tasks")
				})
			]
		});
		
		// Set i18n model to menu
		this.oMenu.setModel(this.getView().getModel("i18n"), "i18n");
		
		// Attach to router's routeMatched event to load backend version after config is ready
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
	}

	private onRouteMatched(): void {
		// Called when any route is matched - config should be loaded by now
		// Only load once
		if (!this._versionLoaded) {
			this._versionLoaded = true;
			console.log("Route matched, loading backend version...");
			this.loadBackendVersion();
		}
	}

	private _versionLoaded = false;

	public onShellBarHomeIconPressed(): void {
		this.getRouter().navTo("home");
	}

	public onShellBarMenuButtonPressed(oEvent: Event): void {
		const oButton = oEvent.getSource() as Button;
		this.oMenu.openBy(oButton);
	}

	public onLanguageButtonPress(): void {
		const oModel = this.getView().getModel() as JSONModel;
		const sCurrentLanguage = oModel.getProperty("/selectedLanguage") as string;
		
		// Toggle between EN and DE
		const sNewLanguage = sCurrentLanguage === "EN" ? "de" : "en";
		
		console.log(`Language changed from ${sCurrentLanguage} to: ${sNewLanguage}`);
		
		// Save language preference to localStorage
		localStorage.setItem("ui5-language", sNewLanguage);
		
		// Update model
		oModel.setProperty("/selectedLanguage", sNewLanguage.toUpperCase());
		
		// Update configuration
		const oConfiguration = Core.getConfiguration();
		oConfiguration.setLanguage(sNewLanguage);
		
		// Reload the page to apply language change
		window.location.reload();
	}

	public onApplicationSelectChange(): void {
		const oModel = this.getView().getModel() as JSONModel;
		const sApplication = oModel.getProperty("/currentApplication") as string;
		const oApplications: Record<string, { port: number; localPath: string; path: string }> = {
			react: { port: 5173, localPath: "/", path: "/apps/sample-react/" },
			ui5: { port: 8080, localPath: "/index.html", path: "/apps/sample-ui5/" },
			vue: { port: 5174, localPath: "/", path: "/apps/sample-vue/" },
			angular: { port: 4200, localPath: "/", path: "/apps/sample-angular/" }
		};
		const oTarget = oApplications[sApplication];
		if (!oTarget || sApplication === "ui5") return;

		const bIsLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
		window.location.assign(
			bIsLocal
				? `http://localhost:${oTarget.port}${oTarget.localPath}`
				: new URL(oTarget.path, window.location.origin).toString()
		);
	}

	private async loadBackendVersion(): Promise<void> {
		try {
			const response = await fetch(`${this.getApiBaseUrl()}/Info`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json"
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const oModel = this.getView().getModel() as JSONModel;
			oModel.setProperty("/backendVersion", `Backend: ${data.version}`);
		} catch (error) {
			console.error("Failed to load backend version:", error);
			const oModel = this.getView().getModel() as JSONModel;
			oModel.setProperty("/backendVersion", "Backend: Unknown");
		}
	}
}
