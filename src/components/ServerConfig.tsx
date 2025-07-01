"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Paper,
    Chip,
    Alert
} from "@mui/material";
import {
    Settings,
    ContentCopy,
    CheckCircle,
    NetworkCheck
} from "@mui/icons-material";
import { getServerConfig, getFirmwareUrl } from "@/lib/config";

export default function ServerConfig() {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [config, setConfig] = useState(getServerConfig());
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const serverConfig = getServerConfig();
        setConfig(serverConfig);

        if (serverConfig.isAutoDetect && typeof window !== 'undefined') {
            setCurrentUrl(`http://${window.location.host}/api/firmware/latest.bin`);
        } else {
            setCurrentUrl(getFirmwareUrl());
        }
    }, []);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <Card elevation={2}>
            <CardHeader
                avatar={
                    <Paper elevation={3} sx={{ p: 1, backgroundColor: 'warning.main', color: 'white' }}>
                        <Settings />
                    </Paper>
                }
                title={
                    <Typography variant="h6" fontWeight="bold">
                        Server Config
                    </Typography>
                }
                subheader="Network settings"
            />
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Network Settings */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            border: '1px solid rgba(25, 118, 210, 0.2)'
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary.dark" gutterBottom>
                                    Host
                                </Typography>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        backgroundColor: 'white',
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {config.host}
                                </Paper>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary.dark" gutterBottom>
                                    Port
                                </Typography>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        backgroundColor: 'white',
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {config.port}
                                </Paper>
                            </Box>
                        </Box>
                    </Paper>

                    {/* OTA URL */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                            border: '1px solid rgba(46, 125, 50, 0.2)'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                                OTA Endpoint
                            </Typography>
                            <Button
                                variant={copied ? "outlined" : "contained"}
                                size="small"
                                color={copied ? "success" : "primary"}
                                startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                                onClick={copyToClipboard}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </Box>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                backgroundColor: '#1a1a1a',
                                color: '#4ade80',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                overflowX: 'auto',
                                borderRadius: 1
                            }}
                        >
                            {currentUrl}
                        </Paper>
                        {config.isAutoDetect && (
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    icon={<NetworkCheck />}
                                    label="Auto-detecting hostname"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </Paper>
                </Box>
            </CardContent>
        </Card>
    );
} 
