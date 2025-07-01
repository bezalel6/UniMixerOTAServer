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
    Grid,
    Chip,
    Skeleton
} from "@mui/material";
import {
    Analytics,
    Refresh,
    Folder,
    Download,
    Schedule,
    Memory,
    Storage,
    Circle
} from "@mui/icons-material";

interface Stats {
    totalFirmwareFiles: number;
    totalDownloads: number;
    lastUpdate: string | null;
    lastDownload: string | null;
    serverUptime: string;
    diskSpace: {
        used: string;
        available: string;
    };
}

export default function OTAStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Card elevation={2}>
                <CardHeader
                    avatar={
                        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'secondary.main', color: 'white' }}>
                            <Analytics />
                        </Paper>
                    }
                    title={
                        <Typography variant="h6" fontWeight="bold">
                            Server Analytics
                        </Typography>
                    }
                    subheader="Real-time metrics"
                />
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Skeleton variant="rectangular" height={80} sx={{ flex: 1, borderRadius: 2 }} />
                            <Skeleton variant="rectangular" height={80} sx={{ flex: 1, borderRadius: 2 }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Skeleton variant="text" width="75%" />
                            <Skeleton variant="text" width="50%" />
                            <Skeleton variant="text" width="85%" />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={2}>
            <CardHeader
                avatar={
                    <Paper elevation={3} sx={{ p: 1, backgroundColor: 'secondary.main', color: 'white' }}>
                        <Analytics />
                    </Paper>
                }
                title={
                    <Typography variant="h6" fontWeight="bold">
                        Server Analytics
                    </Typography>
                }
                subheader="Real-time metrics"
                action={
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Refresh />}
                        onClick={fetchStats}
                    >
                        Refresh
                    </Button>
                }
            />
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Key Metrics Cards */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper
                            elevation={1}
                            sx={{
                                flex: 1,
                                p: 2,
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                border: '1px solid rgba(25, 118, 210, 0.2)'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 1,
                                        backgroundColor: 'primary.100',
                                        borderRadius: 1
                                    }}
                                >
                                    <Folder color="primary" fontSize="small" />
                                </Paper>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" color="primary">
                                        {stats?.totalFirmwareFiles || 0}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="primary.dark">
                                        Files
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        <Paper
                            elevation={1}
                            sx={{
                                flex: 1,
                                p: 2,
                                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                border: '1px solid rgba(46, 125, 50, 0.2)'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 1,
                                        backgroundColor: 'success.100',
                                        borderRadius: 1
                                    }}
                                >
                                    <Download color="success" fontSize="small" />
                                </Paper>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" color="success.main">
                                        {stats?.totalDownloads || 0}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="success.dark">
                                        Downloads
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Detailed Statistics */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Analytics fontSize="small" color="action" />
                            Details
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Schedule fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Last Update
                                    </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="medium">
                                    {stats?.lastUpdate
                                        ? new Date(stats.lastUpdate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Never'
                                    }
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Download fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Last Download
                                    </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="medium">
                                    {stats?.lastDownload
                                        ? new Date(stats.lastDownload).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Never'
                                    }
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Memory fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Uptime
                                    </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="medium">
                                    {stats?.serverUptime || 'Unknown'}
                                </Typography>
                            </Box>

                            {stats?.diskSpace && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Storage fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                Used
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {stats.diskSpace.used}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Storage fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                Available
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {stats.diskSpace.available}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>

                    {/* Server Status */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                            border: '1px solid rgba(46, 125, 50, 0.2)'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Circle
                                    sx={{
                                        fontSize: 12,
                                        color: 'success.main',
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                                <Typography variant="body2" fontWeight="bold" color="success.dark">
                                    Server Online
                                </Typography>
                            </Box>
                            <Chip
                                label="Auto-refresh: 30s"
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                        </Box>
                    </Paper>
                </Box>
            </CardContent>
        </Card>
    );
} 
