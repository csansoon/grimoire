import { useMemo } from "react";
import { Game, GameState, PlayerState } from "../../lib/types";
import { getRole } from "../../lib/roles";
import { getTeam } from "../../lib/teams";
import { getNightRolesStatus, NightRoleStatus } from "../../lib/game";
import { getAvailableNightFollowUps } from "../../lib/pipeline";
import { AvailableNightFollowUp } from "../../lib/pipeline/types";
import { useI18n } from "../../lib/i18n";
import { Button, Icon } from "../atoms";
import { Grimoire } from "../items/Grimoire";
import { MysticDivider } from "../items";
import { cn } from "../../lib/utils";

// ============================================================================
// UNIFIED NIGHT DASHBOARD ITEM
// ============================================================================

type NightDashboardItem =
    | { type: "night_action"; data: NightRoleStatus }
    | { type: "night_follow_up"; data: AvailableNightFollowUp };

// ============================================================================
// COMPONENT
// ============================================================================

type Props = {
    game: Game;
    state: GameState;
    onOpenNightAction: (playerId: string, roleId: string) => void;
    onOpenNightFollowUp: (followUp: AvailableNightFollowUp) => void;
    onStartDay: () => void;
    onMainMenu: () => void;
    onShowRoleCard?: (player: PlayerState) => void;
    onEditEffects?: (player: PlayerState) => void;
};

