import { GameState, PlayerState } from "../../lib/types";
import { useI18n } from "../../lib/i18n";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    Icon,
} from "../atoms";
import { Grimoire } from "./Grimoire";

type Props = {
    state: GameState;
    open: boolean;
    onClose: () => void;
    onShowRoleCard?: (player: PlayerState) => void;
    onEditEffects?: (player: PlayerState) => void;
};

export function GrimoireModal({ state, open, onClose, onShowRoleCard, onEditEffects }: Props) {
    const { t } = useI18n();
    
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-h-[90vh]">
                <DialogHeader>
                    <div className="flex items-center justify-center gap-2">
                        <Icon name="scrollText" size="md" className="text-mystic-gold" />
                        <DialogTitle>{t.game.grimoire}</DialogTitle>
                    </div>
                </DialogHeader>
                <DialogBody>
                    <Grimoire state={state} onShowRoleCard={onShowRoleCard} onEditEffects={onEditEffects} />
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
