"use client";

import { useState, useEffect } from "react";

interface Stats {
    totalFirmwareFiles: number;
    totalDownloads: number;
    lastUpdate: string | null;
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
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Statistics</h3>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Statistics</h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">
                            {stats?.totalFirmwareFiles || 0}
                        </div>
                        <div className="text-sm text-blue-800">Firmware Files</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.totalDownloads || 0}
                        </div>
                        <div className="text-sm text-green-800">Total Downloads</div>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="font-medium">
                            {stats?.lastUpdate
                                ? new Date(stats.lastUpdate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'Never'
                            }
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Server Uptime:</span>
                        <span className="font-medium">{stats?.serverUptime || 'Unknown'}</span>
                    </div>

                    {stats?.diskSpace && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Storage Used:</span>
                                <span className="font-medium">{stats.diskSpace.used}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Available:</span>
                                <span className="font-medium">{stats.diskSpace.available}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Server Online</span>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 
