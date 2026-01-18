import React from "react";
import { Link } from "react-router";
import { Trophy, BarChart3, Calendar, TrendingUp, TrendingDown, Swords, ArrowRight } from "lucide-react";
import { useCurrentPlayer } from "features/players/utils/hooks";
import {
	useLastEventTopScorers,
	useLongestDrought,
	useCurrentYearBoardGamesLeaderboard,
} from "features/dashboard/utils/hooks";
import { useSortedEvents } from "features/events/utils/hooks";
import { useTopRivalries } from "features/stats/utils/hooks";
import { LeaderCard } from "features/dashboard/components/LeaderCard";
import { EventCard } from "features/dashboard/components/EventCard";
import { Card, EmptyState } from "common/components";
import { getDisplayName } from "features/players/utils/helpers";
import { pluralize } from "common/utils/helpers";

export const HomePage: React.FC = () => {
	const linkedPlayer = useCurrentPlayer();
	const welcomeName = linkedPlayer ? getDisplayName(linkedPlayer) : null;
	const currentYear = new Date().getFullYear();

	// Get current year board games leaderboard (default dashboard leaderboard)
	const currentYearBoardGamesLeaderboard = useCurrentYearBoardGamesLeaderboard();
	const topThree = currentYearBoardGamesLeaderboard.slice(0, 3);

	// Recent activity
	const sortedEvents = useSortedEvents();
	const latestEvents = sortedEvents.slice(0, 3);

	// Insights (these use all-time data)
	const topScorers = useLastEventTopScorers();
	const longestDrought = useLongestDrought();
	const topRivalries = useTopRivalries();
	const topRivalry = topRivalries.length > 0 ? topRivalries[0] : null;

	const hasData = currentYearBoardGamesLeaderboard.length > 0;

	return (
		<div className="mx-auto max-w-6xl">
			{/* Welcome Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Welcome back{welcomeName ? `, ${welcomeName}` : ""}! 👋
				</h1>
				<p className="text-sm text-[var(--color-text-secondary)]">
					Here's what's been happening in your game nights
				</p>
			</div>

			{!hasData ? (
				<EmptyState>
					<div className="flex flex-col items-center gap-3">
						<Trophy className="h-12 w-12 text-[var(--color-text-secondary)]" />
						<div>
							<p className="mb-1 font-semibold text-[var(--color-text)]">No events recorded yet</p>
							<p className="text-sm">
								Events and results will appear here once they're added to the system.
							</p>
						</div>
					</div>
				</EmptyState>
			) : (
				<div className="space-y-6 sm:space-y-8">
					{/* Current Year Board Games Leaders */}
					<section>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-base font-bold text-[var(--color-text)] md:text-lg">
								Current Leaders ({currentYear} Board Games)
							</h2>
							<Link
								to="/leaderboard"
								className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
							>
								<span>View All</span>
								<ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</div>
						{topThree.length > 0 ? (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{topThree.map((player, idx) => (
									<LeaderCard key={player.id} player={player} rank={idx + 1} />
								))}
							</div>
						) : (
							<Card className="p-6 text-center">
								<p className="text-sm text-[var(--color-text-secondary)]">
									No board game results for {currentYear} yet
								</p>
							</Card>
						)}
					</section>

					{/* Latest Events */}
					{latestEvents.length > 0 && (
						<section>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-base font-bold text-[var(--color-text)] md:text-lg">
									Recent Events
								</h2>
								<Link
									to="/events"
									className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
								>
									<span>View All</span>
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
							</div>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{latestEvents.map((event) => (
									<EventCard key={event.id} event={event} />
								))}
							</div>
						</section>
					)}

					{/* Dynamic Insights */}
					<section>
						<h2 className="mb-4 text-base font-bold text-[var(--color-text)] md:text-lg">Highlights</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{/* Top Scorer(s) from Last Event */}
							{topScorers.length > 0 ? (
								<Card className="relative overflow-hidden border-2 border-[var(--color-success)]/30 bg-gradient-to-br from-[var(--color-success)]/10 via-[var(--color-success)]/5 to-transparent p-4">
									<div className="mb-3 inline-flex rounded-lg bg-[var(--color-success)]/20 p-2">
										<TrendingUp className="h-5 w-5 text-[var(--color-success)]" />
									</div>
									<h3 className="mb-3 font-semibold text-[var(--color-text)]">
										Last Event Top Scorer
									</h3>
									<div className="space-y-2">
										{topScorers.map((scorer, idx) => (
											<div key={idx} className="flex items-center justify-between">
												<span className="text-sm text-[var(--color-text)]">
													{getDisplayName(scorer.player)}
												</span>
												<span className="font-semibold text-[var(--color-success)]">
													{scorer.points} {pluralize(scorer.points, "point")}
												</span>
											</div>
										))}
									</div>
								</Card>
							) : (
								<Card className="relative overflow-hidden border-2 border-[var(--color-success)]/20 bg-gradient-to-br from-[var(--color-success)]/5 via-[var(--color-success)]/5 to-transparent p-4">
									<div className="mb-3 inline-flex rounded-lg bg-[var(--color-success)]/20 p-2">
										<TrendingUp className="h-5 w-5 text-[var(--color-success)]" />
									</div>
									<h3 className="mb-3 font-semibold text-[var(--color-text)]">
										Last Event Top Scorer
									</h3>
									<p className="text-sm text-[var(--color-text-secondary)]">
										No recent event results yet
									</p>
								</Card>
							)}

							{/* Longest Drought */}
							{longestDrought ? (
								<Card className="relative overflow-hidden border-2 border-[var(--color-warning)]/30 bg-gradient-to-br from-[var(--color-warning)]/10 via-[var(--color-warning)]/5 to-transparent p-4">
									<div className="mb-3 inline-flex rounded-lg bg-[var(--color-warning)]/20 p-2">
										<TrendingDown className="h-5 w-5 text-[var(--color-warning)]" />
									</div>
									<h3 className="mb-3 font-semibold text-[var(--color-text)]">Longest Drought</h3>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--color-text-secondary)]">Player</span>
											<span className="font-medium text-[var(--color-text)]">
												{getDisplayName(longestDrought.player)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--color-text-secondary)]">
												Games Since Win
											</span>
											<span className="font-semibold text-[var(--color-warning)]">
												{longestDrought.gamesSinceWin}
											</span>
										</div>
									</div>
								</Card>
							) : (
								<Card className="relative overflow-hidden border-2 border-[var(--color-warning)]/20 bg-gradient-to-br from-[var(--color-warning)]/5 via-[var(--color-warning)]/5 to-transparent p-4">
									<div className="mb-3 inline-flex rounded-lg bg-[var(--color-warning)]/20 p-2">
										<TrendingDown className="h-5 w-5 text-[var(--color-warning)]" />
									</div>
									<h3 className="mb-3 font-semibold text-[var(--color-text)]">Longest Drought</h3>
									<p className="text-sm text-[var(--color-text-secondary)]">
										Everyone's winning! No active droughts
									</p>
								</Card>
							)}

							{/* Top Rivalry */}
							{topRivalry ? (
								<Card className="relative overflow-hidden border-2 border-[var(--color-info)]/30 bg-gradient-to-br from-[var(--color-info)]/10 via-[var(--color-info)]/5 to-transparent p-4">
									<div className="mb-3 inline-flex rounded-lg bg-[var(--color-info)]/20 p-2">
										<Swords className="h-5 w-5 text-[var(--color-info)]" />
									</div>
									<h3 className="mb-3 font-semibold text-[var(--color-text)]">Hottest Rivalry</h3>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--color-text-secondary)]">Players</span>
											<span className="font-medium text-[var(--color-text)]">
												{topRivalry.player1Name} vs {topRivalry.player2Name}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--color-text-secondary)]">
												Head-to-Head
											</span>
											<span className="font-semibold text-[var(--color-info)]">
												{topRivalry.player1Wins}-{topRivalry.player2Wins}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--color-text-secondary)]">
												Games Played
											</span>
											<span className="font-medium text-[var(--color-text)]">
												{topRivalry.totalGames}
											</span>
										</div>
									</div>
								</Card>
							) : (
								<Card className="relative overflow-hidden border-2 border-[var(--color-info)]/20 bg-gradient-to-br from-[var(--color-info)]/5 via-[var(--color-info)]/5 to-transparent p-4">
									<div className="mb-3 inline-flex rounded-lg bg-[var(--color-info)]/20 p-2">
										<Swords className="h-5 w-5 text-[var(--color-info)]" />
									</div>
									<h3 className="mb-3 font-semibold text-[var(--color-text)]">Hottest Rivalry</h3>
									<p className="text-sm text-[var(--color-text-secondary)]">
										No rivalries yet - play more games together!
									</p>
								</Card>
							)}
						</div>
					</section>

					{/* Quick Navigation */}
					<section>
						<h2 className="mb-4 text-lg font-bold text-[var(--color-text)] sm:text-xl">Explore</h2>
						<div className="grid gap-4 sm:grid-cols-3">
							<Link to="/leaderboard">
								<Card
									variant="interactive"
									className="group relative overflow-hidden border-2 border-transparent p-5 transition-all hover:border-[var(--color-gold)]/50 hover:bg-gradient-to-br hover:from-[var(--color-gold)]/10 hover:to-transparent"
								>
									<div className="mb-3 inline-flex rounded-xl bg-[var(--color-gold)]/20 p-3 transition-all group-hover:scale-110 group-hover:bg-[var(--color-gold)]/30">
										<Trophy className="h-6 w-6 text-[var(--color-gold)]" />
									</div>
									<h3 className="mb-1 text-lg font-bold text-[var(--color-text)]">Leaderboard</h3>
									<p className="text-sm text-[var(--color-text-secondary)]">
										View complete player rankings and stats
									</p>
								</Card>
							</Link>

							<Link to="/stats">
								<Card
									variant="interactive"
									className="group relative overflow-hidden border-2 border-transparent p-5 transition-all hover:border-[var(--color-info)]/50 hover:bg-gradient-to-br hover:from-[var(--color-info)]/10 hover:to-transparent"
								>
									<div className="mb-3 inline-flex rounded-xl bg-[var(--color-info)]/20 p-3 transition-all group-hover:scale-110 group-hover:bg-[var(--color-info)]/30">
										<BarChart3 className="h-6 w-6 text-[var(--color-info)]" />
									</div>
									<h3 className="mb-1 text-lg font-bold text-[var(--color-text)]">Stats</h3>
									<p className="text-sm text-[var(--color-text-secondary)]">
										Dive into detailed analytics and trends
									</p>
								</Card>
							</Link>

							<Link to="/events">
								<Card
									variant="interactive"
									className="group relative overflow-hidden border-2 border-transparent p-5 transition-all hover:border-[var(--color-primary)]/50 hover:bg-gradient-to-br hover:from-[var(--color-primary)]/10 hover:to-transparent"
								>
									<div className="mb-3 inline-flex rounded-xl bg-[var(--color-primary)]/20 p-3 transition-all group-hover:scale-110 group-hover:bg-[var(--color-primary)]/30">
										<Calendar className="h-6 w-6 text-[var(--color-primary)]" />
									</div>
									<h3 className="mb-1 text-lg font-bold text-[var(--color-text)]">Events</h3>
									<p className="text-sm text-[var(--color-text-secondary)]">
										Browse all game nights and results
									</p>
								</Card>
							</Link>
						</div>
					</section>
				</div>
			)}
		</div>
	);
};

export default HomePage;
