# UniMixer OTA Server

A Next.js-based Over-The-Air (OTA) firmware update server for UniMixer ESP32 devices.

## Features

- 🚀 **Easy Firmware Upload**: Web-based interface for uploading .bin firmware files
- 📱 **Responsive Dashboard**: Modern, mobile-friendly UI built with Next.js and Tailwind CSS
- 🔄 **Automatic Latest Firmware**: Always serves the most recent firmware at `/api/firmware/latest.bin`
- 📊 **Real-time Statistics**: Server uptime, file counts, and storage usage
- 🗂️ **File Management**: List, download, and delete firmware files through the web interface
- 🔒 **ESP32 Optimized**: Proper HTTP headers and binary file serving for ESP32 OTA updates
- ⚡ **High Performance**: Built on Next.js with TypeScript for reliability and speed

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The server will be available at [http://localhost:3000](http://localhost:3000)

### 3. Production Build
```bash
npm run build
npm start
```

## ESP32 Integration

### Update Your ESP32 Code

1. Edit `include/OTAConfig.h` in your UniMixer project:
```cpp
#define OTA_SERVER_URL "http://YOUR_SERVER_IP:3000/api/firmware/latest.bin"
```

2. Replace `YOUR_SERVER_IP` with your server's IP address or domain name.

### How OTA Works

1. **Upload Firmware**: Use the web interface to upload a `.bin` firmware file
2. **Automatic Latest**: The server automatically makes the newest firmware available at `/api/firmware/latest.bin`
3. **ESP32 Download**: Your ESP32 device downloads from this URL when OTA is triggered
4. **Installation**: ESP32 handles the firmware installation and reboot

## API Endpoints

### Upload Firmware
```
POST /api/upload
Content-Type: multipart/form-data
Body: firmware file (.bin)
```

### Download Latest Firmware (ESP32)
```
GET /api/firmware/latest.bin
Response: Binary firmware file
```

### Download Specific Firmware
```
GET /api/firmware/[filename]
Response: Binary firmware file
```

### List All Firmware Files
```
GET /api/firmware/list
Response: JSON array of firmware files with metadata
```

### Delete Firmware File
```
DELETE /api/firmware/[filename]
Response: Success/error message
```

### Server Statistics
```
GET /api/stats
Response: JSON object with server stats
```

## File Structure

```
server/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── firmware/
│   │   │   │   ├── [filename]/route.ts    # Download/delete specific files
│   │   │   │   └── list/route.ts          # List all firmware files
│   │   │   ├── upload/route.ts            # Upload endpoint
│   │   │   └── stats/route.ts             # Server statistics
│   │   ├── globals.css                    # Global styles
│   │   ├── layout.tsx                     # Root layout
│   │   └── page.tsx                       # Main dashboard page
│   └── components/
│       ├── FirmwareUpload.tsx             # Upload component
│       ├── FirmwareList.tsx               # File list component
│       └── OTAStats.tsx                   # Statistics component
├── public/
│   └── firmware/                          # Uploaded firmware files stored here
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Configuration

### Environment Variables

Create a `.env.local` file in the server directory for custom configuration:

```env
# Server port (default: 3000)
PORT=3000

# Maximum file upload size (default: 50MB)
MAX_UPLOAD_SIZE=52428800
```

### Security Considerations

- **Network Security**: Run behind a reverse proxy (nginx) with HTTPS in production
- **Access Control**: Consider adding authentication for the web interface
- **File Validation**: Only `.bin` files are accepted, with size limits
- **IP Restrictions**: Consider restricting access to your local network

## Deployment

### Docker (Recommended)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t unimixer-ota-server .
docker run -p 3000:3000 -v ./firmware:/app/public/firmware unimixer-ota-server
```

### Traditional Server

1. Install Node.js 18+ on your server
2. Copy the project files
3. Run `npm ci --only=production`
4. Run `npm run build`
5. Start with `npm start` or use PM2 for process management

## Troubleshooting

### ESP32 Cannot Connect

1. **Check Network**: Ensure ESP32 and server are on the same network
2. **Verify URL**: Confirm the server URL in `OTAConfig.h` is correct
3. **Check Firewall**: Ensure port 3000 is accessible
4. **WiFi Credentials**: Verify WiFi credentials in ESP32 code match your network

### Upload Fails

1. **File Size**: Ensure firmware file is under 50MB
2. **File Format**: Only `.bin` files are accepted
3. **Disk Space**: Check available disk space on server
4. **Permissions**: Ensure server has write permissions to `public/firmware/` directory

### Server Errors

1. **Check Logs**: View server console for detailed error messages
2. **Port Conflicts**: Ensure port 3000 is not used by another application
3. **Node Version**: Requires Node.js 18 or higher

## Version Control

### Gitignore Configuration

The server includes a comprehensive `.gitignore` that excludes:
- **Node modules** and build artifacts
- **Environment files** (`.env.local`, etc.)
- **Uploaded firmware files** (`.bin`, `.hex`, `.elf`)
- **IDE and OS specific files**

### Firmware File Management

- **Firmware files are ignored** by git to prevent large binary files in the repository
- **Directory structure is preserved** with `.gitkeep` files
- **Environment configuration** (`.env.local`) is ignored for security

### Important Notes

1. **Back up firmware files separately** - they're not version controlled
2. **Environment files are ignored** - copy `.env.local` manually to new deployments
3. **Lock files are tracked** - ensures consistent dependencies across environments

## Development

### Adding Features

1. **Authentication**: Add user authentication to secure uploads
2. **Version Management**: Implement semantic versioning for firmware
3. **Download Tracking**: Add database to track download statistics
4. **Notifications**: Add webhook notifications for successful uploads
5. **Backup**: Automatic backup of firmware files to cloud storage

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Workflow

```bash
# Clone and setup
git clone <repository>
cd server
npm install

# Copy environment template
cp .env.local.example .env.local  # Edit with your settings

# Start development
npm run dev
```

## License

This project is part of the UniMixer ESP32 client system. See the main project license for details.

## Support

For issues and questions, please refer to the main UniMixer project documentation or create an issue in the project repository. 
