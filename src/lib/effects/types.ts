import { IconName } from "../../components/atoms/icon";
import { GameState, PlayerState } from "../types";

export type EffectId = "dead" | "used_dead_vote" | "safe" | "red_herring";

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
};
