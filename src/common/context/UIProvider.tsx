import React, { useState, useEffect, type PropsWithChildren } from "react";
import { UIContext } from "./UIContext";
import { getInitialTheme, type Theme } from "common/utils/theme";

export const UIProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
	const openSidebar = () => setIsSidebarOpen(true);
	const closeSidebar = () => setIsSidebarOpen(false);

	const toggleTheme = () => {
		setTheme((prev) => {
			const newTheme = prev === "light" ? "dark" : "light";
			localStorage.setItem("theme", newTheme);
			return newTheme;
		});
	};

	const updateTheme = (newTheme: Theme) => {
		localStorage.setItem("theme", newTheme);
		setTheme(newTheme);
	};

	// Apply theme to document root
	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

	return (
		<UIContext.Provider
			value={{
				isSidebarOpen,
				toggleSidebar,
				openSidebar,
				closeSidebar,
				theme,
				updateTheme,
				toggleTheme,
			}}
		>
			{children}
		</UIContext.Provider>
	);
};
