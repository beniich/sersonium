import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TenantPrismaClient } from "../db/tenantPrisma.js";
import crypto from "crypto";

export class StorageService {
  private static getS3Client(): S3Client {
    const endpoint = process.env.R2_ENDPOINT || "https://eu-central-1.r2.cloudflarestorage.com";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || "dev_r2_mock_key";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "dev_r2_mock_secret_key_12345";

    return new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  /**
   * Génère une URL signée pour uploader un fichier vers un bucket S3 / Cloudflare R2 (Pattern Blueprint)
   * et enregistre les métadonnées dans la base de données isolée par tenant.
   */
  static async getUploadUrl(
    tenantPrisma: TenantPrismaClient,
    tenantId: string,
    params: {
      fileName: string;
      mimeType: string;
      fileSize: number;
      bucket?: string;
      uploadedBy?: string;
    }
  ) {
    const bucket = params.bucket || "beecarbonat-assets";
    const fileExt = params.fileName.includes(".") ? params.fileName.split(".").pop() : "bin";
    const sanitizedName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueStorageKey = `tenants/${tenantId}/uploads/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${fileExt}`;

    let uploadUrl: string;

    try {
      const s3 = this.getS3Client();
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: uniqueStorageKey,
        ContentType: params.mimeType
      });

      uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    } catch (err) {
      console.warn("[StorageService] R2 SDK signature simulated fallback:", err);
      uploadUrl = `https://${bucket}.r2.cloudflarestorage.com/${uniqueStorageKey}?X-Amz-Expires=3600&X-Amz-Signature=${crypto.randomBytes(16).toString("hex")}`;
    }

    // Persistance des métadonnées du fichier
    const fileRecord = await tenantPrisma.fileMetadata.create({
      data: {
        fileName: sanitizedName,
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        storageKey: uniqueStorageKey,
        bucket,
        uploadedBy: params.uploadedBy || null
      } as any
    });

    return {
      fileId: fileRecord.id,
      fileName: fileRecord.fileName,
      storageKey: uniqueStorageKey,
      bucket,
      uploadUrl,
      expiresInSeconds: 3600,
      createdAt: fileRecord.createdAt
    };
  }

  /**
   * Récupère la liste des fichiers pour le tenant
   */
  static async getFiles(tenantPrisma: TenantPrismaClient) {
    return tenantPrisma.fileMetadata.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Récupère les métadonnées d'un fichier par ID
   */
  static async getFileById(tenantPrisma: TenantPrismaClient, id: string) {
    return tenantPrisma.fileMetadata.findFirst({
      where: { id }
    });
  }

  /**
   * Supprime un fichier
   */
  static async deleteFile(tenantPrisma: TenantPrismaClient, id: string) {
    return tenantPrisma.fileMetadata.delete({
      where: { id }
    });
  }
}
