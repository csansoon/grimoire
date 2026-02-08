import type { FC } from "react";
import { GameState, PlayerState, HistoryEntry, Game } from "../types";
import { EffectToAdd } from "../roles/types";
import { IconName } from "../../components/atoms/icon";
import { TeamId } from "../teams/types";

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
    changeRoles?: Record<string, string>; // playerId -> new roleId
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
// NIGHT FOLLOW-UPS
// ============================================================================

/**
 * Props for a night follow-up's action component.
 * Similar to DayActionProps but includes game context for history checks.
 */
export type NightFollowUpProps = {
    state: GameState;
    game: Game;
    playerId: string;
    onComplete: (result: NightFollowUpResult) => void;
};

/**
 * Result of a night follow-up action.
 * Applied the same way as DayActionResult — entries and effect changes.
 */
export type NightFollowUpResult = {
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    addEffects?: Record<string, EffectToAdd[]>;
    removeEffects?: Record<string, string[]>;
};

/**
 * Defines a follow-up action that can be triggered during the night phase
 * by an effect. Modeled after DayActionDefinition.
 *
 * Follow-ups appear as items in the Night Dashboard when their condition
 * is met. They are used for reactive behaviors like role change reveals
 * (e.g., Scarlet Woman becoming the Demon after the Imp kills itself).
 */
export type NightFollowUpDefinition = {
    id: string;
    icon: IconName;
    getLabel: (t: Record<string, any>) => string;
    condition: (player: PlayerState, state: GameState, game: Game) => boolean;
    ActionComponent: FC<NightFollowUpProps>;
};

/**
 * A resolved night follow-up ready for the UI.
 */
export type AvailableNightFollowUp = {
    id: string;
    playerId: string;
    playerName: string;
    icon: IconName;
    label: string;
    ActionComponent: FC<NightFollowUpProps>;
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

// ============================================================================
// PERCEPTION
// ============================================================================

/**
 * What aspect of a player is being queried by an information role.
 *
 * - "alignment": Is this player good or evil? (Chef, Empath)
 * - "team":      What team does this player belong to? (Washerwoman, Librarian, Investigator)
 * - "role":      What specific role is this player? (Undertaker, Fortune Teller)
 */
export type PerceptionContext = "alignment" | "team" | "role";

/**
 * The result of perceiving a player — what an information role "sees".
 * This may differ from the player's actual role/team/alignment due to
 * perception modifiers (e.g., Recluse registering as evil, Spy registering as good).
 */
export type Perception = {
    roleId: string;
    team: TeamId;
    alignment: "good" | "evil";
};

/**
 * A modifier declared on an EffectDefinition that can alter how the
 * player carrying this effect is perceived by information roles.
 *
 * Examples:
 * - Recluse: registers as evil/minion/demon to info abilities
 * - Spy: registers as good/townsfolk/outsider to info abilities
 */
export type PerceptionModifier = {
    /** Which perception contexts this modifier applies to. */
    context: PerceptionContext | PerceptionContext[];

    /**
     * Optional: restrict this modifier to specific observer roles.
     * If omitted, applies to all information roles.
     */
    observerRoles?: string[];

    /**
     * Transform the perception. Receives the current perception (which may
     * already be modified by earlier modifiers), the target player, the
     * observer player, the game state, and the effect instance data.
     */
    modify: (
        perception: Perception,
        targetPlayer: PlayerState,
        observerPlayer: PlayerState,
        state: GameState,
        effectData?: Record<string, unknown>
    ) => Perception;
};
