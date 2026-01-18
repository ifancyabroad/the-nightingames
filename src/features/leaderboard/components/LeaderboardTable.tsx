import { Trophy, Medal, Award } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { PlayerWithData } from "features/players/types";
import { Avatar } from "common/components";
import { formatPct } from "common/utils/helpers";
import { ChampionshipBadge } from "./ChampionshipBadge";
import { GameTypeIcon } from "features/games/components/GameTypeIcon";

const getRankIcon = (rank: number) => {
	if (rank === 1) return <Trophy className="h-4 w-4 shrink-0 text-[var(--color-gold)] sm:h-5 sm:w-5" />;
	if (rank === 2) return <Medal className="h-4 w-4 shrink-0 text-[var(--color-silver)] sm:h-5 sm:w-5" />;
	if (rank === 3) return <Award className="h-4 w-4 shrink-0 text-[var(--color-bronze)] sm:h-5 sm:w-5" />;
	return (
		<span className="inline-flex text-xs font-semibold text-[var(--color-text-secondary)] sm:text-sm">{rank}</span>
	);
};

const getRankBorderColor = (rank: number) => {
	if (rank === 1) return "bg-[var(--color-gold)]";
	if (rank === 2) return "bg-[var(--color-silver)]";
	if (rank === 3) return "bg-[var(--color-bronze)]";
	return "";
};

const getFormColor = (points: number | null) => {
	if (points === null) return "bg-gray-700 text-gray-400";
	if (points >= 3) return "bg-[var(--color-success)] text-[var(--color-success-contrast)]";
	if (points > 0) return "bg-[var(--color-primary)] text-[var(--color-primary-contrast)]";
	if (points === 0) return "bg-gray-500 text-white";
	return "bg-[var(--color-danger)] text-[var(--color-danger-contrast)]";
};

const formatFormValue = (points: number | null) => {
	if (points === null) return "—";
	if (points > 0) return `+${points}`;
	if (points === 0) return "0";
	return points.toString();
};

const trimTrailingNulls = (arr: (number | null)[]) => {
	let lastNonNullIndex = -1;
	for (let i = arr.length - 1; i >= 0; i--) {
		if (arr[i] !== null) {
			lastNonNullIndex = i;
			break;
		}
	}
	return lastNonNullIndex === -1 ? [] : arr.slice(0, lastNonNullIndex + 1);
};

