import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppBar, Toolbar, Typography, Box, Chip, Container } from '@mui/material';
import { Memory, FlashAuto } from '@mui/icons-material';
import CustomThemeProvider from '@/components/ThemeProvider';

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
                <CustomThemeProvider>
                    <Box className="app-background">
                        <AppBar position="static" elevation={2}>
                            <Toolbar>
                                <FlashAuto sx={{ mr: 2 }} />
                                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                    UniMixer OTA Server
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip
                                        icon={<Memory />}
                                        label="ESP32 Ready"
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        label="Server Online"
                                        color="success"
                                        size="small"
                                    />
                                </Box>
                            </Toolbar>
                        </AppBar>
                        <Container maxWidth="xl" sx={{ py: 4 }}>
                            {children}
                        </Container>
                        <Box component="footer" sx={{
                            mt: 'auto',
                            py: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderTop: '1px solid rgba(0,0,0,0.12)'
                        }}>
                            <Container maxWidth="xl">
                                <Typography variant="body2" color="text.secondary" align="center">
                                    © 2024 UniMixer OTA Server • ESP32 Firmware Management • Version 1.0.0
                                </Typography>
                            </Container>
                        </Box>
                    </Box>
                </CustomThemeProvider>
            </body>
        </html>
    );
} 
