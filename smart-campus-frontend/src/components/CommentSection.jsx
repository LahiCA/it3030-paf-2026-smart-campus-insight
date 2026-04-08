import { useEffect, useState } from "react";
import { getComments, addComment, deleteComment, editComment } from "../api/ticketApi";

export default function CommentSection({ ticketId }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const currentUserId = localStorage.getItem("userId") || "user1";

    const loadComments = async () => {
        try {
            const data = await getComments(ticketId);
            setComments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    };

    useEffect(() => {
        loadComments();
    }, [ticketId]);

    const handleAddComment = async () => {
        if (!text.trim()) {
            alert("Please enter a comment");
            return;
        }

        setLoading(true);
        try {
            await addComment(ticketId, { message: text.trim(), userId: currentUserId });
            setText("");
            await loadComments();
        } catch (err) {
            console.error("Error adding comment:", err);
            alert("Failed to add comment");
        } finally {
            setLoading(false);
        }
    };

    const handleEditComment = async (commentId, newMessage) => {
        if (!newMessage.trim()) {
            alert("Comment cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await editComment(commentId, currentUserId, newMessage.trim());
            setEditingId(null);
            setEditingText("");
            await loadComments();
        } catch (err) {
            console.error("Error editing comment:", err);
            alert("Failed to edit comment");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;

        setLoading(true);
        try {
            await deleteComment(commentId, currentUserId);
            await loadComments();
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert("Failed to delete comment");
        } finally {
            setLoading(false);
        }
    };

    const canEditDelete = (comment) => {
        return comment.userId === currentUserId || localStorage.getItem("userRole") === "ADMIN";
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments & Resolution Notes</h2>

            {/* Comments List */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id || comment._id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-200 transition"
                        >
                            {editingId === (comment.id || comment._id) ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        rows="2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditComment(comment.id || comment._id, editingText)}
                                            disabled={loading}
                                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-3 py-1 rounded transition disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-3 py-1 rounded transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {comment.userId || "Anonymous"}
                                                {comment.userId === currentUserId && (
                                                    <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {comment.createdAt
                                                    ? new Date(comment.createdAt).toLocaleDateString()
                                                    : "Just now"}
                                            </p>
                                        </div>
                                        {canEditDelete(comment) && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(comment.id || comment._id);
                                                        setEditingText(comment.message);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteComment(comment.id || comment._id)
                                                    }
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-700 text-sm break-words">{comment.message}</p>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Section */}
            <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-3 font-medium">Add a comment or resolution note:</p>
                <div className="space-y-2">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write your comment... (resolution notes, updates, etc.)"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={loading || !text.trim()}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Posting..." : "Post Comment"}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Use comments to share updates and resolution notes with the team
                </p>
            </div>
        </div>
    );
}