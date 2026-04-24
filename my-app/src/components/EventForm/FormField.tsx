import * as React from "react";

type FormFieldProps = {
	/** Text shown in the <label>. */
	label: string;
	/** Validation error message. When present the child input gets aria-invalid
	 *  and aria-describedby injected automatically. */
	error?: string;
	/** The single input/select/textarea element to render inside the field. */
	children: React.ReactNode;
	/** The id of the underlying input — wires <label htmlFor> and aria refs. */
	htmlFor: string;
};

/**
 * Wraps a form control with a label and optional error message.
 *
 * When `error` is set this component:
 * - Renders a `<p id="{htmlFor}-error">` for the message (role="alert" so
 *   screen readers announce it immediately).
 * - Clones the child element to inject `aria-invalid="true"` and
 *   `aria-describedby="{htmlFor}-error"` so assistive technology can associate
 *   the error with its input.
 */
export function FormField({ label, error, children, htmlFor }: FormFieldProps) {
	// Cast to ReactElement<AriaProps> so cloneElement can inject the aria attrs
	// without fighting TypeScript's strict cloneElement overloads.
	type AriaProps = {
		"aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
		"aria-describedby"?: string;
	};

	const child = React.Children.only(children) as React.ReactElement<AriaProps>;

	const enhancedChild = error
		? React.cloneElement(child, {
				"aria-invalid": true,
				// Preserve any existing aria-describedby from the caller.
				"aria-describedby": [
					child.props["aria-describedby"],
					`${htmlFor}-error`,
				]
					.filter(Boolean)
					.join(" "),
			})
		: child;

	return (
		<div className="nx-form-field">
			<label htmlFor={htmlFor} className="nx-form-label">
				{label}
			</label>
			{enhancedChild}
			{error && (
				<p id={`${htmlFor}-error`} className="nx-form-error" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
