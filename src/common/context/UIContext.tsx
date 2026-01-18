import { createContext, useContext } from "react";
import type { Theme } from "common/utils/theme";

interface IUIContext {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	theme: Theme;
	updateTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

export const UIContext = createContext<IUIContext | null>(null);

export const useUI = () => {
	const context = useContext(UIContext);
	if (!context) {
		throw new Error("useUI must be used within UIProvider");
	}
	return context;
};
