import { useState } from 'react';
import { ticketApi } from '../api/ticketApi';

const CommentSection = ({ ticketId, comments, onCommentsUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setLoading(true);
            const commentData = {
                ticketId,
                userId: 'user123', // In real app, get from auth
                message: newComment.trim()
            };

            await ticketApi.addComment(ticketId, commentData);
            setNewComment('');
            // Refresh comments
            const response = await ticketApi.getComments(ticketId);
            onCommentsUpdate(response.data);
        } catch (err) {
            alert('Failed to add comment');
            console.error('Error adding comment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editText.trim()) return;

        try {
            setLoading(true);
            await ticketApi.updateComment(commentId, editText.trim());
            setEditingComment(null);
            setEditText('');
            // Refresh comments
            const response = await ticketApi.getComments(ticketId);
            onCommentsUpdate(response.data);
        } catch (err) {
            alert('Failed to update comment');
            console.error('Error updating comment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            setLoading(true);
            await ticketApi.deleteComment(commentId);
            // Refresh comments
            const response = await ticketApi.getComments(ticketId);
            onCommentsUpdate(response.data);
        } catch (err) {
            alert('Failed to delete comment');
            console.error('Error deleting comment:', err);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.message);
    };

    const cancelEditing = () => {
        setEditingComment(null);
        setEditText('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="comment-section card">
            <div className="card-header">
                <h2>Comments ({comments.length})</h2>
            </div>
            <div className="card-body">
                <form onSubmit={handleAddComment} className="comment-form">
                    <textarea
                        className="form-input form-textarea"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        required
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !newComment.trim()}
                    >
                        {loading ? 'Adding...' : 'Add Comment'}
                    </button>
                </form>

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="no-comments">No comments yet.</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.userId}</span>
                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                </div>

                                {editingComment === comment.id ? (
                                    <div className="comment-edit">
                                        <textarea
                                            className="form-input form-textarea"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        <div className="edit-actions">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleEditComment(comment.id)}
                                                disabled={loading}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={cancelEditing}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="comment-content">
                                        <p>{comment.message}</p>
                                        <div className="comment-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => startEditing(comment)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-small"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentSection;