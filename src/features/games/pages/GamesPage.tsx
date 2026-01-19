import { useModal } from "common/context/ModalContext";
import { GameForm } from "features/games/components/GameForm";
import { useGames } from "features/games/context/GamesContext";
import type { IGame } from "features/games/types";
import { ConfirmDelete, Button, PageHeader, EmptyState } from "common/components";
import { GameCard } from "features/games/components/GameCard";
import { useAuth } from "common/context/AuthContext";
import { Gamepad2, Plus } from "lucide-react";
import { useToast } from "common/context/ToastContext";

const GamesPage: React.FC = () => {
	const { games, addGame, editGame, deleteGame } = useGames();
	const { openModal, closeModal } = useModal();
	const { isAdmin } = useAuth();
	const toast = useToast();

	const handleAddGame = async (game: Omit<IGame, "id">) => {
		try {
			await addGame(game);
			toast.success("Game added successfully");
			closeModal();
		} catch (error) {
			toast.error("Failed to add game");
			throw error;
		}
	};

	const handleEditGame = async (game: IGame, changes: Omit<IGame, "id">) => {
		try {
			await editGame(game.id, changes);
			toast.success("Game updated successfully");
			closeModal();
		} catch (error) {
			toast.error("Failed to update game");
			throw error;
		}
	};

	const handleDeleteGame = async (game: IGame) => {
		try {
			await deleteGame(game.id);
			toast.success("Game deleted successfully");
			closeModal();
		} catch {
			toast.error("Failed to delete game");
		}
	};

	const handleAdd = () => {
		openModal(<GameForm onSubmit={handleAddGame} />);
	};

	const handleEdit = (game: IGame) => {
		openModal(<GameForm initialData={game} onSubmit={(changes) => handleEditGame(game, changes)} />);
	};

	const handleDelete = (game: IGame) => {
		openModal(
			<ConfirmDelete
				title="Delete game?"
				message={`This will remove ${game.name}.`}
				onConfirm={() => handleDeleteGame(game)}
				onCancel={closeModal}
			/>,
		);
	};

	const boardGames = games.filter((game) => game.type === "board");
	const videoGames = games.filter((game) => game.type === "video");

	const renderGameGrid = (gamesList: IGame[]) => (
		<ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
			{gamesList.map((game) => (
				<li key={game.id} className="transition-transform hover:-translate-y-0.5">
					<GameCard
						game={game}
						canEdit={isAdmin}
						onEdit={() => handleEdit(game)}
						onDelete={() => handleDelete(game)}
					/>
				</li>
			))}
		</ul>
	);

	return (
		<div className="mx-auto max-w-6xl">
			<PageHeader
				icon={<Gamepad2 />}
				title="Games"
				count={games.length}
				action={
					isAdmin ? (
						<Button onClick={handleAdd} variant="primary" size="md">
							<Plus className="h-4 w-4" /> Add Game
						</Button>
					) : undefined
				}
			/>

			{games.length === 0 ? (
				<EmptyState>
					No games yet. {isAdmin ? "Add your first game to get started." : "Check back later."}
				</EmptyState>
			) : (
				<div className="space-y-8">
					{boardGames.length > 0 && (
						<section>
							<h2 className="mb-4 text-lg font-semibold text-white/90">Board Games</h2>
							{renderGameGrid(boardGames)}
						</section>
					)}
					{videoGames.length > 0 && (
						<section>
							<h2 className="mb-4 text-lg font-semibold text-white/90">Video Games</h2>
							{renderGameGrid(videoGames)}
						</section>
					)}
				</div>
			)}
		</div>
	);
};

export default GamesPage;
