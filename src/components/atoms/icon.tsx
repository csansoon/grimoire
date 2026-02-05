import {
    AlertTriangleIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    ClockIcon,
    DicesIcon,
    EyeIcon,
    Gamepad2Icon,
    GlobeIcon,
    MinusIcon,
    MoonIcon,
    PlayIcon,
    PlusIcon,
    ScaleIcon,
    ScrollTextIcon,
    ShuffleIcon,
    SkullIcon,
    SparklesIcon,
    SunIcon,
    SwordsIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    Trash2Icon,
    TrophyIcon,
    UserIcon,
    UserPlusIcon,
    UserRoundIcon,
    UsersIcon,
    VoteIcon,
    XIcon,
    ZapOffIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

const Icons = {
    alertTriangle: AlertTriangleIcon,
    arrowLeft: ArrowLeftIcon,
    arrowRight: ArrowRightIcon,
    check: CheckIcon,
    clock: ClockIcon,
    dices: DicesIcon,
    eye: EyeIcon,
    gamepad: Gamepad2Icon,
    globe: GlobeIcon,
    minus: MinusIcon,
    moon: MoonIcon,
    play: PlayIcon,
    plus: PlusIcon,
    scale: ScaleIcon,
    scrollText: ScrollTextIcon,
    shuffle: ShuffleIcon,
    skull: SkullIcon,
    sparkles: SparklesIcon,
    sun: SunIcon,
    swords: SwordsIcon,
    thumbsDown: ThumbsDownIcon,
    thumbsUp: ThumbsUpIcon,
    trash: Trash2Icon,
    trophy: TrophyIcon,
    user: UserIcon,
    userPlus: UserPlusIcon,
    userRound: UserRoundIcon,
    users: UsersIcon,
    vote: VoteIcon,
    x: XIcon,
    zapOff: ZapOffIcon,
};

export type IconName = keyof typeof Icons;

export type IconProps = {
    name: IconName;
    size?: Size;
    className?: string;
    strokeWidth?: number;
};

type Size =
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl";

const sizeClasses: Record<Size, string> = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    "2xl": "w-12 h-12",
    "3xl": "w-16 h-16",
    "4xl": "w-20 h-20",
};

export function Icon({
    name,
    size = "md",
    strokeWidth = 2,
    className,
}: IconProps) {
    const IconComponent = Icons[name];
    return (
        <IconComponent
            className={cn(sizeClasses[size], className)}
            strokeWidth={strokeWidth}
        />
    );
}
