import { RoleDefinition } from "../../types";
import { useI18n } from "../../../i18n";
import { DefaultRoleReveal } from "../../../../components/items/DefaultRoleReveal";
import { NightActionLayout } from "../../../../components/layouts";
import { RoleRevealBadge } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";
import { getAliveNeighbors, isAlive } from "../../../types";
import { perceive } from "../../../pipeline";

const definition: RoleDefinition = {
    id: "empath",
    team: "townsfolk",
    icon: "handHeart",
    nightOrder: 14,
    shouldWake: (_game, player) => isAlive(player),

    RoleReveal: DefaultRoleReveal,

    NightAction: ({ state, player, onComplete }) => {
        const { t } = useI18n();

        // Get alive neighbors and count how many register as evil
        // Uses perception so modifiers like Recluse/Spy apply
        const [leftNeighbor, rightNeighbor] = getAliveNeighbors(state, player.id);

        let evilNeighbors = 0;

        if (leftNeighbor) {
            const leftPerception = perceive(leftNeighbor, player, "alignment", state);
            if (leftPerception.alignment === "evil") {
                evilNeighbors++;
            }
        }

        if (rightNeighbor && rightNeighbor.id !== leftNeighbor?.id) {
            const rightPerception = perceive(rightNeighbor, player, "alignment", state);
            if (rightPerception.alignment === "evil") {
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
