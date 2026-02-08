import { RoleDefinition } from "../../types";
import { useI18n } from "../../../i18n";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";
import { NightActionLayout } from "../../../../components/layouts";
import { RoleRevealBadge } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";
import { GameState, PlayerState, isAlive } from "../../../types";
import { perceive } from "../../../pipeline";

/**
 * Calculate the number of pairs of evil players sitting next to each other.
 * Dead players are skipped when determining neighbors.
 * Uses the perception system so roles like Recluse/Spy are properly handled.
 */
export function countEvilPairs(state: GameState, observer: PlayerState): number {
    const alivePlayers = state.players.filter(isAlive);
    if (alivePlayers.length < 2) return 0;

    // Get indices of alive players in the original order
    const aliveIndices = state.players
        .map((p, i) => (isAlive(p) ? i : -1))
        .filter((i) => i !== -1);

    let evilPairs = 0;

    // Check each pair of adjacent alive players (in circular order)
    for (let i = 0; i < aliveIndices.length; i++) {
        const currentIdx = aliveIndices[i];
        const nextIdx = aliveIndices[(i + 1) % aliveIndices.length];

        const currentPlayer = state.players[currentIdx];
        const nextPlayer = state.players[nextIdx];

        const currentIsEvil =
            perceive(currentPlayer, observer, "alignment", state).alignment === "evil";
        const nextIsEvil =
            perceive(nextPlayer, observer, "alignment", state).alignment === "evil";

        if (currentIsEvil && nextIsEvil) {
            evilPairs++;
        }
    }

    return evilPairs;
}

const definition: RoleDefinition = {
    id: "chef",
    team: "townsfolk",
    icon: "chefHat",
    nightOrder: 13,
    shouldWake: (game, player) => isAlive(player) && game.history.at(-1)?.stateAfter.round === 1,

    RoleReveal: DefaultRoleReveal,

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();

        // Calculate evil pairs (using perception so modifiers like Recluse apply)
        const evilPairs = countEvilPairs(state, player);

        const handleComplete = () => {
            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.chef.history.sawEvilPairs",
                                params: {
                                    player: player.id,
                                    count: evilPairs.toString(),
                                },
                            },
                        ],
                        data: {
                            roleId: "chef",
                            playerId: player.id,
                            action: "count_evil_pairs",
                            evilPairs,
                        },
                    },
                ],
            });
        };

        return (
            <NightActionLayout
                player={player}
                title={t.game.chefInfo}
                description={t.game.evilPairsExplanation}
            >
                <div className="text-center mb-6">
                    <p className="text-parchment-400 text-sm mb-4">
                        {t.game.evilPairsCount}
                    </p>
                    <RoleRevealBadge
                        icon="chefHat"
                        roleName={evilPairs.toString()}
                    />
                </div>

                <Button
                    onClick={handleComplete}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 font-tarot uppercase tracking-wider"
                >
                    <Icon name="check" size="md" className="mr-2" />
                    {t.common.iUnderstandMyRole}
                </Button>
            </NightActionLayout>
        );
    },
};

export default definition;
