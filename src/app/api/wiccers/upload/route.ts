import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { COOKIE, assertOrigin, failure } from "@/lib/wiccers-auth";
import { withCommunity, currentMember, limit, newId, CommunityError } from "@/lib/wiccers-store";

export const runtime = "nodejs";
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
    let uploadedUrl: string | undefined;
    try {
        assertOrigin(request);
        const permission = await withCommunity(state => {
            const user = currentMember(state, request.cookies.get(COOKIE)?.value);
            if (!user) throw new CommunityError("Sign in to upload an image.", 401);
            return { memberId: user.id, allowed: limit(state, `upload:${user.id}`, 10, 60000) };
        });
        if (!permission.allowed) return NextResponse.json({ error: "Please wait a minute before uploading again." }, { status: 429 });
        if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
            throw new CommunityError("Image storage is not configured.", 503);
        if (!/^image\/(jpeg|png|webp)$/.test(request.headers.get("content-type") ?? ""))
            throw new CommunityError("Choose a JPEG, PNG, or WebP image.", 415);
        if (Number(request.headers.get("content-length")) > MAX_BYTES)
            throw new CommunityError("Images must be 4 MB or smaller.", 413);
        const reader = request.body?.getReader();
        if (!reader) throw new CommunityError("Choose an image.");
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > MAX_BYTES) { await reader.cancel(); throw new CommunityError("Images must be 4 MB or smaller.", 413); }
            chunks.push(value);
        }
        let output;
        try {
            const image = sharp(Buffer.concat(chunks), { limitInputPixels: 20000000, animated: false });
            const metadata = await image.metadata();
            if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) throw new Error();
            output = await image.rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
        } catch { throw new CommunityError("This image cannot be read. Choose a still JPEG, PNG, or WebP image up to 20 megapixels."); }
        const id = newId();
        const blob = await put(`wiccers/${permission.memberId}/${id}.webp`, output.data, { access: "public", contentType: "image/webp", addRandomSuffix: true });
        uploadedUrl = blob.url;
        await withCommunity(state => {
            const user = currentMember(state, request.cookies.get(COOKIE)?.value);
            if (user?.id !== permission.memberId) throw new CommunityError("Sign in again before posting.", 401);
            (state.uploads ??= []).push({ id, url: blob.url, pathname: blob.pathname, width: output.info.width, height: output.info.height, alt: "", memberId: user.id, createdAt: Date.now(), used: false });
        });
        uploadedUrl = undefined;
        return NextResponse.json({ imageId: id }, { status: 201 });
    } catch (error) {
        if (uploadedUrl) await del(uploadedUrl).catch(() => undefined);
        return failure(error);
    }
}
