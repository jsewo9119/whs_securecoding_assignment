import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_PRODUCT_IMAGE_SIZE = 2 * 1024 * 1024;
const PRODUCT_IMAGE_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products",
);

const MIME_TO_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
} as const;

type AllowedProductImageMime = keyof typeof MIME_TO_EXTENSION;

export class ProductImageUploadError extends Error {}

function isAllowedMimeType(type: string): type is AllowedProductImageMime {
  return type === "image/png" || type === "image/jpeg";
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isJpeg(bytes: Uint8Array) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

function assertValidProductImage(file: File, bytes: Uint8Array) {
  if (!isAllowedMimeType(file.type)) {
    throw new ProductImageUploadError(
      "상품 이미지는 png, jpg, jpeg 파일만 업로드할 수 있습니다.",
    );
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new ProductImageUploadError(
      "상품 이미지는 2MB 이하만 업로드할 수 있습니다.",
    );
  }

  const hasValidSignature =
    file.type === "image/png" ? isPng(bytes) : isJpeg(bytes);

  if (!hasValidSignature) {
    throw new ProductImageUploadError(
      "파일 내용이 이미지 형식과 일치하지 않습니다.",
    );
  }
}

export async function saveProductImage(file: File | null) {
  if (!file || file.size === 0) {
    return undefined;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  assertValidProductImage(file, bytes);

  const extension = MIME_TO_EXTENSION[file.type as AllowedProductImageMime];
  const fileName = `${randomUUID()}.${extension}`;
  const uploadPath = path.join(PRODUCT_IMAGE_UPLOAD_DIR, fileName);

  await mkdir(PRODUCT_IMAGE_UPLOAD_DIR, { recursive: true });
  await writeFile(uploadPath, bytes);

  return `/uploads/products/${fileName}`;
}
