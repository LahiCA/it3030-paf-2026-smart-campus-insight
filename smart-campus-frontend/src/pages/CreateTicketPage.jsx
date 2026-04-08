import { useState } from "react";
import { createTicket, getCurrentUser, uploadImages } from "../api/ticketApi";

const INITIAL_FORM = {
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
};

const CATEGORY_OPTIONS = ["Electrical", "Network", "Hardware", "Software", "Facility", "Safety", "Other"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CreateTicketPage({ onTicketCreated, onClose, embedded = false }) {
    const { userId } = getCurrentUser();
    const [form, setForm] = useState(INITIAL_FORM);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const nextErrors = {};
        if (form.title.trim().length < 3) nextErrors.title = "Title must be at least 3 characters";
        if (form.description.trim().length < 10) nextErrors.description = "Description must be at least 10 characters";
        if (!form.category) nextErrors.category = "Select a category";
        if (files.length > 3) nextErrors.files = "Only 3 images are allowed";
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) {
            return;
        }

        setSubmitting(true);
        setSubmitError("");
        try {
            const ticket = await createTicket({
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category,
                priority: form.priority,
                userId,
            });

            let completeTicket = ticket;
            if (files.length) {
                const attachments = await uploadImages(ticket.id, files);
                completeTicket = { ...ticket, attachments };
            }

            setForm(INITIAL_FORM);
            setFiles([]);
            onTicketCreated?.(completeTicket);
            onClose?.();
        } catch (apiError) {
            setSubmitError(apiError.message || "Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles(selectedFiles.slice(0, 3));
        if (selectedFiles.length > 3) {
            setErrors((current) => ({ ...current, files: "Only the first 3 images will be used" }));
        } else {
            setErrors((current) => ({ ...current, files: "" }));
        }
    };

    return (
        <div className={embedded ? "" : "mx-auto max-w-3xl px-4 py-10"}>
            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">New Incident</p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create maintenance ticket</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Capture the issue clearly so admins and technicians can respond faster.
                        </p>
                    </div>
                    {onClose ? (
                        <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                            Close
                        </button>
                    ) : null}
                </div>

                {submitError ? (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                    </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                        <input
                            value={form.title}
                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                            placeholder="Broken projector in Lab 03"
                        />
                        {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title}</p> : null}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            rows="5"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                            placeholder="Describe what happened, where it happened, and how it affects campus operations."
                        />
                        {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description}</p> : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                        <select
                            value={form.category}
                            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        >
                            <option value="">Select category</option>
                            {CATEGORY_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {errors.category ? <p className="mt-1 text-xs text-red-600">{errors.category}</p> : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
                        <select
                            value={form.priority}
                            onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Attachments</label>
                        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="block w-full text-sm" />
                        <p className="mt-2 text-xs text-slate-500">Up to 3 images can be uploaded with the ticket.</p>
                        {files.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {files.map((file) => (
                                    <span key={file.name} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                        {file.name}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                        {errors.files ? <p className="mt-2 text-xs text-red-600">{errors.files}</p> : null}
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {submitting ? "Creating ticket..." : "Create ticket"}
                    </button>
                    {onClose ? (
                        <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700">
                            Cancel
                        </button>
                    ) : null}
                </div>
            </form>
        </div>
    );
}
