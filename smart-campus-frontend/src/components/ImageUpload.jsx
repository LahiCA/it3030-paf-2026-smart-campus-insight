import { useState } from "react";
import { uploadImages } from "../api/ticketApi";

export default function ImageUpload({ ticketId, refresh }) {
    const [files, setFiles] = useState([]);

    const handleUpload = async () => {
        await uploadImages(ticketId, files);
        setFiles([]);
        refresh();
    };

    return (
        <div className="mt-4">
            <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
            <button onClick={handleUpload} className="bg-teal-500 text-white px-4 py-2 mt-2 rounded">
                Upload
            </button>
        </div>
    );
}