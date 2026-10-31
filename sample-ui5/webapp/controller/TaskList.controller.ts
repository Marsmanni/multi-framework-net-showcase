import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import formatter from "../model/formatter";
import Event from "sap/ui/base/Event";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import TextArea from "sap/m/TextArea";
import DatePicker from "sap/m/DatePicker";
import Select from "sap/m/Select";
import Button from "sap/m/Button";
import VBox from "sap/m/VBox";
import Label from "sap/m/Label";
import Item from "sap/ui/core/Item";
import StandardListItem from "sap/m/StandardListItem";

interface Task {
	id?: number;
	title: string;
	description: string;
	dueDate?: string | null;
	status: number;
	createdAt?: string;
}

enum TaskStatus {
	Open = 0,
	InProgress = 1,
	Completed = 2
}

/**
 * @namespace com.24steps.ui5sample.controller
 */
export default class TaskList extends BaseController {
	public formatter = formatter;
	private oCreateDialog?: Dialog;
	private oEditDialog?: Dialog;

	public onInit(): void {
		const oModel = new JSONModel({ tasks: [] });
		this.getView()?.setModel(oModel);
		
		// Load tasks when view is initialized
		this.loadTasks();
	}

	private async loadTasks(): Promise<void> {
		try {
			const response = await fetch(`${this.getApiBaseUrl()}/TaskList`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json"
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const tasks = await response.json() as Task[];
			const oModel = this.getView()?.getModel() as JSONModel;
			oModel.setProperty("/tasks", tasks);
			
			console.log("Tasks loaded successfully:", tasks);
		} catch (error) {
			console.error("Error loading tasks:", error);
			const oBundle = await this.getResourceBundle();
			MessageBox.error(oBundle.getText("taskLoadError"));
		}
	}

	public onAddTaskButtonPress(): void {
		if (!this.oCreateDialog) {
			this.oCreateDialog = this.createTaskDialog(false);
		}
		
		// Reset dialog fields
		const oDialogModel = new JSONModel({
			title: "",
			description: "",
			dueDate: null,
			status: TaskStatus.Open
		});
		this.oCreateDialog.setModel(oDialogModel, "newTask");
		this.oCreateDialog.open();
	}

	public async onStandardListItemDetailPress(oEvent: Event): Promise<void> {
		const oItem = oEvent.getSource() as StandardListItem;
		const oContext = oItem.getBindingContext();
		if (!oContext) return;

		const oTask = oContext.getObject() as Task;
		
		if (!this.oEditDialog) {
			this.oEditDialog = this.createTaskDialog(true);
		}
		
		// Set task data to dialog
		const oDialogModel = new JSONModel({
			id: oTask.id,
			title: oTask.title,
			description: oTask.description,
			dueDate: oTask.dueDate,
			status: oTask.status
		});
		this.oEditDialog.setModel(oDialogModel, "editTask");
		this.oEditDialog.open();
	}

	private createTaskDialog(isEdit: boolean): Dialog {
		const sModelName = isEdit ? "editTask" : "newTask";
		
		const dialogConfig: any = {
			title: `{i18n>${isEdit ? "editTaskDialogTitle" : "createTaskDialogTitle"}}`,
			contentWidth: "500px",
			content: new VBox({
				items: [
					new Label({ text: "{i18n>taskTitleLabel}", required: true }),
					new Input({
						value: `{${sModelName}>/title}`,
						placeholder: "{i18n>taskTitlePlaceholder}"
					}),
					new Label({ text: "{i18n>taskDescriptionLabel}", required: true }),
					new TextArea({
						value: `{${sModelName}>/description}`,
						placeholder: "{i18n>taskDescriptionPlaceholder}",
						rows: 4
					}),
					new Label({ text: "{i18n>taskDueDateLabel}" }),
					new DatePicker({
						value: `{${sModelName}>/dueDate}`,
						valueFormat: "yyyy-MM-dd",
						displayFormat: "short"
					}),
					new Label({ text: "{i18n>taskStatusLabel}", required: true }),
					new Select({
						selectedKey: `{${sModelName}>/status}`,
						items: [
							new Item({ key: TaskStatus.Open.toString(), text: "{i18n>taskStatusOpen}" }),
							new Item({ key: TaskStatus.InProgress.toString(), text: "{i18n>taskStatusInProgress}" }),
							new Item({ key: TaskStatus.Completed.toString(), text: "{i18n>taskStatusCompleted}" })
						]
					})
				]
			}).addStyleClass("sapUiSmallMargin"),
			beginButton: new Button({
				text: `{i18n>${isEdit ? "saveButton" : "createButton"}}`,
				type: "Emphasized",
				press: () => {
					if (isEdit) {
						this.onSaveTask();
					} else {
						this.onCreateTask();
					}
				}
			}),
			endButton: new Button({
				text: "{i18n>cancelButton}",
			})
		};
		
		const oDialog = new Dialog(dialogConfig);

		// Fix the cancel button handler
		dialogConfig.endButton.attachPress(() => oDialog.close());
		
		// Set i18n model to dialog
		const oView = this.getView();
		oView?.addDependent(oDialog);
		oDialog.setModel(oView?.getModel("i18n"), "i18n");
		
		return oDialog;
	}

	private async onCreateTask(): Promise<void> {
		const oDialogModel = this.oCreateDialog?.getModel("newTask") as JSONModel;
		const oTaskData = oDialogModel.getData() as Task;
		const oBundle = await this.getResourceBundle();

		if (!oTaskData.title || !oTaskData.description) {
			MessageBox.error(oBundle.getText("requiredFieldsError"));
			return;
		}

		try {
			const response = await fetch(`${this.getApiBaseUrl()}/TaskList`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(oTaskData)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			this.oCreateDialog?.close();
			MessageToast.show(oBundle.getText("taskCreatedSuccess"));
			await this.loadTasks();
		} catch (error) {
			console.error("Error creating task:", error);
			MessageBox.error(oBundle.getText("taskCreateError"));
		}
	}

	private async onSaveTask(): Promise<void> {
		const oDialogModel = this.oEditDialog?.getModel("editTask") as JSONModel;
		const oTaskData = oDialogModel.getData() as Task;
		const oBundle = await this.getResourceBundle();

		if (!oTaskData.title || !oTaskData.description) {
			MessageBox.error(oBundle.getText("requiredFieldsError"));
			return;
		}

		try {
			const response = await fetch(`${this.getApiBaseUrl()}/TaskList/${oTaskData.id}`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(oTaskData)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			this.oEditDialog?.close();
			MessageToast.show(oBundle.getText("taskUpdatedSuccess"));
			await this.loadTasks();
		} catch (error) {
			console.error("Error updating task:", error);
			MessageBox.error(oBundle.getText("taskUpdateError"));
		}
	}

	public async onTasksListDelete(oEvent: Event): Promise<void> {
		const oListItem = (oEvent as any).getParameter("listItem");
		const oContext = (oListItem as any).getBindingContext();
		if (!oContext) return;

		const oTaskData = oContext.getObject() as Task;
		const oBundle = await this.getResourceBundle();

		MessageBox.confirm(
			oBundle.getText("deleteTaskConfirmation", [oTaskData.title]),
			{
				onClose: async (sAction: string) => {
					if (sAction === MessageBox.Action.OK) {
						try {
							const response = await fetch(`${this.getApiBaseUrl()}/TaskList/${oTaskData.id}`, {
								method: "DELETE",
								credentials: "include"
							});

							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`);
							}

							this.oEditDialog?.close();
							MessageToast.show(oBundle.getText("taskDeletedSuccess"));
							await this.loadTasks();
						} catch (error) {
							console.error("Error deleting task:", error);
							MessageBox.error(oBundle.getText("taskDeleteError"));
						}
					}
				}
			}
		);
	}
}
