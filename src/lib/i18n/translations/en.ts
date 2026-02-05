import { Translations } from "../types";

const en: Translations = {
    common: {
        continue: "Continue",
        confirm: "Confirm",
        cancel: "Cancel",
        back: "Back",
        next: "Next",
        players: "Players",
        player: "Player",
        roles: "Roles",
        role: "Role",
        random: "Random",
        startGame: "Start Game",
        mainMenu: "Main Menu",
        history: "History",
        winCondition: "Win Condition",
        youAreThe: "You are the...",
        iUnderstandMyRole: "I understand my role",
    },

    mainMenu: {
        title: "Grimoire",
        subtitle: "Blood on the Clocktower Narrator Companion",
        continueGame: "Continue Game",
        newGame: "New Game",
        startFreshGame: "Start a fresh game",
        previousGames: "Previous Games",
        completed: "Completed",
        settingUp: "Setting up",
        round: "Round",
        language: "Language",
    },

    newGame: {
        step1Title: "New Game",
        step1Subtitle: "Step 1: Add players",
        addPlayer: "Add Player",
        playerPlaceholder: "Player",
        minPlayersWarning: "Add at least 2 players to continue",
        nextSelectRoles: "Next: Select Roles",

        step2Title: "New Game",
        step2Subtitle: "Step 2: Select roles in play",
        needAtLeastRoles: "Need at least {count} roles",
        needAtLeastImp: "Need at least 1 Imp",
        nextAssignRoles: "Next: Assign Roles",

        step3Title: "New Game",
        step3Subtitle: "Step 3: Assign roles (optional)",
        assignmentInfo:
            "Optionally assign specific roles to players. Unassigned players get random roles from the pool.",
        resetToRandom: "Reset all to random",
        playerAssignments: "Player Assignments",
        randomPool: "Random Pool",
        rolesForPlayers: "{roles} roles for {players} players",
        impNotAssignedWarning:
            "The Imp won't be assigned! Make sure at least one player gets the Imp or leave some players random.",
    },

    game: {
        narratorGiveDevice: "Give the device to {player} to see their role.",
        narratorWakePlayer: "Wake {player} ({role}) for their night action.",
        readyShowToPlayer: "Ready - Show to Player",

        nightComplete: "Night {round} Complete",
        nightActionsResolved:
            "All night actions have been resolved. Ready to start the day?",
        startDay: "Start Day",
        choosePlayerToKill: "Choose a player to kill",
        selectVictim: "Select your victim for tonight.",
        confirmKill: "Confirm Kill",

        grimoire: "Grimoire",
        daytimeActions: "Daytime Actions",
        accusePlayerDescription: "Accuse a player and put them to vote",
        nominatesForExecution: "{nominator} nominates {nominee} for execution",

        day: "Day",
        discussionAndNominations: "Discussion and nominations",
        newNomination: "New Nomination",
        whoIsNominating: "Who is nominating?",
        whoAreTheyNominating: "Who are they nominating?",
        selectNominator: "Select nominator...",
        selectNominee: "Select nominee...",
        startNomination: "Start Nomination",
        endDayGoToNight: "End Day → Go to Night",

        executePlayer: "Execute {player}?",
        majorityNeeded: "Majority needed: {count} votes",
        votesFor: "For",
        votesAgainst: "Against",
        abstain: "Abstain",
        willBeExecuted: "{player} will be EXECUTED ({votes}/{majority} votes)",
        willNotBeExecuted:
            "{player} will NOT be executed ({votes}/{majority} needed)",
        votes: "votes",
        needed: "needed",
        confirmVotes: "Confirm Votes",
        cancelNomination: "Cancel Nomination",

        goodWins: "Good Wins!",
        evilWins: "Evil Wins!",
        townVanquishedDemon: "The town has vanquished the Demon!",
        demonConqueredTown: "The Demon has conquered the town!",
        finalRoles: "Final Roles",
        backToMainMenu: "Back to Main Menu",

        gameHistory: "Game History",

        // Washerwoman / Librarian shared
        narratorSetup: "Narrator Setup",
        selectTwoPlayers: "Select 2 players to show",
        selectWhichRoleToShow: "Select which role to reveal",
        showToPlayer: "Show to Player",
        oneOfThemIsThe: "One of them is the...",

        // Washerwoman specific
        mustIncludeTownsfolk:
            "At least one selected player must be a Townsfolk",
        washerwomanInfo: "Your Information",
        oneOfTheseIsTheTownsfolk:
            "One of these players is a Townsfolk. Remember who they are!",

        // Librarian specific
        mustIncludeOutsider:
            "At least one selected player must be an Outsider",
        librarianInfo: "Your Information",
        oneOfTheseIsTheOutsider:
            "One of these players is an Outsider. Remember who they are!",
        noOutsidersInGame: "No Outsiders",
        noOutsidersMessage:
            "There are no Outsiders in this game. This is valuable information!",
        confirmNoOutsiders: "Show to Player",

        // Investigator specific
        mustIncludeMinion:
            "At least one selected player must be a Minion",
        investigatorInfo: "Your Information",
        oneOfTheseIsTheMinion:
            "One of these players is a Minion. Remember who they are!",

        // Chef specific
        chefInfo: "Your Information",
        evilPairsCount: "Evil pairs sitting together:",
        evilPairsExplanation:
            "This is the number of pairs of evil players who are sitting next to each other.",

        // Empath specific
        empathInfo: "Your Information",
        evilNeighborsCount: "Evil neighbors:",
        evilNeighborsExplanation:
            "This is how many of your alive neighbors are evil.",

        // Monk specific
        monkInfo: "Choose a Player",
        selectPlayerToProtect: "Select a player to protect from the Demon tonight.",
        protectedForTheNight: "is protected for the night.",

        // Soldier specific
        soldierInfo: "Your Protection",
        permanentlyProtected: "You are permanently protected from the Demon.",

        // Handback screen
        handbackToNarrator: "Hand back to Narrator",
        handbackDescription:
            "Please return the device to the Narrator before continuing.",
        narratorReady: "Narrator Ready",
    },

    teams: {
        townsfolk: {
            name: "Townsfolk",
            winCondition: "Execute the Demon to win!",
        },
        outsider: {
            name: "Outsider",
            winCondition:
                "Execute the Demon to win! But beware, your ability may hinder the town.",
        },
        minion: {
            name: "Minion",
            winCondition:
                "Help your Demon survive! Evil wins when evil players equal or outnumber the good.",
        },
        demon: {
            name: "Demon",
            winCondition:
                "Evil wins when evil players equal or outnumber the good. Stay hidden and eliminate the town!",
        },
    },

    roles: {
        villager: {
            name: "Villager",
            description:
                "You have no ability. But you are still a good person! Help your town find the Demon.",
        },
        imp: {
            name: "Imp",
            description:
                "Each night*, choose a player: they die. If you kill yourself, a Minion becomes the Imp.",
            history: {
                choseToKill: "{player} chose to kill {target}",
                failedToKill: "{player} tried to kill {target}, but they were protected",
            },
        },
        washerwoman: {
            name: "Washerwoman",
            description:
                "You start knowing that 1 of 2 players is a particular Townsfolk.",
            history: {
                discoveredTownsfolk:
                    "{player} discovered that either {player1} or {player2} is the {role}",
            },
        },
        librarian: {
            name: "Librarian",
            description:
                "You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)",
            history: {
                discoveredOutsider:
                    "{player} discovered that either {player1} or {player2} is the {role}",
                noOutsiders: "{player} learned there are no Outsiders in this game",
            },
        },
        investigator: {
            name: "Investigator",
            description:
                "You start knowing that 1 of 2 players is a particular Minion.",
            history: {
                discoveredMinion:
                    "{player} discovered that either {player1} or {player2} is the {role}",
            },
        },
        chef: {
            name: "Chef",
            description:
                "You start knowing how many pairs of evil players there are.",
            history: {
                sawEvilPairs: "{player} learned there are {count} pairs of evil players sitting together",
            },
        },
        empath: {
            name: "Empath",
            description:
                "Each night, you learn how many of your 2 alive neighbours are evil.",
            history: {
                sawEvilNeighbors: "{player} learned that {count} of their neighbors are evil",
            },
        },
        monk: {
            name: "Monk",
            description:
                "Each night*, choose a player (not yourself): they are safe from the Demon tonight.",
            history: {
                protectedPlayer: "{player} protected {target} for the night",
            },
        },
        soldier: {
            name: "Soldier",
            description:
                "You are safe from the Demon.",
        },
    },

    effects: {
        dead: {
            name: "Dead",
            description:
                "This player is dead and cannot vote or nominate (except for one final dead vote).",
        },
        used_dead_vote: {
            name: "Used Dead Vote",
            description:
                "This dead player has used their one dead vote and cannot vote again.",
        },
        safe: {
            name: "Safe",
            description:
                "This player is protected from the Demon's kill.",
        },
    },

    ui: {
        effects: "Effects",
        seeRoleCard: "See Role Card",
    },

    history: {
        gameStarted: "Game started",
        nightBegins: "Night {round} begins",
        sunRises: "The sun rises...",
        diedInNight: "{player} has died in the night",
        dayBegins: "Day {round} begins",
        learnedRole: "{player} learned they are the {role}",
        noActionTonight: "{role} has no action tonight",
        nominates: "{nominator} nominates {nominee}",
        voteResult: "{player}: {for} for, {against} against. ",
        votePassed: "The vote passes!",
        voteFailed: "The vote fails.",
        executed: "{player} has been executed",
        goodWins: "Good wins! The Demon has been defeated.",
        evilWins: "Evil wins! The town has fallen.",
    },

    scripts: {
        "trouble-brewing": "Trouble Brewing",
    },
};

export default en;
