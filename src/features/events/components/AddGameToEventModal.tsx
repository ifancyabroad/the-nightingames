import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Select } from "common/components";
import { useEvents } from "features/events/context/EventsContext";
import { useToast } from "common/context/ToastContext";
import type { IEvent } from "features/events/types";
import type { IGame } from "features/games/types";

interface AddGameToEventModalProps {
	event: IEvent;
	games: IGame[];
	onGameAdded?: (gameId: string) => void;
	onClose: () => void;
}

export const AddGameToEventModal: React.FC<AddGameToEventModalProps> = ({ event, games, onGameAdded, onClose }) => {
	const { editEvent } = useEvents();
	const toast = useToast();

	// Compute games not already in the event
	const availableGames = games.filter((game) => !event.gameIds.includes(game.id));
	const [selectedGameId, setSelectedGameId] = useState<string>(availableGames[0]?.id || "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!selectedGameId || isSubmitting) return;

		setIsSubmitting(true);
		try {
			// Add the game to the event's gameIds array
			const updatedGameIds = [...event.gameIds, selectedGameId];
			await editEvent(event.id, {
				...event,
				gameIds: updatedGameIds,
			});

			toast.success("Game added to event");
			onGameAdded?.(selectedGameId);
		} catch (error) {
			console.error("Failed to add game to event:", error);
			toast.error("Failed to add game to event");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-md">
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Plus className="h-4 w-4 text-[var(--color-primary)]" />
						<h4 className="text-sm font-semibold text-[var(--color-text)]">Add Game to Event</h4>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]"
						disabled={isSubmitting}
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{availableGames.length === 0 ? (
					<p className="text-sm text-[var(--color-text-secondary)]">
						All games have already been added to this event.
					</p>
				) : (
					<>
						<Select
							value={selectedGameId}
							onChange={(e) => setSelectedGameId(e.target.value)}
							disabled={isSubmitting}
						>
							{availableGames.map((game) => (
								<option key={game.id} value={game.id}>
									{game.name}
								</option>
							))}
						</Select>

						<div className="flex justify-end gap-2">
							<Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
								Cancel
							</Button>
							<Button type="button" onClick={handleSubmit} disabled={!selectedGameId || isSubmitting}>
								{isSubmitting ? "Adding..." : "Add Game"}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
