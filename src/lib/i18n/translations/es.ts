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
        minPlayersWarning: "Añade al menos 5 jugadores para continuar",
        nextSelectRoles: "Siguiente: Seleccionar Roles",
        loadedFromLastGame: "De la última partida",

        step2Title: "Nueva Partida",
        step2Subtitle: "Paso 2: Seleccionar roles en juego",
        needAtLeastRoles: "Se necesitan al menos {count} roles",
        needAtLeastImp: "Se necesita al menos 1 Imp",
        nextAssignRoles: "Siguiente: Asignar Roles",
        suggested: "Sugerido",

        step3Title: "Nueva Partida",
        step3Subtitle: "Paso 3: Asignar roles (opcional)",
        assignmentInfo: "Opcionalmente asigna roles específicos a jugadores. Los jugadores sin asignar reciben roles aleatorios.",
        resetToRandom: "Restablecer todo a aleatorio",
        playerAssignments: "Asignaciones de Jugadores",
        randomPool: "Pool Aleatorio",
        rolesForPlayers: "{roles} roles para {players} jugadores",
        impNotAssignedWarning: "¡El Imp no será asignado! Asegúrate de que al menos un jugador reciba el Imp o deja algunos jugadores en aleatorio.",
        rolesRandomlyAssigned: "Los roles se asignarán aleatoriamente",
        customizeAssignments: "Personalizar Asignaciones",
        tapToAssign: "Toca un jugador para asignar un rol específico",
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
        executionAlreadyHappened: "Ya ha habido una ejecución hoy",
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

        // Slayer
        slayerAction: "Disparo del Matador",
        slayerActionDescription: "Proclama ser el Matador y dispara a un jugador",
        selectSlayer: "Seleccionar Matador",
        selectTarget: "Seleccionar Objetivo",
        confirmSlayerShot: "Confirmar Disparo",

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

        // Fortune Teller specific
        fortuneTellerInfo: "Tu Visión",
        selectTwoPlayersToCheck: "Selecciona 2 jugadores para verificar si son Demonios.",
        selectRedHerring: "Asignar Pista Falsa",
        redHerringInfo: "Selecciona un jugador bueno que se registrará como Demonio para este Adivino.",
        selectGoodPlayerAsRedHerring: "Selecciona un jugador bueno como Pista Falsa",
        selectRandomRedHerring: "Aleatorio",
        yesOneIsDemon: "SÍ — ¡Uno de ellos es un Demonio!",
        noNeitherIsDemon: "NO — Ninguno es un Demonio.",

        // Undertaker specific
        undertakerInfo: "El Rol del Ejecutado",
        executedPlayerRole: "El jugador ejecutado hoy era...",
        noExecutionToday: "Nadie fue ejecutado hoy.",

        // Ravenkeeper specific
        ravenkeeperInfo: "Elige un Jugador",
        selectPlayerToSeeRole: "¡Has muerto! Selecciona un jugador para conocer su rol.",
        playerRoleIs: "Su rol es...",

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
            bounceTitle: "¡Asesinato Redirigido!",
            bounceDescription: "El Demonio eligió a {target}, pero su asesinato rebotó. Elige quién muere en su lugar.",
            bounceOriginalLabel: "objetivo original",
            history: {
                choseToKill: "{player} eligió matar a {target}",
                failedToKill: "{player} intentó matar a {target}, pero estaba protegido/a",
                bounceRedirected: "{player} eligió a {target}, pero el asesinato fue redirigido a {redirect}",
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
        fortune_teller: {
            name: "Adivino",
            description:
                "Cada noche, elige 2 jugadores: descubres si alguno es un Demonio. Hay un jugador bueno que se registra como Demonio para ti.",
            history: {
                sawDemon: "{player} revisó a {player1} y {player2} — SÍ, uno es un Demonio (o Pista Falsa)",
                sawNoDemon: "{player} revisó a {player1} y {player2} — NO, ninguno es un Demonio",
                redHerringAssigned: "{redHerring} fue asignado como la Pista Falsa para {player}",
            },
        },
        undertaker: {
            name: "Enterrador",
            description:
                "Cada noche*, descubres qué personaje murió por ejecución hoy.",
            history: {
                sawExecutedRole: "{player} descubrió que el jugador ejecutado era el/la {role}",
                noExecution: "{player} descubrió que no hubo ejecución hoy",
            },
        },
        ravenkeeper: {
            name: "Guardacuervos",
            description:
                "Si mueres de noche, te despiertan para elegir un jugador: descubres su personaje.",
            history: {
                sawRole: "{player} eligió ver el rol de {target}: {role}",
            },
        },
        virgin: {
            name: "Virgen",
            description:
                "La primera vez que eres nominado, si el nominador es un Aldeano, es ejecutado inmediatamente.",
            history: {
                townsfolkExecuted: "¡{nominator} nominó a la Virgen y fue ejecutado!",
                lostPurity: "{nominator} nominó a la Virgen — el poder de la Virgen se ha agotado",
            },
        },
        slayer: {
            name: "Matador",
            description:
                "Una vez por partida, durante el día, elige públicamente a un jugador: si es el Demonio, muere.",
            history: {
                killedDemon: "¡{slayer} disparó a {target} — era el Demonio!",
                missed: "{slayer} disparó a {target} — no pasó nada",
            },
        },
        mayor: {
            name: "Alcalde",
            description:
                "Si solo quedan 3 jugadores vivos y no hay ejecución, tu equipo gana. Si mueres de noche, otro jugador podría morir en tu lugar.",
        },
        saint: {
            name: "Santo",
            description:
                "Si mueres por ejecución, tu equipo pierde.",
        },
        scarlet_woman: {
            name: "Mujer Escarlata",
            description:
                "Si hay 5 o más jugadores vivos y el Demonio muere, tú te conviertes en el Demonio.",
            history: {
                becameDemon: "{player} se convirtió en el/la {role}",
            },
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
        red_herring: {
            name: "Pista Falsa",
            description:
                "Este jugador se registra como un Demonio para un Adivino específico.",
        },
        pure: {
            name: "Pura",
            description:
                "Si un Aldeano nomina a este jugador, ese Aldeano es ejecutado en su lugar.",
        },
        slayer_bullet: {
            name: "Disparo del Matador",
            description:
                "Este jugador puede usar su habilidad de Matador para disparar a un jugador.",
        },
        bounce: {
            name: "Rebote",
            description:
                "Si este jugador es objetivo del Demonio de noche, el Narrador puede redirigir la muerte a otro jugador.",
        },
        martyrdom: {
            name: "Martirio",
            description:
                "Si este jugador es ejecutado, el equipo malvado gana.",
        },
        scarlet_woman: {
            name: "Mujer Escarlata",
            description:
                "Si el Demonio muere con 5+ jugadores vivos, el jugador con este efecto se convierte en el Demonio.",
        },
    },

    ui: {
        effects: "Efectos",
        seeRoleCard: "Ver Carta de Rol",
        editEffects: "Editar Efectos",
        currentEffects: "Efectos Actuales",
        addEffect: "Añadir Efecto",
        noEffects: "Sin efectos",
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
        effectAdded: "El Narrador añadió {effect} a {player}",
        effectRemoved: "El Narrador eliminó {effect} de {player}",
        roleChanged: "{player} se convirtió en el/la {role}",
    },

    scripts: {
        "trouble-brewing": "Problemas en el Pueblo",
    },
};

export default es;
