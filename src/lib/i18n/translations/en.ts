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
        minPlayersWarning: "Add at least 5 players to continue",
        nextSelectRoles: "Next: Select Roles",
        loadedFromLastGame: "From last game",

        step2Title: "New Game",
        step2Subtitle: "Step 2: Select roles in play",
        needAtLeastRoles: "Need at least {count} roles",
        needAtLeastImp: "Need at least 1 Imp",
        nextAssignRoles: "Next: Assign Roles",
        suggested: "Suggested",

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
        rolesRandomlyAssigned: "Roles will be randomly assigned to players",
        customizeAssignments: "Customize Assignments",
        tapToAssign: "Tap a player to assign a specific role",
    },

    game: {
        narratorGiveDevice: "Give the device to {player} to see their role.",
        narratorWakePlayer: "Wake {player} ({role}) for their night action.",
        narratorRoleChanged:
            "Give the device to {player} — their role has changed.",
        readyShowToPlayer: "Ready - Show to Player",
        yourRoleHasChanged: "Your role has changed!",

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
        executionAlreadyHappened: "An execution has already happened today",
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

        // Slayer
        slayerAction: "Slayer Shot",
        slayerActionDescription: "Claim to be the Slayer and shoot a player",
        selectSlayer: "Select Slayer",
        selectTarget: "Select Target",
        confirmSlayerShot: "Confirm Shot",

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
        mustIncludeOutsider: "At least one selected player must be an Outsider",
        librarianInfo: "Your Information",
        oneOfTheseIsTheOutsider:
            "One of these players is an Outsider. Remember who they are!",
        noOutsidersInGame: "No Outsiders",
        noOutsidersMessage:
            "There are no Outsiders in this game. This is valuable information!",
        confirmNoOutsiders: "Show to Player",

        // Investigator specific
        mustIncludeMinion: "At least one selected player must be a Minion",
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
        selectPlayerToProtect:
            "Select a player to protect from the Demon tonight.",
        protectedForTheNight: "is protected for the night.",

        // Soldier specific
        soldierInfo: "Your Protection",
        permanentlyProtected: "You are permanently protected from the Demon.",

        // Fortune Teller specific
        fortuneTellerInfo: "Your Vision",
        selectTwoPlayersToCheck: "Select 2 players to check for Demons.",
        selectRedHerring: "Assign Red Herring",
        redHerringInfo:
            "Select a good player who will register as a Demon to this Fortune Teller.",
        selectGoodPlayerAsRedHerring: "Select a good player as the Red Herring",
        selectRandomRedHerring: "Random",
        yesOneIsDemon: "YES — One of them is a Demon!",
        noNeitherIsDemon: "NO — Neither is a Demon.",

        // Undertaker specific
        undertakerInfo: "The Executed Role",
        executedPlayerRole: "The player executed today was...",
        noExecutionToday: "No one was executed today.",

        // Ravenkeeper specific
        ravenkeeperInfo: "Choose a Player",
        selectPlayerToSeeRole:
            "You have died! Select a player to learn their role.",
        playerRoleIs: "Their role is...",

        // Handback screen
        handbackToNarrator: "Hand back to Narrator",
        handbackDescription:
            "Please return the device to the Narrator before continuing.",
        narratorReady: "Narrator Ready",

        // Role Revelation
        roleRevelation: "Role Revelation",
        roleRevelationDescription: "Tap each player to show them their role",
        tapToReveal: "Tap to reveal",
        revealed: "Revealed",
        startFirstNight: "Start Night 1",
        skipRoleRevelation: "Skip and reveal roles later",
        revealAllFirst: "Reveal all roles before continuing",

        // Night Dashboard
        night: "Night",
        nightDashboard: "Night Actions",
        nightDashboardDescription: "Process each role's night action in order",
        nextAction: "Next",
        actionDone: "Done",
        actionSkipped: "Skipped",
        actionPending: "Pending",
        allActionsComplete: "All night actions have been processed",
        proceedToDay: "Proceed to Day",
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
            bounceTitle: "Kill Redirected!",
            bounceDescription:
                "The Demon targeted {target}, but their kill bounced. Choose who dies instead.",
            bounceOriginalLabel: "original target",
            history: {
                choseToKill: "{player} chose to kill {target}",
                failedToKill:
                    "{player} tried to kill {target}, but they were protected",
                bounceRedirected:
                    "{player} targeted {target}, but the kill was redirected to {redirect}",
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
                noOutsiders:
                    "{player} learned there are no Outsiders in this game",
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
                sawEvilPairs:
                    "{player} learned there are {count} pairs of evil players sitting together",
            },
        },
        empath: {
            name: "Empath",
            description:
                "Each night, you learn how many of your 2 alive neighbours are evil.",
            history: {
                sawEvilNeighbors:
                    "{player} learned that {count} of their neighbors are evil",
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
            description: "You are safe from the Demon.",
        },
        fortune_teller: {
            name: "Fortune Teller",
            description:
                "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.",
            history: {
                sawDemon:
                    "{player} checked {player1} and {player2} — YES, one is a Demon (or Red Herring)",
                sawNoDemon:
                    "{player} checked {player1} and {player2} — NO, neither is a Demon",
                redHerringAssigned:
                    "{redHerring} was assigned as the Red Herring for {player}",
            },
        },
        undertaker: {
            name: "Undertaker",
            description:
                "Each night*, you learn which character died by execution today.",
            history: {
                sawExecutedRole:
                    "{player} learned that the executed player was the {role}",
                noExecution: "{player} learned there was no execution today",
            },
        },
        ravenkeeper: {
            name: "Ravenkeeper",
            description:
                "If you die at night, you are woken to choose a player: you learn their character.",
            history: {
                sawRole: "{player} chose to see {target}'s role: {role}",
            },
        },
        virgin: {
            name: "Virgin",
            description:
                "The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.",
            history: {
                townsfolkExecuted:
                    "{nominator} nominated the Virgin and was executed!",
                lostPurity:
                    "{nominator} nominated the Virgin — the Virgin's power is spent",
            },
        },
        slayer: {
            name: "Slayer",
            description:
                "Once per game, during the day, publicly choose a player: if they are the Demon, they die.",
            history: {
                killedDemon: "{slayer} shot {target} — they were the Demon!",
                missed: "{slayer} shot {target} — nothing happened",
            },
        },
        mayor: {
            name: "Mayor",
            description:
                "If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.",
        },
        saint: {
            name: "Saint",
            description: "If you die by execution, your team loses.",
        },
        scarlet_woman: {
            name: "Scarlet Woman",
            description:
                "If there are 5 or more players alive & the Demon dies, you become the Demon.",
            history: {
                becameDemon: "{player} became the {role}",
            },
        },
        recluse: {
            name: "Recluse",
            description:
                "You might register as evil & as a Minion or Demon, even if dead.",
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
            description: "This player is protected from the Demon's kill.",
        },
        red_herring: {
            name: "Red Herring",
            description:
                "This player registers as a Demon to a specific Fortune Teller.",
        },
        pure: {
            name: "Pure",
            description:
                "If a Townsfolk nominates this player, that Townsfolk is executed instead.",
        },
        slayer_bullet: {
            name: "Slayer Shot",
            description:
                "This player can use their Slayer ability to shoot a player.",
        },
        bounce: {
            name: "Bounce",
            description:
                "If this player is targeted by the Demon at night, the Storyteller may redirect the kill to another player.",
        },
        martyrdom: {
            name: "Martyrdom",
            description: "If this player is executed, the evil team wins.",
        },
        scarlet_woman: {
            name: "Scarlet Woman",
            description:
                "If the Demon dies with 5+ players alive, the player with this effect becomes the Demon.",
        },
        recluse_misregister: {
            name: "Misregister",
            description:
                "This player might register as evil & as a Minion or Demon to information abilities.",
        },
        pending_role_reveal: {
            name: "Role Changed",
            description:
                "This player's role has changed and needs to be revealed.",
        },
    },

    ui: {
        effects: "Effects",
        seeRoleCard: "See Role Card",
        editEffects: "Edit Effects",
        currentEffects: "Current Effects",
        addEffect: "Add Effect",
        noEffects: "No effects",
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
        effectAdded: "Narrator added {effect} to {player}",
        effectRemoved: "Narrator removed {effect} from {player}",
        roleChanged: "{player} became the {role}",
    },

    scripts: {
        "trouble-brewing": "Trouble Brewing",
    },
};

export default en;
