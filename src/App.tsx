import { useState } from "react";
import { Game } from "./lib/types";
import { createGame, PlayerSetup } from "./lib/game";
import {
    saveGame,
    setCurrentGameId,
    getGame,
    clearCurrentGame,
} from "./lib/storage";
import {
    MainMenu,
    PlayerEntry,
    RoleSelection,
    RoleAssignment,
    GameScreen,
    RolesLibrary,
} from "./components/screens";
import { LanguageToggle } from "./components/atoms";

type Screen =
    | { type: "main_menu" }
    | { type: "roles_library" }
    | { type: "new_game_players" }
    | { type: "new_game_roles"; players: string[] }
    | { type: "new_game_assign"; players: string[]; selectedRoles: string[] }
    | { type: "game"; game: Game };

function App() {
    const [screen, setScreen] = useState<Screen>({ type: "main_menu" });

    const handleNewGame = () => {
        setScreen({ type: "new_game_players" });
    };

    const handleRolesLibrary = () => {
        setScreen({ type: "roles_library" });
    };

    const handlePlayersNext = (players: string[]) => {
        setScreen({ type: "new_game_roles", players });
    };

    const handleRolesNext = (players: string[], selectedRoles: string[]) => {
        setScreen({ type: "new_game_assign", players, selectedRoles });
    };

    const handleStartGame = (
        roleAssignments: { name: string; roleId: string }[]
    ) => {
        const players: PlayerSetup[] = roleAssignments.map((a) => ({
            name: a.name,
            roleId: a.roleId,
        }));

        const gameName = `Game ${new Date().toLocaleDateString()}`;
        const game = createGame(gameName, players);

        saveGame(game);
        setCurrentGameId(game.id);

        setScreen({ type: "game", game });
    };

    const handleContinueGame = (gameId: string) => {
        const game = getGame(gameId);
        if (game) {
            setCurrentGameId(gameId);
            setScreen({ type: "game", game });
        }
    };

    const handleLoadGame = (gameId: string) => {
        const game = getGame(gameId);
        if (game) {
            setCurrentGameId(gameId);
            setScreen({ type: "game", game });
        }
    };

    const handleMainMenu = () => {
        clearCurrentGame();
        setScreen({ type: "main_menu" });
    };

    const handleBack = () => {
        setScreen({ type: "main_menu" });
    };

    const renderScreen = () => {
        switch (screen.type) {
            case "main_menu":
                return (
                    <MainMenu
                        onNewGame={handleNewGame}
                        onContinue={handleContinueGame}
                        onLoadGame={handleLoadGame}
                        onRolesLibrary={handleRolesLibrary}
                    />
                );

            case "roles_library":
                return (
                    <RolesLibrary
                        onBack={handleBack}
                    />
                );

            case "new_game_players":
                return <PlayerEntry onNext={handlePlayersNext} onBack={handleBack} />;

            case "new_game_roles":
                return (
                    <RoleSelection
                        players={screen.players}
                        onNext={(selectedRoles) => handleRolesNext(screen.players, selectedRoles)}
                        onBack={() => setScreen({ type: "new_game_players" })}
                    />
                );

            case "new_game_assign":
                return (
                    <RoleAssignment
                        players={screen.players}
                        selectedRoles={screen.selectedRoles}
                        onStart={handleStartGame}
                        onBack={() => setScreen({ type: "new_game_roles", players: screen.players })}
                    />
                );

            case "game":
                return (
                    <GameScreen
                        initialGame={screen.game}
                        onMainMenu={handleMainMenu}
                    />
                );

            default:
                return null;
        }
    };

    // For game screen, it handles its own language toggle
    if (screen.type === "game") {
        return renderScreen();
    }

    // For all other screens, wrap with floating language toggle
    return (
        <div className="relative">
            {renderScreen()}
            <div className="fixed top-4 right-4 z-50">
                <LanguageToggle variant="floating" />
            </div>
        </div>
    );
}

export default App;
