import * as React from "react";
import { NavLink } from "react-router-dom";

type AppHeaderProps = {
	actions?: React.ReactNode;
};

export function AppHeader({ actions }: AppHeaderProps) {
	return (
		<header className="nx-header">
			<div className="nx-header-brand">
				<span className="nx-header-icon" aria-hidden="true">◈</span>
				<div className="nx-header-text">
					<span className="nx-header-title">NEXUS</span>
					<span className="nx-header-subtitle">Anomaly &amp; Incident Response</span>
				</div>
			</div>
			<nav className="nx-header-nav" aria-label="Main navigation">
				<NavLink
					to="/"
					end
					className={({ isActive }) =>
						`nx-nav-link${isActive ? " nx-nav-link--active" : ""}`
					}
				>
					Dashboard
				</NavLink>
				<NavLink
					to="/timeline"
					className={({ isActive }) =>
						`nx-nav-link${isActive ? " nx-nav-link--active" : ""}`
					}
				>
					Timeline
				</NavLink>
			</nav>
			{actions && <div className="nx-header-actions">{actions}</div>}
		</header>
	);
}
