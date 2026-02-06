import type { FC } from "react";
import { GameState, PlayerState, HistoryEntry, Game } from "../types";
import { EffectToAdd } from "../roles/types";
import { IconName } from "../../components/atoms/icon";

// ============================================================================
// INTENTS
// ============================================================================

export type KillIntent = {
    type: "kill";
    sourceId: string;
    targetId: string;
    cause: string;
};

export type NominateIntent = {
    type: "nominate";
    nominatorId: string;
    nomineeId: string;
};

export type ExecuteIntent = {
    type: "execute";
    playerId: string;
    cause: string;
};

export type Intent = KillIntent | NominateIntent | ExecuteIntent;

// ============================================================================
// STATE CHANGES
// ============================================================================

export type StateChanges = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    stateUpdates?: Partial<GameState>;
    addEffects?: Record<string, EffectToAdd[]>;
    removeEffects?: Record<string, string[]>;
};

// ============================================================================
// HANDLER RESULTS
// ============================================================================

export type HandlerResult =
    | { action: "allow"; stateChanges?: StateChanges }
    | { action: "prevent"; reason: string; stateChanges?: StateChanges }
    | { action: "redirect"; newIntent: Intent; stateChanges?: StateChanges }
    | {
          action: "request_ui";
          UIComponent: FC<PipelineInputProps>;
          resume: (result: unknown) => HandlerResult;
      };

// ============================================================================
// INTENT HANDLERS
// ============================================================================

export type IntentHandler = {
    intentType: Intent["type"] | Intent["type"][];
    priority: number;
    appliesTo: (
        intent: Intent,
        effectPlayer: PlayerState,
        state: GameState
    ) => boolean;
    handle: (
        intent: Intent,
        effectPlayer: PlayerState,
        state: GameState,
        game: Game
    ) => HandlerResult;
};

// ============================================================================
// PIPELINE RESULTS
// ============================================================================

export type PipelineInputProps = {
    state: GameState;
    intent: Intent;
    onComplete: (result: unknown) => void;
};

export type PipelineResult =
    | { type: "resolved"; stateChanges: StateChanges }
    | { type: "prevented"; stateChanges: StateChanges }
    | {
          type: "needs_input";
          UIComponent: FC<PipelineInputProps>;
          intent: Intent;
          resume: (result: unknown) => PipelineResult;
      };

// ============================================================================
// DAY ACTIONS
// ============================================================================

export type DayActionProps = {
    state: GameState;
    playerId: string;
    onComplete: (result: DayActionResult) => void;
    onBack: () => void;
};

export type DayActionResult = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    addEffects?: Record<string, EffectToAdd[]>;
    removeEffects?: Record<string, string[]>;
};

export type DayActionDefinition = {
    id: string;
    icon: IconName;
    // Functions receive the translations object and return localized strings
    getLabel: (t: Record<string, any>) => string;
    getDescription: (t: Record<string, any>) => string;
    condition: (player: PlayerState, state: GameState) => boolean;
    ActionComponent: FC<DayActionProps>;
};

// ============================================================================
// AVAILABLE DAY ACTION (resolved for UI)
// ============================================================================

export type AvailableDayAction = {
    id: string;
    playerId: string;
    icon: IconName;
    label: string;
    description: string;
    ActionComponent: FC<DayActionProps>;
};

// ============================================================================
// WIN CONDITIONS
// ============================================================================

export type WinConditionTrigger =
    | "after_execution"
    | "end_of_day"
    | "after_state_change";

export type WinConditionCheck = {
    trigger: WinConditionTrigger;
    check: (state: GameState, game: Game) => "townsfolk" | "demon" | null;
};
