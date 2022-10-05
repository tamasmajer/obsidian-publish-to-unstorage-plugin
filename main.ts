import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Vault,
	TFile
} from 'obsidian';


import { createStorage, Storage } from 'unstorage'
import createDriver from 'unstorage-driver-http-headers'

const UNSTORAGE_SERVER_DATA_API_URL = 'http://localhost:8081/api/data'
const UNSTORAGE_PREVIEW_SITE_URL = 'http://localhost:8080'

const createLinkHtml = (href: string, title: string) => {
	return `<a style="color:inherit;text-decoration:underline;" href="${href}">${title}</a>`;
}

class PublishUtils {

	static async getCurrentPageAsMarkdown(appVault: Vault, activeFile: TFile): Promise<string | undefined> {
		try {
			const markdown = await appVault.cachedRead(activeFile)
			return markdown
		} catch (e) {
			console.log(e)
		}
	}

	static getServerDataApi(apiKey: string): Storage {
		const AUTHORIZATION_HEADER = { 'Authorization': 'Bearer ' + apiKey }
		const driver = createDriver({ base: UNSTORAGE_SERVER_DATA_API_URL, headers: AUTHORIZATION_HEADER })
		const storage = createStorage({ driver })
		return storage
	}

	static async uploadToUnstorageServer(name: string, vault: any, token: string): Promise<number> {
		const dataApi = this.getServerDataApi(token);
		const before = await dataApi.getItem(name);
		const already = JSON.stringify(vault) === JSON.stringify(before)
		if (already) return 2;
		await dataApi.setItem(name, vault);
		const check = await dataApi.getItem(name);
		const saved = JSON.stringify(vault) === JSON.stringify(check)
		return saved ? 1 : 0;
	}

}



interface UnstorageSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: UnstorageSettings = {
	apiKey: ''
}

export default class UnstoragePlugin extends Plugin {
	// icon is from https://lucide.dev/
	PUBLISH_BUTTON_ICON = 'arrow-up-circle'
	PUBLISH_BUTTON_TEXT = 'Publish To Unstorage'
	PUBLISH_COMMAND_ID = 'obsidian-publish-to-unstorage'
	PUBLISH_COMMAND_NAME = 'Save current file with linked documents to an Unstorage server.'

	settings: UnstorageSettings;

	async publishToUnstorageServer(activeFile: TFile | null, appVault: Vault, apiKey: string): Promise<string> {
		const STATUS_NO_API_KEY = 'Open Settings to see how to get an API Key!'
		const STATUS_NO_ACTIVE_FILE = 'Select a file first to upload!'
		const STATUS_COULD_NOT_SAVE = 'Could not save!'
		const STATUS_ALREADY_SAVED = 'Already saved!'
		const STATUS_ALREADY_SAVED_LINK = 'Open'
		const STATUS_SAVED = 'Saved!'
		const STATUS_SAVED_LINK = 'Have a look'

		if (!apiKey) return STATUS_NO_API_KEY;
		if (!activeFile) return STATUS_NO_ACTIVE_FILE;
		let saved = 0
		try {
			// await getVaultAsObject(this.app)
			const activeFile = app.workspace.getActiveFile()
			if (activeFile) {
				const markdown = await PublishUtils.getCurrentPageAsMarkdown(appVault, activeFile);
				if (markdown) {
					const notes = { [activeFile.path]: markdown }
					saved = await PublishUtils.uploadToUnstorageServer(activeFile.name, notes, apiKey);
					console.log({ saved })
				}
			}
			if (saved == 0) return STATUS_COULD_NOT_SAVE;
			else if (saved == 2) return STATUS_ALREADY_SAVED + ' ' + createLinkHtml(UNSTORAGE_PREVIEW_SITE_URL, STATUS_ALREADY_SAVED_LINK);
			else return STATUS_SAVED + ' ' + createLinkHtml(UNSTORAGE_PREVIEW_SITE_URL, STATUS_SAVED_LINK);
		} catch (e) {
			console.log('PUBLISH ERR', e);
			return `Error: ${e.getMessage()}`;
		}
	}

	async publishToUnstorageCommand() {
		const activeFile = app.workspace.getActiveFile()
		const message = await this.publishToUnstorageServer(activeFile, app.vault, this.settings.apiKey);
		const notice = new DocumentFragment()
		notice.createDiv().innerHTML = message;
		new Notice(notice, 5000)
	}

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon(this.PUBLISH_BUTTON_ICON, this.PUBLISH_BUTTON_TEXT, async (evt: MouseEvent) => {
			await this.publishToUnstorageCommand()
		});

		this.addCommand({
			id: this.PUBLISH_COMMAND_ID,
			name: this.PUBLISH_COMMAND_NAME,
			callback: () => {
				this.publishToUnstorageCommand();
			}
		});

		this.addSettingTab(new UnstorageSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class UnstorageSettingTab extends PluginSettingTab {
	TITLE = 'Publish To Unstorage'
	LINK_TO_OPEN_PREVIEW_SITE = 'open preview site'
	LINK_TO_OPEN_PREVIEW_SITE_URL = UNSTORAGE_PREVIEW_SITE_URL
	LINK_TO_GET_API_KEY = 'or get one here'
	LINK_TO_GET_API_KEY_URL = UNSTORAGE_PREVIEW_SITE_URL
	TEXT_CURRENT_API_KEY = 'Enter your API Key:'
	TEXT_ENTER_API_KEY = ''

	plugin: UnstoragePlugin;

	constructor(app: App, plugin: UnstoragePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: this.TITLE });
		containerEl.createDiv().innerHTML = createLinkHtml(this.LINK_TO_OPEN_PREVIEW_SITE_URL, this.LINK_TO_OPEN_PREVIEW_SITE);

		const getApiKey = new DocumentFragment();
		getApiKey.createDiv().innerHTML = createLinkHtml(this.LINK_TO_GET_API_KEY_URL, this.LINK_TO_GET_API_KEY);

		new Setting(containerEl)
			.setName(this.TEXT_CURRENT_API_KEY)
			.setDesc(getApiKey)
			.addText(text => text
				.setPlaceholder(this.TEXT_ENTER_API_KEY)
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
