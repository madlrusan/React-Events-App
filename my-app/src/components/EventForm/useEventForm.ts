import { isValid, parseISO } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import type {
	EventCategory,
	EventSeverity,
	NexusEvent,
} from "../../data/eventTypes";

export type FormValues = {
	title: string;
	date: string;
	category: EventCategory | "";
	severity: EventSeverity | "";
	agent: string;
	location: string;
	description: string;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

type UseEventFormReturn = {
	values: FormValues;
	errors: FormErrors;
	isDirty: boolean;
	handleChange: <K extends keyof FormValues>(
		field: K,
		value: FormValues[K],
	) => void;
	validate: () => boolean;
	reset: () => void;
};

const EPOCH = new Date("1970-01-01T00:00:00.000Z");

function buildInitialValues(defaults?: Partial<NexusEvent>): FormValues {
	return {
		title: defaults?.title ?? "",
		date: defaults?.date ?? "",
		category: defaults?.category ?? "",
		severity: defaults?.severity ?? "",
		agent: defaults?.agent ?? "",
		location: defaults?.location ?? "",
		description: defaults?.description ?? "",
	};
}

function validateValues(values: FormValues): FormErrors {
	const errors: FormErrors = {};

	if (!values.title.trim()) {
		errors.title = "Title is required";
	}

	if (!values.date.trim()) {
		errors.date = "Date is required";
	} else {
		const parsed = parseISO(values.date);
		if (!isValid(parsed)) {
			errors.date = "Please enter a valid date";
		} else if (parsed < EPOCH) {
			errors.date = "Date is out of range";
		}
	}

	if (!values.category) {
		errors.category = "Category is required";
	}

	if (!values.severity) {
		errors.severity = "Severity is required";
	}

	if (!values.agent.trim()) {
		errors.agent = "Agent is required";
	}

	return errors;
}

export function useEventForm(
	defaultValues?: Partial<NexusEvent>,
): UseEventFormReturn {
	const [initial] = useState<FormValues>(() =>
		buildInitialValues(defaultValues),
	);

	const [values, setValues] = useState<FormValues>(initial);
	const [errors, setErrors] = useState<FormErrors>({});

	const isDirty = useMemo(
		() =>
			(Object.keys(values) as Array<keyof FormValues>).some(
				(key) => values[key] !== initial[key],
			),
		[values, initial],
	);

	// Errors are cleared per-field on input rather than on blur. This feels more
	// responsive than waiting for blur, and prevents the jarring "error appears as
	// you type" problem.
	const handleChange = useCallback(
		<K extends keyof FormValues>(field: K, value: FormValues[K]) => {
			setValues((prev) => ({ ...prev, [field]: value }));
			setErrors((prev) => {
				if (!prev[field]) return prev;
				const next = { ...prev };
				delete next[field];
				return next;
			});
		},
		[],
	);

	const validate = useCallback((): boolean => {
		const next = validateValues(values);
		setErrors(next);
		return Object.keys(next).length === 0;
	}, [values]);

	const reset = useCallback(() => {
		setValues(initial);
		setErrors({});
	}, [initial]);

	return { values, errors, isDirty, handleChange, validate, reset };
}
