import { RoleDefinition } from "../../types";
import { getRole } from "../../index";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout } from "../../../../components/layouts";
import { RoleRevealBadge } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";
import { getAliveNeighbors } from "../../../types";

const definition: RoleDefinition = {
    id: "empath",
    team: "townsfolk",
    icon: "handHeart",
    nightOrder: 14,
    firstNightOnly: false, // Empath wakes every night

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();

        // Get alive neighbors and count how many are evil
        const [leftNeighbor, rightNeighbor] = getAliveNeighbors(state, player.id);

        let evilNeighbors = 0;

        if (leftNeighbor) {
            const leftRole = getRole(leftNeighbor.roleId);
            if (leftRole?.team === "minion" || leftRole?.team === "demon") {
                evilNeighbors++;
            }
        }

        if (rightNeighbor && rightNeighbor.id !== leftNeighbor?.id) {
            const rightRole = getRole(rightNeighbor.roleId);
            if (rightRole?.team === "minion" || rightRole?.team === "demon") {
                evilNeighbors++;
            }
        }

        const handleComplete = () => {
            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.empath.history.sawEvilNeighbors",
                                params: {
                                    player: player.id,
                                    count: evilNeighbors.toString(),
                                },
                            },
                        ],
                        data: {
                            roleId: "empath",
                            playerId: player.id,
                            action: "count_evil_neighbors",
                            evilNeighbors,
                            leftNeighborId: leftNeighbor?.id,
                            rightNeighborId: rightNeighbor?.id,
                        },
                    },
                ],
            });
        };

        return (
            <NightActionLayout
                player={player}
                title={t.game.empathInfo}
                description={t.game.evilNeighborsExplanation}
            >
                <div className="text-center mb-6">
                    <p className="text-parchment-400 text-sm mb-4">
                        {t.game.evilNeighborsCount}
                    </p>
                    <RoleRevealBadge
                        icon="handHeart"
                        roleName={evilNeighbors.toString()}
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
