"use client";

import { useState, useEffect } from "react";
import { getServerConfig, getFirmwareUrl } from "@/lib/config";

export default function ServerConfig() {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [config, setConfig] = useState(getServerConfig());

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
            alert('URL copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
                🔧 Server Configuration
            </h4>

            <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-blue-700 font-medium">Host:</span>
                        <div className="text-blue-600">{config.host}</div>
                    </div>
                    <div>
                        <span className="text-blue-700 font-medium">Port:</span>
                        <div className="text-blue-600">{config.port}</div>
                    </div>
                </div>

                <div>
                    <span className="text-blue-700 font-medium">ESP32 OTA URL:</span>
                    <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 bg-white px-2 py-1 rounded text-xs font-mono border text-blue-800">
                            {currentUrl}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            title="Copy to clipboard"
                        >
                            📋
                        </button>
                    </div>
                </div>

                <div className="text-xs text-blue-600 pt-2 border-t border-blue-200">
                    <strong>Configuration:</strong> Update <code>NEXT_PUBLIC_SERVER_HOST</code> in <code>.env.local</code>
                    {config.isAutoDetect && <span> (currently auto-detecting hostname)</span>}
                </div>
            </div>
        </div>
    );
} 
