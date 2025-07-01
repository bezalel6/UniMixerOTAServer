"use client";

import { useState, useEffect } from "react";

interface FirmwareFile {
    name: string;
    size: number;
    uploadDate: string;
    version?: string;
    isLatest?: boolean;
}

interface FirmwareListProps {
    refreshKey: number;
}

export default function FirmwareList({ refreshKey }: FirmwareListProps) {
    const [firmwareFiles, setFirmwareFiles] = useState<FirmwareFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFirmwareList = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/firmware/list');
            if (!response.ok) {
                throw new Error('Failed to fetch firmware list');
            }
            const data = await response.json();
            setFirmwareFiles(data.files || []);
            setError(null);
        } catch (err) {
            setError('Failed to load firmware files');
            console.error('Error fetching firmware list:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFirmwareList();
    }, [refreshKey]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = (filename: string) => {
        window.open(`/api/firmware/${filename}`, '_blank');
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/firmware/${filename}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchFirmwareList(); // Refresh the list
            } else {
                alert('Failed to delete firmware file');
            }
        } catch (error) {
            alert('Error deleting firmware file');
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Firmware Files</h3>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Firmware Files</h3>
                <div className="text-center py-8">
                    <div className="text-red-600 mb-2">⚠️ {error}</div>
                    <button
                        onClick={fetchFirmwareList}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Firmware Files</h3>
                <button
                    onClick={fetchFirmwareList}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    Refresh
                </button>
            </div>

            {firmwareFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📁</div>
                    <p>No firmware files uploaded yet</p>
                    <p className="text-sm">Upload a .bin file to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {firmwareFiles.map((file, index) => (
                        <div
                            key={index}
                            className={`border rounded-lg p-4 ${file.isLatest ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                                        {file.isLatest && (
                                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                Latest
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span className="mx-2">•</span>
                                        <span>{formatDate(file.uploadDate)}</span>
                                        {file.version && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <span>v{file.version}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(file.name)}
                                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    <strong>ESP32 URL:</strong> The latest firmware is always available at{' '}
                    <code className="bg-gray-100 px-1 rounded">/api/firmware/latest.bin</code>
                </p>
            </div>
        </div>
    );
} 
