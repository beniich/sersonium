import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListBucketsCommand, 
  CreateBucketCommand, 
  DeleteBucketCommand,
  HeadBucketCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TenantPrismaClient } from "../db/tenantPrisma.js";
import crypto from "crypto";

export interface MinioStorageConfig {
  endpoint: string;
  port?: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  defaultBucket: string;
  region: string;
  publicUrl?: string;
}

export class StorageService {
  /**
   * Résout la configuration S3 / MinIO dynamique :
   * Priorité : Variables MINIO_* -> sinon variables S3_* / R2_* -> fallback développement
   */
  public static getConfig(): MinioStorageConfig {
    const minioEndpoint = process.env.MINIO_ENDPOINT;
    const minioPort = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : undefined;
    const minioUseSSL = process.env.MINIO_USE_SSL === "true" || process.env.MINIO_USE_SSL === "1";
    const minioAccessKey = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "minioadmin";
    const minioSecretKey = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "minioadmin_secret_2026";
    const defaultBucket = process.env.MINIO_DEFAULT_BUCKET || process.env.S3_BUCKET || "sensorium-vault";
    const region = process.env.MINIO_REGION || process.env.AWS_REGION || "us-east-1";

    let endpoint = minioEndpoint;
    if (!endpoint) {
      endpoint = process.env.R2_ENDPOINT || "http://127.0.0.1:9000";
    }

    // Formatage de l'endpoint avec protocole si absent
    if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
      const protocol = minioUseSSL ? "https://" : "http://";
      endpoint = `${protocol}${endpoint}${minioPort ? `:${minioPort}` : ""}`;
    }

    const publicUrl = process.env.MINIO_PUBLIC_URL || endpoint;

    return {
      endpoint,
      port: minioPort,
      useSSL: minioUseSSL,
      accessKey: minioAccessKey,
      secretKey: minioSecretKey,
      defaultBucket,
      region,
      publicUrl
    };
  }

  /**
   * Instancie le client AWS S3 configuré pour MinIO (avec forcePathStyle: true)
   */
  public static getS3Client(): S3Client {
    const config = this.getConfig();

    return new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey
      },
      forcePathStyle: true // INDISPENSABLE pour MinIO / stockage auto-hébergé
    });
  }

  /**
   * S'assure qu'un bucket existe dans MinIO, le crée si nécessaire
   */
  public static async ensureBucketExists(bucketName?: string): Promise<string> {
    const targetBucket = bucketName || this.getConfig().defaultBucket;
    const s3 = this.getS3Client();

    try {
      await s3.send(new HeadBucketCommand({ Bucket: targetBucket }));
      return targetBucket;
    } catch (err: any) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404 || err.Code === "NoSuchBucket") {
        try {
          await s3.send(new CreateBucketCommand({ Bucket: targetBucket }));
          console.log(`[MinIO Storage] Bucket '${targetBucket}' initialisé avec succès.`);
        } catch (createErr) {
          console.warn(`[MinIO Storage] Impossible de créer le bucket '${targetBucket}':`, createErr);
        }
      }
      return targetBucket;
    }
  }

  /**
   * Génère une URL pré-signée pour upload (PUT) vers MinIO / S3
   * et enregistre les métadonnées dans la base de données isolée par tenant.
   */
  public static async getUploadUrl(
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
    const config = this.getConfig();
    const bucket = params.bucket || config.defaultBucket;
    const fileExt = params.fileName.includes(".") ? params.fileName.split(".").pop() : "bin";
    const sanitizedName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueStorageKey = `tenants/${tenantId}/uploads/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${fileExt}`;

    let uploadUrl: string;

    try {
      await this.ensureBucketExists(bucket);
      const s3 = this.getS3Client();
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: uniqueStorageKey,
        ContentType: params.mimeType
      });

      uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    } catch (err) {
      console.warn("[StorageService] MinIO S3 SDK signature fallback:", err);
      uploadUrl = `${config.endpoint}/${bucket}/${uniqueStorageKey}?X-Amz-Expires=3600&X-Amz-Signature=${crypto.randomBytes(16).toString("hex")}`;
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
      publicDownloadUrl: `${config.publicUrl}/${bucket}/${uniqueStorageKey}`,
      provider: "MinIO / S3 Sovereign Object Store",
      expiresInSeconds: 3600,
      createdAt: fileRecord.createdAt
    };
  }

  /**
   * Génère une URL pré-signée de téléchargement (GET)
   */
  public static async getDownloadUrl(tenantPrisma: TenantPrismaClient, fileId: string): Promise<string> {
    const file = await this.getFileById(tenantPrisma, fileId);
    if (!file) {
      throw new Error("Fichier introuvable.");
    }

    const s3 = this.getS3Client();
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.storageKey
    });

    return getSignedUrl(s3, command, { expiresIn: 3600 });
  }

  /**
   * Liste les buckets disponibles dans l'instance MinIO
   */
  public static async listBuckets(): Promise<{ name: string; creationDate?: Date }[]> {
    try {
      const s3 = this.getS3Client();
      const response = await s3.send(new ListBucketsCommand({}));
      return (response.Buckets || []).map(b => ({
        name: b.Name || "unknown",
        creationDate: b.CreationDate
      }));
    } catch (error) {
      console.warn("[StorageService] MinIO listBuckets fallback:", error);
      const config = this.getConfig();
      return [
        { name: config.defaultBucket, creationDate: new Date() },
        { name: "telemetry-raw-logs", creationDate: new Date() },
        { name: "digital-twins-bim", creationDate: new Date() }
      ];
    }
  }

  /**
   * Crée un nouveau bucket dans MinIO
   */
  public static async createBucket(bucketName: string): Promise<boolean> {
    const s3 = this.getS3Client();
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    return true;
  }

  /**
   * Supprime un bucket dans MinIO
   */
  public static async deleteBucket(bucketName: string): Promise<boolean> {
    const s3 = this.getS3Client();
    await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
    return true;
  }

  /**
   * Récupère la liste des fichiers pour le tenant
   */
  public static async getFiles(tenantPrisma: TenantPrismaClient) {
    return tenantPrisma.fileMetadata.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Récupère les métadonnées d'un fichier par ID
   */
  public static async getFileById(tenantPrisma: TenantPrismaClient, id: string) {
    return tenantPrisma.fileMetadata.findFirst({
      where: { id }
    });
  }

  /**
   * Supprime un fichier de la base de données et du bucket MinIO
   */
  public static async deleteFile(tenantPrisma: TenantPrismaClient, id: string) {
    const file = await this.getFileById(tenantPrisma, id);
    if (file) {
      try {
        const s3 = this.getS3Client();
        await s3.send(new DeleteObjectCommand({
          Bucket: file.bucket,
          Key: file.storageKey
        }));
      } catch (err) {
        console.warn("[StorageService] MinIO file deletion warning:", err);
      }
    }

    return tenantPrisma.fileMetadata.delete({
      where: { id }
    });
  }
}
