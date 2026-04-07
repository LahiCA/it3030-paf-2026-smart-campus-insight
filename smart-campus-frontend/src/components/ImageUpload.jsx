import { useState, useRef } from 'react';
import { ticketApi } from '../api/ticketApi';

const ImageUpload = ({ ticketId, images, onImagesUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (files.length > 3) {
            setError('Maximum 3 images allowed');
            return;
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setError('Only image files (JPEG, PNG, GIF) are allowed');
            return;
        }

        // Validate file sizes (max 5MB each)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            setError('Each image must be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            await ticketApi.uploadImages(ticketId, files);

            // Refresh images
            const response = await ticketApi.getImages(ticketId);
            onImagesUpdate(response.data);

            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError('Failed to upload images');
            console.error('Error uploading images:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await ticketApi.deleteImage(imageId);
            // Refresh images
            const response = await ticketApi.getImages(ticketId);
            onImagesUpdate(response.data);
        } catch (err) {
            alert('Failed to delete image');
            console.error('Error deleting image:', err);
        }
    };

    return (
        <div className="image-upload-section card">
            <div className="card-header">
                <h2>Images ({images.length})</h2>
            </div>
            <div className="card-body">
                <div className="upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Images'}
                    </button>
                    <p className="upload-info">
                        Select up to 3 images (JPEG, PNG, GIF). Max 5MB each.
                    </p>
                </div>

                {error && (
                    <div className="error-message" style={{
                        color: 'var(--danger)',
                        backgroundColor: '#fef2f2',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                <div className="images-grid">
                    {images.length === 0 ? (
                        <p className="no-images">No images uploaded yet.</p>
                    ) : (
                        images.map(image => (
                            <div key={image.id} className="image-item">
                                <img
                                    src={`http://localhost:8080/uploads/${image.imagePath.split('/').pop()}`}
                                    alt="Ticket attachment"
                                    className="image-preview"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.png'; // Fallback image
                                    }}
                                />
                                <div className="image-actions">
                                    <button
                                        className="btn btn-danger btn-small"
                                        onClick={() => handleDeleteImage(image.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;