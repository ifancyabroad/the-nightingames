import type { PlayerEntry, GameWinRateRow, PlayerAggregates } from "features/players/types";
import type { IGame } from "features/games/types";
import type { IEvent, IResult } from "features/events/types";
import { isPlayerWinner } from "common/utils/gameHelpers";
import { calculateWinRatePercent } from "common/utils/calculations";
import { getColorForGame, getDisplayName } from "features/games/utils/helpers";
import { sortEventsByDate } from "common/utils/sorting";
import { STATS_THRESHOLDS, DISPLAY_LIMITS } from "common/utils/constants";

interface GameStatsAccumulator {
	games: number;
	wins: number;
}

interface WinRatePoint {
	idx: number;
	cumWins: number;
	cumGames: number;
	wr: number;
}

/**
 * Build game win rate statistics
 */
function buildGameWinRates(entries: PlayerEntry[], gameById: Map<string, IGame>): GameWinRateRow[] {
	const byGame: Record<string, GameStatsAccumulator> = {};

	entries.forEach((entry) => {
		if (!byGame[entry.gameId]) {
			byGame[entry.gameId] = { games: 0, wins: 0 };
		}

		byGame[entry.gameId].games++;
		if (isPlayerWinner(entry)) {
			byGame[entry.gameId].wins++;
		}
	});

	return Object.entries(byGame).map(([gameId, stats]) => {
		const game = gameById.get(gameId);
		return {
			gameId,
			name: getDisplayName(game),
			color: getColorForGame(game),
			games: stats.games,
			wins: stats.wins,
			wr: stats.games ? stats.wins / stats.games : 0,
			points: (game?.points ?? 0) * stats.wins,
		};
	});
}

/**
 * Build rank distribution
 */
function buildRankCounts(entries: PlayerEntry[]): Array<{ rank: number; count: number }> {
	const ranks: Record<number, number> = {};

	entries.forEach((entry) => {
		const rank = Number.isFinite(entry.rank as number) ? (entry.rank as number) : -1;
		if (rank > 0) {
			ranks[rank] = (ranks[rank] ?? 0) + 1;
		}
	});

	return Object.entries(ranks)
		.sort((a, b) => Number(a[0]) - Number(b[0]))
		.map(([rank, count]) => ({ rank: Number(rank), count }));
}

/**
 * Build cumulative win rate series
 */
function buildWinRateSeries(entries: PlayerEntry[], recentWindow: number): WinRatePoint[] {
	const series: WinRatePoint[] = [];
	let cumWins = 0;
	let cumGames = 0;

	entries.forEach((entry, i) => {
		cumGames++;
		if (isPlayerWinner(entry)) cumWins++;

		series.push({
			idx: i + 1,
			cumWins,
			cumGames,
			wr: calculateWinRatePercent(cumWins, cumGames),
		});
	});

	return series.slice(-recentWindow);
}

/**
 * Find best game by win rate (minimum games required)
 */
function findBestGame(gameWinRates: GameWinRateRow[], minGames: number): GameWinRateRow | undefined {
	return gameWinRates.filter((g) => g.games >= minGames).sort((a, b) => b.wr - a.wr || b.games - a.games)[0];
}

/**
 * Find most played game
 */
function findMostPlayed(gameWinRates: GameWinRateRow[]): GameWinRateRow | undefined {
	return gameWinRates.slice().sort((a, b) => b.games - a.games || b.wr - a.wr)[0];
}

/**
 * Find game with most points earned
 */
function findMostPoints(gameWinRates: GameWinRateRow[]): GameWinRateRow | undefined {
	return gameWinRates.slice().sort((a, b) => b.points - a.points || b.wr - a.wr)[0];
}

/**
 * Build recent form series (points from recent events)
 */
function buildRecentFormSeries(
	playerId: string,
	events: IEvent[],
	results: IResult[],
	gameById: Map<string, IGame>,
	recentWindow: number,
): Array<{ x: number; points: number | null }> {
	const sortedEvents = sortEventsByDate(events, true); // Sort descending (newest first)
	const recentEvents = sortedEvents.slice(0, recentWindow);

	const formData = recentEvents.map((event) => {
		let eventPoints = 0;
		let playerAttended = false;

		results.forEach((result) => {
			if (result.eventId !== event.id) return;

			const game = gameById.get(result.gameId);
			if (!game) return;

			const playerResult = result.playerResults.find((pr) => pr.playerId === playerId);
			if (!playerResult) return;

			playerAttended = true;

			if (isPlayerWinner(playerResult)) {
				eventPoints += game.points;
			}
			if (playerResult.isLoser) {
				eventPoints -= game.points;
			}
		});

		return playerAttended ? eventPoints : null;
	});

	// Reverse to get oldest first, then map with index
	return formData
		.reverse()
		.map((points, i) => ({
			x: i + 1,
			points,
		}))
		.filter((d) => d.points !== null); // Only include events where player attended
}

/**
 * Aggregate player statistics for page display
 */
export function aggregatePlayerStatsForPage(
	playerId: string,
	entries: PlayerEntry[],
	gameById: Map<string, IGame>,
	events: IEvent[],
	results: IResult[],
	opts: { bestGameMinSamples?: number; recentWindow?: number; recentFormWindow?: number } = {},
): PlayerAggregates {
	const bestGameMinSamples = opts.bestGameMinSamples ?? STATS_THRESHOLDS.MIN_GAMES_FOR_BEST_GAME;
	const recentWindow = opts.recentWindow ?? DISPLAY_LIMITS.CHARTS.RECENT_GAMES;
	const recentFormWindow = opts.recentFormWindow ?? DISPLAY_LIMITS.CHARTS.RECENT_FORM_EVENTS;

	const gameWinRates = buildGameWinRates(entries, gameById);
	const rankCounts = buildRankCounts(entries);
	const winRateSeries = buildWinRateSeries(entries, recentWindow);
	const recentFormSeries = buildRecentFormSeries(playerId, events, results, gameById, recentFormWindow);

	const bestGame = findBestGame(gameWinRates, bestGameMinSamples);
	const mostPlayed = findMostPlayed(gameWinRates);
	const mostPoints = findMostPoints(gameWinRates);

	const lastGamesSeries = winRateSeries.map((p, i) => ({
		x: i + 1,
		wr: p.wr,
	}));

	return {
		bestGame,
		mostPlayed,
		mostPoints,
		gameWinRates,
		rankCounts,
		lastGamesSeries,
		recentFormSeries,
	};
}
