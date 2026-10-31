import UIComponent from "sap/ui/core/UIComponent";
import models from "./model/models";
import Device from "sap/ui/Device";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.24steps.ui5sample
 */
export default class Component extends UIComponent {
	public static metadata = {
		manifest: "json",
		interfaces: ["sap.ui.core.IAsyncContentCreation"]
	};

	private contentDensityClass: string;

	public init(): void {
		// call the base component's init function FIRST
		super.init();

		// create the device model
		this.setModel(models.createDeviceModel(), "device");

		// load environment-specific configuration BEFORE initializing router
		this.loadEnvironmentConfig().then(() => {
			console.log("Config loaded, now initializing router...");
			// Fire event to notify that config is ready
			this.fireEvent("configReady");
			// NOW create the views based on the url/hash (after config is loaded)
			this.getRouter().initialize();
		}).catch((error) => {
			console.error("Error loading config, initializing router with defaults:", error);
			this.getRouter().initialize();
		});
	}

	/**
	 * Load environment-specific configuration from manifest-{env}.json
	 * Falls back to development configuration if environment is not specified
	 */
	private async loadEnvironmentConfig(): Promise<void> {
		// Determine environment (default to 'dev' for local development)
		const env = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
			? 'dev' 
			: 'prod';

		try {
			const response = await fetch(`./manifest-${env}.json`);
			const envConfig = await response.json();
			
			// Get the config model and merge environment-specific settings
			const configModel = this.getModel("config") as JSONModel;
			configModel.setData(envConfig.config);
			
			console.log(`Loaded ${env} environment config:`, envConfig.config);
		} catch (error) {
			console.warn(`Failed to load environment config for '${env}', using defaults from manifest.json`, error);
		}
	}

	/**
	 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
	 * design mode class should be set, which influences the size appearance of some controls.
	 * @public
	 * @returns css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
	 */
	public getContentDensityClass(): string {
		if (this.contentDensityClass === undefined) {
			// check whether FLP has already set the content density class; do nothing in this case
			if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
				this.contentDensityClass = "";
			} else if (!Device.support.touch) {
				// apply "compact" mode if touch is not supported
				this.contentDensityClass = "sapUiSizeCompact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
				this.contentDensityClass = "sapUiSizeCozy";
			}
		}
		return this.contentDensityClass;
	}
}
