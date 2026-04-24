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
    const [touched, setTouched] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ---------------- VALIDATION ----------------
    const validate = (values = form, fileList = files) => {
        const nextErrors = {};

        if (!values.title.trim()) {
            nextErrors.title = "Title is required";
        } else if (values.title.trim().length < 3) {
            nextErrors.title = "Title must be at least 3 characters";
        }

        if (!values.description.trim()) {
            nextErrors.description = "Description is required";
        } else if (values.description.trim().length < 10) {
            nextErrors.description = "Description must be at least 10 characters";
        }

        if (!values.category) {
            nextErrors.category = "Please select a category";
        }

        // ✅ FIXED: STRICT 10 DIGIT VALIDATION
        const phoneDigits = values.contactNumber.replace(/\D/g, "");

        if (!values.contactNumber.trim()) {
            nextErrors.contactNumber = "Contact number is required";
        } else if (phoneDigits.length !== 10) {
            nextErrors.contactNumber = "Contact number must be exactly 10 digits";
        }

        if (fileList.length > 3) {
            nextErrors.files = "Maximum 3 images allowed";
        }

        return nextErrors;
    };

    // ---------------- HANDLERS ----------------
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors(validate({ ...form }, files));
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []).slice(0, 3);

        let fileError = "";

        for (const file of selectedFiles) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                fileError = "Only JPG and PNG files are allowed";
                break;
            }
            if (file.size > MAX_FILE_SIZE) {
                fileError = `${file.name} exceeds 5MB limit`;
                break;
            }
        }

        setFiles(fileError ? [] : selectedFiles);
        setErrors((prev) => ({ ...prev, files: fileError }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);
        setTouched({
            title: true,
            description: true,
            category: true,
            contactNumber: true,
        });

        if (Object.keys(validationErrors).length > 0) return;

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

            let finalTicket = ticket;

            if (files.length > 0) {
                const attachments = await uploadImages(ticket.id, files);
                finalTicket = { ...ticket, attachments };
            }

            setForm(INITIAL_FORM);
            setFiles([]);
            setErrors({});
            setTouched({});

            onTicketCreated?.(finalTicket);
            onClose?.();

        } catch (error) {
            setSubmitError(error?.message || "Something went wrong while creating the ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const showError = (field) => touched[field] && errors[field];

    return (
        <div className={embedded ? "" : "mx-auto max-w-3xl px-4 py-10"}>
            <form
                onSubmit={handleSubmit}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
                {/* HEADER */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">
                            New Incident
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                            Create maintenance ticket
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Describe the issue clearly for faster resolution.
                        </p>

                        {displayId && (
                            <p className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                                Reporter ID: {displayId}
                            </p>
                        )}
                    </div>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                            Close
                        </button>
                    )}
                </div>

                {/* SERVER ERROR */}
                {submitError && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                    </div>
                )}

                {/* FORM */}
                <div className="grid gap-5 md:grid-cols-2">

                    {/* TITLE */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Resource / Location
                        </label>

                        <input
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            onBlur={() => handleBlur("title")}
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        />

                        {showError("title") && (
                            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Description
                        </label>

                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            onBlur={() => handleBlur("description")}
                            rows="5"
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        />

                        {showError("description") && (
                            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Category
                        </label>

                        <select
                            value={form.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            onBlur={() => handleBlur("category")}
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        >
                            <option value="">Select category</option>
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        {showError("category") && (
                            <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                        )}
                    </div>

                    {/* PRIORITY */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Priority
                        </label>

                        <select
                            value={form.priority}
                            onChange={(e) => handleChange("priority", e.target.value)}
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        >
                            {PRIORITY_OPTIONS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Contact Number
                        </label>

                        <input
                            value={form.contactNumber}
                            onChange={(e) => {
                                const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                handleChange("contactNumber", onlyDigits);
                            }}
                            onBlur={() => handleBlur("contactNumber")}
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        />

                        {showError("contactNumber") && (
                            <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>
                        )}
                    </div>

                    {/* FILES */}
                    <div className="md:col-span-2 rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Attachments
                        </label>

                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />

                        {errors.files && (
                            <p className="mt-2 text-xs text-red-600">{errors.files}</p>
                        )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-8 flex gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
                    >
                        {submitting ? "Submitting..." : "Create Ticket"}
                    </button>
                </div>
            </form>
        </div>
    );
}