import { Translations } from "../types";

const es: Translations = {
    common: {
        continue: "Continuar",
        confirm: "Confirmar",
        cancel: "Cancelar",
        back: "Volver",
        next: "Siguiente",
        players: "Jugadores",
        player: "Jugador",
        roles: "Roles",
        role: "Rol",
        random: "Aleatorio",
        startGame: "Iniciar Partida",
        mainMenu: "Menú Principal",
        history: "Historial",
        winCondition: "Condición de Victoria",
        youAreThe: "Eres el/la...",
        iUnderstandMyRole: "Entiendo mi rol",
    },

    mainMenu: {
        title: "Grimoire",
        subtitle: "Asistente de Narrador para Blood on the Clocktower",
        continueGame: "Continuar Partida",
        newGame: "Nueva Partida",
        startFreshGame: "Comenzar una nueva partida",
        previousGames: "Partidas Anteriores",
        completed: "Completada",
        settingUp: "Configurando",
        round: "Ronda",
        language: "Idioma",
    },

    newGame: {
        step1Title: "Nueva Partida",
        step1Subtitle: "Paso 1: Añadir jugadores",
        addPlayer: "Añadir Jugador",
        playerPlaceholder: "Jugador",
        minPlayersWarning: "Añade al menos 2 jugadores para continuar",
        nextSelectRoles: "Siguiente: Seleccionar Roles",

        step2Title: "Nueva Partida",
        step2Subtitle: "Paso 2: Seleccionar roles en juego",
        needAtLeastRoles: "Se necesitan al menos {count} roles",
        needAtLeastImp: "Se necesita al menos 1 Imp",
        nextAssignRoles: "Siguiente: Asignar Roles",

        step3Title: "Nueva Partida",
        step3Subtitle: "Paso 3: Asignar roles (opcional)",
        assignmentInfo: "Opcionalmente asigna roles específicos a jugadores. Los jugadores sin asignar reciben roles aleatorios.",
        resetToRandom: "Restablecer todo a aleatorio",
        playerAssignments: "Asignaciones de Jugadores",
        randomPool: "Pool Aleatorio",
        rolesForPlayers: "{roles} roles para {players} jugadores",
        impNotAssignedWarning: "¡El Imp no será asignado! Asegúrate de que al menos un jugador reciba el Imp o deja algunos jugadores en aleatorio.",
    },

    game: {
        narratorGiveDevice: "Dale el dispositivo a {player} para que vea su rol.",
        narratorWakePlayer: "Despierta a {player} ({role}) para su acción nocturna.",
        readyShowToPlayer: "Listo - Mostrar al Jugador",

        nightComplete: "Noche {round} Completa",
        nightActionsResolved: "Todas las acciones nocturnas han sido resueltas. ¿Listos para comenzar el día?",
        startDay: "Comenzar Día",
        choosePlayerToKill: "Elige un jugador para matar",
        selectVictim: "Selecciona tu víctima para esta noche.",
        confirmKill: "Confirmar Asesinato",

        grimoire: "Grimoire",
        daytimeActions: "Acciones de Día",
        accusePlayerDescription: "Acusa a un jugador y ponlo a votación",
        nominatesForExecution: "{nominator} nomina a {nominee} para ejecución",

        day: "Día",
        discussionAndNominations: "Discusión y nominaciones",
        newNomination: "Nueva Nominación",
        whoIsNominating: "¿Quién está nominando?",
        whoAreTheyNominating: "¿A quién están nominando?",
        selectNominator: "Seleccionar nominador...",
        selectNominee: "Seleccionar nominado...",
        startNomination: "Iniciar Nominación",
        endDayGoToNight: "Terminar Día → Ir a Noche",

        executePlayer: "¿Ejecutar a {player}?",
        majorityNeeded: "Mayoría necesaria: {count} votos",
        votesFor: "A favor",
        votesAgainst: "En contra",
        abstain: "Abstención",
        willBeExecuted: "{player} será EJECUTADO ({votes}/{majority} votos)",
        willNotBeExecuted: "{player} NO será ejecutado ({votes}/{majority} necesarios)",
        votes: "votos",
        needed: "necesarios",
        confirmVotes: "Confirmar Votos",
        cancelNomination: "Cancelar Nominación",

        goodWins: "¡Gana el Bien!",
        evilWins: "¡Gana el Mal!",
        townVanquishedDemon: "¡El pueblo ha vencido al Demonio!",
        demonConqueredTown: "¡El Demonio ha conquistado el pueblo!",
        finalRoles: "Roles Finales",
        backToMainMenu: "Volver al Menú Principal",

        gameHistory: "Historial de Partida",

        // Washerwoman / Librarian shared
        narratorSetup: "Configuración del Narrador",
        selectTwoPlayers: "Selecciona 2 jugadores para mostrar",
        selectWhichRoleToShow: "Selecciona qué rol revelar",
        showToPlayer: "Mostrar al Jugador",
        oneOfThemIsThe: "Uno de ellos es el/la...",

        // Washerwoman specific
        mustIncludeTownsfolk: "Al menos uno de los jugadores seleccionados debe ser un Aldeano",
        washerwomanInfo: "Tu Información",
        oneOfTheseIsTheTownsfolk: "Uno de estos jugadores es un Aldeano. ¡Recuerda quiénes son!",

        // Librarian specific
        mustIncludeOutsider: "Al menos uno de los jugadores seleccionados debe ser un Forastero",
        librarianInfo: "Tu Información",
        oneOfTheseIsTheOutsider: "Uno de estos jugadores es un Forastero. ¡Recuerda quiénes son!",
        noOutsidersInGame: "Sin Forasteros",
        noOutsidersMessage: "No hay Forasteros en esta partida. ¡Esta es información valiosa!",
        confirmNoOutsiders: "Mostrar al Jugador",

        // Investigator specific
        mustIncludeMinion: "Al menos uno de los jugadores seleccionados debe ser un Secuaz",
        investigatorInfo: "Tu Información",
        oneOfTheseIsTheMinion: "Uno de estos jugadores es un Secuaz. ¡Recuerda quiénes son!",

        // Chef specific
        chefInfo: "Tu Información",
        evilPairsCount: "Parejas malvadas sentadas juntas:",
        evilPairsExplanation:
            "Este es el número de parejas de jugadores malvados que están sentados uno al lado del otro.",

        // Empath specific
        empathInfo: "Tu Información",
        evilNeighborsCount: "Vecinos malvados:",
        evilNeighborsExplanation:
            "Este es cuántos de tus vecinos vivos son malvados.",

        // Monk specific
        monkInfo: "Elige un Jugador",
        selectPlayerToProtect: "Selecciona un jugador para proteger del Demonio esta noche.",
        protectedForTheNight: "está protegido/a por esta noche.",

        // Soldier specific
        soldierInfo: "Tu Protección",
        permanentlyProtected: "Estás permanentemente protegido del Demonio.",

        // Handback screen
        handbackToNarrator: "Devolver al Narrador",
        handbackDescription: "Por favor, devuelve el dispositivo al Narrador antes de continuar.",
        narratorReady: "Narrador Listo",
    },

    teams: {
        townsfolk: {
            name: "Aldeano",
            winCondition: "¡Ejecuta al Demonio para ganar!",
        },
        outsider: {
            name: "Forastero",
            winCondition: "¡Ejecuta al Demonio para ganar! Pero cuidado, tu habilidad puede perjudicar al pueblo.",
        },
        minion: {
            name: "Secuaz",
            winCondition: "¡Ayuda a tu Demonio a sobrevivir! El mal gana cuando los jugadores malvados igualan o superan a los buenos.",
        },
        demon: {
            name: "Demonio",
            winCondition: "El mal gana cuando los jugadores malvados igualan o superan a los buenos. ¡Permanece oculto y elimina al pueblo!",
        },
    },

    roles: {
        villager: {
            name: "Aldeano",
            description: "No tienes ninguna habilidad. ¡Pero sigues siendo una buena persona! Ayuda a tu pueblo a encontrar al Demonio.",
        },
        imp: {
            name: "Imp",
            description: "Cada noche*, elige un jugador: muere. Si te matas a ti mismo, un Secuaz se convierte en el Imp.",
            history: {
                choseToKill: "{player} eligió matar a {target}",
                failedToKill: "{player} intentó matar a {target}, pero estaba protegido/a",
            },
        },
        washerwoman: {
            name: "Lavandera",
            description: "Empiezas sabiendo que 1 de 2 jugadores es un Aldeano en particular.",
            history: {
                discoveredTownsfolk: "{player} descubrió que {player1} o {player2} es el/la {role}",
            },
        },
        librarian: {
            name: "Bibliotecario",
            description: "Empiezas sabiendo que 1 de 2 jugadores es un Forastero en particular. (O que no hay ninguno en juego.)",
            history: {
                discoveredOutsider: "{player} descubrió que {player1} o {player2} es el/la {role}",
                noOutsiders: "{player} descubrió que no hay Forasteros en esta partida",
            },
        },
        investigator: {
            name: "Investigador",
            description: "Empiezas sabiendo que 1 de 2 jugadores es un Secuaz en particular.",
            history: {
                discoveredMinion: "{player} descubrió que {player1} o {player2} es el/la {role}",
            },
        },
        chef: {
            name: "Chef",
            description: "Empiezas sabiendo cuántas parejas de jugadores malvados hay.",
            history: {
                sawEvilPairs: "{player} descubrió que hay {count} parejas de jugadores malvados sentados juntos",
            },
        },
        empath: {
            name: "Empático",
            description: "Cada noche, descubres cuántos de tus 2 vecinos vivos son malvados.",
            history: {
                sawEvilNeighbors: "{player} descubrió que {count} de sus vecinos son malvados",
            },
        },
        monk: {
            name: "Monje",
            description: "Cada noche*, elige un jugador (no tú mismo): está a salvo del Demonio esta noche.",
            history: {
                protectedPlayer: "{player} protegió a {target} por esta noche",
            },
        },
        soldier: {
            name: "Soldado",
            description: "Estás a salvo del Demonio.",
        },
    },

    effects: {
        dead: {
            name: "Muerto",
            description: "Este jugador está muerto y no puede votar ni nominar (excepto por un voto final de muerto).",
        },
        used_dead_vote: {
            name: "Voto de Muerto Usado",
            description: "Este jugador muerto ha usado su único voto de muerto y no puede votar de nuevo.",
        },
        safe: {
            name: "A Salvo",
            description: "Este jugador está protegido de la muerte del Demonio.",
        },
    },

    ui: {
        effects: "Efectos",
        seeRoleCard: "Ver Carta de Rol",
    },

    history: {
        gameStarted: "Partida iniciada",
        nightBegins: "Noche {round} comienza",
        sunRises: "El sol sale...",
        diedInNight: "{player} ha muerto en la noche",
        dayBegins: "Día {round} comienza",
        learnedRole: "{player} descubrió que es el/la {role}",
        noActionTonight: "{role} no tiene acción esta noche",
        nominates: "{nominator} nomina a {nominee}",
        voteResult: "{player}: {for} a favor, {against} en contra. ",
        votePassed: "¡La votación pasa!",
        voteFailed: "La votación falla.",
        executed: "{player} ha sido ejecutado/a",
        goodWins: "¡El Bien gana! El Demonio ha sido derrotado.",
        evilWins: "¡El Mal gana! El pueblo ha caído.",
    },

    scripts: {
        "trouble-brewing": "Problemas en el Pueblo",
    },
};

export default es;
