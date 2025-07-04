interface BunnyUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface BunnyConfig {
  storageZone: string;
  accessKey: string;
  hostname: string;
  cdnUrl: string;
}

const bunnyConfig: BunnyConfig = {
  storageZone: 'innpanel',
  accessKey: '94b51440-98fd-4f2e-9c68e9c47e6a-3c0f-451b',
  hostname: 'storage.bunnycdn.com',
  cdnUrl: 'https://innpanel.b-cdn.net'
};

export class BunnyStorage {
  private config: BunnyConfig;

  constructor() {
    this.config = bunnyConfig;
  }

  /**
   * Upload a file to Bunny.net storage
   */
  async uploadFile(file: File, folder: string): Promise<BunnyUploadResponse> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Upload to Bunny.net
      const response = await fetch(`https://${this.config.hostname}/${this.config.storageZone}/${filePath}`, {
        method: 'PUT',
        headers: {
          'AccessKey': this.config.accessKey,
          'Content-Type': file.type,
        },
        body: arrayBuffer,
      });

      if (response.ok) {
        const cdnUrl = `${this.config.cdnUrl}/${filePath}`;
        return {
          success: true,
          url: cdnUrl,
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `Upload failed: ${response.status} - ${errorText}`,
        };
      }
    } catch (error) {
      console.error('Bunny.net upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload a file from base64 data
   */
  async uploadFromBase64(base64Data: string, fileName: string, folder: string): Promise<BunnyUploadResponse> {
    try {
      // Remove data URL prefix if present
      const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to binary
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      // Upload to Bunny.net
      const response = await fetch(`https://${this.config.hostname}/${this.config.storageZone}/${filePath}`, {
        method: 'PUT',
        headers: {
          'AccessKey': this.config.accessKey,
          'Content-Type': 'image/jpeg',
        },
        body: bytes,
      });

      if (response.ok) {
        const cdnUrl = `${this.config.cdnUrl}/${filePath}`;
        return {
          success: true,
          url: cdnUrl,
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `Upload failed: ${response.status} - ${errorText}`,
        };
      }
    } catch (error) {
      console.error('Bunny.net base64 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Delete a file from Bunny.net storage
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract file path from CDN URL
      const filePath = fileUrl.replace(`${this.config.cdnUrl}/`, '');

      const response = await fetch(`https://${this.config.hostname}/${this.config.storageZone}/${filePath}`, {
        method: 'DELETE',
        headers: {
          'AccessKey': this.config.accessKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Bunny.net delete error:', error);
      return false;
    }
  }

  /**
   * Get the CDN URL for a file path
   */
  getCdnUrl(filePath: string): string {
    return `${this.config.cdnUrl}/${filePath}`;
  }

  /**
   * Extract file path from CDN URL
   */
  getFilePathFromUrl(url: string): string {
    return url.replace(`${this.config.cdnUrl}/`, '');
  }
}

// Export singleton instance
export const bunnyStorage = new BunnyStorage();

// Helper functions for different folders
export const uploadServiceImage = (file: File) => bunnyStorage.uploadFile(file, 'hizmetler');
export const uploadLocationImage = (file: File) => bunnyStorage.uploadFile(file, 'hizmetnoktalari');
export const uploadProfileImage = (file: File) => bunnyStorage.uploadFile(file, 'profile');
export const uploadVehicleImage = (file: File) => bunnyStorage.uploadFile(file, 'arac');

export const uploadServiceImageFromBase64 = (base64: string, fileName: string) => 
  bunnyStorage.uploadFromBase64(base64, fileName, 'hizmetler');
export const uploadLocationImageFromBase64 = (base64: string, fileName: string) => 
  bunnyStorage.uploadFromBase64(base64, fileName, 'hizmetnoktalari');
export const uploadProfileImageFromBase64 = (base64: string, fileName: string) => 
  bunnyStorage.uploadFromBase64(base64, fileName, 'profile');
export const uploadVehicleImageFromBase64 = (base64: string, fileName: string) => 
  bunnyStorage.uploadFromBase64(base64, fileName, 'arac');