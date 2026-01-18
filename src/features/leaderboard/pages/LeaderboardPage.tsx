import React, { useState } from "react";
import { Trophy, LayoutGrid, List } from "lucide-react";
import {
	useLeaderboardByTypeAndYear,
	usePlayerChampionships,
	useLeaderboardOptions,
} from "features/leaderboard/utils/hooks";
import { parseLeaderboardSelection } from "features/leaderboard/utils/helpers";
import { PlayerCard } from "features/leaderboard/components/PlayerCard";
import { LeaderboardTable } from "features/leaderboard/components/LeaderboardTable";
import { LeaderboardDropdown } from "features/leaderboard/components/LeaderboardDropdown";
import { SegmentedControl, PageHeader } from "common/components";
import type { SegmentedControlOption } from "common/components/SegmentedControl";

type ViewMode = "card" | "table";

const viewModeOptions: SegmentedControlOption<ViewMode>[] = [
	{ value: "card", label: "Cards", icon: LayoutGrid },
	{ value: "table", label: "Table", icon: List },
];

export const LeaderboardPage: React.FC = () => {
	const currentYear = new Date().getFullYear();
	const [selectedLeaderboard, setSelectedLeaderboard] = useState<string>(`board-${currentYear}`);
	const [viewMode, setViewMode] = useState<ViewMode>("card");

	// Get leaderboard options
	const leaderboardOptions = useLeaderboardOptions();

	// Parse selected leaderboard (format: "board-2025" or "video-all")
	const { gameType, year } = parseLeaderboardSelection(selectedLeaderboard);

	// Get leaderboard data using the new hook
	const leaderboard = useLeaderboardByTypeAndYear(gameType, year);
	const championships = usePlayerChampionships(gameType);

	const hasData = leaderboard.length > 0;
	const maxPoints = hasData ? leaderboard[0].data.points : 0;

	return (
		<div className="mx-auto max-w-6xl">
			<PageHeader
				icon={<Trophy />}
				title="Leaderboard"
				action={
					<SegmentedControl
						value={viewMode}
						onChange={setViewMode}
						options={viewModeOptions}
						hideLabelsOnMobile
					/>
				}
			/>

			<div className="mt-3 sm:mt-4">
				<div className="mb-4">
					<LeaderboardDropdown
						options={leaderboardOptions}
						value={selectedLeaderboard}
						onChange={setSelectedLeaderboard}
					/>
				</div>

				{!hasData ? (
					<div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)] sm:p-8">
						No results yet. Play some games to populate the board!
					</div>
				) : viewMode === "table" ? (
					<LeaderboardTable leaderboard={leaderboard} championships={championships} />
				) : (
					<div className="space-y-3 sm:space-y-4">
						{leaderboard.map((row, idx) => (
							<PlayerCard
								key={row.id}
								row={row}
								rank={idx + 1}
								maxPoints={maxPoints}
								championshipYears={championships.get(row.id) || []}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default LeaderboardPage;
