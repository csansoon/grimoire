export type Language = "en" | "es";

export type Translations = {
    // Common
    common: {
        continue: string;
        confirm: string;
        cancel: string;
        back: string;
        next: string;
        players: string;
        player: string;
        roles: string;
        role: string;
        random: string;
        startGame: string;
        mainMenu: string;
        history: string;
        winCondition: string;
        youAreThe: string;
        iUnderstandMyRole: string;
    };

    // Main Menu
    mainMenu: {
        title: string;
        subtitle: string;
        continueGame: string;
        newGame: string;
        startFreshGame: string;
        previousGames: string;
        completed: string;
        settingUp: string;
        round: string;
        language: string;
    };

    // New Game Flow
    newGame: {
        step1Title: string;
        step1Subtitle: string;
        addPlayer: string;
        playerPlaceholder: string;
        minPlayersWarning: string;
        nextSelectRoles: string;

        step2Title: string;
        step2Subtitle: string;
        needAtLeastRoles: string;
        needAtLeastImp: string;
        nextAssignRoles: string;

        step3Title: string;
        step3Subtitle: string;
        assignmentInfo: string;
        resetToRandom: string;
        playerAssignments: string;
        randomPool: string;
        rolesForPlayers: string;
        impNotAssignedWarning: string;
    };

    // Game Phases
    game: {
        // Narrator prompts
        narratorGiveDevice: string;
        narratorWakePlayer: string;
        readyShowToPlayer: string;

        // Night
        nightComplete: string;
        nightActionsResolved: string;
        startDay: string;
        choosePlayerToKill: string;
        selectVictim: string;
        confirmKill: string;

        // Grimoire
        grimoire: string;
        daytimeActions: string;
        accusePlayerDescription: string;
        nominatesForExecution: string;

        // Day
        day: string;
        discussionAndNominations: string;
        newNomination: string;
        whoIsNominating: string;
        whoAreTheyNominating: string;
        selectNominator: string;
        selectNominee: string;
        startNomination: string;
        endDayGoToNight: string;

        // Voting
        executePlayer: string;
        majorityNeeded: string;
        votesFor: string;
        votesAgainst: string;
        abstain: string;
        willBeExecuted: string;
        willNotBeExecuted: string;
        votes: string;
        needed: string;
        confirmVotes: string;
        cancelNomination: string;

        // Game Over
        goodWins: string;
        evilWins: string;
        townVanquishedDemon: string;
        demonConqueredTown: string;
        finalRoles: string;
        backToMainMenu: string;

        // History
        gameHistory: string;
    };

    // Teams
    teams: {
        townsfolk: {
            name: string;
            winCondition: string;
        };
        outsider: {
            name: string;
            winCondition: string;
        };
        minion: {
            name: string;
            winCondition: string;
        };
        demon: {
            name: string;
            winCondition: string;
        };
    };

    // Roles
    roles: {
        villager: {
            name: string;
            description: string;
        };
        imp: {
            name: string;
            description: string;
        };
    };

    // Effects
    effects: {
        dead: string;
        usedDeadVote: string;
    };

    // UI
    ui: {
        effects: string;
        seeRoleCard: string;
    };
};
