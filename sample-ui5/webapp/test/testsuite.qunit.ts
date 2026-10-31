export default {
	name: "QUnit test suite for the UI5 Application: com.24steps.ui5sample",
	defaults: {
		page: "ui5://test-resources/com/24steps/ui5sample/Test.qunit.html?testsuite={suite}&test={name}",
		qunit: {
			version: 2
		},
		sinon: {
			version: 4
		},
		ui5: {
			language: "EN",
			theme: "sap_horizon"
		},
		coverage: {
			only: "com/24steps/ui5sample/",
			never: "test-resources/com/24steps/ui5sample/"
		},
		loader: {
			paths: {
				"com/24steps/ui5sample": "../"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit tests for com.24steps.ui5sample"
		},
		"integration/opaTests": {
			title: "Integration tests for com.24steps.ui5sample"
		}
	}
};
