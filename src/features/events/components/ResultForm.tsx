import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResults } from "features/events/context/ResultsContext";
import { useGames } from "features/games/context/GamesContext";
import { usePlayers } from "features/players/context/PlayersContext";
import type { IResult } from "features/events/types";
import { Gamepad2, Target, Plus } from "lucide-react";
import { getDisplayName } from "features/players/utils/helpers";
import { Button, Select, Label, Input, ErrorMessage } from "common/components";
import { useToast } from "common/context/ToastContext";
import { resultSchema, type ResultFormData } from "common/utils/validation";
import { AddGameToEventModal } from "./AddGameToEventModal";
import { useEvents } from "features/events/context/EventsContext";

interface ResultFormProps {
	eventId: string;
	initialData?: IResult;
	onSuccess?: () => void;
}

export const ResultForm: React.FC<ResultFormProps> = ({ eventId, initialData, onSuccess }) => {
	const { addResult, editResult, results } = useResults();
	const { games } = useGames();
	const { playerById } = usePlayers();
	const toast = useToast();
	const { eventById } = useEvents();
	const [showAddGame, setShowAddGame] = useState(false);

	// Get live event data from context for real-time updates
	const event = eventById.get(eventId);

	// Compute derived data from context
	const eventPlayerIds = useMemo(() => event?.playerIds || [], [event]);
	const eventResults = results.filter((r) => r.eventId === eventId);
	const numOfResults = eventResults.length;

	// Use event.gameIds directly for real-time updates when games are added
	const filteredGames = useMemo(() => {
		if (!event || !Array.isArray(event.gameIds) || event.gameIds.length === 0) return [];
		const set = new Set(event.gameIds);
		return games.filter((g) => set.has(g.id));
	}, [games, event]);

	// Default playerResults for form - always includes all event players
	const defaultPlayerResults =
		initialData?.playerResults ||
		eventPlayerIds.map((id) => ({ playerId: id, rank: null, isWinner: false, isLoser: false }));

	// Track which players are included (checked) in the result
	const [included, setIncluded] = useState<Record<string, boolean>>(() => {
		if (initialData) {
			const present = new Set(initialData.playerResults.map((r) => r.playerId));
			return Object.fromEntries(eventPlayerIds.map((id) => [id, present.has(id)]));
		}
		return Object.fromEntries(eventPlayerIds.map((id) => [id, true]));
	});

	// Remember initial included state to detect changes
	const initialIncludedState = useMemo(() => {
		if (initialData) {
			const present = new Set(initialData.playerResults.map((r) => r.playerId));
			return Object.fromEntries(eventPlayerIds.map((id) => [id, present.has(id)]));
		}
		return Object.fromEntries(eventPlayerIds.map((id) => [id, true]));
	}, [initialData, eventPlayerIds]);

	// Check if included state has changed
	const includedHasChanged = useMemo(() => {
		return eventPlayerIds.some((id) => included[id] !== initialIncludedState[id]);
	}, [included, initialIncludedState, eventPlayerIds]);

	const {
		register,
		handleSubmit,
		watch,
		control,
		setValue,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<ResultFormData>({
		resolver: zodResolver(resultSchema),
		defaultValues: {
			eventId,
			gameId: initialData?.gameId ?? filteredGames[0]?.id ?? "",
			order: initialData?.order ?? numOfResults + 1,
			playerResults: defaultPlayerResults,
			notes: initialData?.notes || "",
		},
	});

	const gameId = watch("gameId");
	const playerResults = watch("playerResults");

	const handlePlayerToggle = (playerId: string, checked: boolean) => {
		setIncluded((m) => ({ ...m, [playerId]: checked }));
	};

	const handleAddGameClick = () => {
		setShowAddGame(true);
	};

	const handleGameAdded = (gameId: string) => {
		setValue("gameId", gameId, { shouldDirty: true, shouldValidate: true });
		setShowAddGame(false);
	};

	const getPlayer = (id: string) => playerById.get(id);

	const isEditMode = !!initialData;
	const isSubmitDisabled =
		isSubmitting || !filteredGames.length || !gameId || (isEditMode && !isDirty && !includedHasChanged);

	const onFormSubmit = async (data: ResultFormData) => {
		try {
			// Filter out unchecked players before submitting
			const filteredData = {
				...data,
				playerResults: data.playerResults.filter((pr) => included[pr.playerId]),
			};

			if (initialData) {
				await editResult(initialData.id, filteredData);
				toast.success("Result updated successfully");
			} else {
				await addResult(filteredData);
				toast.success("Result added successfully");
			}
			onSuccess?.();
		} catch {
			toast.error("Failed to save result");
			// Don't throw - ResultForm is called from modal, not nested form
		}
	};

	if (!event) {
		return <div className="p-4 text-center text-[var(--color-text-secondary)]">Event not found</div>;
	}

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="m-0 flex flex-col gap-4 p-0">
			<div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
				<Target className="h-4 w-4 text-[var(--color-primary)]" />
				<h3 className="text-base font-bold text-[var(--color-text)] md:text-lg">
					{initialData ? "Edit Result" : "Add Result"}
				</h3>
			</div>

			<div>
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<div className="relative">
							<div className="flex items-end gap-0">
								<div className="flex-1">
									<Select
										label="Game"
										icon={Gamepad2}
										{...register("gameId")}
										disabled={!filteredGames.length}
										className="rounded-r-none border-r-0"
									>
										{!filteredGames.length ? (
											<option value="">No games added to this event</option>
										) : (
											filteredGames.map((g) => (
												<option key={g.id} value={g.id}>
													{g.name}
												</option>
											))
										)}
									</Select>
								</div>
								<button
									type="button"
									onClick={handleAddGameClick}
									className="flex h-[38px] items-center justify-center rounded-r-lg border border-[var(--color-border)] bg-[var(--color-primary)] px-3 text-[var(--color-primary-contrast)] transition-colors hover:opacity-90 focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:outline-none"
									title="Add game to event"
								>
									<Plus className="h-4 w-4" />
								</button>
							</div>
							{errors.gameId && <ErrorMessage>{errors.gameId.message}</ErrorMessage>}

							{showAddGame && (
								<div className="absolute top-full right-0 left-0 z-10 mt-1">
									<AddGameToEventModal
										event={event}
										games={games}
										onGameAdded={handleGameAdded}
										onClose={() => setShowAddGame(false)}
									/>
								</div>
							)}

							{!filteredGames.length && !showAddGame && (
								<p className="mt-2 text-xs text-[var(--color-warning)]">
									This event doesn't have any games yet. Click the + button to add one.
								</p>
							)}
						</div>
					</div>

					<div>
						<Label>Order</Label>
						<Input
							type="number"
							{...register("order", { valueAsNumber: true })}
							fullWidth={false}
							className="w-16"
							min={1}
							placeholder="#"
						/>
						{errors.order && <ErrorMessage>{errors.order.message}</ErrorMessage>}
					</div>
				</div>
			</div>

			<div>
				<Label>Notes (optional)</Label>
				<textarea
					{...register("notes")}
					placeholder="Add notes about this result (e.g., asterisk wins, special circumstances)..."
					rows={2}
					maxLength={500}
					className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
				/>
				{errors.notes && <ErrorMessage>{errors.notes.message}</ErrorMessage>}
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Players</p>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{playerResults.map((pr, idx) => {
						const p = getPlayer(pr.playerId);
						const name = getDisplayName(p);
						const isIncluded = !!included[pr.playerId];
						return (
							<Controller
								key={pr.playerId}
								control={control}
								name={`playerResults.${idx}`}
								render={({ field }) => (
									<div
										className={`rounded-md bg-[var(--color-accent)] p-3 ${isIncluded ? "" : "opacity-60"}`}
									>
										<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
											<label className="flex items-center gap-2 text-sm whitespace-nowrap text-[var(--color-text)]">
												<input
													type="checkbox"
													checked={isIncluded}
													onChange={(e) => handlePlayerToggle(pr.playerId, e.target.checked)}
													className="h-4 w-4 accent-[var(--color-primary)]"
												/>
												{name}
											</label>
										</div>

										<div className="mt-2 flex flex-wrap items-center gap-3">
											<div className="flex items-center gap-2">
												<span className="text-xs text-[var(--color-text-secondary)]">Rank</span>
												<Input
													type="number"
													min={1}
													value={field.value.rank ?? ""}
													onChange={(e) =>
														field.onChange({
															...field.value,
															rank: e.target.value ? Number(e.target.value) : null,
														})
													}
													inputSize="sm"
													fullWidth={false}
													className="w-12 text-center tabular-nums"
													placeholder="#"
													disabled={!isIncluded}
												/>
											</div>

											<label className="flex items-center gap-1 text-xs whitespace-nowrap text-[var(--color-text-secondary)]">
												<input
													type="checkbox"
													checked={!!field.value.isWinner}
													onChange={(e) =>
														field.onChange({ ...field.value, isWinner: e.target.checked })
													}
													className="h-4 w-4 accent-[var(--color-success)]"
													disabled={!isIncluded}
												/>
												Win
											</label>
											<label className="flex items-center gap-1 text-xs whitespace-nowrap text-[var(--color-text-secondary)]">
												<input
													type="checkbox"
													checked={!!field.value.isLoser}
													onChange={(e) =>
														field.onChange({ ...field.value, isLoser: e.target.checked })
													}
													className="h-4 w-4 accent-[var(--color-danger)]"
													disabled={!isIncluded}
												/>
												Lose
											</label>
										</div>
									</div>
								)}
							/>
						);
					})}
				</div>
				{errors.playerResults && <ErrorMessage>{errors.playerResults.message}</ErrorMessage>}
			</div>

			<Button type="submit" disabled={isSubmitDisabled} variant="primary" size="md">
				{isEditMode ? "Update Result" : "Submit Result"}
			</Button>
		</form>
	);
};
