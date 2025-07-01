"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Chip,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Divider
} from "@mui/material";
import {
    Folder,
    Refresh,
    Download,
    Delete,
    ErrorOutline,
    Schedule,
    Storage,
    Label,
    Info
} from "@mui/icons-material";

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
        if (!confirm(`Are you sure you want to delete ${filename}?\n\nThis action cannot be undone.`)) {
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
            <Card elevation={2}>
                <CardHeader
                    avatar={
                        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'success.main', color: 'white' }}>
                            <Folder />
                        </Paper>
                    }
                    title={
                        <Typography variant="h6" fontWeight="bold">
                            Firmware Library
                        </Typography>
                    }
                    subheader="Manage versions"
                />
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                        <CircularProgress color="primary" sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Loading...
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card elevation={2}>
                <CardHeader
                    avatar={
                        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'success.main', color: 'white' }}>
                            <Folder />
                        </Paper>
                    }
                    title={
                        <Typography variant="h6" fontWeight="bold">
                            Firmware Library
                        </Typography>
                    }
                    subheader="Manage versions"
                />
                <CardContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                borderRadius: '50%',
                                backgroundColor: 'error.50',
                                display: 'inline-flex',
                                mb: 2
                            }}
                        >
                            <ErrorOutline color="error" fontSize="large" />
                        </Paper>
                        <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
                            ⚠️ {error}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={fetchFirmwareList}
                            size="small"
                        >
                            Try Again
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={2}>
            <CardHeader
                avatar={
                    <Paper elevation={3} sx={{ p: 1, backgroundColor: 'success.main', color: 'white' }}>
                        <Folder />
                    </Paper>
                }
                title={
                    <Typography variant="h6" fontWeight="bold">
                        Firmware Library
                    </Typography>
                }
                subheader={`${firmwareFiles.length} versions available`}
                action={
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Refresh />}
                        onClick={fetchFirmwareList}
                    >
                        Refresh
                    </Button>
                }
            />
            <CardContent>
                {firmwareFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                borderRadius: '50%',
                                backgroundColor: 'grey.100',
                                display: 'inline-flex',
                                mb: 2
                            }}
                        >
                            <Folder color="action" fontSize="large" />
                        </Paper>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            No firmware files yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Upload your first .bin file to get started
                        </Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <Download color="primary" fontSize="small" />
                            <Typography variant="body2" color="primary">
                                Use the upload section to add firmware
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {firmwareFiles.map((file, index) => (
                            <Paper
                                key={index}
                                elevation={1}
                                sx={{
                                    p: 2,
                                    border: file.isLatest ? '2px solid' : '1px solid',
                                    borderColor: file.isLatest ? 'success.main' : 'divider',
                                    backgroundColor: file.isLatest ? 'success.50' : 'background.paper',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        elevation: 3,
                                        borderColor: file.isLatest ? 'success.dark' : 'primary.main'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 0.5,
                                                    borderRadius: 1,
                                                    backgroundColor: file.isLatest ? 'success.100' : 'grey.100'
                                                }}
                                            >
                                                <Folder
                                                    fontSize="small"
                                                    color={file.isLatest ? 'success' : 'action'}
                                                />
                                            </Paper>
                                            <Typography variant="h6" fontWeight="bold">
                                                {file.name}
                                            </Typography>
                                            {file.isLatest && (
                                                <Chip
                                                    label="LATEST"
                                                    color="success"
                                                    size="small"
                                                    variant="filled"
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Storage fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatFileSize(file.size)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Schedule fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(file.uploadDate)}
                                                </Typography>
                                            </Box>
                                            {file.version && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Label fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        v{file.version}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<Download />}
                                            onClick={() => handleDownload(file.name)}
                                        >
                                            Download
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<Delete />}
                                            onClick={() => handleDelete(file.name)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Alert severity="info" icon={<Info />}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                        ESP32 OTA Endpoint
                    </Typography>
                    <Typography variant="body2">
                        Latest firmware: <code style={{
                            backgroundColor: '#e3f2fd',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                        }}>
                            /api/firmware/latest.bin
                        </code>
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
} 
