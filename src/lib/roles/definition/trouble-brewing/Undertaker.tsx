import { useState } from "react";
import { RoleDefinition } from "../../types";
import { getRole, getAllRoles, hasRoleRegistration, getPossibleDisplayRoles } from "../../index";
import { isAlive } from "../../../types";
import { useI18n } from "../../../i18n";
import { RoleCard } from "../../../../components/items/RoleCard";
import { NightActionLayout, NarratorSetupLayout } from "../../../../components/layouts";
import { MysticDivider, RoleRevealBadge, StepSection, RoleRegistrationPrompt } from "../../../../components/items";
import { Button, Icon } from "../../../../components/atoms";

type Phase = "registration_setup" | "player_view";

// Helper to find execution from the previous day
function findExecutedPlayerId(game: { history: Array<{ type: string; data: Record<string, unknown> }> }): string | null {
    let lastDayStartIndex = -1;

    for (let i = game.history.length - 1; i >= 0; i--) {
        const entry = game.history[i];
        if (entry.type === "day_started") {
            lastDayStartIndex = i;
            break;
        }
    }

    if (lastDayStartIndex !== -1) {
        for (let i = lastDayStartIndex; i < game.history.length; i++) {
            const entry = game.history[i];
            if (entry.type === "execution") {
                return entry.data.playerId as string;
            }
        }
    }

    return null;
}

const definition: RoleDefinition = {
    id: "undertaker",
    team: "townsfolk",
    icon: "shovel",
    nightOrder: 40, // Wakes late, after deaths are resolved

    // Only wake if alive, not first night, AND there was an execution during the day
    shouldWake: (game, player) => {
        if (!isAlive(player)) return false;
        const round = game.history.at(-1)?.stateAfter.round ?? 0;
        if (round <= 1) return false; // Skip first night
        return findExecutedPlayerId(game) !== null;
    },

    RoleReveal: ({ player, onContinue }) => (
        <RoleCard player={player} onContinue={onContinue} />
    ),

    NightAction: ({ game, state, player, onComplete }) => {
        const { t } = useI18n();

        // Find the executed player (we know there was one because shouldWake returned true)
        const executedPlayerId = findExecutedPlayerId(game);
        const executedPlayer = executedPlayerId
            ? state.players.find((p) => p.id === executedPlayerId)
            : null;
        const executedRole = executedPlayer ? getRole(executedPlayer.roleId) : null;

        // Check if the executed player has role registration
        const needsRegistration = executedRole ? hasRoleRegistration(executedRole) : false;

        const [phase, setPhase] = useState<Phase>(
            needsRegistration ? "registration_setup" : "player_view"
        );
        const [displayRoleId, setDisplayRoleId] = useState<string | null>(null);

        const handleRegistrationDone = () => {
            if (!displayRoleId) return;
            setPhase("player_view");
        };

        const handleComplete = () => {
            if (!executedPlayer) return;

            // Use overridden role if registration was used, otherwise actual role
            const shownRoleId = displayRoleId ?? executedPlayer.roleId;
            const shownRole = getRole(shownRoleId);
            if (!shownRole) return;

            onComplete({
                entries: [
                    {
                        type: "night_action",
                        message: [
                            {
                                type: "i18n",
                                key: "roles.undertaker.history.sawExecutedRole",
                                params: {
                                    player: player.id,
                                    role: shownRole.id,
                                },
                            },
                        ],
                        data: {
                            roleId: "undertaker",
                            playerId: player.id,
                            action: "saw_executed",
                            executedPlayerId: executedPlayer.id,
                            executedRoleId: shownRole.id,
                            actualRoleId: executedPlayer.roleId,
                            registrationOverride: displayRoleId ? true : undefined,
                        },
                    },
                ],
            });
        };

        const getRoleName = (roleId: string) => {
            const key = roleId as keyof typeof t.roles;
            return t.roles[key]?.name ?? roleId;
        };

        // Registration Setup Phase - Narrator picks displayed role
        if (phase === "registration_setup" && executedPlayer && executedRole) {
            const possibleRoles = getPossibleDisplayRoles(executedRole, getAllRoles());

            return (
                <NarratorSetupLayout
                    icon="shovel"
                    roleName={getRoleName("undertaker")}
                    playerName={executedPlayer.name}
                    onShowToPlayer={handleRegistrationDone}
                    showToPlayerDisabled={!displayRoleId}
                >
                    <StepSection step={1} label={t.game.reclusePrompt}>
                        <RoleRegistrationPrompt
                            player={{ id: executedPlayer.id, name: executedPlayer.name }}
                            possibleRoles={possibleRoles}
                            selectedRoleId={displayRoleId}
                            onSelect={setDisplayRoleId}
                            ownRoleLabel={t.game.recluseShowAsOwnRole}
                        />
                    </StepSection>
                </NarratorSetupLayout>
            );
        }

        // Player View Phase
        const shownRoleId = displayRoleId ?? executedPlayer?.roleId;
        const shownRole = shownRoleId ? getRole(shownRoleId) : null;

        return (
            <NightActionLayout
                player={player}
                title={t.game.undertakerInfo}
                description={t.game.executedPlayerRole}
            >
                {shownRole && (
                    <>
                        <MysticDivider />
                        <RoleRevealBadge
                            icon={shownRole.icon}
                            roleName={getRoleName(shownRole.id)}
                            label={t.game.executedPlayerRole}
                        />
                    </>
                )}

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
