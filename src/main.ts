import { Plugin, WorkspaceLeaf } from 'obsidian';
import { UpkeepSettingTab } from './settings';
import { UpkeepView, VIEW_TYPE_UPKEEP } from './view';
import { PluginData, DEFAULT_DATA } from './types';


export default class UpkeepPlugin extends Plugin {
	data!: PluginData;

	async onload() {
		await this.load_();

		this.registerView(
			VIEW_TYPE_UPKEEP,
			(leaf) => new UpkeepView(leaf, this)
		);

		this.addRibbonIcon('book-open-check', 'Open Upkeep', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-upkeep',
			name: 'Open Upkeep panel',
			callback: () => this.activateView(),
		});

		this.addSettingTab(new UpkeepSettingTab(this.app, this));
	}

	async load_() {
		this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
	}

	async save() {
		await this.saveData(this.data);
	}

	refreshViews() {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_UPKEEP)) {
			(leaf.view as UpkeepView).refresh();
		}
	}

	async activateView() {
		const { workspace } = this.app;

		const existing = workspace.getLeavesOfType(VIEW_TYPE_UPKEEP)[0];
		if (existing) {
			workspace.revealLeaf(existing);
			return;
		}

		const leaf = workspace.getRightLeaf(false);
		if (!leaf) return;
		await leaf.setViewState({ type: VIEW_TYPE_UPKEEP, active: true });
		workspace.revealLeaf(leaf);
	}
}
