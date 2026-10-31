import { ValueState } from "sap/ui/core/library";

export default {
	formatValue: (value: string) => {
		return value?.toUpperCase();
	},

	formatStatusState: (status: number | string): ValueState => {
		let statusValue: number;
		
		// Handle both string and number inputs
		if (typeof status === "string") {
			switch (status) {
				case "Open":
				case "0":
					statusValue = 0;
					break;
				case "In Progress":
				case "InProgress":
				case "1":
					statusValue = 1;
					break;
				case "Completed":
				case "2":
					statusValue = 2;
					break;
				default:
					statusValue = 0;
			}
		} else {
			statusValue = status;
		}
		
		switch (statusValue) {
			case 0: // Open
				return ValueState.Warning;
			case 1: // InProgress
				return ValueState.Information;
			case 2: // Completed
				return ValueState.Success;
			default:
				return ValueState.None;
		}
	},
	
	formatStatusText: (status: number  | string): string => {
		if (typeof status === "string") {
			return status;
		}
		switch (status) {
			case 0:
				return "Open";
			case 1:
				return "In Progress";
			case 2:
				return "Completed";
			default:
				return "Unknown";
		}
	}
};
