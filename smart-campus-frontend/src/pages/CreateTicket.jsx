import { useState } from "react";
import { createTicket, uploadImages } from "../api/ticketApi";

export default function CreateTicket({ onTicketCreated }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        priority: "LOW",
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
                await uploadImages(newTicket.id, files);
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


        <div className="bg-white p-5 rounded-xl">
            <h2 className="text-lg font-bold mb-3 text-teal-600">Create Ticket</h2>

            <input placeholder="Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="border p-2 w-full mb-2 rounded" />

            <textarea placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="border p-2 w-full mb-2 rounded" />

            <select value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="border p-2 w-full mb-2 rounded">
                <option value="">Category</option>
                <option>Hardware</option>
                <option>Network</option>
                <option>Software</option>
            </select>

            <input placeholder="Resource ID"
                value={form.resourceId}
                onChange={e => setForm({ ...form, resourceId: e.target.value })}
                className="border p-2 w-full mb-2 rounded" />

            <input placeholder="Location"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="border p-2 w-full mb-2 rounded" />

            <select value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="border p-2 w-full mb-2 rounded">
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
            </select>

            {/* CONTACT */}
            <input placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="border p-2 w-full mb-2 rounded" />

            <input placeholder="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="border p-2 w-full mb-2 rounded" />

            {/* IMAGE UPLOAD */}
            <input type="file" multiple
                onChange={e => setFiles([...e.target.files])}
                className="mb-2" />

            <button onClick={handleSubmit}
                className="bg-teal-500 text-white px-4 py-2 rounded w-full">
                Submit
            </button>

        </div>
    );
}