import type { GameType } from "features/games/types";
import type { IEvent, IResult } from "features/events/types";
import type { IGame } from "features/games/types";
import type { IPlayer } from "features/players/types";
import type { LeaderboardDropdownOption } from "features/leaderboard/components/LeaderboardDropdown";
import { getAvailableYears } from "common/utils/yearFilter";
import { getLeaderboardByTypeAndYear } from "./filtering";

/**
 * Generate all available leaderboard options with leader info
 * Creates options for all combinations of game type and year that have results
 * @param events - All events
 * @param results - All results
 * @param players - All players
 * @param gameById - Map of game IDs to games
 * @returns Array of leaderboard options with current leader data
 */
export function getLeaderboardOptions(
	events: IEvent[],
	results: IResult[],
	players: IPlayer[],
	gameById: Map<string, IGame>,
): LeaderboardDropdownOption[] {
	const availableYears = getAvailableYears(events);
	const currentYear = new Date().getFullYear();
	const options: LeaderboardDropdownOption[] = [];

	// Helper to check if a game type + year combo has results
	const hasResults = (year: number | null, gameType: GameType): boolean => {
		const filteredResults = results.filter((result) => {
			const event = events.find((e) => e.id === result.eventId);
			if (!event) return false;

			const eventYear = new Date(event.date).getFullYear();
			if (year !== null && eventYear !== year) return false;

			const game = gameById.get(result.gameId);
			return game?.type === gameType;
		});

		return filteredResults.length > 0;
	};

	// Helper to get leader for a leaderboard
	const getLeader = (year: number | null, gameType: GameType) => {
		const leaderboard = getLeaderboardByTypeAndYear(players, results, events, gameById, gameType, year);
		return leaderboard.length > 0 ? leaderboard[0] : null;
	};

	// Add "All Board Games" and "All Video Games" options if they have results
	// if (hasResults(null, "board")) {
	// 	options.push({
	// 		gameType: "board",
	// 		year: null,
	// 		label: "All Board Games",
	// 		value: "board-all",
	// 		leader: getLeader(null, "board"),
	// 	});
	// }
	// if (hasResults(null, "video")) {
	// 	options.push({
	// 		gameType: "video",
	// 		year: null,
	// 		label: "All Video Games",
	// 		value: "video-all",
	// 		leader: getLeader(null, "video"),
	// 	});
	// }

	// Add year-specific options for each game type
	availableYears.forEach((year) => {
		const isPastYear = year < currentYear;

		if (hasResults(year, "board")) {
			options.push({
				gameType: "board",
				year,
				label: `Board Games ${year}`,
				value: `board-${year}`,
				leader: getLeader(year, "board"),
				isChampionship: isPastYear,
			});
		}
		if (hasResults(year, "video")) {
			options.push({
				gameType: "video",
				year,
				label: `Video Games ${year}`,
				value: `video-${year}`,
				leader: getLeader(year, "video"),
				isChampionship: isPastYear,
			});
		}
	});

	// If no options available, add default current year board games
	if (options.length === 0) {
		options.push({
			gameType: "board",
			year: currentYear,
			label: `Board Games ${currentYear}`,
			value: `board-${currentYear}`,
		});
	}

	return options;
}
