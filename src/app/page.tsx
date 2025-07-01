"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Button,
    Chip,
    Alert,
    AlertTitle
} from "@mui/material";
import { Code, ContentCopy } from "@mui/icons-material";
import FirmwareUpload from "@/components/FirmwareUpload";
import FirmwareList from "@/components/FirmwareList";
import OTAStats from "@/components/OTAStats";
import ServerConfig from "@/components/ServerConfig";
import { getFirmwareUrl, getServerConfig } from "@/lib/config";

interface FirmwareFile {
    name: string;
    size: number;
    uploadDate: string;
    version?: string;
}

export default function Home() {
    const [firmwareFiles, setFirmwareFiles] = useState<FirmwareFile[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [serverUrl, setServerUrl] = useState<string>('');

    const refreshFirmwareList = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        // Handle dynamic URL detection after component mounts to avoid hydration issues
        const config = getServerConfig();
        if (config.isAutoDetect && typeof window !== 'undefined') {
            setServerUrl(`http://${window.location.host}/api/firmware/latest.bin`);
        } else {
            setServerUrl(getFirmwareUrl());
        }
    }, []);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(serverUrl || getFirmwareUrl());
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    ESP32 Firmware Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Upload and manage firmware updates for your UniMixer devices
                </Typography>
            </Box>

            {/* Main Dashboard Layout */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 3
            }}>
                {/* Left Column - Upload and Configuration */}
                <Box sx={{
                    flex: { xs: '1', lg: '0 0 400px' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    <FirmwareUpload onUploadSuccess={refreshFirmwareList} />
                    <ServerConfig />
                    <OTAStats />
                </Box>

                {/* Right Column - Firmware Management */}
                <Box sx={{ flex: 1 }}>
                    <FirmwareList refreshKey={refreshKey} />
                </Box>
            </Box>

            {/* ESP32 Integration Guide */}
            <Paper
                elevation={2}
                sx={{
                    mt: 4,
                    p: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    border: '1px solid rgba(25, 118, 210, 0.2)'
                }}
            >
                <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 1.5,
                                    backgroundColor: 'primary.main',
                                    color: 'white'
                                }}
                            >
                                <Code />
                            </Paper>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    ESP32 Integration
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Configure your ESP32 device to use this OTA server for firmware updates.
                                </Typography>
                                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            OTA Server URL
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<ContentCopy />}
                                            onClick={handleCopyUrl}
                                        >
                                            Copy
                                        </Button>
                                    </Box>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            backgroundColor: '#1a1a1a',
                                            color: '#4ade80',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            overflowX: 'auto'
                                        }}
                                    >
                                        {serverUrl || getFirmwareUrl()}
                                    </Paper>
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Update <code style={{ backgroundColor: '#e3f2fd', padding: '2px 4px', borderRadius: '4px' }}>
                                                OTA_SERVER_URL
                                            </code> in your ESP32 code with the URL above.
                                        </Typography>
                                    </Alert>
                                </Paper>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Paper>
        </Box>
    );
} 
