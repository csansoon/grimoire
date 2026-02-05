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
        },
    },

    effects: {
        dead: "Muerto",
        usedDeadVote: "Voto de muerto usado",
    },

    ui: {
        effects: "Efectos",
        seeRoleCard: "Ver Carta de Rol",
    },
};

export default es;
