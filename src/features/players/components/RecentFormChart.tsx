import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartCard, ChartTooltip } from "common/components";
import { usePlayerPageStats } from "features/players/utils/hooks";
import { usePlayers } from "features/players/context/PlayersContext";
import { getColorForPlayer } from "features/players/utils/helpers";

interface RecentFormChartProps {
	playerId: string;
}

export const RecentFormChart: React.FC<RecentFormChartProps> = ({ playerId }) => {
	const { recentFormSeries } = usePlayerPageStats(playerId);
	const { playerById } = usePlayers();
	const player = playerById.get(playerId);
	const color = getColorForPlayer(player);

	return (
		<ChartCard
			title="Recent Form (last 5 events)"
			isEmpty={recentFormSeries.length === 0}
			emptyTitle="No recent events"
			emptyDescription="Attend at least one event to see recent form"
		>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={recentFormSeries} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
					<XAxis
						dataKey="x"
						tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
						label={{
							value: "Event",
							position: "insideBottom",
							offset: -5,
							fill: "var(--color-text-secondary)",
							fontSize: 12,
						}}
					/>
					<YAxis
						tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
						label={{
							value: "Points",
							angle: -90,
							position: "center",
							style: { textAnchor: "middle" },
							fontSize: 12,
							dx: -20,
						}}
					/>
					<Tooltip
						content={<ChartTooltip formatter={(v) => `${v} pts`} labelFormatter={(v) => `Event ${v}`} />}
					/>
					<Line type="monotone" dataKey="points" stroke={color} strokeWidth={2} dot={true} />
				</LineChart>
			</ResponsiveContainer>
		</ChartCard>
	);
};
