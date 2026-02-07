import { GameState, PlayerState, HistoryEntry, Game } from "../types";
import { IconName } from "../../components/atoms/icon";
import { TeamId } from "../teams";
import { Intent, WinConditionCheck } from "../pipeline/types";

// ============================================================================
// REGISTRATION CONFIG
// ============================================================================

/**
 * Declarative config for roles that can register differently when detected
 * by other abilities. The Narrator is prompted to choose how such a role
 * registers whenever another ability reads its alignment or role.
 *
 * This keeps roles decoupled: the detecting role doesn't know *which* role
 * has registration overrides — it only checks whether the generic config
 * exists and renders the generic prompt components.
 */
export type RegistrationConfig = {
    /** Can this role register as evil when alignment is checked? */
    canRegisterAsEvil: boolean;
    /** Which team types can this role register as? (for team-detection abilities) */
    canRegisterAsTeams: TeamId[];
    /** Can this role appear as a different role when revealed? */
    canAppearAsDifferentRole: boolean;
};

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
    game: Game;
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
    // Intent to resolve through the pipeline (for action roles like Imp)
    intent?: Intent;
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

export type RoleId = "villager" | "imp" | "washerwoman" | "librarian" | "investigator" | "chef" | "empath" | "fortune_teller" | "undertaker" | "monk" | "ravenkeeper" | "soldier" | "virgin" | "slayer" | "mayor" | "saint" | "recluse";

export type RoleDefinition = {
    id: RoleId;
    team: TeamId;
    icon: IconName;

    // Night order - lower numbers wake first, null means doesn't wake at night
    nightOrder: number | null;

    // Optional function to check if this role should wake this night
    // Used for: first night only, skips first night, conditional abilities, etc.
    // If not provided, the role always wakes when it's their turn
    shouldWake?: (game: Game, player: PlayerState) => boolean;

    // Effects that are applied to this player at game start
    initialEffects?: EffectToAdd[];

    // Win conditions this role contributes (checked dynamically)
    winConditions?: WinConditionCheck[];

    // Registration overrides — if set, this role can register differently
    // when detected by other abilities (e.g. registering as evil or as a Demon)
    registration?: RegistrationConfig;

    // Component to show when revealing role to player
    RoleReveal: React.FC<RoleRevealProps>;

    // Component for night action, null if no action needed
    NightAction: React.FC<NightActionProps> | null;
};
