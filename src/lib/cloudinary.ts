import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  // não lançar erro na importação pra não quebrar build sem env (mas as rotas vão validar)
} else {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

export function assertCloudinaryEnv() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY_CLOUD_NAME ausente");
  if (!process.env.CLOUDINARY_API_KEY) throw new Error("CLOUDINARY_API_KEY ausente");
  if (!process.env.CLOUDINARY_API_SECRET) throw new Error("CLOUDINARY_API_SECRET ausente");
}

export { cloudinary };
