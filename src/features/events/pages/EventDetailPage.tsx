import { useParams, useNavigate } from "react-router";
import { useEvents } from "features/events/context/EventsContext";
import { usePlayers } from "features/players/context/PlayersContext";
import { useGames } from "features/games/context/GamesContext";
import { useResults } from "features/events/context/ResultsContext";
import { CalendarDays, Users, Gamepad2, Plus, Edit, Trash2, Trophy, MessageSquare, ClipboardList } from "lucide-react";
import { useModal } from "common/context/ModalContext";
import { BackButton, Button, Card, ConfirmDelete, EmptyState, KpiCard } from "common/components";
import { EventForm } from "features/events/components/EventForm";
import { ResultForm } from "features/events/components/ResultForm";
import { ResultDisplay } from "features/events/components/ResultDisplay";
import { EventPlayerCard } from "features/events/components/EventPlayerCard";
import { EventGameCard } from "features/events/components/EventGameCard";
import type { IEvent, IResult } from "features/events/types";
import { useAuth } from "common/context/AuthContext";
import { useEventPlayerStats, useEventGameStats, useEventTopScorers } from "features/events/utils/hooks";
import { useToast } from "common/context/ToastContext";

export const EventDetailPage: React.FC = () => {
	const { eventId: eventIdParam } = useParams();
	const eventId = String(eventIdParam || "");
	const navigate = useNavigate();

	const { eventById, editEvent, deleteEvent } = useEvents();
	const { players, playerById } = usePlayers();
	const { games, gameById } = useGames();
	const { results, deleteResult } = useResults();
	const { openModal, closeModal } = useModal();
	const { isAdmin } = useAuth();
	const toast = useToast();

	const event = eventById.get(eventId);
	const eventResults = results.filter((r) => r.eventId === eventId).sort((a, b) => a.order - b.order);

	const playerStats = useEventPlayerStats(eventId);
	const gameStats = useEventGameStats(eventId);
	const topScorerDisplay = useEventTopScorers(eventId);

	const handleEditEventSubmit = async (changes: Omit<IEvent, "id">) => {
		try {
			await editEvent(eventId, changes);
			toast.success("Event updated successfully");
			closeModal();
		} catch (error) {
			toast.error("Failed to update event");
			throw error;
		}
	};

	const handleDeleteEventConfirm = async () => {
		try {
			await deleteEvent(eventId);
			toast.success("Event deleted successfully");
			closeModal();
			navigate("/events");
		} catch {
			toast.error("Failed to delete event");
		}
	};

	const handleDeleteResultConfirm = async (resultId: string) => {
		try {
			await deleteResult(resultId);
			toast.success("Result deleted successfully");
			closeModal();
		} catch {
			toast.error("Failed to delete result");
		}
	};

	const handleEditEvent = (ev: IEvent) => {
		openModal(<EventForm initialData={ev} players={players} games={games} onSubmit={handleEditEventSubmit} />);
	};

	const handleDeleteEvent = (ev: IEvent) => {
		openModal(
			<ConfirmDelete
				title="Delete event?"
				message={`This will remove the event at ${ev.location}.`}
				onConfirm={handleDeleteEventConfirm}
				onCancel={closeModal}
			/>,
		);
	};

	const handleAddResult = () => {
		if (!event) return;
		openModal(<ResultForm eventId={event.id} onSuccess={closeModal} />);
	};

	const handleEditResult = (result: IResult) => {
		if (!event) return;
		openModal(<ResultForm initialData={result} eventId={event.id} onSuccess={closeModal} />);
	};

	const handleDeleteResult = (resultId: string) => {
		openModal(
			<ConfirmDelete
				title="Delete result?"
				message="This will remove the selected result."
				onConfirm={() => handleDeleteResultConfirm(resultId)}
				onCancel={closeModal}
			/>,
		);
	};

	if (!event) {
		return (
			<div className="mx-auto max-w-6xl">
				<div className="mb-4">
					<BackButton />
				</div>
				<EmptyState>Event not found.</EmptyState>
			</div>
		);
	}

	const date = new Date(event.date);
	const dateLabel = isNaN(date.getTime())
		? event.date
		: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

	return (
		<div className="mx-auto grid max-w-6xl gap-4 sm:gap-6">
			<div className="flex items-center justify-between gap-3">
				<BackButton />

				{isAdmin && (
					<div className="flex flex-wrap items-center gap-2">
						<Button onClick={() => handleEditEvent(event)} variant="secondary" size="md">
							<Edit size={16} /> Edit
						</Button>
						<Button onClick={() => handleDeleteEvent(event)} variant="danger" size="md">
							<Trash2 size={16} /> Delete
						</Button>
					</div>
				)}
			</div>

			<Card className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-accent)]">
							<CalendarDays className="h-8 w-8 text-[var(--color-primary)]" />
						</div>
						<div className="min-w-0">
							<h1 className="text-xl font-bold text-[var(--color-text)] md:text-2xl">{event.location}</h1>
							<div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
								<CalendarDays size={14} />
								<span>{dateLabel}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
					<KpiCard
						icon={<Users className="h-4 w-4 text-[var(--color-primary)]" />}
						label="Players"
						value={event.playerIds.length}
					/>
					<KpiCard
						icon={<Gamepad2 className="h-4 w-4 text-[var(--color-primary)]" />}
						label="Games"
						value={event.gameIds.length}
					/>
					<KpiCard
						icon={<ClipboardList className="h-4 w-4 text-[var(--color-primary)]" />}
						label="Results"
						value={eventResults.length}
					/>
					<KpiCard
						icon={<Trophy className="h-4 w-4 text-[var(--color-primary)]" />}
						label="Top Scorer"
						value={topScorerDisplay}
					/>
				</div>

				{event.notes && (
					<div className="border-l-4 border-[var(--color-primary)] bg-[var(--color-accent)] p-3 sm:p-4">
						<div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
							<MessageSquare className="h-4 w-4 text-[var(--color-primary)]" />
							Event Summary
						</div>
						<p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)]">
							{event.notes}
						</p>
					</div>
				)}
			</Card>

			<div className="grid gap-4 sm:gap-4 lg:grid-cols-2">
				<Card className="p-3 sm:p-4">
					<h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)] md:text-base">
						<Users size={16} className="text-[var(--color-primary)]" /> Players
					</h3>
					<div className="space-y-2">
						{playerStats.map((stat) => (
							<EventPlayerCard key={stat.playerId} stat={stat} />
						))}
					</div>
				</Card>

				<Card className="p-3 sm:p-4">
					<h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)] md:text-base">
						<Gamepad2 size={16} className="text-[var(--color-primary)]" /> Games Played
					</h3>
					<div className="space-y-2">
						{gameStats.map((stat) => (
							<EventGameCard key={stat.gameId} stat={stat} />
						))}
					</div>
				</Card>
			</div>

			<div>
				<div className="mb-3 flex items-center justify-between">
					<h2 className="flex items-center gap-2 text-base font-bold text-[var(--color-text)] md:text-lg">
						<ClipboardList size={18} className="text-[var(--color-primary)]" />
						Results
					</h2>
					{isAdmin && (
						<Button onClick={handleAddResult} variant="primary" size="md">
							<Plus size={16} /> Add Result
						</Button>
					)}
				</div>

				{eventResults.length === 0 ? (
					<EmptyState>
						No results added yet. {isAdmin ? "Click 'Add Result' to record game outcomes." : ""}
					</EmptyState>
				) : (
					<div className="grid gap-3 sm:gap-4">
						{eventResults.map((result) => (
							<ResultDisplay
								key={result.id}
								result={result}
								gameById={gameById}
								playerById={playerById}
								canEdit={isAdmin}
								onEdit={handleEditResult}
								onDelete={handleDeleteResult}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EventDetailPage;
