/**
 * Generic registration prompt components.
 *
 * These components are used by any role that needs to resolve how a player
 * with registration overrides is perceived. They are fully generic —
 * no role is referenced by name.
 */

import { RoleDefinition } from "../../lib/roles/types";
import { Icon } from "../atoms";
import { IconName } from "../atoms/icon";
import { SelectableRoleItem } from "../inputs";
import { useI18n, interpolate } from "../../lib/i18n";

// ============================================================================
// ALIGNMENT REGISTRATION PROMPT
// ============================================================================

type AlignmentRegistrationPromptProps = {
    /** Players whose alignment the narrator must decide */
    players: Array<{ id: string; name: string }>;
    /** Current values: playerId → registersAsEvil */
    values: Record<string, boolean>;
    /** Called when the narrator toggles a value */
    onChange: (playerId: string, registersAsEvil: boolean) => void;
};

/**
 * Renders good/evil toggles for each player with alignment registration.
 * Embeddable inside any NarratorSetupLayout.
 */
export function AlignmentRegistrationPrompt({
    players,
    values,
    onChange,
}: AlignmentRegistrationPromptProps) {
    const { t } = useI18n();

    return (
        <>
            {players.map((player) => {
                const isEvil = values[player.id] ?? false;

                return (
                    <div key={player.id} className="mb-4">
                        <p className="text-sm text-parchment-300 mb-3">
                            {interpolate(t.game.doesRecluseRegisterAsEvil, {
                                player: player.name,
                            })}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onChange(player.id, false)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm ${
                                    !isEvil
                                        ? "bg-emerald-700/40 border-emerald-500 text-emerald-200"
                                        : "bg-white/5 border-white/10 text-parchment-400 hover:border-white/30"
                                }`}
                            >
                                <Icon
                                    name="checkCircle"
                                    size="sm"
                                    className="inline mr-2"
                                />
                                {t.game.recluseRegistersAsGood}
                            </button>
                            <button
                                onClick={() => onChange(player.id, true)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm ${
                                    isEvil
                                        ? "bg-red-700/40 border-red-500 text-red-200"
                                        : "bg-white/5 border-white/10 text-parchment-400 hover:border-white/30"
                                }`}
                            >
                                <Icon
                                    name="alertTriangle"
                                    size="sm"
                                    className="inline mr-2"
                                />
                                {t.game.recluseRegistersAsEvil}
                            </button>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

// ============================================================================
// ROLE REGISTRATION PROMPT
// ============================================================================

type RoleRegistrationPromptProps = {
    /** The player whose displayed role the narrator must choose */
    player: { id: string; name: string };
    /** The roles this player can appear as */
    possibleRoles: RoleDefinition[];
    /** The currently selected role ID (null = not yet chosen) */
    selectedRoleId: string | null;
    /** Called when the narrator selects a role */
    onSelect: (roleId: string) => void;
    /** Label shown as own-role marker */
    ownRoleLabel: string;
};

/**
 * Renders a role picker for a player with role registration.
 * Embeddable inside any NarratorSetupLayout.
 */
export function RoleRegistrationPrompt({
    player,
    possibleRoles,
    selectedRoleId,
    onSelect,
    ownRoleLabel,
}: RoleRegistrationPromptProps) {
    const { t } = useI18n();

    const getRoleName = (roleId: string) => {
        const key = roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? roleId;
    };

    return (
        <div>
            <p className="text-sm text-parchment-300 mb-3">
                {interpolate(t.game.recluseSelectDisplayRole, {
                    player: player.name,
                })}
            </p>
            {possibleRoles.map((role, idx) => {
                const isOwnRole = idx === 0; // First entry is always the player's own role
                const label = isOwnRole
                    ? `${getRoleName(role.id)} (${ownRoleLabel})`
                    : getRoleName(role.id);

                return (
                    <SelectableRoleItem
                        key={role.id}
                        playerName=""
                        roleName={label}
                        roleIcon={role.icon as IconName}
                        isSelected={selectedRoleId === role.id}
                        onClick={() => onSelect(role.id)}
                    />
                );
            })}
        </div>
    );
}
