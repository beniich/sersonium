import { google } from "googleapis";
import { Readable } from "stream";

export class StorageService {
  private drive: any;

  /**
   * Initialise le client Google Drive avec le token d'accès OAuth2 de l'utilisateur
   * @param accessToken Le token OAuth2 récupéré via auth.service.ts / Firebase Google OAuth
   */
  private async initClient(accessToken: string): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: "v3", auth });
  }

  /**
   * 1. Assure l'existence du dossier SENSORIUM_VAULT sur le Drive de l'utilisateur
   * Cherche le dossier, le crée s'il n'existe pas, et retourne son ID Google Drive
   */
  async ensureVaultFolder(accessToken: string): Promise<string> {
    await this.initClient(accessToken);

    // Cherche un dossier nommé SENSORIUM_VAULT
    const response = await this.drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and name = 'SENSORIUM_VAULT' and trashed = false",
      fields: "files(id, name)",
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      return files[0].id; // Le dossier existe déjà
    }

    // Sinon, création du dossier dans le Drive de l'utilisateur
    const fileMetadata = {
      name: "SENSORIUM_VAULT",
      mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });

    return folder.data.id;
  }

  /**
   * 2. Upload d'un fichier vers le dossier SENSORIUM_VAULT du Drive de l'utilisateur
   * @param accessToken Token OAuth2 de l'utilisateur
   * @param fileName Nom du fichier (ex: maquette_batiment_A.ifc, rapport_esg.pdf)
   * @param fileBuffer Buffer contenant le fichier physique
   * @param mimeType Type MIME (ex: application/octet-stream, application/pdf)
   */
  async uploadFile(
    accessToken: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string = "application/octet-stream"
  ): Promise<{ fileId: string; url: string }> {
    await this.initClient(accessToken);
    const folderId = await this.ensureVaultFolder(accessToken);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(fileBuffer),
    };

    try {
      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
      });

      return {
        fileId: file.data.id,
        url: file.data.webViewLink || file.data.webContentLink,
      };
    } catch (error: any) {
      console.error("[StorageService - Google Drive Vault Error]:", error?.message || error);
      throw new Error(`Failed to upload file to user Google Drive: ${error?.message || "Unknown error"}`);
    }
  }

  /**
   * 3. Récupération d'un lien de consultation webViewLink
   */
  async getFileUrl(accessToken: string, fileId: string): Promise<string> {
    await this.initClient(accessToken);
    const result = await this.drive.files.get({
      fileId: fileId,
      fields: "id, name, webViewLink, webContentLink",
    });
    return result.data.webViewLink || result.data.webContentLink;
  }

  /**
   * 4. Suppression du fichier sur le Drive de l'utilisateur
   */
  async deleteFile(accessToken: string, fileId: string): Promise<void> {
    await this.initClient(accessToken);
    await this.drive.files.delete({ fileId });
  }
}

export const storageService = new StorageService();
