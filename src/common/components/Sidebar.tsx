import { NavLink } from "react-router";
import {
	Home,
	Users,
	Calendar,
	Gamepad2,
	BarChart,
	X,
	LogIn,
	User,
	Sun,
	Moon,
	Trophy,
	UserCog,
	ChevronRight,
} from "lucide-react";
import { useUI } from "common/context/UIContext";
import { useModal } from "common/context/ModalContext";
import { LoginForm, Button, SegmentedControl } from "common/components";
import type { SegmentedControlOption } from "common/components/SegmentedControl";
import { useAuth } from "common/context/AuthContext";
import { Link } from "react-router";
import Logo from "assets/logo.svg?react";
import { useEffect } from "react";
import type { Theme } from "common/utils/theme";
import { useBodyScrollLock } from "common/utils/hooks";

const navItems = [
	{ to: "/", label: "Home", icon: Home },
	{ to: "/leaderboard", label: "Leaderboard", icon: Trophy },
	{ to: "/events", label: "Events", icon: Calendar },
	{ to: "/games", label: "Games", icon: Gamepad2 },
	{ to: "/players", label: "Players", icon: Users },
	{ to: "/stats", label: "Stats", icon: BarChart },
];

const adminNavItems = [{ to: "/users", label: "Users", icon: UserCog }];

const themeOptions: SegmentedControlOption<Theme>[] = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
];

export const Sidebar: React.FC = () => {
	const { isSidebarOpen, closeSidebar, theme, updateTheme } = useUI();
	const { openModal, closeModal } = useModal();
	const { authUser, user, isAdmin } = useAuth();

	// Lock body scroll when sidebar is open on mobile
	useBodyScrollLock(isSidebarOpen);

	const handleLoginClick = () => {
		openModal(<LoginForm onSuccess={closeModal} />);
	};

	// Handle Escape key to close sidebar on mobile
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isSidebarOpen) {
				closeSidebar();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isSidebarOpen, closeSidebar]);

	return (
		<>
			{isSidebarOpen && (
				<div
					className="fixed inset-0 z-50 bg-black/50 lg:hidden"
					onClick={closeSidebar}
					aria-label="Close sidebar"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							closeSidebar();
						}
					}}
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-[60] flex w-72 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 transition-transform lg:py-6 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				}`}
			>
				<div className="mb-4 flex items-center justify-between lg:mb-6">
					<Link to="/" className="flex items-center gap-3" onClick={closeSidebar}>
						<div className="flex h-9 w-9 items-center justify-center text-[var(--color-primary)]">
							<Logo className="h-full w-full" />
						</div>
						<div>
							<h1 className="font-display text-base leading-tight text-[var(--color-text)]">
								THE NIGHTINGAMES
							</h1>
						</div>
					</Link>
					<button
						onClick={closeSidebar}
						className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] lg:hidden"
						aria-label="Close sidebar"
					>
						<X size={20} />
					</button>
				</div>

				<nav className="flex flex-col gap-1">
					{navItems.map(({ to, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) =>
								`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
									isActive
										? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
										: "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-text)]"
								}`
							}
							onClick={closeSidebar}
						>
							<Icon size={16} />
							{label}
						</NavLink>
					))}
					{isAdmin && (
						<>
							<div className="my-2 border-t border-[var(--color-border)]" />
							{adminNavItems.map(({ to, label, icon: Icon }) => (
								<NavLink
									key={to}
									to={to}
									className={({ isActive }) =>
										`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
											isActive
												? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
												: "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-text)]"
										}`
									}
									onClick={closeSidebar}
								>
									<Icon size={16} />
									{label}
								</NavLink>
							))}
						</>
					)}
				</nav>

				<div className="mt-auto flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
					<SegmentedControl value={theme} onChange={updateTheme} options={themeOptions} />
					{authUser ? (
						<Link
							to="/profile"
							onClick={closeSidebar}
							className="group flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)]"
						>
							<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
								<User className="h-5 w-5 text-[var(--color-primary)]" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="truncate text-sm font-medium text-[var(--color-text)]">
									{user?.email}
								</div>
								<div className="text-xs text-[var(--color-text-secondary)]">View profile</div>
							</div>
							<ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)] transition-transform group-hover:translate-x-0.5" />
						</Link>
					) : (
						<Button onClick={handleLoginClick} variant="secondary" size="md">
							<LogIn size={16} />
							Login
						</Button>
					)}
				</div>
			</aside>
		</>
	);
};
