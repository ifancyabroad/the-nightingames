import { Card, IconButton, Badge, Avatar } from "common/components";
import { Edit, Trash2, UserCircle, Link as LinkIcon, Unlink } from "lucide-react";
import type { IUser } from "features/users/types";
import { getRoleLabel, getRoleBadgeVariant } from "features/users/utils/helpers";
import { usePlayers } from "features/players/context/PlayersContext";
import { getDisplayName } from "features/players/utils/helpers";

interface UserCardProps {
	user: IUser;
	onEdit?: (user: IUser) => void;
	onDelete?: (user: IUser) => void;
	canEdit?: boolean;
}

export function UserCard({ user, onEdit, onDelete, canEdit }: UserCardProps) {
	const { playerById } = usePlayers();
	const linkedPlayer = user.linkedPlayerId ? playerById.get(user.linkedPlayerId) : null;

	// Use linked player's data when available, otherwise use email as fallback
	const displayName = linkedPlayer ? getDisplayName(linkedPlayer) : user.email;
	const photoUrl = linkedPlayer?.pictureUrl || null;

	return (
		<Card className="p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					{photoUrl ? (
						<Avatar name={displayName} src={photoUrl} size={48} />
					) : (
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
							<UserCircle className="h-7 w-7 text-[var(--color-primary)]" />
						</div>
					)}
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-sm font-bold text-[var(--color-text)] md:text-base">
							{displayName}
						</h3>
						<p className="truncate text-xs text-[var(--color-text-secondary)]">{user.email}</p>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
							{linkedPlayer && (
								<Badge variant="success" className="flex items-center gap-1">
									<LinkIcon className="h-3 w-3" />
									Linked to player
								</Badge>
							)}
							{!linkedPlayer && user.role === "user" && (
								<Badge variant="warning" className="flex items-center gap-1">
									<Unlink className="h-3 w-3" />
									Not linked
								</Badge>
							)}
						</div>
					</div>
				</div>

				{canEdit && (
					<div className="flex gap-1">
						{onEdit && (
							<IconButton
								icon={<Edit />}
								onClick={() => onEdit(user)}
								variant="secondary"
								title="Edit user"
							/>
						)}
						{onDelete && (
							<IconButton
								icon={<Trash2 />}
								onClick={() => onDelete(user)}
								variant="danger"
								title="Delete user"
							/>
						)}
					</div>
				)}
			</div>
		</Card>
	);
}
