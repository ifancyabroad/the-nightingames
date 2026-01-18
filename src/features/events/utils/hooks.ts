import { useMemo } from "react";
import { getSortedEventPlayerStats, getSortedEventGameStats, getEventTopScorers } from "./calculations";
import { sortResultsChronologically, sortEventsByDate } from "common/utils/sorting";
import type { IResult, IEvent } from "features/events/types";
import { useEvents } from "features/events/context/EventsContext";
import { useResults } from "features/events/context/ResultsContext";
import { usePlayers } from "features/players/context/PlayersContext";
import { useGames } from "features/games/context/GamesContext";

export function useSortedResults(): IResult[] {
	const { results } = useResults();
	const { eventById } = useEvents();
	return useMemo(() => sortResultsChronologically(results, eventById), [results, eventById]);
}

export function useSortedEvents(): IEvent[] {
	const { events } = useEvents();
	return useMemo(() => sortEventsByDate(events, true), [events]);
}

export function useEventPlayerStats(eventId: string) {
	const { eventById } = useEvents();
	const { results } = useResults();
	const { playerById } = usePlayers();
	const { gameById } = useGames();
	return useMemo(
		() => getSortedEventPlayerStats(eventId, eventById, results, playerById, gameById),
		[eventId, eventById, results, playerById, gameById],
	);
}

export function useEventGameStats(eventId: string) {
	const { eventById } = useEvents();
	const { results } = useResults();
	const { gameById } = useGames();
	const { playerById } = usePlayers();
	return useMemo(
		() => getSortedEventGameStats(eventId, eventById, results, gameById, playerById),
		[eventId, eventById, results, gameById, playerById],
	);
}

export function useEventTopScorers(eventId: string) {
	const { playerById } = usePlayers();
	const playerStats = useEventPlayerStats(eventId);
	return useMemo(() => getEventTopScorers(playerStats, playerById), [playerStats, playerById]);
}
