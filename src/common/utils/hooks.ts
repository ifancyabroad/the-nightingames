import { useState, useEffect } from "react";
import { useAuth } from "common/context/AuthContext";
import { useUsers } from "features/users/context/UsersContext";
import { usePlayers } from "features/players/context/PlayersContext";
import { useGames } from "features/games/context/GamesContext";
import { useEvents } from "features/events/context/EventsContext";
import { useResults } from "features/events/context/ResultsContext";

export function useAppReady() {
	const a = useAuth();
	const u = useUsers();
	const p = usePlayers();
	const g = useGames();
	const e = useEvents();
	const r = useResults();
	return { loading: a.loading || u.loading || p.loading || g.loading || e.loading || r.loading };
}

export function useIsMobile(breakpoint = 768) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < breakpoint);
		};

		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);

		return () => window.removeEventListener("resize", checkIsMobile);
	}, [breakpoint]);

	return isMobile;
}

/**
 * Locks body scroll when enabled (typically for modals/sidebars on mobile)
 * Preserves scroll position when lock is applied and restores it when removed
 * Compensates for scrollbar width to prevent layout shift
 */
export function useBodyScrollLock(isLocked: boolean) {
	useEffect(() => {
		if (!isLocked) return;

		// Save current scroll position and measure scrollbar width
		const scrollY = window.scrollY;
		const body = document.body;
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

		// Lock scroll and compensate for scrollbar
		body.style.position = "fixed";
		body.style.top = `-${scrollY}px`;
		body.style.width = "100%";
		body.style.paddingRight = `${scrollbarWidth}px`;

		// Cleanup: restore scroll
		return () => {
			body.style.position = "";
			body.style.top = "";
			body.style.width = "";
			body.style.paddingRight = "";
			window.scrollTo(0, scrollY);
		};
	}, [isLocked]);
}
