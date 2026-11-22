import { Component } from 'obsidian';
import type UpkeepPlugin from './main';

function todayKey(): string {
    return new Date().toLocaleDateString('en-CA');
}

function yesterdayKey(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA');
}

export class HabitTracker extends Component {
    private list!: HTMLUListElement;
    private summary!: HTMLElement;
    private renderedFor = '';

    constructor(
        private plugin: UpkeepPlugin,
        private container: HTMLElement,
    ) {
        super();
    }

    onload() {
        const container = this.container;
        container.empty();
        container.addClass('upkeep-section');
        container.createEl('h4', { text: 'Daily Upkeep', cls: 'upkeep-heading' });
        this.list = container.createEl('ul', { cls: 'upkeep-habits' });
        this.summary = container.createEl('p', { cls: 'upkeep-summary' });

        this.refresh();

        this.registerInterval(
            window.setInterval(() => {
                if (this.renderedFor !== todayKey()) this.refresh();
            }, 60 * 1000),
        );
    }

    refresh() {
        this.renderedFor = todayKey();
        this.renderHabits();
        this.renderSummary();
    }

    private renderHabits() {
        this.list.empty();

        const habits = this.plugin.data.habits.filter((h) => h.text.trim());

        if (habits.length === 0) {
            this.list.createEl('li', { text: 'No habits yet - add some in settings' });
            return;
        }

        for (const habit of habits) {
            const li = this.list.createEl('li');

            const box = li.createEl('input', { type: 'checkbox' });
            box.id = `upkeep-${habit.id}`;
            box.checked = this.isCompletedToday(habit.id);

            const label = li.createEl('label', { text: habit.text });
            label.htmlFor = box.id;

            const streak = this.plugin.data.completions[habit.id]?.streak ?? 0;
            if (streak > 1) {
                li.createEl('span', {
                    text: ` ${streak}d`,
                    cls: 'upkeep-streak',
                });
            }

            box.addEventListener('change', () =>
                this.toggleHabit(habit.id, box.checked),
            );
        }
    }

    private renderSummary() {
        const habits = this.plugin.data.habits.filter((h) => h.text.trim());
        const done = habits.filter((h) => this.isCompletedToday(h.id)).length;
        this.summary.setText(`${done} of ${habits.length} done today`);
    }

    private isCompletedToday(id: string): boolean {
        return this.plugin.data.completions[id]?.lastDate === todayKey();
    }

    private async toggleHabit(id: string, checked: boolean) {
        const completions = this.plugin.data.completions;

        if (checked) {
            const prev = completions[id];
            const continuing = prev?.lastDate === yesterdayKey();
            completions[id] = {
                lastDate: todayKey(),
                streak: continuing ? prev.streak + 1 : 1,
                prevStreak: continuing ? prev.streak : 0,
            };
        } else {
            const prev = completions[id];
            if (prev?.prevStreak) {
                completions[id] = {
                    lastDate: yesterdayKey(),
                    streak: prev.prevStreak,
                };
            } else {
                delete completions[id];
            }
        }

        await this.plugin.save();
        this.refresh();
    }
}
