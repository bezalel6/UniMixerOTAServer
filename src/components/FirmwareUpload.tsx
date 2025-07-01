"use client";

import { useState } from "react";

interface FirmwareUploadProps {
    onUploadSuccess: () => void;
}

export default function FirmwareUpload({ onUploadSuccess }: FirmwareUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type (should be .bin for ESP32 firmware)
        if (!file.name.endsWith('.bin')) {
            setMessage({ type: 'error', text: 'Please select a .bin firmware file' });
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setMessage(null);

        const formData = new FormData();
        formData.append('firmware', file);

        try {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    setMessage({ type: 'success', text: 'Firmware uploaded successfully!' });
                    onUploadSuccess();
                    // Reset file input
                    event.target.value = '';
                } else {
                    setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
                }
                setUploading(false);
                setUploadProgress(0);
            });

            xhr.addEventListener('error', () => {
                setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
                setUploading(false);
                setUploadProgress(0);
            });

            xhr.open('POST', '/api/upload');
            xhr.send(formData);

        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Firmware</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Firmware File (.bin)
                    </label>
                    <input
                        type="file"
                        accept=".bin"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                </div>

                {uploading && (
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`p-3 rounded-md ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="text-sm text-gray-500">
                    <p><strong>Supported formats:</strong> .bin files only</p>
                    <p><strong>Max file size:</strong> 50MB</p>
                    <p><strong>Note:</strong> Uploaded firmware will be available at <code>/api/firmware/latest.bin</code></p>
                </div>
            </div>
        </div>
    );
} 
