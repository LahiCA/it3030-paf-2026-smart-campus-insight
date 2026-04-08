import { useMemo, useRef, useState } from "react";
import { uploadImages } from "../api/ticketApi";

const MAX_IMAGES = 3;
const MAX_SIZE = 5 * 1024 * 1024;

export default function TicketImageUpload({ ticketId, currentCount = 0, onUploaded }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const previews = useMemo(
        () => files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
        [files],
    );

    const validateFiles = (selectedFiles) => {
        if (currentCount + selectedFiles.length > MAX_IMAGES) {
            return `You can upload only ${MAX_IMAGES - currentCount} more image(s)`;
        }
        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                return `${file.name} is not an image`;
            }
            if (file.size > MAX_SIZE) {
                return `${file.name} exceeds the 5MB limit`;
            }
        }
        return "";
    };

    const handleChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        const validationError = validateFiles(selectedFiles);
        setError(validationError);
        if (!validationError) {
            setFiles(selectedFiles);
        }
    };

    const removeFile = (index) => {
        setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    };

    const handleUpload = async () => {
        if (!files.length) {
            setError("Select at least one image");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const attachments = await uploadImages(ticketId, files);
            setFiles([]);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
            onUploaded?.(attachments);
        } catch (apiError) {
            setError(apiError.message || "Failed to upload images");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-teal-300 bg-teal-50/70 px-6 py-8 text-center transition hover:border-teal-500 hover:bg-teal-50">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleChange}
                />
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
                    Evidence Upload
                </span>
                <p className="mt-2 text-lg font-semibold text-slate-900">Select up to 3 screenshots or photos</p>
                <p className="mt-1 text-sm text-slate-500">PNG, JPG, or WEBP. Max 5MB each.</p>
            </label>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            {previews.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {previews.map(({ file, preview }, index) => (
                        <div key={`${file.name}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <img src={preview} alt={file.name} className="h-36 w-full object-cover" />
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !files.length}
                className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                {loading ? "Uploading..." : "Upload attachments"}
            </button>
        </div>
    );
}