export function NightDashboard({
    game,
    state,
    onOpenNightAction,
    onOpenNightFollowUp,
    onStartDay,
    onMainMenu,
    onShowRoleCard,
    onEditEffects,
}: Props) {
    const { t } = useI18n();

    // Collect night actions and follow-ups separately, then merge
    const items: NightDashboardItem[] = useMemo(() => {
        const nightActions = getNightRolesStatus(game);
        const followUps = getAvailableNightFollowUps(state, game, t);

        const result: NightDashboardItem[] = nightActions.map((data) => ({
            type: "night_action" as const,
            data,
        }));

        // Append follow-ups after regular night actions
        for (const followUp of followUps) {
            result.push({ type: "night_follow_up" as const, data: followUp });
        }

        return result;
    }, [game, state, t]);

    // Derive next pending item and allDone from the unified list
    const nextPendingIndex = items.findIndex((item) => {
        if (item.type === "night_action") return item.data.status === "pending";
        // Follow-ups are always pending (they disappear when completed)
        return true;
    });
    const allDone = nextPendingIndex === -1;

    return (
        <div className="min-h-app bg-gradient-to-b from-indigo-950 via-grimoire-purple to-grimoire-darker flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-b from-indigo-900/50 to-transparent px-4 py-4">
                <div className="max-w-lg mx-auto">
                    {/* Back button row */}
                    <div className="flex items-center mb-4">
                        <button
                            onClick={onMainMenu}
                            className="p-2 -ml-2 text-parchment-400 hover:text-parchment-100 transition-colors"
                        >
                            <Icon name="arrowLeft" size="md" />
                        </button>
                        <span className="text-parchment-500 text-xs ml-1">
                            {t.common.mainMenu}
                        </span>
                    </div>

                    {/* Title section */}
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Icon
                                name="moon"
                                size="3xl"
                                className="text-indigo-400"
                            />
                        </div>
                        <h1 className="font-tarot text-2xl text-parchment-100 tracking-widest-xl uppercase">
                            {t.game.night} {state.round}
                        </h1>
                        <p className="text-parchment-400 text-sm">
                            {t.game.nightDashboardDescription}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full overflow-y-auto">
                {/* Night Actions List */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Icon
                            name="moon"
                            size="sm"
                            className="text-indigo-400"
                        />
                        <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                            {t.game.nightDashboard}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {items.map((item, index) =>
                            item.type === "night_action" ? (
                                <NightActionRow
                                    key={`action-${item.data.roleId}`}
                                    roleStatus={item.data}
                                    index={index + 1}
                                    isNext={index === nextPendingIndex}
                                    onOpen={() =>
                                        onOpenNightAction(
                                            item.data.playerId,
                                            item.data.roleId,
                                        )
                                    }
                                />
                            ) : (
                                <NightFollowUpRow
                                    key={`followup-${item.data.id}`}
                                    followUp={item.data}
                                    index={index + 1}
                                    isNext={index === nextPendingIndex}
                                    onOpen={() =>
                                        onOpenNightFollowUp(item.data)
                                    }
                                />
                            ),
                        )}
                    </div>

                    {allDone && items.length > 0 && (
                        <div className="mt-4 text-center">
                            <p className="text-emerald-400 text-sm flex items-center justify-center gap-2">
                                <Icon name="checkCircle" size="sm" />
                                {t.game.allActionsComplete}
                            </p>
                        </div>
                    )}
                </div>

                <MysticDivider className="mb-6" />

                {/* Grimoire Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Icon
                            name="scrollText"
                            size="sm"
                            className="text-mystic-gold"
                        />
                        <span className="font-tarot text-sm text-parchment-100 tracking-wider uppercase">
                            {t.game.grimoire}
                        </span>
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <Grimoire
                            state={state}
                            compact
                            onShowRoleCard={onShowRoleCard}
                            onEditEffects={onEditEffects}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-grimoire-dark/95 backdrop-blur-sm border-t border-indigo-500/30 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={onStartDay}
                        disabled={!allDone}
                        fullWidth
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-grimoire-dark font-tarot uppercase tracking-wider"
                    >
                        <Icon name="sun" size="md" className="mr-2" />
                        {t.game.proceedToDay}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// NIGHT ACTION ROW (regular night actions from roles)
// ============================================================================

function NightActionRow({
    roleStatus,
    index,
    isNext,
    onOpen,
}: {
    roleStatus: NightRoleStatus;
    index: number;
    isNext: boolean;
    onOpen: () => void;
}) {
    const { t } = useI18n();
    const role = getRole(roleStatus.roleId);
    const team = role ? getTeam(role.team) : null;

    const roleName = useMemo(() => {
        const key = roleStatus.roleId as keyof typeof t.roles;
        return t.roles[key]?.name ?? roleStatus.roleId;
    }, [roleStatus.roleId, t.roles]);

    const isDone = roleStatus.status === "done";

    return (
        <DashboardRow
            index={index}
            isNext={isNext}
            isDone={isDone}
            icon={role?.icon ?? "user"}
            label={roleName}
            sublabel={roleStatus.playerName}
            isEvil={team?.isEvil}
            onOpen={onOpen}
        />
    );
}

// ============================================================================
// NIGHT FOLLOW-UP ROW (reactive follow-ups from effects)
// ============================================================================

function NightFollowUpRow({
    followUp,
    index,
    isNext,
    onOpen,
}: {
    followUp: AvailableNightFollowUp;
    index: number;
    isNext: boolean;
    onOpen: () => void;
}) {
    return (
        <DashboardRow
            index={index}
            isNext={isNext}
            isDone={false}
            icon={followUp.icon}
            label={followUp.label}
            sublabel={followUp.playerName}
            isFollowUp
            onOpen={onOpen}
        />
    );
}

// ============================================================================
// SHARED ROW COMPONENT
// ============================================================================

function DashboardRow({
    index,
    isNext,
    isDone,
    icon,
    label,
    sublabel,
    isEvil,
    isFollowUp,
    onOpen,
}: {
    index: number;
    isNext: boolean;
    isDone: boolean;
    icon: string;
    label: string;
    sublabel: string;
    isEvil?: boolean;
    isFollowUp?: boolean;
    onOpen: () => void;
}) {
    const { t } = useI18n();

    const getStatusBadge = () => {
        if (isDone) {
            return (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Icon name="checkCircle" size="sm" />
                    {t.game.actionDone}
                </span>
            );
        }
        if (isNext) {
            return (
                <span className="flex items-center gap-1 text-xs text-indigo-300">
                    <Icon name="arrowRight" size="sm" />
                    {t.game.nextAction}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-xs text-parchment-600">
                {t.game.actionPending}
            </span>
        );
    };

    return (
        <button
            onClick={isNext ? onOpen : undefined}
            disabled={!isNext}
            className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                isNext
                    ? isFollowUp
                        ? "bg-purple-900/30 border border-purple-500/40 hover:bg-purple-900/50 cursor-pointer"
                        : "bg-indigo-900/30 border border-indigo-500/40 hover:bg-indigo-900/50 cursor-pointer"
                    : isDone
                        ? "bg-white/3 opacity-70"
                        : "bg-white/2 opacity-50",
            )}
        >
            {/* Order number */}
            <div
                className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    isNext
                        ? isFollowUp
                            ? "bg-purple-500/30 text-purple-300 border border-purple-400/40"
                            : "bg-indigo-500/30 text-indigo-300 border border-indigo-400/40"
                        : isDone
                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                            : "bg-white/5 text-parchment-600 border border-white/10",
                )}
            >
                {isDone ? <Icon name="check" size="xs" /> : index}
            </div>

            {/* Icon */}
            <div
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                    isNext
                        ? isFollowUp
                            ? "bg-purple-500/20 border-purple-400/30"
                            : isEvil
                                ? "bg-red-900/30 border-red-600/30"
                                : "bg-indigo-500/20 border-indigo-400/30"
                        : isDone
                            ? "bg-parchment-500/10 border-parchment-500/20"
                            : "bg-white/5 border-white/10",
                )}
            >
                <Icon
                    name={icon as any}
                    size="md"
                    className={cn(
                        isNext
                            ? isFollowUp
                                ? "text-purple-300"
                                : isEvil
                                    ? "text-red-400"
                                    : "text-indigo-300"
                            : "text-parchment-500",
                    )}
                />
            </div>

            {/* Label & Sublabel */}
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        "font-medium text-sm",
                        isNext
                            ? "text-parchment-100"
                            : isDone
                                ? "text-parchment-400"
                                : "text-parchment-600",
                    )}
                >
                    {label}
                </div>
                <span
                    className={cn(
                        "text-xs",
                        isNext
                            ? isFollowUp
                                ? "text-purple-400/80"
                                : "text-indigo-400/80"
                            : "text-parchment-600",
                    )}
                >
                    {sublabel}
                </span>
            </div>

            {/* Status Badge */}
            {getStatusBadge()}
        </button>
    );
}
