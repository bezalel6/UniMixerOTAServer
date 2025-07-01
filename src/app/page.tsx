"use client";

import { useState, useEffect } from "react";
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

    return (
        <div className="px-4 py-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    OTA Firmware Management
                </h2>
                <p className="text-gray-600">
                    Upload and manage firmware files for your UniMixer ESP32 devices
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Upload and Stats */}
                <div className="space-y-6">
                    <FirmwareUpload onUploadSuccess={refreshFirmwareList} />
                    <ServerConfig />
                    <OTAStats />
                </div>

                {/* Right Column - Firmware List */}
                <div>
                    <FirmwareList refreshKey={refreshKey} />
                </div>
            </div>

            <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ESP32 Integration Instructions
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                        <strong>Server URL:</strong> Update your ESP32 code to use this server:
                    </p>
                    <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm font-mono">
                        {serverUrl || getFirmwareUrl()}
                    </code>
                    <p className="text-sm text-gray-600 mt-3">
                        Replace the <code className="bg-gray-200 px-1 rounded">OTA_SERVER_URL</code> in your
                        <code className="bg-gray-200 px-1 rounded"> include/OTAConfig.h</code> file with the URL above.
                    </p>
                </div>
            </div>
        </div>
    );
} 
