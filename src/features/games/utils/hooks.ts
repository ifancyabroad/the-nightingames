import { useMemo } from "react";
import { getGameResults, computeGameData, aggregateGameStatsForPage } from "./calculations";
import type { GameWithData } from "features/games/types";
import { useGames } from "features/games/context/GamesContext";
import { usePlayers } from "features/players/context/PlayersContext";
import { useEvents } from "features/events/context/EventsContext";
import { useResults } from "features/events/context/ResultsContext";
import { useSortedResults } from "features/events/utils/hooks";

/**
 * Get all games with computed data
 */
export function useGameData(): GameWithData[] {
	const { games } = useGames();
	const { results } = useResults();
	return useMemo(() => computeGameData(games, results), [games, results]);
}

/**
 * Get a specific game with computed data by ID
 */
export function useGameDataById(gameId: string): GameWithData | undefined {
	const allData = useGameData();
	return useMemo(() => allData.find((data) => data.id === gameId), [allData, gameId]);
}

/**
 * Get all results for a specific game
 */
export function useGameResults(gameId: string) {
	const results = useSortedResults();
	return useMemo(() => getGameResults(results, gameId), [results, gameId]);
}

/**
 * Get aggregated stats for a game page
 */
export function useGamePageStats(gameId: string) {
	const gameResults = useGameResults(gameId);
	const { playerById } = usePlayers();
	const { eventById } = useEvents();
	const { gameById } = useGames();
	return useMemo(
		() => aggregateGameStatsForPage(gameResults, playerById, eventById, gameById),
		[gameResults, playerById, eventById, gameById],
	);
}
