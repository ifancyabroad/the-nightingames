/**
 * Stats calculation thresholds for qualifying and filtering
 */
export const STATS_THRESHOLDS = {
	/** Minimum games required to qualify for "best game" stats */
	MIN_GAMES_FOR_BEST_GAME: 3,
	/** Minimum games required to appear on leaderboard */
	MIN_GAMES_FOR_LEADERBOARD: 1,
	/** Minimum games required for win rate calculations */
	MIN_GAMES_FOR_WIN_RATE: 3,
} as const;

/**
 * Display limits for charts, tables, and UI elements
 */
export const DISPLAY_LIMITS = {
	CHARTS: {
		/** Top winning players chart - number of players to display */
		TOP_WINNING_PLAYERS: 8,
		/** Players over time chart - number of player lines to display */
		TOP_PLAYERS_OVER_TIME: 8,
		/** Game trends chart - number of games to display */
		GAME_TRENDS: 8,
		/** Game points chart - number of games to display */
		GAME_POINTS: 8,
		/** Points by game pie chart - number of slices to display */
		POINTS_BY_GAME_PIE: 8,
		/** Most played games - number of games to display */
		MOST_PLAYED_GAMES: 8,
		/** Recent games window - number of games in recent form/win rate charts */
		RECENT_GAMES: 20,
		/** Recent form chart - number of events to display */
		RECENT_FORM_EVENTS: 5,
		/** Player win rates chart - number of players to display */
		PLAYER_WIN_RATES: 8,
		/** Game difficulty/competitiveness chart - number of games to display */
		GAME_DIFFICULTY: 8,
	},
	TABLES: {
		/** Performance by game table - number of rows to display */
		PERFORMANCE_BY_GAME: 10,
		/** Top players per game table - number of players to display */
		TOP_PLAYERS: 10,
		/** Top opponents list - number of opponents to display */
		TOP_OPPONENTS: 5,
		/** Streaks - number of win/loss streaks to display */
		STREAKS: 5,
		/** Rivalries - number of top/lopsided rivalries to display */
		RIVALRIES: 5,
	},
	UI: {
		/** Recent events summary - number of events to display */
		RECENT_EVENTS: 3,
		/** Event card - maximum avatars before showing "+X more" */
		EVENT_CARD_MAX_AVATARS: 6,
	},
} as const;
