import {
    Icon as IconRootComponent,
    AlertTriangleIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    BookMarkedIcon,
    BirdhouseIcon,
    BombIcon,
    CheckIcon,
    CheckCircleIcon,
    ChefHatIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChurchIcon,
    CircleIcon,
    ClockIcon,
    CrosshairIcon,
    DicesIcon,
    EyeIcon,
    FishIcon,
    FlowerIcon,
    Gamepad2Icon,
    GlobeIcon,
    HandHeartIcon,
    HeartIcon,
    LandmarkIcon,
    MinusIcon,
    MoonIcon,
    PlayIcon,
    PlusIcon,
    ScaleIcon,
    ScrollTextIcon,
    SearchIcon,
    ShieldIcon,
    ShirtIcon,
    ShovelIcon,
    ShuffleIcon,
    SkullIcon,
    SparklesIcon,
    SunIcon,
    SwordsIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    Trash2Icon,
    TrendingUpDownIcon,
    TrophyIcon,
    UserIcon,
    UserPlusIcon,
    UserRoundIcon,
    UserXIcon,
    UsersIcon,
    VoteIcon,
    XIcon,
    ZapOffIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { flowerLotus, starNorth } from "@lucide/lab";

const Icons = {
    alertTriangle: AlertTriangleIcon,
    arrowLeft: ArrowLeftIcon,
    arrowRight: ArrowRightIcon,
    birdHouse: BirdhouseIcon,
    bomb: BombIcon,
    bookMarked: BookMarkedIcon,
    check: CheckIcon,
    checkCircle: CheckCircleIcon,
    chefHat: ChefHatIcon,
    chevronDown: ChevronDownIcon,
    chevronUp: ChevronUpIcon,
    church: ChurchIcon,
    circle: CircleIcon,
    clock: ClockIcon,
    crosshair: CrosshairIcon,
    landmark: LandmarkIcon,
    dices: DicesIcon,
    eye: EyeIcon,
    fish: FishIcon,
    flower: FlowerIcon,
    gamepad: Gamepad2Icon,
    globe: GlobeIcon,
    handHeart: HandHeartIcon,
    heart: HeartIcon,
    minus: MinusIcon,
    moon: MoonIcon,
    play: PlayIcon,
    plus: PlusIcon,
    scale: ScaleIcon,
    scrollText: ScrollTextIcon,
    search: SearchIcon,
    shield: ShieldIcon,
    shirt: ShirtIcon,
    shovel: ShovelIcon,
    shuffle: ShuffleIcon,
    skull: SkullIcon,
    sparkles: SparklesIcon,
    sun: SunIcon,
    swords: SwordsIcon,
    thumbsDown: ThumbsDownIcon,
    thumbsUp: ThumbsUpIcon,
    trash: Trash2Icon,
    trendingUpDown: TrendingUpDownIcon,
    trophy: TrophyIcon,
    user: UserIcon,
    userPlus: UserPlusIcon,
    userRound: UserRoundIcon,
    userX: UserXIcon,
    users: UsersIcon,
    vote: VoteIcon,
    x: XIcon,
    zapOff: ZapOffIcon,
};

const LabIcons = {
    flowerLotus,
    starNorth,
}

export type IconName = keyof typeof Icons | keyof typeof LabIcons;

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
    if (name in LabIcons) {
        return (
            <IconRootComponent
                iconNode={LabIcons[name as keyof typeof LabIcons]}
                className={cn(sizeClasses[size], className)}
                strokeWidth={strokeWidth}
            />
        )
    }

    const IconComponent = Icons[name as keyof typeof Icons];
    return (
        <IconComponent
            className={cn(sizeClasses[size], className)}
            strokeWidth={strokeWidth}
        />
    );
}
