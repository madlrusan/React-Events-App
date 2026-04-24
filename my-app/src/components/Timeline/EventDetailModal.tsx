import { format, parseISO } from "date-fns";
import "./Timeline.css";
import type { NexusEvent } from "../../data/eventTypes";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

type EventDetailModalProps = {
	event: NexusEvent | null;
	open: boolean;
	onClose: () => void;
};

const SEVERITY_DOT_CLASS: Record<NexusEvent["severity"], string> = {
	low: "nx-severity-low",
	medium: "nx-severity-medium",
	high: "nx-severity-high",
	critical: "nx-severity-critical",
};

const STATUS_BADGE_CLASS: Record<NexusEvent["status"], string> = {
	open: "nx-detail-status--open",
	investigating: "nx-detail-status--investigating",
	closed: "nx-detail-status--closed",
	redacted: "nx-detail-status--redacted",
};

export function EventDetailModal({ event, open, onClose }: EventDetailModalProps) {
	if (!event) return null;

	const formattedDate = format(parseISO(event.date), "EEEE, dd MMMM yyyy");
	const formattedTime = format(parseISO(event.date), "HH:mm");

	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
			<DialogContent className="nx-detail-modal">
				<DialogHeader>
					<DialogTitle className="nx-detail-title">{event.title}</DialogTitle>
					<div className="nx-detail-badges">
						<Badge variant="secondary">{event.category}</Badge>
						<span className={cn("nx-detail-status", STATUS_BADGE_CLASS[event.status])}>
							{event.status}
						</span>
					</div>
				</DialogHeader>

				<div className="nx-detail-body">
					<div className="nx-detail-grid">
						<div className="nx-detail-field">
							<span className="nx-detail-label">Date</span>
							<span className="nx-detail-value">{formattedDate}</span>
						</div>
						<div className="nx-detail-field">
							<span className="nx-detail-label">Time</span>
							<span className="nx-detail-value">{formattedTime}</span>
						</div>
						<div className="nx-detail-field">
							<span className="nx-detail-label">Severity</span>
							<span className="nx-detail-value nx-detail-severity">
								<span
									aria-hidden="true"
									className={cn("nx-timeline-card-severity-dot", SEVERITY_DOT_CLASS[event.severity])}
								/>
								{event.severity}
							</span>
						</div>
						<div className="nx-detail-field">
							<span className="nx-detail-label">Agent</span>
							<span className="nx-detail-value nx-detail-agent">{event.agent}</span>
						</div>
						<div className="nx-detail-field">
							<span className="nx-detail-label">Location</span>
							<span className="nx-detail-value">{event.location}</span>
						</div>
						{event.coordinates && (
							<div className="nx-detail-field">
								<span className="nx-detail-label">Coordinates</span>
								<span className="nx-detail-value nx-detail-coords">{event.coordinates}</span>
							</div>
						)}
					</div>

					<div className="nx-detail-description-wrap">
						<span className="nx-detail-label">Description</span>
						<p className="nx-detail-description">{event.description}</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
