import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function GET() {
  try {
    const files = await utapi.listFiles();
    
    // Transform the response to match our MediaFile interface
    const transformedFiles = files.files.map((file) => ({
      id: file.id,
      key: file.key,
      name: file.name,
      url: `https://utfs.io/f/${file.key}`,
      size: file.size,
      //@ts-expect-error - file.type is not defined in the UploadThingResponse type
      type: file.type || "application/octet-stream",
      uploadedAt: file.uploadedAt,
    }));

    return Response.json(transformedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return Response.json({ error: "Failed to fetch files" }, { status: 500 });
  }
} 