export interface IPlayer {
	id: string;
	firstName: string;
	lastName: string;
	preferredName: string | null;
	pictureUrl: string | null;
	color: string;
	showOnLeaderboard: boolean;
	linkedUserId: string | null;
}

export interface BestGame {
	gameId: string;
	gameName: string;
	gameType: "board" | "video";
	points: number;
}

export interface PlayerData {
	playerId: string;
	name: string;
	fullName: string;
	color: string;
	points: number;
	wins: number;
	games: number;
	winRate: number; // Decimal (0-1)
	winRatePercent: number; // Percentage (0-100)
	recentForm: (number | null)[]; // Points from last 3 events (newest first), null if not attended
	bestGame: BestGame | null;
}

export interface PlayerWithData extends IPlayer {
	data: PlayerData;
}

export interface PlayerEntry {
	resultId: string;
	gameId: string;
	isWinner: boolean | null;
	isLoser: boolean | null;
	rank: number | null;
	opponents: string[];
}

export interface GameWinRateRow {
	gameId: string;
	name: string;
	games: number;
	wins: number;
	wr: number;
	points: number;
	color: string;
}

export interface PlayerAggregates {
	bestGame?: GameWinRateRow | undefined;
	mostPlayed?: GameWinRateRow | undefined;
	mostPoints?: GameWinRateRow | undefined;
	gameWinRates: GameWinRateRow[];
	rankCounts: Array<{ rank: number; count: number }>;
	lastGamesSeries: Array<{ x: number; wr: number }>;
	recentFormSeries: Array<{ x: number; points: number | null }>;
}

export interface PlayerStreaks {
	longestWinStreak: number;
	longestLossStreak: number;
}
