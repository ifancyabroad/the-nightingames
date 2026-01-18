import type { PlayerWithData } from "features/players/types";
import type { IPlayer } from "features/players/types";
import type { IResult, IEvent } from "features/events/types";
import type { IGame, GameType } from "features/games/types";
import { STATS_THRESHOLDS } from "common/utils/constants";
import { sortLeaderboard } from "common/utils/sorting";
import { filterResultsByYear } from "common/utils/yearFilter";
import { computePlayerData } from "features/players/utils/calculations";

/**
 * Filter and sort players to create leaderboard
 * Only includes players with minimum required games and showOnLeaderboard enabled
 */
export function getLeaderboard(players: PlayerWithData[]): PlayerWithData[] {
	const playersWithGames = players.filter(
		(player) => player.data.games >= STATS_THRESHOLDS.MIN_GAMES_FOR_LEADERBOARD && player.showOnLeaderboard,
	);
	return sortLeaderboard(playersWithGames);
}

/**
 * Calculate leaderboard filtered by game type and year
 * @param players - All players
 * @param results - All results
 * @param events - All events
 * @param gameById - Map of game IDs to games
 * @param gameType - Type of games to filter by
 * @param year - Year to filter by (null for all years)
 * @returns Filtered and sorted leaderboard
 */
export function getLeaderboardByTypeAndYear(
	players: IPlayer[],
	results: IResult[],
	events: IEvent[],
	gameById: Map<string, IGame>,
	gameType: GameType,
	year: number | null,
): PlayerWithData[] {
	// Filter results by year
	const yearFiltered = filterResultsByYear(results, events, year);

	// Filter by game type
	const typeFiltered = yearFiltered.filter((result) => {
		const game = gameById.get(result.gameId);
		return game?.type === gameType;
	});

	// Compute player data and leaderboard
	const playerData = computePlayerData(players, typeFiltered, gameById, events, gameType);
	return getLeaderboard(playerData);
}
