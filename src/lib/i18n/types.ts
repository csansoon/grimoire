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

        // Washerwoman / Librarian shared
        narratorSetup: string;
        selectTwoPlayers: string;
        selectWhichRoleToShow: string;
        showToPlayer: string;
        oneOfThemIsThe: string;

        // Washerwoman specific
        mustIncludeTownsfolk: string;
        washerwomanInfo: string;
        oneOfTheseIsTheTownsfolk: string;

        // Librarian specific
        mustIncludeOutsider: string;
        librarianInfo: string;
        oneOfTheseIsTheOutsider: string;
        noOutsidersInGame: string;
        noOutsidersMessage: string;
        confirmNoOutsiders: string;

        // Investigator specific
        mustIncludeMinion: string;
        investigatorInfo: string;
        oneOfTheseIsTheMinion: string;

        // Chef specific
        chefInfo: string;
        evilPairsCount: string;
        evilPairsExplanation: string;

        // Empath specific
        empathInfo: string;
        evilNeighborsCount: string;
        evilNeighborsExplanation: string;

        // Monk specific
        monkInfo: string;
        selectPlayerToProtect: string;
        protectedForTheNight: string;

        // Soldier specific
        soldierInfo: string;
        permanentlyProtected: string;

        // Handback screen
        handbackToNarrator: string;
        handbackDescription: string;
        narratorReady: string;
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
            history: {
                choseToKill: string;
                failedToKill: string;
            };
        };
        washerwoman: {
            name: string;
            description: string;
            history: {
                discoveredTownsfolk: string;
            };
        };
        librarian: {
            name: string;
            description: string;
            history: {
                discoveredOutsider: string;
                noOutsiders: string;
            };
        };
        investigator: {
            name: string;
            description: string;
            history: {
                discoveredMinion: string;
            };
        };
        chef: {
            name: string;
            description: string;
            history: {
                sawEvilPairs: string;
            };
        };
        empath: {
            name: string;
            description: string;
            history: {
                sawEvilNeighbors: string;
            };
        };
        monk: {
            name: string;
            description: string;
            history: {
                protectedPlayer: string;
            };
        };
        soldier: {
            name: string;
            description: string;
        };
    };

    // Effects
    effects: {
        dead: {
            name: string;
            description: string;
        };
        used_dead_vote: {
            name: string;
            description: string;
        };
        safe: {
            name: string;
            description: string;
        };
    };

    // UI
    ui: {
        effects: string;
        seeRoleCard: string;
    };

    // History messages
    history: {
        gameStarted: string;
        nightBegins: string;
        sunRises: string;
        diedInNight: string;
        dayBegins: string;
        learnedRole: string;
        noActionTonight: string;
        nominates: string;
        voteResult: string;
        votePassed: string;
        voteFailed: string;
        executed: string;
        goodWins: string;
        evilWins: string;
    };

    // Scripts
    scripts: {
        "trouble-brewing": string;
    };
};
