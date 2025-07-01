"use client";

import { useState, useRef } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    LinearProgress,
    Alert,
    Chip,
    Card,
    CardContent,
    CardHeader
} from "@mui/material";
import {
    CloudUpload,
    CheckCircle,
    Error as ErrorIcon,
    UploadFile
} from "@mui/icons-material";

interface FirmwareUploadProps {
    onUploadSuccess: () => void;
}

export default function FirmwareUpload({ onUploadSuccess }: FirmwareUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
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
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
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

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card elevation={2}>
            <CardHeader
                avatar={
                    <Paper elevation={3} sx={{ p: 1, backgroundColor: 'primary.main', color: 'white' }}>
                        <CloudUpload />
                    </Paper>
                }
                title={
                    <Typography variant="h6" fontWeight="bold">
                        Upload Firmware
                    </Typography>
                }
                subheader="Deploy new firmware to ESP32 devices"
            />
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Drag and Drop Area */}
                    <Paper
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={triggerFileInput}
                        elevation={0}
                        sx={{
                            border: 2,
                            borderStyle: 'dashed',
                            borderColor: isDragOver ? 'primary.main' : 'grey.300',
                            backgroundColor: isDragOver ? 'primary.50' : uploading ? 'grey.50' : 'transparent',
                            p: 4,
                            textAlign: 'center',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': !uploading ? {
                                borderColor: 'primary.main',
                                backgroundColor: 'primary.50'
                            } : {}
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".bin"
                            onChange={handleFileInputChange}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {uploading ? (
                                <>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.50'
                                        }}
                                    >
                                        <UploadFile color="primary" />
                                    </Paper>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body1" fontWeight="bold" color="primary">
                                            Uploading...
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {uploadProgress}% complete
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '50%',
                                            backgroundColor: isDragOver ? 'primary.100' : 'grey.100'
                                        }}
                                    >
                                        <CloudUpload color={isDragOver ? 'primary' : 'action'} />
                                    </Paper>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body1" fontWeight="bold">
                                            {isDragOver ? 'Drop file here' : 'Upload Firmware'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Click or drag & drop .bin file
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>

                    {/* Upload Progress */}
                    {uploading && (
                        <Paper elevation={1} sx={{ p: 2, backgroundColor: 'primary.50' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="primary.dark">
                                    Uploading...
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                    {uploadProgress}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Paper>
                    )}

                    {/* Status Messages */}
                    {message && (
                        <Alert
                            severity={message.type === 'success' ? 'success' : 'error'}
                            icon={message.type === 'success' ? <CheckCircle /> : <ErrorIcon />}
                        >
                            {message.text}
                        </Alert>
                    )}

                    {/* Upload Guidelines */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label=".bin files only" size="small" color="primary" variant="outlined" />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="Max size: 50MB" size="small" color="success" variant="outlined" />
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </CardContent>
        </Card>
    );
} 
