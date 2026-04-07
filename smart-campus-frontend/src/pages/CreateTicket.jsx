import { useState } from "react";
import { createTicket } from "../api/ticketApi";

export default function CreateTicket() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        priority: "",
        resourceId: "",
        createdBy: "user123"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createTicket(form);
        alert("Ticket Created!");
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} />
            <br />
            <textarea placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
            <br />
            <button style={{ background: "#14B8A6", color: "white" }}>
                Submit
            </button>
        </form>
    );
}