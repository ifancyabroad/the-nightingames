import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IGame, GameType } from "features/games/types";
import { Gamepad2 } from "lucide-react";
import { ColorPicker, Input, Label, Button, FormHeader, Radio, ErrorMessage } from "common/components";
import { gameSchema, type GameFormData } from "common/utils/validation";

interface IGameFormProps {
	initialData?: IGame;
	onSubmit: (game: Omit<IGame, "id">) => Promise<void> | void;
}

export const GameForm: React.FC<IGameFormProps> = ({ initialData, onSubmit }) => {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<GameFormData>({
		resolver: zodResolver(gameSchema),
		defaultValues: {
			name: initialData?.name || "",
			points: initialData?.points || 1,
			type: initialData?.type || "board",
			color: initialData?.color || "#6366f1",
		},
	});

	const typeValue = watch("type");
	const colorValue = watch("color");

	const onFormSubmit = async (data: GameFormData) => {
		await onSubmit(data);
		if (!initialData) {
			reset();
		} else {
			// Reset form with new values to clear dirty state
			reset(data);
		}
	};

	const isEditMode = !!initialData;
	const isSubmitDisabled = isSubmitting || (isEditMode && !isDirty);

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="m-0 flex flex-col gap-4 p-0">
			<FormHeader icon={<Gamepad2 />} title={initialData ? "Edit Game" : "Add Game"} />

			<div>
				<Label required>Name</Label>
				<Input type="text" {...register("name")} placeholder="Game Name" maxLength={100} />
				{errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
			</div>

			<div>
				<Label required>Points</Label>
				<Input
					type="number"
					{...register("points", { valueAsNumber: true })}
					placeholder="Game Points"
					min={1}
					max={3}
				/>
				{errors.points && <ErrorMessage>{errors.points.message}</ErrorMessage>}
			</div>

			<div>
				<Label>Type</Label>
				<div className="flex gap-4">
					<Radio
						label="Board Game"
						value="board"
						checked={typeValue === "board"}
						onChange={(e) => setValue("type", e.target.value as GameType, { shouldDirty: true })}
					/>
					<Radio
						label="Video Game"
						value="video"
						checked={typeValue === "video"}
						onChange={(e) => setValue("type", e.target.value as GameType, { shouldDirty: true })}
					/>
				</div>
				{errors.type && <ErrorMessage>{errors.type.message}</ErrorMessage>}
			</div>

			<div>
				<ColorPicker
					label="Game colour"
					value={colorValue}
					onChange={(newColor) => setValue("color", newColor, { shouldDirty: true })}
					showInput
				/>
				{errors.color && <ErrorMessage>{errors.color.message}</ErrorMessage>}
			</div>

			<Button type="submit" disabled={isSubmitDisabled}>
				{isEditMode ? "Save Changes" : "Add Game"}
			</Button>
		</form>
	);
};
