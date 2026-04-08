import { useEffect, useState } from "react";
import { getComments, addComment, deleteComment } from "../api/ticketApi";

export default function CommentSection({ ticketId }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");

    const load = async () => {
        const res = await getComments(ticketId);
        setComments(res.data);
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async () => {
        await addComment(ticketId, { message: text, userId: "user1" });
        setText("");
        load();
    };

    return (
        <div className="mt-6">
            <h3 className="font-semibold">Comments</h3>
            {comments.map(c => (
                <div key={c.id} className="bg-gray-100 p-2 rounded mt-2 flex justify-between">
                    <span>{c.message}</span>
                    <button onClick={() => deleteComment(c.id, "user1")} className="text-red-500">Delete</button>
                </div>
            ))}
            <div className="flex mt-2">
                <input value={text} onChange={e => setText(e.target.value)} className="border p-2 flex-1" />
                <button onClick={handleAdd} className="bg-teal-500 text-white px-4">Add</button>
            </div>
        </div>
    );
}