import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResults } from "features/events/context/ResultsContext";
import type { IPlayer } from "features/players/types";
import type { IResult } from "features/events/types";
import type { IGame } from "features/games/types";
import { Gamepad2, Target } from "lucide-react";
import { getDisplayName } from "features/players/utils/helpers";
import { Button, Select, Label, Input, ErrorMessage } from "common/components";
import { useToast } from "common/context/ToastContext";
import { resultSchema, type ResultFormData } from "common/utils/validation";

interface ResultFormProps {
	eventId: string;
	games: IGame[];
	playerById: Map<string, IPlayer>;
	onSuccess?: () => void;
	initialData?: IResult;
	eventPlayerIds: string[];
	allowedGameIds?: string[];
	numOfResults: number;
}

export const ResultForm: React.FC<ResultFormProps> = ({
	eventId,
	games,
	playerById,
	onSuccess,
	initialData,
	eventPlayerIds,
	allowedGameIds,
	numOfResults,
}) => {
	const { addResult, editResult } = useResults();
	const toast = useToast();
	const filteredGames = useMemo(() => {
		if (!Array.isArray(allowedGameIds) || allowedGameIds.length === 0) return [] as IGame[];
		const set = new Set(allowedGameIds);
		return games.filter((g) => set.has(g.id));
	}, [games, allowedGameIds]);

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

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="m-0 flex flex-col gap-4 p-0">
			<div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
				<Target className="h-4 w-4 text-[var(--color-primary)]" />
				<h3 className="text-base font-bold text-[var(--color-text)] md:text-lg">
					{initialData ? "Edit Result" : "Add Result"}
				</h3>
			</div>

			<div>
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0 flex-1">
						<Select label="Game" icon={Gamepad2} {...register("gameId")} disabled={!filteredGames.length}>
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
						{errors.gameId && <ErrorMessage>{errors.gameId.message}</ErrorMessage>}
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

				{!filteredGames.length && (
					<p className="mt-2 text-xs text-[var(--color-warning)]">
						This event doesn't have any games yet. Add a game to the event to create a result.
					</p>
				)}
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
