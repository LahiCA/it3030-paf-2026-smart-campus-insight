import { useEffect, useState } from "react";
import { addComment, deleteComment, editComment, getComments, getCurrentUser } from "../api/ticketApi";

export default function TicketComments({ ticketId }) {
    const { userId } = getCurrentUser();
    const [comments, setComments] = useState([]);
    const [draft, setDraft] = useState("");
    const [editingId, setEditingId] = useState("");
    const [editingText, setEditingText] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const loadComments = async () => {
        try {
            setComments(await getComments(ticketId));
        } catch (apiError) {
            setError(apiError.message || "Failed to load comments");
        }
    };

    useEffect(() => {
        loadComments();
    }, [ticketId]);

    const submitComment = async () => {
        if (!draft.trim()) {
            return;
        }
        setBusy(true);
        setError("");
        try {
            await addComment(ticketId, { userId, message: draft.trim() });
            setDraft("");
            await loadComments();
        } catch (apiError) {
            setError(apiError.message || "Failed to add comment");
        } finally {
            setBusy(false);
        }
    };

    const saveEdit = async () => {
        if (!editingText.trim()) {
            return;
        }
        setBusy(true);
        setError("");
        try {
            await editComment(editingId, { userId, message: editingText.trim() });
            setEditingId("");
            setEditingText("");
            await loadComments();
        } catch (apiError) {
            setError(apiError.message || "Failed to edit comment");
        } finally {
            setBusy(false);
        }
    };

    const removeComment = async (commentId) => {
        setBusy(true);
        setError("");
        try {
            await deleteComment(commentId);
            await loadComments();
        } catch (apiError) {
            setError(apiError.message || "Failed to delete comment");
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Collaboration</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Comments</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {comments.length} total
                </span>
            </div>

            {error ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            <div className="space-y-4">
                {comments.length ? comments.map((comment) => {
                    const isOwner = comment.userId === userId;
                    const isEditing = editingId === comment.id;
                    return (
                        <article key={comment.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{comment.userId}</p>
                                    <p className="text-xs text-slate-500">
                                        {comment.updatedAt ? new Date(comment.updatedAt).toLocaleString() : "Just now"}
                                    </p>
                                </div>
                                {isOwner ? (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditingText(comment.message);
                                            }}
                                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeComment(comment.id)}
                                            className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            {isEditing ? (
                                <div className="mt-3 space-y-3">
                                    <textarea
                                        value={editingText}
                                        onChange={(event) => setEditingText(event.target.value)}
                                        rows="3"
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={saveEdit}
                                            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId("");
                                                setEditingText("");
                                            }}
                                            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm leading-6 text-slate-700">{comment.message}</p>
                            )}
                        </article>
                    );
                }) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                        No comments yet. Add the first progress update or resolution note.
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-3xl bg-teal-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Add a new comment</p>
                <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows="4"
                    placeholder="Share an update, ask a question, or record a resolution note"
                    className="mt-3 w-full rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                />
                <button
                    type="button"
                    disabled={busy || !draft.trim()}
                    onClick={submitComment}
                    className="mt-4 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {busy ? "Saving..." : "Post comment"}
                </button>
            </div>
        </section>
    );
}
