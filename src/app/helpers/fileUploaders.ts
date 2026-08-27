import multer from "multer";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { ICloudinaryRes, IFile } from "../interface/file";
import { env } from "../config/env";

cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
});

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // raw upload hard cap: 20MB
});

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Buffer 5MB-এর বেশি হলে resize + quality কমিয়ে compress করে,
 * ছোট থাকলে original buffer-ই ফেরত দেয়।
 */
const compressIfNeeded = async (buffer: Buffer): Promise<Buffer> => {
    if (buffer.length <= MAX_SIZE_BYTES) {
        return buffer;
    }

    let quality = 80;
    let output = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();

    while (output.length > MAX_SIZE_BYTES && quality > 20) {
        quality -= 15;
        output = await sharp(buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .jpeg({ quality })
            .toBuffer();
    }

    return output;
};

const uploadToCloudinary = (file: IFile): Promise<ICloudinaryRes> => {
    return new Promise((resolve, reject) => {
        compressIfNeeded(file.buffer)
            .then((finalBuffer) => {
                cloudinary.uploader
                    .upload_stream((error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        if (result) {
                            resolve(result as unknown as ICloudinaryRes);
                        } else {
                            reject(new Error("Cloudinary upload failed."));
                        }
                    })
                    .end(finalBuffer);
            })
            .catch(reject);
    });
};

const deleteFromCloudinary = async (publicIds: string[]): Promise<void> => {
    if (publicIds.length === 0) return;

    await cloudinary.api.delete_resources(publicIds);
};

export const fileUploader = {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary,
};
