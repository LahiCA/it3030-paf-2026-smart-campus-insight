import { useState, useRef } from "react";
import { uploadImages } from "../api/ticketApi";

export default function ImageUpload({ ticketId, refresh }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setError("");
        const selectedFiles = Array.from(e.target.files);

        // Validate file count
        if (selectedFiles.length > 3) {
            setError("Maximum 3 images allowed");
            return;
        }

        // Validate file sizes
        const maxSize = 5 * 1024 * 1024; // 5MB
        for (let file of selectedFiles) {
            if (file.size > maxSize) {
                setError(`Image "${file.name}" exceeds 5MB limit`);
                return;
            }
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError(`"${file.name}" is not a valid image file`);
                return;
            }
        }

        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("Please select at least one image");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await uploadImages(ticketId, files);
            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            await refresh();
            alert("✅ Images uploaded successfully!");
        } catch (err) {
            console.error("Error uploading images:", err);
            setError("Failed to upload images. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-300 transition cursor-pointer">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                />
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer py-6">
                    <span className="text-3xl mb-2">📸</span>
                    <p className="text-sm font-semibold text-gray-700">Click to select images</p>
                    <p className="text-xs text-gray-500">or drag & drop • Max 3 images • 5MB each</p>
                </label>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Selected files ({files.length}/3):</p>
                    <div className="space-y-2">
                        {Array.from(files).map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-teal-50 border border-teal-200 rounded"
                            >
                                <span className="text-sm text-gray-800 truncate">
                                    📷 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(idx)}
                                    className="text-red-600 hover:text-red-700 font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Uploading..." : "Upload Images"}
                    </button>
                </div>
            )}
        </div>
    );
}