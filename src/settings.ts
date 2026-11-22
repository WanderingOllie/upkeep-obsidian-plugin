import { App, PluginSettingTab, Setting } from 'obsidian';
import type UpkeepPlugin from './main';

export class UpkeepSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: UpkeepPlugin) {
		super(app, plugin);
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Daily study habits')
			.setDesc('Add, remove, and rename habits below.')
			.setHeading();

		this.plugin.data.habits.forEach((habit, index) => {
			new Setting(containerEl)
				.setClass('upkeep-habit-row')
				.addExtraButton((button) =>
					button
						.setIcon('chevron-up')
						.setTooltip('Move up')
						.setDisabled(index === 0)
						.onClick(() => this.move(index, -1)),
				)
				.addExtraButton((button) =>
					button
						.setIcon('chevron-down')
						.setTooltip('Move down')
						.setDisabled(index === this.plugin.data.habits.length - 1)
						.onClick(() => this.move(index, 1)),
				)
				.addText((text) =>
					text
						.setPlaceholder('Habit name')
						.setValue(habit.text)
						.onChange(async (value) => {
							habit.text = value;
							await this.plugin.save();
							this.plugin.refreshViews();
						}),
				)
				.addExtraButton((button) =>
					button
						.setIcon('trash')
						.setTooltip('Delete habit')
						.onClick(async () => {
							this.plugin.data.habits.splice(index, 1);
							delete this.plugin.data.completions[habit.id];
							await this.plugin.save();
							this.plugin.refreshViews();
							this.display();
						}),
				);
		});

		new Setting(containerEl).addButton((button) =>
			button
				.setButtonText('Add habit')
				.setCta()
				.onClick(async () => {
					this.plugin.data.habits.push({
						id: crypto.randomUUID(),
						text: '',
					});
					await this.plugin.save();
					this.plugin.refreshViews();
					this.display();
				}),
		);
	}

	private async move(index: number, delta: number) {
		const habits = this.plugin.data.habits;
		const target = index + delta;

		const a = habits[index];
		const b = habits[target];
		if (!a || !b) return;

		habits[index] = b;
		habits[target] = a;

		await this.plugin.save();
		this.plugin.refreshViews();
		this.display();
	}

	hide() {
		const habits = this.plugin.data.habits;
		const kept = habits.filter((h) => h.text.trim());

		if (kept.length === habits.length) return;

		for (const habit of habits) {
			if (!habit.text.trim()) delete this.plugin.data.completions[habit.id];
		}

		this.plugin.data.habits = kept;
		void this.plugin.save();
		this.plugin.refreshViews();
	}
}
