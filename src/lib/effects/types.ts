import { IconName } from "../../components/atoms/icon";
import { GameState, PlayerState } from "../types";
import { TeamId } from "../teams";
import {
    IntentHandler,
    DayActionDefinition,
    WinConditionCheck,
    PerceptionModifier,
} from "../pipeline/types";

export type EffectId =
    | "dead"
    | "used_dead_vote"
    | "safe"
    | "red_herring"
    | "pure"
    | "slayer_bullet"
    | "bounce"
    | "martyrdom"
    | "scarlet_woman"
    | "recluse_misregister";

export type EffectDefinition = {
    id: EffectId;
    icon: IconName;

    // Behavior modifiers
    preventsNightWake?: boolean;
    poisonsAbility?: boolean;
    preventsVoting?: boolean;
    preventsNomination?: boolean;

    // Check if a player can vote given this effect
    canVote?: (player: PlayerState, state: GameState) => boolean;

    // Check if a player can nominate given this effect
    canNominate?: (player: PlayerState, state: GameState) => boolean;

    // Pipeline intent handlers — intercept/modify/prevent intents
    handlers?: IntentHandler[];

    // Day actions this effect enables (shown as buttons on the day phase)
    dayActions?: DayActionDefinition[];

    // Win conditions this effect contributes
    winConditions?: WinConditionCheck[];

    // Perception modifiers — alter how the player carrying this effect
    // is perceived by information roles (e.g., Recluse, Spy)
    perceptionModifiers?: PerceptionModifier[];

    // Declares that a player with this effect could register as these teams
    // and/or alignments. Used by narrator-setup UIs (e.g. Investigator) to
    // allow these players as valid picks even when perceiveAs isn't configured.
    canRegisterAs?: {
        teams?: TeamId[];
        alignments?: ("good" | "evil")[];
    };
};
