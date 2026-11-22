import { Component } from 'obsidian';

type SessionKind = 'work' | 'shortBreak' | 'longBreak';
const SESSION_ORDER: SessionKind[] = ['work', 'shortBreak', 'longBreak'];

const SESSIONS: Record<SessionKind, { durationMs: number; label: string }> = {
    work: { durationMs: 25 * 60 * 1000, label: 'Focus' },
    shortBreak: { durationMs: 5 * 60 * 1000, label: 'Short Break' },
    longBreak: { durationMs: 15 * 60 * 1000, label: 'Long Break' },
};

type TimerState =
    | { status: 'idle' }
    | { status: 'running'; endsAt: number }
    | { status: 'paused'; remainingMs: number };

function alert(message: string) {
    chime();

    if (Notification.permission === 'granted') {
        new Notification('Upkeep', { body: message });
    } else if (Notification.permission !== 'denied') {
        void Notification.requestPermission().then((result) => {
            if (result === 'granted') {
                new Notification('Upkeep', { body: message });
            }
        });
    }
}

function chime() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
    osc.onended = () => void ctx.close();
}

export class PomodoroTimer extends Component {
    private display!: HTMLElement;
    private label!: HTMLElement;
    private count!: HTMLElement;
    private startButton!: HTMLButtonElement;
    private pauseButton!: HTMLButtonElement;

    private selectedKind: SessionKind = 'work';
    private kindButtons: Partial<Record<SessionKind, HTMLButtonElement>> = {};
    private timerState: TimerState = { status: 'idle' };
    private completedPomodoros = 0;

    constructor(private container: HTMLElement) {
        super();
    }

    onload() {
        const container = this.container;
        container.empty();
        container.addClass('upkeep-section');
        container.createEl('h4', { text: 'Timer', cls: 'upkeep-heading' });

        const kindRow = container.createDiv('upkeep-button-row');
        for (const kind of SESSION_ORDER) {
            const kindButton = kindRow.createEl('button', {
                text: SESSIONS[kind].label,
            });
            kindButton.addEventListener('click', () => this.selectKind(kind));
            this.kindButtons[kind] = kindButton;
        }

        this.label = container.createEl('p', { cls: 'upkeep-session-label' });
        this.display = container.createEl('p', { cls: 'upkeep-clock' });
        this.count = container.createEl('p', { cls: 'upkeep-count' });

        const controls = container.createDiv('upkeep-button-row');

        this.startButton = controls.createEl('button', { text: 'Start' });
        this.startButton.addEventListener('click', () => this.startTimer());

        this.pauseButton = controls.createEl('button', { text: 'Pause' });
        this.pauseButton.addEventListener('click', () => this.pauseTimer());

        const resetButton = controls.createEl('button', { text: 'Reset' });
        resetButton.addEventListener('click', () => this.resetTimer());

        this.renderSession();
        this.renderCount();
        this.renderControls();

        this.registerInterval(window.setInterval(() => this.tickTimer(), 250));
    }

    startTimer() {
        switch (this.timerState.status) {
            case 'idle':
                this.timerState = {
                    status: 'running',
                    endsAt: Date.now() + SESSIONS[this.selectedKind].durationMs,
                };
                break;
            case 'paused':
                this.timerState = {
                    status: 'running',
                    endsAt: Date.now() + this.timerState.remainingMs,
                };
                break;
            case 'running':
                break;
        }

        if (this.timerState.status === 'running') {
            this.renderTimer(this.timerState.endsAt - Date.now());
        }
        this.renderControls();
    }

    pauseTimer() {
        if (this.timerState.status !== 'running') return;
        this.timerState = {
            status: 'paused',
            remainingMs: this.timerState.endsAt - Date.now(),
        };

        this.renderTimer(this.timerState.remainingMs);
        this.renderControls();
    }

    resetTimer() {
        this.timerState = { status: 'idle' };
        this.renderSession();
        this.renderControls();
    }

    tickTimer() {
        if (this.timerState.status !== 'running') return;

        const remaining = this.timerState.endsAt - Date.now();
        this.renderTimer(remaining);

        if (remaining <= 0) {
            const finished = this.selectedKind;
            this.timerState = { status: 'idle' };
            this.renderControls();
            alert(`${SESSIONS[finished].label} complete`);

            if (finished === 'work') {
                this.completedPomodoros++;
                this.renderCount();
            }
        }
    }

    selectKind(kind: SessionKind) {
        this.selectedKind = kind;
        this.resetTimer();
    }

    renderSession() {
        for (const kind of SESSION_ORDER) {
            this.kindButtons[kind]?.toggleClass('mod-cta', kind === this.selectedKind);
        }
        this.label.setText(SESSIONS[this.selectedKind].label);
        this.renderTimer(SESSIONS[this.selectedKind].durationMs);
    }

    renderTimer(ms: number) {
        const clamped = Math.max(0, ms);
        const totalSeconds = Math.ceil(clamped / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.display.setText(
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
    }

    renderCount() {
        this.count.setText(`Pomodoros completed: ${this.completedPomodoros}`);
    }

    private renderControls() {
        const { status } = this.timerState;
        this.container.toggleClass('is-running', status === 'running');
        this.container.toggleClass('is-paused', status === 'paused');
        this.startButton.disabled = status === 'running';
        this.pauseButton.disabled = status !== 'running';
    }
}