import { RoleDefinition } from "../../types";
import { getRole } from "../../index";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout } from "../../../../components/layouts";
import { RoleRevealBadge } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";
import { GameState, isAlive } from "../../../types";

/**
 * Calculate the number of pairs of evil players sitting next to each other.
 * Dead players are skipped when determining neighbors.
 */
function countEvilPairs(state: GameState): number {
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

        const currentRole = getRole(currentPlayer.roleId);
        const nextRole = getRole(nextPlayer.roleId);

        const currentIsEvil = currentRole?.team === "minion" || currentRole?.team === "demon";
        const nextIsEvil = nextRole?.team === "minion" || nextRole?.team === "demon";

        if (currentIsEvil && nextIsEvil) {
            evilPairs++;
        }
    }

    // If we counted in a circle, we might have double-counted
    // Actually no - each pair is only counted once since we go i -> i+1
    // But if there are only 2 evil players sitting together, we count once
    // If there are 3 evil in a row: A-B, B-C = 2 pairs
    // This is correct behavior for Chef

    return evilPairs;
}

const definition: RoleDefinition = {
    id: "chef",
    team: "townsfolk",
    icon: "chefHat",
    nightOrder: 13,
    firstNightOnly: true,

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();

        // Calculate evil pairs
        const evilPairs = countEvilPairs(state);

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
