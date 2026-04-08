import { useState } from "react";
import { createTicket, uploadImages } from "../api/ticketApi";

export default function CreateTicket({ onTicketCreated }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        priority: "MEDIUM",
        location: "",
        resourceId: "",
        email: "",
        phone: ""
    });

    const [files, setFiles] = useState([]);

    const handleSubmit = async () => {
        if (!form.title || !form.description || !form.category) {
            alert("Fill required fields");
            return;
        }

        if (files.length > 3) {
            alert("Max 3 images allowed");
            return;
        }
        if (files.length > 3) newErrors.files = "Maximum 3 images allowed";

        // Check file sizes (max 5MB each)
        files.forEach((file) => {

        try {
            const payload = {
                title: form.title,
                description: form.description,
                category: form.category,
                priority: form.priority,
                location: form.location,
                resourceId: form.resourceId,
                createdBy: "user001",
                contactDetails: `${form.email} | ${form.phone}`
            };

            const newTicket = await createTicket(payload);

            // upload images after ticket created
            if (files.length > 0) {
                    // Don't fail the whole operation if images fail
                }
            }

            alert("Ticket Created ✅");

            if (onTicketCreated) {
                onTicketCreated(newTicket);
            }

            // reset
            setForm({
                title: "",
                description: "",
                category: "",
                priority: "LOW",
                location: "",
                resourceId: "",
                email: "",
                phone: ""
            });
            setFiles([]);

        } catch (err) {
            console.error(err);
            alert("Error creating ticket");
        }
    };

    return (
                    placeholder="Provide detailed description of the issue..."
                            }`}
                        <option value="Network">Network</option>
                        <option value="Software">Software</option>
                        <option value="Facility">Facility</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority *
                    </label>
                    <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            {/* Location and Resource ID */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location / Building
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Room 101, Building A"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Resource / Equipment ID
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., PROJ-001"
                        value={form.resourceId}
                        onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => {
                            setForm({ ...form, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone
                    </label>
                    <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => {
                            setForm({ ...form, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: "" });
                        }}
                        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${errors.phone ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attachments (Evidence/Screenshots) - Max 3 images
                </label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                />
                {files.length > 0 && (
                    <div className="mt-3">
                        <p className="text-sm text-teal-600 font-semibold mb-2">Selected files ({files.length}/3):</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {files.map((file, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    📷 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {errors.files && <p className="text-red-600 text-xs mt-2">{errors.files}</p>}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">* Required fields</p>
        </form>
    );
}