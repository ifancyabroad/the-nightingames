import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Trophy, Dices, Gamepad2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "common/components";
import { getDisplayName } from "features/players/utils/helpers";
import type { GameType } from "features/games/types";
import type { PlayerWithData } from "features/players/types";

export interface LeaderboardDropdownOption {
	gameType: GameType;
	year: number | null;
	label: string;
	value: string;
	leader?: PlayerWithData | null;
	isChampionship?: boolean;
}

interface LeaderboardDropdownProps {
	options: LeaderboardDropdownOption[];
	value: string;
	onChange: (value: string) => void;
}

/**
 * Custom dropdown for selecting leaderboards with rich UI showing current leaders
 */
export const LeaderboardDropdown: React.FC<LeaderboardDropdownProps> = ({ options, value, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value) || options[0];

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	// Close on escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			return () => document.removeEventListener("keydown", handleEscape);
		}
	}, [isOpen]);

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	const getIcon = (gameType: GameType) => {
		return gameType === "board" ? Dices : Gamepad2;
	};

	return (
		<div className="relative w-full sm:w-auto" ref={dropdownRef}>
			{/* Trigger Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-left transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-accent)] sm:min-w-[280px]"
			>
				<div className="flex items-center gap-2">
					{React.createElement(getIcon(selectedOption.gameType), {
						className: "h-4 w-4 text-[var(--color-text-secondary)]",
					})}
					<span className="font-medium text-[var(--color-text)]">{selectedOption.label}</span>
				</div>
				<ChevronDown
					className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{/* Dropdown Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.96 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl sm:min-w-[320px]"
					>
						<div className="max-h-[400px] overflow-y-auto">
							{options.map((option) => {
								const Icon = getIcon(option.gameType);
								const isSelected = option.value === value;
								const leaderName = option.leader ? getDisplayName(option.leader) : null;

								return (
									<button
										key={option.value}
										onClick={() => handleSelect(option.value)}
										className={`flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-b-0 ${
											isSelected
												? "bg-[var(--color-primary)]/10"
												: "hover:bg-[var(--color-accent)]"
										}`}
									>
										{/* Icon & Label */}
										<div className="flex flex-1 items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-text-secondary)]">
												<Icon className="h-4 w-4" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-[var(--color-text)]">
														{option.label}
													</span>
													{option.isChampionship && (
														<Trophy className="h-3.5 w-3.5 text-[var(--color-gold)]" />
													)}
												</div>
												{leaderName && (
													<div className="mt-0.5 flex items-center gap-1.5">
														{option.leader?.pictureUrl && (
															<Avatar
																src={option.leader.pictureUrl}
																name={leaderName}
																size={16}
															/>
														)}
														<span className="text-xs text-[var(--color-text-secondary)]">
															{option.isChampionship ? "Winner" : "Leader"}: {leaderName}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Selected Indicator */}
										{isSelected && (
											<Check className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
										)}
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
