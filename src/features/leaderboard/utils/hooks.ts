import { useMemo } from "react";
import {
	getFeaturedStats,
	getLeaderboard,
	getPlayerChampionships,
	getLeaderboardByTypeAndYear,
	getLeaderboardOptions,
} from "./calculations";
import { usePlayerData } from "features/players/utils/hooks";
import type { GameType } from "features/games/types";
import { usePlayers } from "features/players/context/PlayersContext";
import { useGames } from "features/games/context/GamesContext";
import { useEvents } from "features/events/context/EventsContext";
import { useResults } from "features/events/context/ResultsContext";

export function usePlayerLeaderboard(gameType?: GameType) {
	const playerData = usePlayerData(gameType);
	return useMemo(() => getLeaderboard(playerData), [playerData]);
}

export function usePlayerFeaturedStats(gameType?: GameType) {
	const leaderboard = usePlayerLeaderboard(gameType);
	return useMemo(() => getFeaturedStats(leaderboard), [leaderboard]);
}

export function usePlayerChampionships(gameType?: GameType) {
	const { events } = useEvents();
	const { results } = useResults();
	const { players } = usePlayers();
	const { gameById } = useGames();

	return useMemo(
		() => getPlayerChampionships(events, results, players, gameById, gameType),
		[events, results, players, gameById, gameType],
	);
}

/**
 * Hook to get leaderboard filtered by game type and year
 * @param gameType - Type of games to filter by
 * @param year - Year to filter by (null for all years)
 */
export function useLeaderboardByTypeAndYear(gameType: GameType, year: number | null) {
	const { players } = usePlayers();
	const { results } = useResults();
	const { events } = useEvents();
	const { gameById } = useGames();

	return useMemo(
		() => getLeaderboardByTypeAndYear(players, results, events, gameById, gameType, year),
		[players, results, events, gameById, gameType, year],
	);
}

/**
 * Hook to get all available leaderboard options with leader info
 */
export function useLeaderboardOptions() {
	const { events } = useEvents();
	const { results } = useResults();
	const { players } = usePlayers();
	const { gameById } = useGames();

	return useMemo(
		() => getLeaderboardOptions(events, results, players, gameById),
		[events, results, players, gameById],
	);
}
