import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";

type FocusPosition = {
	groupIndex: number;
	cardIndex: number | null;
};

type UseTimelineKeyboardReturn = {
	onKeyDown: (e: KeyboardEvent) => void;
	focusedGroupIndex: number;
	focusedCardIndex: number | null;
};

function getWrappedIndex(index: number, length: number): number {
	if (length <= 0) {
		return 0;
	}

	return ((index % length) + length) % length;
}

export function useTimelineKeyboard(
	groupRefs: RefObject<HTMLElement[]>,
	cardRefs: RefObject<HTMLElement[][]>,
): UseTimelineKeyboardReturn {
	const focusPositionRef = useRef<FocusPosition>({
		groupIndex: 0,
		cardIndex: null,
	});

	const [focusedGroupIndex, setFocusedGroupIndex] = useState(0);
	const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(
		null,
	);

	function updateFocusedSnapshot(position: FocusPosition): void {
		setFocusedGroupIndex(position.groupIndex);
		setFocusedCardIndex(position.cardIndex);
	}

	function setFocusPosition(position: FocusPosition): void {
		focusPositionRef.current = position;
		updateFocusedSnapshot(position);
	}

	function applyRovingTabIndex(): void {
		const groups = groupRefs.current ?? [];
		const cardsByGroup = cardRefs.current ?? [];
		const { groupIndex, cardIndex } = focusPositionRef.current;

		for (let g = 0; g < groups.length; g += 1) {
			const groupEl = groups[g];
			if (groupEl) {
				groupEl.setAttribute(
					"tabindex",
					cardIndex === null && g === groupIndex ? "0" : "-1",
				);
			}

			const groupCards = cardsByGroup[g] ?? [];
			for (let c = 0; c < groupCards.length; c += 1) {
				const cardEl = groupCards[c];
				if (cardEl) {
					cardEl.setAttribute(
						"tabindex",
						cardIndex !== null &&
							g === groupIndex &&
							c === cardIndex
							? "0"
							: "-1",
					);
				}
			}
		}
	}

	function resolvePositionFromActiveElement(): FocusPosition {
		const active = document.activeElement;
		const groups = groupRefs.current ?? [];
		const cardsByGroup = cardRefs.current ?? [];

		for (let g = 0; g < groups.length; g += 1) {
			if (groups[g] === active) {
				return { groupIndex: g, cardIndex: null };
			}

			const groupCards = cardsByGroup[g] ?? [];
			for (let c = 0; c < groupCards.length; c += 1) {
				if (groupCards[c] === active) {
					return { groupIndex: g, cardIndex: c };
				}
			}
		}

		return focusPositionRef.current;
	}

	function focusGroupHeader(targetGroupIndex: number): void {
		const groups = groupRefs.current ?? [];
		if (groups.length === 0) {
			return;
		}

		const groupIndex = getWrappedIndex(targetGroupIndex, groups.length);
		const target = groups[groupIndex];
		if (!target) {
			return;
		}

		setFocusPosition({ groupIndex, cardIndex: null });
		applyRovingTabIndex();
		target.focus();
	}

	function focusCard(
		targetGroupIndex: number,
		targetCardIndex: number,
	): boolean {
		const groups = groupRefs.current ?? [];
		const cardsByGroup = cardRefs.current ?? [];

		if (groups.length === 0) {
			return false;
		}

		const groupIndex = getWrappedIndex(targetGroupIndex, groups.length);
		const groupCards = cardsByGroup[groupIndex] ?? [];
		if (groupCards.length === 0) {
			return false;
		}

		const cardIndex = getWrappedIndex(targetCardIndex, groupCards.length);
		const target = groupCards[cardIndex];
		if (!target) {
			return false;
		}

		setFocusPosition({ groupIndex, cardIndex });
		applyRovingTabIndex();
		target.focus();
		return true;
	}

	function focusNextGroupFirstCard(startGroupIndex: number): void {
		const groups = groupRefs.current ?? [];
		if (groups.length === 0) {
			return;
		}

		for (let step = 1; step <= groups.length; step += 1) {
			const nextGroupIndex = getWrappedIndex(
				startGroupIndex + step,
				groups.length,
			);
			if (focusCard(nextGroupIndex, 0)) {
				return;
			}
		}

		focusGroupHeader(startGroupIndex);
	}

	function focusPreviousGroupLastCard(startGroupIndex: number): void {
		const groups = groupRefs.current ?? [];
		const cardsByGroup = cardRefs.current ?? [];
		if (groups.length === 0) {
			return;
		}

		for (let step = 1; step <= groups.length; step += 1) {
			const previousGroupIndex = getWrappedIndex(
				startGroupIndex - step,
				groups.length,
			);
			const previousGroupCards = cardsByGroup[previousGroupIndex] ?? [];
			if (previousGroupCards.length > 0) {
				if (
					focusCard(previousGroupIndex, previousGroupCards.length - 1)
				) {
					return;
				}
			}
		}

		focusGroupHeader(startGroupIndex);
	}

	function onKeyDown(e: KeyboardEvent): void {
		if (e.key === "Tab") {
			return;
		}

		const groups = groupRefs.current ?? [];
		if (groups.length === 0) {
			return;
		}

		const current = resolvePositionFromActiveElement();
		setFocusPosition(current);

		switch (e.key) {
			case "ArrowRight": {
				e.preventDefault();
				// We intentionally wrap from the last group to the first to keep horizontal navigation continuous.
				focusGroupHeader(current.groupIndex + 1);
				break;
			}
			case "ArrowLeft": {
				e.preventDefault();
				focusGroupHeader(current.groupIndex - 1);
				break;
			}
			case "ArrowDown": {
				e.preventDefault();
				const cardsByGroup = cardRefs.current ?? [];
				const currentGroupCards =
					cardsByGroup[current.groupIndex] ?? [];

				if (current.cardIndex === null) {
					if (!focusCard(current.groupIndex, 0)) {
						focusNextGroupFirstCard(current.groupIndex);
					}
					break;
				}

				if (current.cardIndex < currentGroupCards.length - 1) {
					focusCard(current.groupIndex, current.cardIndex + 1);
					break;
				}

				focusNextGroupFirstCard(current.groupIndex);
				break;
			}
			case "ArrowUp": {
				e.preventDefault();

				if (current.cardIndex === null) {
					focusPreviousGroupLastCard(current.groupIndex);
					break;
				}

				if (current.cardIndex > 0) {
					focusCard(current.groupIndex, current.cardIndex - 1);
					break;
				}

				focusGroupHeader(current.groupIndex);
				break;
			}
			default: {
				break;
			}
		}
	}

	useEffect(() => {
		// Roving tabindex keeps only one stop in the tab order, avoiding exhausting tab navigation across many cards.
		applyRovingTabIndex();
		updateFocusedSnapshot(focusPositionRef.current);
	});

	return {
		onKeyDown,
		focusedGroupIndex,
		focusedCardIndex,
	};
}