export const LeaderboardTable: React.FC<{
	leaderboard: PlayerWithData[];
	championships: Map<string, number[]>;
}> = ({ leaderboard, championships }) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollState, setScrollState] = useState({ isScrolled: false, canScrollRight: false });

	// Calculate max form length across all players
	const maxFormLength = leaderboard.reduce((max, player) => {
		const trimmed = trimTrailingNulls(player.data.recentForm);
		return Math.max(max, trimmed.length);
	}, 0);

	useEffect(() => {
		const handleScroll = () => {
			if (!scrollRef.current) return;
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			setScrollState({
				isScrolled: scrollLeft > 0,
				canScrollRight: scrollLeft < scrollWidth - clientWidth - 1,
			});
		};

		const scrollEl = scrollRef.current;
		if (scrollEl) {
			handleScroll(); // Initial check
			scrollEl.addEventListener("scroll", handleScroll);
			// Also check on resize
			window.addEventListener("resize", handleScroll);
			return () => {
				scrollEl.removeEventListener("scroll", handleScroll);
				window.removeEventListener("resize", handleScroll);
			};
		}
	}, []);

	return (
		<div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
			<div ref={scrollRef} className="overflow-x-auto">
				<table className="w-full border-separate border-spacing-0 text-sm">
					<thead className="text-left text-xs text-[var(--color-text-secondary)]">
						<tr className="bg-[var(--color-accent)]">
							<th className="sticky left-0 z-20 w-48 min-w-[12rem] px-3 py-2 whitespace-nowrap sm:px-4">
								<div className="absolute inset-0 -z-10 bg-[var(--color-accent)]" />
								{scrollState.isScrolled && (
									<div className="absolute top-0 right-0 h-full w-px bg-[var(--color-border)]" />
								)}
								Player
							</th>
							<th className="px-3 py-2 text-center whitespace-nowrap sm:px-4">Points</th>
							<th className="px-3 py-2 text-center whitespace-nowrap sm:px-4">Wins</th>
							<th className="px-3 py-2 text-center whitespace-nowrap sm:px-4">Games</th>
							<th className="px-3 py-2 text-center whitespace-nowrap sm:px-4">Win Rate</th>
							<th className="px-3 py-2 text-center whitespace-nowrap sm:px-4">Recent Form</th>
							<th className="px-3 py-2 text-center whitespace-nowrap sm:px-4">Best Game</th>
						</tr>
					</thead>
					<tbody>
						{leaderboard.map((row, idx) => {
							const rank = idx + 1;
							const rankBorderColor = getRankBorderColor(rank);
							const championshipYears = championships.get(row.id) || [];

							return (
								<tr
									key={row.id}
									className="group cursor-pointer transition-colors hover:bg-[var(--color-hover)]"
									onClick={() => (window.location.href = `/players/${row.id}`)}
								>
									{/* Player Column - Sticky (includes rank) */}
									<td className="sticky left-0 z-10 w-48 min-w-[12rem] border-b border-[var(--color-border)] px-3 py-3 sm:px-4">
										{/* Rank indicator line */}
										{rankBorderColor && (
											<div className={`absolute top-0 left-0 h-full w-1 ${rankBorderColor}`} />
										)}
										{/* Sticky background */}
										<div
											className={`absolute inset-x-0 top-0 bottom-0 transition-colors duration-200 group-hover:bg-[var(--color-hover)] ${
												scrollState.isScrolled
													? "bg-[var(--color-accent)]"
													: "bg-[var(--color-surface)]"
											} -z-10`}
										/>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 shrink-0 items-center justify-center">
												{getRankIcon(rank)}
											</div>
											<Avatar src={row.pictureUrl || undefined} name={row.data.name} size={32} />
											<div className="min-w-0 flex-1">
												<div className="truncate text-sm font-semibold text-[var(--color-text)]">
													{row.data.name}
												</div>
												{championshipYears.length > 0 && (
													<div className="mt-0.5 flex flex-wrap items-center gap-0.5">
														{championshipYears.map((year) => (
															<ChampionshipBadge key={year} year={year} />
														))}
													</div>
												)}
											</div>
										</div>
										{/* Scroll indicator border */}
										{scrollState.isScrolled && (
											<div className="absolute top-0 right-0 h-full w-px bg-[var(--color-border)]" />
										)}
									</td>

									{/* Points Column */}
									<td className="border-b border-[var(--color-border)] px-3 py-3 text-center tabular-nums sm:px-4">
										<span className="text-base font-bold text-[var(--color-text)] sm:text-lg">
											{row.data.points}
										</span>
									</td>

									{/* Wins Column */}
									<td className="border-b border-[var(--color-border)] px-3 py-3 text-center text-[var(--color-text)] tabular-nums sm:px-4">
										{row.data.wins}
									</td>

									{/* Games Column */}
									<td className="border-b border-[var(--color-border)] px-3 py-3 text-center text-[var(--color-text)] tabular-nums sm:px-4">
										{row.data.games}
									</td>

									{/* Win Rate Column */}
									<td className="border-b border-[var(--color-border)] px-3 py-3 text-center text-[var(--color-text)] tabular-nums sm:px-4">
										{formatPct(row.data.winRate)}
									</td>

									{/* Form Column */}
									<td className="border-b border-[var(--color-border)] px-3 py-3 text-center sm:px-4">
										<div className="flex items-center justify-center gap-1">
											{maxFormLength > 0 ? (
												row.data.recentForm
													.slice(0, maxFormLength)
													.reverse()
													.map((points, idx) => (
														<span
															key={idx}
															className={`inline-flex min-w-[2.25rem] justify-center rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${getFormColor(points)}`}
														>
															{formatFormValue(points)}
														</span>
													))
											) : (
												<span className="text-xs text-[var(--color-text-secondary)]">—</span>
											)}
										</div>
									</td>

									{/* Best Game Column */}
									<td className="border-b border-[var(--color-border)] px-3 py-3 sm:px-4">
										{row.data.bestGame ? (
											<div className="flex items-center gap-2">
												<GameTypeIcon
													type={row.data.bestGame.gameType}
													className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
												/>
												<span
													className="text-xs whitespace-nowrap text-[var(--color-text)] sm:text-sm"
													title={row.data.bestGame.gameName}
												>
													{row.data.bestGame.gameName}
												</span>
												<span className="shrink-0 rounded bg-[var(--color-accent)] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-text)]">
													{row.data.bestGame.points} pts
												</span>
											</div>
										) : (
											<span className="text-xs text-[var(--color-text-secondary)]">—</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Scroll gradient indicator */}
			<div
				className={`pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-[var(--color-surface)] to-transparent transition-opacity duration-300 ${
					scrollState.canScrollRight ? "opacity-100" : "opacity-0"
				}`}
			/>
		</div>
	);
};
