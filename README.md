# Upkeep

A personal Obsidian plugin which provides a Pomodoro timer and daily study habit tracker in a sidebar panel.

Built from [Obsidian's sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin).

## Features

**Pomodoro timer** — Focus (25m), Short Break (5m), and Long Break (15m)
sessions with start, pause, and reset. Completed focus sessions are counted for
the current session. A chime and a system notification fire when a timer ends.

**Daily upkeep** — A checklist of habits that resets each day. Each habit tracks
a consecutive-day streak. Habits are added, renamed, reordered, and deleted from
the plugin's settings tab.

## Installation

```bash
git clone <this repo> /path/to/vault/.obsidian/plugins/upkeep
cd /path/to/vault/.obsidian/plugins/upkeep
npm install
npm run build
```

Reload Obsidian, then enable **Upkeep** under Settings then Community plugins.

Open the panel from the ribbon icon, or via the command palette with "Open Upkeep panel".

If your vault is itself a git repository, add `.obsidian/plugins/upkeep/` to the vault's `.gitignore` so the two repos don't nest.

## Layout

| File | Contents |
| --- | --- |
| `main.ts` | Plugin entry point; owns saved data, registers the view and settings tab |
| `view.ts` | The sidebar panel; hosts child components |
| `timer.ts` | Pomodoro timer |
| `habits.ts` | Daily study habit tracker |
| `settings.ts` | Settings tab for editing the habit list |
| `types.ts` | Shared types and default saved data |

Habits and completions are stored in `data.json` in this folder. Timer state is in-memory only and resets when Obsidian reloads.
