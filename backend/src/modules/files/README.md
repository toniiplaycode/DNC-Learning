# Files Module

This module provides functionality for uploading files to Google Drive.

## Setup Instructions

### 1. Create a Google Drive API Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable the "Google Drive API"
5. Go to "APIs & Services" > "Credentials"
6. Click "Create credentials" > "Service account"
7. Fill in the details for your service account
8. Grant the service account appropriate permissions (at least Editor role)
9. Create a key for the service account (JSON format)
10. Download the JSON key file

### 2. Set Up Google Drive Folder

1. Create a folder in Google Drive where the files will be uploaded
2. Share this folder with the service account email (it should end with `@*.gserviceaccount.com`)
3. Get the folder ID (it's the last part of the URL when you're in the folder)

### 3. Configure Environment Variables

Add the following environment variables to your `.env` file:

```
# Google Drive API Configuration
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

Alternatively, you can place the service account JSON file in the root of your project and name it `service-account.json`.

## Usage

To upload a file to Google Drive, use the `/api/files/upload` endpoint:

```typescript
// Example frontend code using Axios
import axios from 'axios';

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${yourAuthToken}`,
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });

  return response.data;
}
```

The response will include:

- `success`: Boolean indicating if the upload was successful
- `fileUrl`: Direct URL to the file (for embedding/viewing)
- `fileName`: Original file name
- `fileId`: Google Drive file ID
- `viewUrl`: URL to view the file in Google Drive
- `downloadUrl`: URL to download the file
