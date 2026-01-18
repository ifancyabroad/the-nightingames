import type { GameType } from "features/games/types";

export interface ParsedLeaderboardSelection {
	gameType: GameType;
	year: number | null;
}

/**
 * Parse leaderboard selection string into structured data
 * @param selection - Selection string in format "board-2025" or "video-all"
 * @returns Parsed game type and year (null for "all")
 * @example
 * parseLeaderboardSelection("board-2025") // { gameType: "board", year: 2025 }
 * parseLeaderboardSelection("video-all") // { gameType: "video", year: null }
 */
export function parseLeaderboardSelection(selection: string): ParsedLeaderboardSelection {
	const [type, yearStr] = selection.split("-");
	return {
		gameType: type as GameType,
		year: yearStr === "all" ? null : Number(yearStr),
	};
}
