import { ItemView, WorkspaceLeaf } from 'obsidian';
import { PomodoroTimer } from './timer';
import { HabitTracker } from './habits';
import type UpkeepPlugin from './main';

export const VIEW_TYPE_UPKEEP = 'upkeep-view';

export class UpkeepView extends ItemView {
    private habits!: HabitTracker;

    constructor(
        leaf: WorkspaceLeaf,
        private plugin: UpkeepPlugin,
    ) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_UPKEEP;
    }

    getDisplayText() {
        return 'Upkeep';
    }

    getIcon() {
        return 'book-open-check';
    }

    async onOpen() {
        this.contentEl.empty();
        this.contentEl.addClass('upkeep-view');

        this.addChild(new PomodoroTimer(this.contentEl.createDiv('upkeep-timer')));

        this.habits = new HabitTracker(
            this.plugin,
            this.contentEl.createDiv('upkeep-habits-section'),
        );
        this.addChild(this.habits);
    }

    // Called by the plugin when settings edits the habit list
    refresh() {
        this.habits?.refresh();
    }
}