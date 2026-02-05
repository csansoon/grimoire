import { GameState, PlayerState, HistoryEntry } from "../types";
import { IconName } from "../../components/atoms/icon";
import { TeamId } from "../teams";

// ============================================================================
// EFFECT TYPES
// ============================================================================

export type EffectToAdd = {
    type: string;
    data?: Record<string, unknown>;
    expiresAt?: "end_of_night" | "end_of_day" | "never";
};

// ============================================================================
// NIGHT ACTION PROPS
// ============================================================================

export type NightActionProps = {
    state: GameState;
    player: PlayerState;
    onComplete: (result: NightActionResult) => void;
};

export type NightActionResult = {
    // The events to add to history
    entries: Omit<HistoryEntry, "id" | "timestamp" | "stateAfter">[];
    // Updates to apply to the game state
    stateUpdates?: Partial<GameState>;
    // Effects to add to players (playerId -> effects to add)
    addEffects?: Record<string, EffectToAdd[]>;
    // Effects to remove from players (playerId -> effect types to remove)
    removeEffects?: Record<string, string[]>;
};

// ============================================================================
// ROLE REVEAL PROPS
// ============================================================================

export type RoleRevealProps = {
    player: PlayerState;
    onContinue: () => void;
};

// ============================================================================
// ROLE DEFINITION
// ============================================================================

export type RoleId = "villager" | "imp" | "washerwoman" | "librarian" | "investigator" | "chef" | "empath" | "monk" | "soldier" | "fortune_teller";

export type RoleDefinition = {
    id: RoleId;
    team: TeamId;
    icon: IconName;

    // Night order - lower numbers wake first, null means doesn't wake at night
    nightOrder: number | null;

    // Whether this role wakes on the first night only
    firstNightOnly?: boolean;

    // Whether this role skips the first night (like Imp - doesn't kill night 1)
    skipsFirstNight?: boolean;

    // Component to show when revealing role to player
    RoleReveal: React.FC<RoleRevealProps>;

    // Component for night action, null if no action needed
    NightAction: React.FC<NightActionProps> | null;
};
