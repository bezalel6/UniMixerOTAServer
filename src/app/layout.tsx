import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "UniMixer OTA Server",
    description: "Firmware update server for UniMixer ESP32 devices",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <nav className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex items-center">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        UniMixer OTA Server
                                    </h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">
                                        ESP32 Firmware Management
                                    </span>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
} 
