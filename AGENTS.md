# Grimoire — Agent Manual

This is a **Blood on the Clocktower** narrator companion app built with React 18, TypeScript, Vite, Tailwind CSS, and Radix UI. It guides the narrator through all game phases — role revelation, night actions, day discussion, nominations, voting, and game-over. The narrator controls the device at all times and shows the screen to players when needed (no device passing).

This document explains every system in the codebase, how they interconnect, and the patterns you must follow when implementing new features.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Event-Sourced Game State](#2-event-sourced-game-state)
3. [The Game Controller](#3-the-game-controller)
4. [Roles](#4-roles)
5. [Effects](#5-effects)
6. [The Intent Pipeline](#6-the-intent-pipeline)
7. [The Perception System](#7-the-perception-system)
8. [Day Actions](#8-day-actions)
9. [Night Follow-Ups](#9-night-follow-ups)
10. [Win Conditions](#10-win-conditions)
11. [The Screen State Machine](#11-the-screen-state-machine)
12. [UI Components](#12-ui-components)
13. [Internationalization (i18n)](#13-internationalization-i18n)
14. [How to Implement a New Role](#14-how-to-implement-a-new-role)
15. [How to Implement a New Effect](#15-how-to-implement-a-new-effect)
16. [How to Add a New Intent Type](#16-how-to-add-a-new-intent-type)
17. [Testing](#17-testing)
18. [Rules and Anti-Patterns](#18-rules-and-anti-patterns)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      GameScreen.tsx                          │
│            (Screen state machine + UI orchestrator)          │
│                            │                                │
│    ┌───────────────────────┼──────────────────────────┐     │
│    │                       │                          │     │
│    ▼                       ▼                          ▼     │
│  Screens               game.ts                   Pipeline   │
│  (DayPhase,         (Game controller)          (Intent      │
│   NightAction,         │                      resolution,   │
│   Voting, ...)         │                      Perception)   │
│                        │                          │         │
│                        ▼                          │         │
│                   Event-sourced state             │         │
│                   (Game.history)                  │         │
│                        ▲                          │         │
│                        │                          │         │
│              ┌─────────┼─────────┐               │         │
│              │         │         │               │         │
│              ▼         ▼         ▼               ▼         │
│           Roles    Effects    Teams           Resolvers     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Event Sourcing** — Game state is never mutated directly. All changes are appended as `HistoryEntry` objects to `game.history`. Each entry contains an immutable `stateAfter` snapshot.

2. **Modularity through Pipelines** — Roles and effects do not reference each other's logic. Interactions happen through the **Intent Pipeline**: roles emit intents ("I want to kill this player"), and effects register handlers to intercept/modify/prevent them.

3. **Perception over Identity** — Information roles never check a player's actual role directly. They use the **Perception System** (`perceive()`), which allows effects to modify how a player is perceived (e.g., Recluse registering as evil).

4. **Effects carry behavior** — Roles are thin. Passive abilities live on **Effects** (attached to players at game start via `initialEffects`). Effects declare intent handlers, day actions, win conditions, and perception modifiers.

5. **No hardcoded role logic in the game controller** — `game.ts` knows nothing about individual roles. It orchestrates the game loop generically.

---

## 2. Event-Sourced Game State

**File:** `src/lib/types.ts`

### Core Types

```typescript
type Game = {
    id: string;
    name: string;
    createdAt: number;
    history: HistoryEntry[];    // The entire game state is here
};

type HistoryEntry = {
    id: string;
    timestamp: number;
    type: EventType;
    message: RichMessage;           // i18n-ready display messages
    data: Record<string, unknown>;  // Structured event data
    stateAfter: GameState;          // Full state snapshot after this event
};

type GameState = {
    phase: Phase;                   // "setup" | "night" | "day" | "voting" | "ended"
    round: number;                  // 0 = setup, 1+ = game rounds
    players: PlayerState[];
    winner: Team | null;
};

type PlayerState = {
    id: string;
    name: string;
    roleId: string;
    effects: EffectInstance[];      // All active effects on this player
};

type EffectInstance = {
    id: string;
    type: string;                   // References an EffectId
    data?: Record<string, unknown>; // Instance-specific data
    sourcePlayerId?: string;
    expiresAt?: "end_of_night" | "end_of_day" | "never";
};
```

### How State Evolves

The `Game` object is immutable. Every change creates a new `Game` by appending a `HistoryEntry`:

```typescript
game = addHistoryEntry(
    game,
    { type: "night_action", message: [...], data: {...} },  // entry
    { phase: "day" },                                        // state updates
    { [playerId]: [{ type: "safe", expiresAt: "end_of_night" }] },  // add effects
    { [playerId]: ["pure"] }                                 // remove effects
);
```

`getCurrentState(game)` returns `game.history.at(-1).stateAfter`.

### Event Types

The `EventType` enum tracks all possible history events: `game_created`, `night_started`, `role_revealed`, `night_action`, `night_skipped`, `night_resolved`, `day_started`, `nomination`, `vote`, `execution`, `virgin_execution`, `virgin_spent`, `slayer_shot`, `effect_added`, `effect_removed`, `game_ended`.

### Rich Messages

Messages use `RichMessage` (array of `MessagePart`), which support i18n keys, player references, role references, and effect references. The `RichMessage` component renders these parts with proper formatting.

---

## 3. The Game Controller

**File:** `src/lib/game.ts`

The game controller provides pure functions that take a `Game` and return a new `Game`. It has **zero knowledge of individual roles** — all role-specific behavior lives in role definitions and effects.

### Key Functions

| Function | Purpose |
|----------|---------|
| `createGame(name, players)` | Creates a game, applies `initialEffects` from roles |
| `getNextStep(game)` | Returns the next `GameStep` (role reveal, night action, day, etc.) |
| `startNight(game)` | Transitions to night phase, increments round |
| `startDay(game)` | Resolves night, announces deaths, expires effects, transitions to day |
| `applyNightAction(game, result)` | Applies direct history entries and effects from a role's night action |
| `nominate(game, nominatorId, nomineeId)` | Sends nomination through the Intent Pipeline |
| `resolveVote(game, nomineeId, votesFor, votesAgainst)` | Processes vote, executes if majority |
| `checkWinCondition(state, game)` | Checks core + dynamic win conditions |
| `checkEndOfDayWinConditions(state, game)` | Checks "end_of_day" trigger win conditions |
| `endGame(game, winner)` | Ends game with a winner |
| `addEffectToPlayer(game, playerId, effectType)` | Narrator manually adds an effect |
| `removeEffectFromPlayer(game, playerId, effectType)` | Narrator manually removes an effect |

### Night Action Flow

The night action flow is critical. When `applyNightAction()` is called:

1. **Direct changes** (entries, stateUpdates, addEffects, removeEffects) are applied immediately via `addHistoryEntry()`.
2. **The intent** (if present in `NightActionResult.intent`) is **NOT** processed here — it's handled separately by `GameScreen.tsx` via `resolveIntent()`.

This separation exists because the pipeline may return `needs_input` (requiring UI), which the game controller can't handle — only the React component can.

### Night Role Status

`getNightRolesStatus(game)` returns a list of `NightRoleStatus` entries for the current night, indicating which roles need to act and whether they've already done so:

```typescript
type NightRoleStatus = {
    roleId: string;
    playerId: string;
    playerName: string;
    status: "pending" | "done";
};
```

Only roles whose `shouldWake()` returns `true` (or is undefined) and who have a `nightOrder` appear in this list. Roles that don't need to wake are excluded entirely.

### Game Step Resolution

`getNextStep()` determines what happens next:

- In **night**: finds the next role (by `nightOrder`) that hasn't acted
- In **day**: returns `{ type: "day" }`
- Always checks `checkWinCondition()` first

---

## 4. Roles

**Files:** `src/lib/roles/types.ts`, `src/lib/roles/index.ts`, `src/lib/roles/definition/**`

### RoleDefinition

```typescript
type RoleDefinition = {
    id: RoleId;
    team: TeamId;                           // "townsfolk" | "outsider" | "minion" | "demon"
    icon: IconName;
    nightOrder: number | null;              // Lower = wakes earlier. null = doesn't wake
    shouldWake?: (game, player) => boolean; // Conditional waking
    initialEffects?: EffectToAdd[];         // Effects added at game creation
    winConditions?: WinConditionCheck[];    // Dynamic win conditions
    RoleReveal: FC<RoleRevealProps>;        // Component shown when player learns their role
    NightAction: FC<NightActionProps> | null; // Night action component (null = no action)
};
```

### Night Action Result

When a role's `NightAction` component calls `onComplete()`, it provides:

```typescript
type NightActionResult = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];  // History log
    stateUpdates?: Partial<GameState>;
    addEffects?: Record<string, EffectToAdd[]>;     // playerId -> effects to add
    removeEffects?: Record<string, string[]>;       // playerId -> effect types to remove
    intent?: Intent;                                // Optional intent for the pipeline
};
```

**Key:** `entries`, `stateUpdates`, `addEffects`, and `removeEffects` are applied **directly** (they are the role's own bookkeeping). The `intent` is sent through the **pipeline** for other effects to intercept.

### Role Categories

| Category | Example Roles | Pattern |
|----------|---------------|---------|
| **Action Roles** | Imp, Monk | Emit an intent or apply direct effects at night |
| **Info Roles (auto-calc)** | Chef, Empath | Calculate information using `perceive()`, display result |
| **Info Roles (narrator-setup)** | Washerwoman, Librarian, Investigator | Narrator selects players/roles to show, uses `perceive()` for highlighting and role display |
| **Info Roles (death-triggered)** | Ravenkeeper, Undertaker | Wake conditionally, show role using `perceive()` |
| **Passive Roles** | Virgin, Slayer, Mayor, Soldier, Saint | `NightAction: null`, behavior via `initialEffects` |

### Registering a New Role

1. Create file in `src/lib/roles/definition/` (or `definition/trouble-brewing/` for that script)
2. Add `RoleId` to the union type in `src/lib/roles/types.ts`
3. Import and register in `src/lib/roles/index.ts` (both `ROLES` and the relevant `SCRIPTS` entry)
4. Add translations in `src/lib/i18n/translations/en.ts` and `es.ts`

---

## 5. Effects

**Files:** `src/lib/effects/types.ts`, `src/lib/effects/index.ts`, `src/lib/effects/definition/*`

Effects are the primary mechanism for modular game behavior. They attach to players and can:
- Modify player state (dead, can't vote, can't nominate)
- Intercept game intents (prevent kills, redirect kills, prevent nominations)
- Register day actions (Slayer shot)
- Register night follow-ups (reactive night actions, e.g., role change reveals)
- Register win conditions (Saint/Martyrdom, Mayor peaceful victory)
- Modify perception (how info roles see the player)

### EffectDefinition

```typescript
type EffectDefinition = {
    id: EffectId;
    icon: IconName;

    // Behavior modifiers (simple boolean flags)
    preventsNightWake?: boolean;
    poisonsAbility?: boolean;      // Used for Drunk/Poisoner — info roles give wrong info
    preventsVoting?: boolean;
    preventsNomination?: boolean;

    // Conditional behavior
    canVote?: (player, state) => boolean;
    canNominate?: (player, state) => boolean;

    // Pipeline integration
    handlers?: IntentHandler[];             // Intercept/modify intents
    dayActions?: DayActionDefinition[];     // Register day-phase abilities
    nightFollowUps?: NightFollowUpDefinition[];  // Register reactive night-phase actions
    winConditions?: WinConditionCheck[];    // Register custom win conditions
    perceptionModifiers?: PerceptionModifier[];  // Alter perceived identity
};
```

### Current Effects

| Effect | Applied By | Purpose | Pipeline Features |
|--------|-----------|---------|-------------------|
| `dead` | Pipeline/game | Player is dead | `preventsNightWake`, conditional voting |
| `used_dead_vote` | game.ts | Dead player used their one vote | `preventsVoting` |
| `safe` | Soldier (permanent), Monk (nightly) | Protection from death | `handlers`: prevents kill intents |
| `red_herring` | Fortune Teller | False positive for FT checks | No handlers (checked directly by FT) |
| `pure` | Virgin | Townsfolk nominators get executed | `handlers`: intercepts nominations |
| `slayer_bullet` | Slayer | One-shot day kill | `dayActions`: SlayerActionScreen |
| `bounce` | Mayor | Redirects kills to another player | `handlers`: requests UI, redirects kill |
| `martyrdom` | Saint | Evil wins if executed | `winConditions`: after_execution |
| `scarlet_woman` | Scarlet Woman | Becomes Demon when Demon dies | `handlers`: piggybacks role change + `pending_role_reveal` |
| `pending_role_reveal` | Scarlet Woman handler (or any role-changing effect) | Signals a role change needs to be revealed | `nightFollowUps`: shows RoleCard to narrator |

### Effect Lifecycle

- **Creation**: Added via `initialEffects` on role definition, or via `addEffects` in night action results / pipeline state changes
- **Expiration**: Effects can expire at `"end_of_night"`, `"end_of_day"`, or `"never"`. Expiration is handled by `expireEffects()` in `game.ts` during phase transitions.
- **Manual management**: The narrator can add/remove effects via the Grimoire UI (`EditEffectsModal`)

### Registering a New Effect

1. Create file in `src/lib/effects/definition/`
2. Add `EffectId` to the union type in `src/lib/effects/types.ts`
3. Import and register in `src/lib/effects/index.ts`
4. Add translations in `src/lib/i18n/translations/en.ts` and `es.ts`

---

## 6. The Intent Pipeline

**Files:** `src/lib/pipeline/types.ts`, `src/lib/pipeline/index.ts`, `src/lib/pipeline/resolvers.ts`

The Intent Pipeline is the core mechanism for decoupled role/effect interactions. Instead of roles checking for other roles' effects directly, they emit **Intents** that flow through a pipeline of **Handlers**.

### Intent Types

```typescript
type KillIntent = { type: "kill"; sourceId: string; targetId: string; cause: string };
type NominateIntent = { type: "nominate"; nominatorId: string; nomineeId: string };
type ExecuteIntent = { type: "execute"; playerId: string; cause: string };
type Intent = KillIntent | NominateIntent | ExecuteIntent;
```

### Pipeline Flow

```
  Role emits Intent
        │
        ▼
  collectActiveHandlers()     ← Gathers handlers from ALL players' active effects
        │
        ▼
  Sort by priority (ascending — lower numbers run first)
        │
        ▼
  ┌─── For each handler where appliesTo() returns true: ─────┐
  │                                                           │
  │   handler.handle() returns HandlerResult:                 │
  │                                                           │
  │   "allow"     → merge stateChanges, continue pipeline     │
  │   "prevent"   → merge stateChanges, stop pipeline         │
  │   "redirect"  → merge stateChanges, restart with new      │
  │                  intent (re-collects handlers)             │
  │   "request_ui" → pause pipeline, show UI component,       │
  │                   resume with narrator's input             │
  └───────────────────────────────────────────────────────────┘
        │
        ▼ (if no handler prevented)
  Default Resolver runs
        │
        ▼
  PipelineResult returned (resolved | prevented | needs_input)
```

### IntentHandler

```typescript
type IntentHandler = {
    intentType: Intent["type"] | Intent["type"][];   // Which intents to handle
    priority: number;                                 // Lower = runs first
    appliesTo: (intent, effectPlayer, state) => boolean;  // Guard condition
    handle: (intent, effectPlayer, state, game) => HandlerResult;  // Logic
};
```

### HandlerResult

```typescript
type HandlerResult =
    | { action: "allow"; stateChanges?: StateChanges }
    | { action: "prevent"; reason: string; stateChanges?: StateChanges }
    | { action: "redirect"; newIntent: Intent; stateChanges?: StateChanges }
    | { action: "request_ui"; UIComponent: FC<PipelineInputProps>; resume: (result: unknown) => HandlerResult };
```

### StateChanges

The unified structure for describing changes across the pipeline:

```typescript
type StateChanges = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    stateUpdates?: Partial<GameState>;
    addEffects?: Record<string, EffectToAdd[]>;
    removeEffects?: Record<string, string[]>;
};
```

Multiple `StateChanges` from different handlers are merged via `mergeStateChanges()`.

### Default Resolvers

**File:** `src/lib/pipeline/resolvers.ts`

If no handler prevents an intent, a **default resolver** runs:

| Intent | Default Resolver |
|--------|-----------------|
| `kill` | Adds `dead` effect to target |
| `nominate` | Creates nomination entry, transitions to voting phase |
| `execute` | Creates execution entry, adds `dead` effect |

### Priority Conventions

| Priority | Use Case |
|----------|----------|
| 1-5 | Redirect handlers (Bounce) — run before protection so redirect happens first |
| 6-10 | Protection handlers (Safe) — can prevent after redirect |
| 11-20 | Modification handlers — alter intent details |
| 21+ | Observation handlers — react without changing |

### Example: Kill Intent Flow (Imp → Bounce → Safe)

1. **Imp** emits `{ type: "kill", sourceId: "imp", targetId: "mayor", cause: "demon" }`
2. Pipeline collects handlers: **Bounce** (priority 5), **Safe** (priority 10)
3. **Bounce** handler: target has bounce effect → returns `request_ui` with `BounceRedirectUI`
4. Narrator selects new target → `resume()` called → returns `redirect` with new target
5. Pipeline restarts with new intent `{ ...kill, targetId: "newTarget" }`
6. **Safe** handler: if new target has safe effect → returns `prevent`; otherwise continues
7. If not prevented: default resolver adds `dead` effect to target

### How to add a new intent type

1. Add the intent type to the `Intent` union in `pipeline/types.ts`
2. Add a default resolver in `pipeline/resolvers.ts`
3. Emit the intent from the appropriate role or game function

---

## 7. The Perception System

**Files:** `src/lib/pipeline/perception.ts`, `src/lib/pipeline/types.ts`

The Perception System decouples information-gathering roles from roles that alter their perceived identity (Recluse, Spy, etc.).

### Core Concept

Information roles never check `getRole(player.roleId).team` directly. Instead, they call:

```typescript
const perception = perceive(targetPlayer, observerPlayer, context, state);
// perception = { roleId, team, alignment }
```

This starts with the target's actual identity, then applies **perception modifiers** from the target's active effects.

### Perception Types

```typescript
type PerceptionContext = "alignment" | "team" | "role";

type Perception = {
    roleId: string;          // What role they appear to be
    team: TeamId;            // What team they appear on
    alignment: "good" | "evil"; // What alignment they appear to have
};

type PerceptionModifier = {
    context: PerceptionContext | PerceptionContext[];  // When to apply
    observerRoles?: string[];  // Optional: only for specific observer roles
    modify: (
        perception: Perception,
        targetPlayer: PlayerState,
        observerPlayer: PlayerState,
        state: GameState,
        effectData?: Record<string, unknown>  // Data from the EffectInstance
    ) => Perception;
};
```

### PerceptionContext

| Context | Used By | What It Queries |
|---------|---------|-----------------|
| `"alignment"` | Chef, Empath | Is this player good or evil? |
| `"team"` | Washerwoman, Librarian, Investigator | What team is this player on? |
| `"role"` | Fortune Teller, Undertaker, Ravenkeeper | What specific role is this player? |

### How Roles Use Perception

**Auto-calculating roles** (Chef, Empath):
```typescript
const perception = perceive(targetPlayer, chefPlayer, "alignment", state);
const isEvil = perception.alignment === "evil";
```

**Narrator-setup roles** (Washerwoman, Librarian, Investigator):
```typescript
// For team highlighting in player lists:
const perception = perceive(p, observerPlayer, "team", state);
const registersTownsfolk = perception.team === "townsfolk";

// For role display in step 2:
const pPerception = perceive(p, observerPlayer, "role", state);
const perceivedRole = getRole(pPerception.roleId);
```

**Role-reveal roles** (Undertaker, Ravenkeeper):
```typescript
const perception = perceive(executedPlayer, undertakerPlayer, "role", state);
const executedRole = getRole(perception.roleId);
```

### How to Add Perception Modifiers

On an `EffectDefinition`, add `perceptionModifiers`. Example for a hypothetical "misregister" effect:

```typescript
perceptionModifiers: [{
    context: ["alignment", "team", "role"],
    modify: (perception, _target, _observer, _state, effectData) => {
        const overrides = effectData?.perceiveAs as Partial<Perception> | undefined;
        if (!overrides) return perception;
        return { ...perception, ...overrides };
    },
}]
```

The narrator would configure the effect's instance data when assigning it (e.g., `{ perceiveAs: { team: "minion", alignment: "evil", roleId: "poisoner" } }`).

---

## 8. Day Actions

Day actions are abilities that can be used during the day phase. They are registered on effects via `dayActions`.

### DayActionDefinition

```typescript
type DayActionDefinition = {
    id: string;
    icon: IconName;
    getLabel: (t) => string;         // i18n label
    getDescription: (t) => string;   // i18n description
    condition: (player, state) => boolean;  // When is this action available?
    ActionComponent: FC<DayActionProps>;    // The UI for this action
};

type DayActionProps = {
    state: GameState;
    playerId: string;
    onComplete: (result: DayActionResult) => void;
    onBack: () => void;
};

type DayActionResult = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    addEffects?: Record<string, EffectToAdd[]>;
    removeEffects?: Record<string, string[]>;
};
```

### How Day Actions Are Collected

`getAvailableDayActions(state, t)` in `pipeline/index.ts` iterates over all players' effects, checks each `DayActionDefinition.condition`, and returns an `AvailableDayAction[]` array. `DayPhase.tsx` renders these as buttons.

### Current Day Actions

- **Slayer Shot** (`slayer_bullet` effect): Allows the Slayer to attempt to kill a player during the day

---

## 9. Night Follow-Ups

**Files:** `src/lib/pipeline/types.ts`, `src/lib/pipeline/index.ts`

Night follow-ups are reactive actions that appear in the Night Dashboard during the night phase. They are registered on effects via `nightFollowUps`, following the same pattern as `dayActions`. Follow-ups are used for consequences of night events — e.g., the Scarlet Woman needs a role change reveal after the Demon dies.

### NightFollowUpDefinition

```typescript
type NightFollowUpDefinition = {
    id: string;
    icon: IconName;
    getLabel: (t) => string;                               // i18n label
    condition: (player, state, game) => boolean;            // When is this follow-up needed?
    ActionComponent: FC<NightFollowUpProps>;                // The UI for this follow-up
};

type NightFollowUpProps = {
    state: GameState;
    game: Game;
    playerId: string;
    onComplete: (result: NightFollowUpResult) => void;
};

type NightFollowUpResult = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    addEffects?: Record<string, EffectToAdd[]>;
    removeEffects?: Record<string, string[]>;
};
```

### How Night Follow-Ups Are Collected

`getAvailableNightFollowUps(state, game, t)` in `pipeline/index.ts` iterates over all players' effects, checks each `NightFollowUpDefinition.condition`, and returns an `AvailableNightFollowUp[]` array. The `NightDashboard` merges these with regular night actions into a unified list.

### How Night Follow-Ups Work

1. An effect handler creates a consequence (e.g., Scarlet Woman handler changes the player's role)
2. The handler also adds an effect with `nightFollowUps` (e.g., `pending_role_reveal`)
3. When the Night Dashboard re-renders, `getAvailableNightFollowUps()` picks up the new follow-up
4. The follow-up appears as a clickable item in the night action list (with distinct purple styling)
5. The narrator taps it, the follow-up's `ActionComponent` renders
6. On completion, the result is applied (history entries, effect removal) and the dashboard updates

### Key Design: Follow-ups disappear when done

Follow-ups are condition-based. When a follow-up's `ActionComponent` calls `onComplete`, it typically removes the effect that triggered it (e.g., `removeEffects: { [playerId]: ["pending_role_reveal"] }`). This causes the condition to become false, so the follow-up no longer appears in the list. This is consistent with how `dayActions` work — the Slayer bullet disappears after use.

### Current Night Follow-Ups

| Follow-Up | Effect | Trigger | Purpose |
|-----------|--------|---------|---------|
| Role Change Reveal | `pending_role_reveal` | Added by Scarlet Woman handler when Demon dies | Shows the player's new RoleCard so the narrator can reveal the role change |

### The `pending_role_reveal` pattern

This is a **generic, reusable effect** for any role change. Any effect handler that changes a player's role should add `pending_role_reveal` to that player:

```typescript
// In a handler's stateChanges:
addEffects: {
    [playerId]: [{ type: "pending_role_reveal", expiresAt: "never" }],
},
changeRoles: {
    [playerId]: newRoleId,
},
```

The `pending_role_reveal` effect's `nightFollowUp` has `condition: () => true` — if the effect exists, the reveal is needed. The follow-up's `ActionComponent` shows a RoleCard with "Your role has changed!" and creates a `role_change_revealed` history entry on completion.

---

## 10. Win Conditions

Win conditions are checked at multiple points during the game.

### Core Win Conditions (in `game.ts`)

1. **Good wins** if all demons are dead
2. **Evil wins** if only 2 players remain (and one is a demon)

### Dynamic Win Conditions

Effects and roles can declare `winConditions`:

```typescript
type WinConditionTrigger = "after_execution" | "end_of_day" | "after_state_change";

type WinConditionCheck = {
    trigger: WinConditionTrigger;
    check: (state: GameState, game: Game) => "townsfolk" | "demon" | null;
};
```

`checkDynamicWinConditions()` in `pipeline/index.ts` iterates over all players' effects and roles, checking win conditions that match the given triggers.

### Current Dynamic Win Conditions

| Source | Trigger | Condition |
|--------|---------|-----------|
| `martyrdom` effect (Saint) | `after_execution` | Evil wins if player with martyrdom is executed |
| `mayor` role | `end_of_day` | Good wins if 3 alive, no execution today, Mayor alive |

---

## 11. The Screen State Machine

**File:** `src/components/screens/GameScreen.tsx`

`GameScreen` is the central orchestrator. It maintains a `screen` state that determines what UI is shown.

### Screen Types

```
role_revelation → showing_role (tap player to show role card)
night_dashboard → night_action (process a role's night action)
                → night_follow_up (process a reactive follow-up, e.g., role change reveal)
                → pipeline_input (when pipeline requests UI during night action resolution)
day → nomination → voting
    → day_action
    → pipeline_input
game_over
grimoire_role_card (from grimoire modal, returns to previous screen)
```

### Night Dashboard Flow

The Night Dashboard (`NightDashboard.tsx`) is the central hub for the night phase. It displays a unified list of:
1. **Regular night actions** — from `getNightRolesStatus(game)` (roles with `nightOrder`)
2. **Night follow-ups** — from `getAvailableNightFollowUps(state, game, t)` (reactive actions from effects)

The list is ordered: regular actions first (by `nightOrder`), follow-ups appended at the end. Only the next pending item is clickable. `allDone` is derived from the combined list — no pending items means the narrator can proceed to day.

### Critical Flow: Night Action → Pipeline

```
1. Narrator taps next action in Night Dashboard
2. Screen transitions to "night_action" with playerId + roleId
3. NightAction component renders, narrator/player interacts
4. NightAction calls onComplete(result)
5. applyNightAction(game, result) — applies direct changes
6. If result.intent exists:
   - resolveIntent(intent, state, game) — runs pipeline
   - processPipelineResult(result) handles the outcome:
     * "resolved" → applyPipelineChanges(), check win, return to dashboard
     * "prevented" → applyPipelineChanges(), check win, return to dashboard
     * "needs_input" → show pipeline_input screen with UIComponent
7. If no intent: check win, return to dashboard
```

### Night Follow-Up Flow

```
1. Narrator taps a follow-up item in Night Dashboard
2. Screen transitions to "night_follow_up" with the AvailableNightFollowUp data
3. The follow-up's ActionComponent renders (e.g., RoleCard for role change reveal)
4. ActionComponent calls onComplete(result)
5. Result is applied via applyPipelineChanges() (entries, effects)
6. Screen returns to night_dashboard — follow-up disappears from list
```

### Pipeline Input Screen

When the pipeline returns `needs_input`:
1. `pipelineUI` state is set with the `UIComponent`, `intent`, and `resume` callback
2. The screen type becomes `pipeline_input`
3. The component renders, narrator makes a choice
4. `onComplete` calls `resume()` which returns a new `PipelineResult`
5. `processPipelineResult()` handles the new result (may chain into more UI)

---

## 12. UI Components

### Component Hierarchy

```
atoms/     → Basic primitives: Button, Icon, Badge, Card, Dialog
inputs/    → Form elements: PlayerSelector, SelectablePlayerItem, VoteButton
items/     → Game-specific: Grimoire, RoleCard, EditEffectsModal, BounceRedirectUI
layouts/   → Screen wrappers: NightActionLayout, NarratorSetupLayout
screens/   → Full screens: GameScreen, RoleRevelationScreen, NightDashboard,
              DayPhase, VotingPhase, NominationScreen
```

### Layout Components

**`NightActionLayout`** — For showing information to the player. Used by info roles (Chef, Empath, etc.) and the Ravenkeeper. Renders with player info, title, description, and children.

**`NarratorSetupLayout`** — For narrator-only setup screens. Used by Washerwoman, Librarian, Investigator, Fortune Teller. Has a "Show to Player" button to transition from narrator setup to player view.

### Icon System

**File:** `src/components/atoms/icon.tsx`

Icons are referenced by `IconName` string. The `Icon` component maps these to Lucide React icons. When adding new roles or effects, check if the needed icon exists in the `IconName` type. Add new Lucide icon mappings if needed.

---

## 13. Internationalization (i18n)

**Files:** `src/lib/i18n/`

### Usage

```typescript
const { t } = useI18n();
// t.game.choosePlayerToKill, t.roles.imp.name, t.effects.dead.name, etc.
```

### Structure

Translations are organized under keys: `common`, `mainMenu`, `newGame`, `game`, `teams`, `roles`, `effects`, `ui`, `history`, `scripts`.

Every role needs entries in `t.roles[roleId]` with at least `name` and `description`. Every effect needs entries in `t.effects[effectId]` with at least `name`.

### Adding Translations

When adding a new role or effect, add translations in **both** `src/lib/i18n/translations/en.ts` and `src/lib/i18n/translations/es.ts`. Update the `Translations` type in `src/lib/i18n/types.ts` if adding new top-level keys.

---

## 14. How to Implement a New Role

### Step-by-step

1. **Decide the behavior category:**
   - Does it have a night action? → Implement `NightAction` component
   - Is it purely passive? → Set `NightAction: null`, implement behavior via effects
   - Does it gather information? → Use `perceive()` in the night action

2. **Create the role definition file:**
   - Place in `src/lib/roles/definition/trouble-brewing/` (or the relevant script folder)
   - Export a `const definition: RoleDefinition` as default

3. **Register the role:**
   - Add the role ID to the `RoleId` union in `src/lib/roles/types.ts`
   - Import and add to `ROLES` in `src/lib/roles/index.ts`
   - Add to the relevant script in `SCRIPTS`

4. **Create effects if needed:**
   - If the role has passive abilities, create effect definitions
   - Register effects in `src/lib/effects/index.ts` and `types.ts`
   - Add effect to `initialEffects` on the role definition

5. **Add translations:**
   - Add to `en.ts` and `es.ts` under `roles[roleId]`
   - Add effect translations if new effects were created

6. **Never modify `game.ts`** for role-specific logic. Use effects and the pipeline instead.

### Example: Implementing a Poisoner (hypothetical)

```typescript
// src/lib/effects/definition/Poisoned.ts
const definition: EffectDefinition = {
    id: "poisoned",
    icon: "flask",
    poisonsAbility: true,      // Info roles give wrong info when poisoned
    perceptionModifiers: [{     // Could alter how the poisoned player is perceived
        context: ["alignment", "team", "role"],
        modify: (perception, _t, _o, _s, effectData) => {
            // Narrator configures what the poisoned player registers as
            const overrides = effectData?.perceiveAs as Partial<Perception> | undefined;
            return overrides ? { ...perception, ...overrides } : perception;
        }
    }],
};

// src/lib/roles/definition/trouble-brewing/Poisoner.tsx
const definition: RoleDefinition = {
    id: "poisoner",
    team: "minion",
    icon: "flask",
    nightOrder: 5,  // Before info roles
    NightAction: ({ state, player, onComplete }) => {
        // Select a player to poison
        // On confirm: add "poisoned" effect (expires end_of_night) to target
        onComplete({
            entries: [{ type: "night_action", message: [...], data: {...} }],
            addEffects: {
                [targetId]: [{ type: "poisoned", expiresAt: "end_of_night" }]
            },
        });
    },
};
```

---

## 15. How to Implement a New Effect

### Step-by-step

1. **Create the effect definition** in `src/lib/effects/definition/`
2. **Register it:**
   - Add to `EffectId` union in `src/lib/effects/types.ts`
   - Import and register in `src/lib/effects/index.ts`
3. **Add translations** in both language files
4. **Wire it up** — assign to a role via `initialEffects`, or add dynamically via `addEffects` in night actions

### When to use each capability

| I want to... | Use... |
|--------------|--------|
| Prevent a player from being killed | `handlers` with `intentType: "kill"`, return `{ action: "prevent" }` |
| Redirect a kill to someone else | `handlers` with `intentType: "kill"`, return `{ action: "redirect" }` |
| Need narrator input during pipeline | `handlers` returning `{ action: "request_ui" }` |
| Give a player a day-phase ability | `dayActions` with condition + ActionComponent |
| React to a night event with a follow-up action | `nightFollowUps` with condition + ActionComponent |
| Show a role change reveal after transformation | Add `pending_role_reveal` effect (it has a built-in `nightFollowUp`) |
| Create a custom win condition | `winConditions` with trigger + check |
| Make a player register differently to info roles | `perceptionModifiers` |
| Prevent a player from waking at night | `preventsNightWake: true` |
| Make info roles give wrong results | `poisonsAbility: true` |
| Prevent voting | `preventsVoting: true` or `canVote` function |

---

## 16. How to Add a New Intent Type

If you need a new category of game action that should be interceptable:

1. **Define the intent type** in `src/lib/pipeline/types.ts`:
   ```typescript
   type MyNewIntent = { type: "my_new"; /* fields */ };
   ```
   Add it to the `Intent` union.

2. **Add a default resolver** in `src/lib/pipeline/resolvers.ts`:
   ```typescript
   function resolveMyNew(intent: Intent, state: GameState): StateChanges { ... }
   // Add to the resolvers record
   ```

3. **Emit the intent** from the relevant role or game function.

4. **Optionally add effect handlers** that intercept this new intent type.

---

## 17. Testing

**Framework:** Vitest (integrated with Vite)

### Running Tests

```bash
# Run all tests
pnpm test

# Run a specific test file
pnpm test src/lib/roles/definition/trouble-brewing/Chef.test.ts

# Run tests matching a pattern
pnpm test Chef
```

Tests are configured in `vite.config.ts` to include `src/**/*.test.{ts,tsx}`.

### Test Structure

Tests are co-located with the files they test:

```
src/lib/
├── __tests__/
│   ├── helpers.ts              # Shared test utilities (makePlayer, makeState, etc.)
│   ├── game.test.ts            # Game controller integration tests
│   ├── pipeline.test.ts        # Intent pipeline integration tests
│   ├── perception.test.ts      # Perception system tests
│   ├── effects.test.ts         # Effect handler integration tests
│   ├── winConditions.test.ts   # Win condition tests
│   └── nightFollowUps.test.ts  # Night follow-up collection + integration tests
├── roles/definition/
│   ├── Imp.test.ts
│   └── trouble-brewing/
│       ├── Chef.test.ts
│       ├── Empath.test.ts
│       └── ...
└── effects/definition/
    ├── Safe.test.ts
    ├── Pure.test.ts
    ├── PendingRoleReveal.test.ts
    └── ...
```

### What to Test

Tests must validate **features and behavior**, not definition metadata. Do not test `id`, `team`, `icon`, `nightOrder`, or other static properties.

| Category | What to test |
|----------|-------------|
| **Information roles** (Chef, Empath, Washerwoman, etc.) | `shouldWake` conditions, perception integration including **deception** (false positives and false negatives via perception modifiers) |
| **Action roles** (Imp, Monk) | `shouldWake` conditions |
| **Passive roles** (Soldier, Virgin, Slayer, Saint) | Nothing — just an empty test delegating to the corresponding effect test file |
| **Role win conditions** (Mayor) | The `check` function with various game states (trigger conditions, edge cases) |
| **Effect handlers** (Safe, Pure, Bounce, ScarletWoman) | `appliesTo` guard, `handle` logic (action type, stateChanges, history entries) |
| **Effect day actions** (SlayerBullet) | `condition` function (alive checks, effect presence) |
| **Effect night follow-ups** (PendingRoleReveal) | `condition` function, metadata (id, icon), `ActionComponent` presence, integration with `getAvailableNightFollowUps()` |
| **Effect win conditions** (Martyrdom) | `check` function with matching and non-matching history entries |
| **Effect behavior flags** (Dead, UsedDeadVote) | `canVote`, `canNominate`, `preventsNightWake`, etc. |

### Testing Perception Deception

To test that information roles handle deception correctly (e.g., a Recluse appearing evil to the Chef), mock `getEffect` to inject a test effect with perception modifiers:

```typescript
import { vi } from "vitest";
import { EffectDefinition, EffectId } from "../../../effects/types";

vi.mock("../../../effects", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        getEffect: (effectId: string) => {
            if (testEffects[effectId]) return testEffects[effectId];
            return (actual.getEffect as (id: string) => EffectDefinition | undefined)(effectId);
        },
    };
});

const testEffects: Record<string, EffectDefinition> = {};

// In tests:
testEffects["appears_evil"] = {
    id: "appears_evil" as EffectId,
    icon: "user",
    perceptionModifiers: [{
        context: "alignment",
        modify: (p) => ({ ...p, alignment: "evil" }),
    }],
};
const player = addEffectTo(makePlayer({ roleId: "villager" }), "appears_evil");
// Now `perceive(player, observer, "alignment", state).alignment` === "evil"
```

Always test both directions:
- **False positive**: a good player appearing evil/wrong team
- **False negative**: an evil player appearing good/different team

### Test Helpers

`src/lib/__tests__/helpers.ts` provides:

| Helper | Purpose |
|--------|---------|
| `makePlayer({ id, roleId, ... })` | Creates a `PlayerState` |
| `addEffectTo(player, effectType, data?, expiresAt?)` | Returns a new player with the effect added |
| `makeState({ phase, round, players })` | Creates a `GameState` |
| `makeGame(state?)` | Creates a `Game` with a single history entry |
| `makeGameWithHistory(entries, baseState?)` | Creates a `Game` with specific history entries |
| `makeStandardPlayers()` | Creates a standard 5-player set |
| `resetPlayerCounter()` | Resets the auto-incrementing player counter (call in `beforeEach`) |

### Empty Tests

If a role or effect has no testable behavior of its own (e.g., Villager, or roles whose behavior is entirely on a separate effect), create a minimal test:

```typescript
import { it, expect } from "vitest";

it("Villager has no testable features", () => {
    expect(true);
});
```

### After Modifying Code

Always run lints after editing files to catch issues:

```bash
# Check lints on modified files (use ReadLints tool in Cursor)
# Then run the full test suite
pnpm test
```

Tests run as a required step in the CI/CD pipeline (`.github/workflows/deploy.yml`) before building. A failing test will block deployment.

---

## 18. Rules and Anti-Patterns

### DO

- **Use `perceive()` in all information roles** — never check `getRole(player.roleId).team` directly when gathering information for a player ability.
- **Emit intents for any action that should be interceptable** — kills, nominations, executions. Don't apply state changes directly if other effects might need to react.
- **Put passive abilities on effects, not roles** — the role definition should be thin. Use `initialEffects` to attach behavior.
- **Return `stateChanges` from handlers** — don't modify game state directly inside a handler. Return the changes and let the pipeline merge and apply them.
- **Use `expiresAt` for temporary effects** — Monk's protection expires at `"end_of_night"`. Don't manually track removal.
- **Add history entries for every significant action** — the game's undo/history system depends on the event log being complete.
- **Use i18n keys for all user-facing text** — never hardcode English strings in components.

### DON'T

- **Never add role-specific logic to `game.ts`** — if you find yourself writing `if (roleId === "my_role")` in the game controller, you're doing it wrong. Use effects and the pipeline.
- **Never import one role from another role's definition** — roles must be completely independent. Use effects and the pipeline for interactions.
- **Never import effect definitions from role definitions** — roles can import from `effects/types.ts` for type info, but should not import specific effect definitions.
- **Never mutate state** — always return new objects. The event-sourced architecture depends on immutability.
- **Never skip the pipeline for interceptable actions** — even if there are currently no handlers for an intent type, still use the pipeline. Future effects may need to intercept it.
- **Never check `player.roleId` to determine team/alignment in info role logic** — always use `perceive()`. Direct checks bypass the perception system.
- **Never hardcode effect checks in `GameScreen.tsx`, `DayPhase.tsx`, or `NightDashboard.tsx`** — use `getAvailableDayActions()`, `getAvailableNightFollowUps()`, and `checkDynamicWinConditions()` instead.

### Handler Priority Guidelines

- **1-5**: Redirects (change the target before anything else checks)
- **6-10**: Protection (prevent the action)
- **11-20**: Modification (alter details without preventing)
- **21+**: Observation (react without changing the outcome)

### File Naming Conventions

- Role definitions: PascalCase matching the role name (e.g., `FortuneTeller.tsx`)
- Effect definitions: PascalCase matching the effect name (e.g., `SlayerBullet.ts`)
- Roles with UI use `.tsx`; effects without UI use `.ts`
- Components: PascalCase (e.g., `BounceRedirectUI.tsx`)

### Import Guidelines

- Roles can import from: `../types`, `../../types`, `../../i18n`, `../index` (for `getRole`), `../../pipeline` (for `perceive`), and UI components
- Effects can import from: `../types`, `../../pipeline/types`, `../../types`, and UI components (for `request_ui`)
- Pipeline can import from: `../types`, `../effects`, `../roles/index`, `../teams`
- `game.ts` can import from: `./types`, `./roles`, `./pipeline`, `./roles/types`
