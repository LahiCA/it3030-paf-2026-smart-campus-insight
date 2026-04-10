import { useState } from "react";
import { createTicket, getCurrentUser, uploadImages } from "../api/ticketApi";

const INITIAL_FORM = {
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    contactNumber: "",
};

const CATEGORY_OPTIONS = ["Electrical", "Network", "Hardware", "Software", "Facility", "Safety", "Other"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function CreateTicketPage({ onTicketCreated, onClose, embedded = false }) {
    const { userId, displayId } = getCurrentUser();
    const [form, setForm] = useState(INITIAL_FORM);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const nextErrors = {};
        if (form.title.trim().length < 3) nextErrors.title = "Resource / location must be at least 3 characters";
        if (form.description.trim().length < 10) nextErrors.description = "Description must be at least 10 characters";
        if (!form.category) nextErrors.category = "Select a category";
        if (!form.contactNumber.trim()) {
            nextErrors.contactNumber = "Contact number is required";
        } else if (!/^[0-9+()\-\s]{7,20}$/.test(form.contactNumber.trim())) {
            nextErrors.contactNumber = "Enter a valid contact number";
        }
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
                userDisplayId: displayId,
                contactNumber: form.contactNumber.trim(),
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
        const limitedFiles = selectedFiles.slice(0, 3);
        let fileError = "";

        if (selectedFiles.length > 3) {
            fileError = "Only the first 3 images will be used";
        }

        for (const file of limitedFiles) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                fileError = "Only JPG and PNG files are allowed";
                break;
            }
            if (file.size > MAX_FILE_SIZE) {
                fileError = `${file.name} exceeds the 5MB limit`;
                break;
            }
        }

        setFiles(fileError && fileError !== "Only the first 3 images will be used" ? [] : limitedFiles);
        setErrors((current) => ({ ...current, files: fileError }));
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
                        {displayId ? (
                            <p className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                                Reporter ID: {displayId}
                            </p>
                        ) : null}
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
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Resource / Location</label>
                        <input
                            value={form.title}
                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                            placeholder="Projector room - Lab 03"
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

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Contact Number</label>
                        <input
                            value={form.contactNumber}
                            onChange={(event) => setForm((current) => ({ ...current, contactNumber: event.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                            placeholder="071 234 5678"
                        />
                        {errors.contactNumber ? <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p> : null}
                    </div>

                    <div className="md:col-span-2 rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Attachments</label>
                        <input type="file" accept=".jpg,.jpeg,.png" multiple onChange={handleFileChange} className="block w-full text-sm" />
                        <p className="mt-2 text-xs text-slate-500">Up to 3 JPG or PNG images, 5MB each.</p>
                        {files.length ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {files.map((file) => (
                                    <div key={file.name} className="rounded-2xl border border-teal-100 bg-white p-3">
                                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full rounded-xl object-cover" />
                                        <p className="mt-2 truncate text-xs font-semibold text-slate-700">{file.name}</p>
                                        <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
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
