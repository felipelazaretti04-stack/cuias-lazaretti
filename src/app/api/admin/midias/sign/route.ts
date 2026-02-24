import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { assertCloudinaryEnv, cloudinary } from "@/lib/cloudinary";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    assertCloudinaryEnv();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "cuias-lazaretti";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Falha ao assinar upload" }, { status: 500 });
  }
}
