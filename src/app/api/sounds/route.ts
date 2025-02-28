import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const soundsDirectory = path.join(process.cwd(), "public", "sounds");
    const files = fs.readdirSync(soundsDirectory);

    // Filter for audio and video files
    const mediaFiles = files
      .filter((file) => /\.(wav|mp3|mp4)$/i.test(file))
      .map((filename) => {
        let icon = "fa-volume-high";
        let category = "wav";

        if (filename.endsWith(".mp3")) {
          icon = "fa-music";
          category = "mp3";
        } else if (filename.endsWith(".mp4")) {
          icon = "fa-video";
          category = "mp4";
        }

        const friendlyName = filename
          .replace(/\.(wav|mp3|mp4)$/i, "")
          .replace(/-/g, " ");

        return {
          name: friendlyName,
          displayName:
            friendlyName.length > 18
              ? friendlyName.substring(0, 18) + "..."
              : friendlyName,
          file: filename,
          filePath: `/sounds/${filename}`,
          category,
          icon,
        };
      });

    return NextResponse.json({ sounds: mediaFiles });
  } catch (error) {
    console.error("Error reading sounds directory:", error);
    return NextResponse.json(
      { error: "Failed to read sounds directory" },
      { status: 500 }
    );
  }
}
