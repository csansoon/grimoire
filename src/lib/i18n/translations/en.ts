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
        assignmentInfo: "Optionally assign specific roles to players. Unassigned players get random roles from the pool.",
        resetToRandom: "Reset all to random",
        playerAssignments: "Player Assignments",
        randomPool: "Random Pool",
        rolesForPlayers: "{roles} roles for {players} players",
        impNotAssignedWarning: "The Imp won't be assigned! Make sure at least one player gets the Imp or leave some players random.",
    },

    game: {
        narratorGiveDevice: "Give the device to {player} to see their role.",
        narratorWakePlayer: "Wake {player} ({role}) for their night action.",
        readyShowToPlayer: "Ready - Show to Player",

        nightComplete: "Night {round} Complete",
        nightActionsResolved: "All night actions have been resolved. Ready to start the day?",
        startDay: "Start Day",
        choosePlayerToKill: "Choose a player to kill",
        selectVictim: "Select your victim for tonight.",
        confirmKill: "Confirm Kill",

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
        willNotBeExecuted: "{player} will NOT be executed ({votes}/{majority} needed)",
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
    },

    teams: {
        townsfolk: {
            name: "Townsfolk",
            winCondition: "Execute the Demon to win!",
        },
        outsider: {
            name: "Outsider",
            winCondition: "Execute the Demon to win! But beware, your ability may hinder the town.",
        },
        minion: {
            name: "Minion",
            winCondition: "Help your Demon survive! Evil wins when evil players equal or outnumber the good.",
        },
        demon: {
            name: "Demon",
            winCondition: "Evil wins when evil players equal or outnumber the good. Stay hidden and eliminate the town!",
        },
    },

    roles: {
        villager: {
            name: "Villager",
            description: "You have no ability. But you are still a good person! Help your town find the Demon.",
        },
        imp: {
            name: "Imp",
            description: "Each night*, choose a player: they die. If you kill yourself, a Minion becomes the Imp.",
        },
    },

    effects: {
        dead: "Dead",
        usedDeadVote: "Used dead vote",
    },
};

export default en;
