import "server-only";
import { load } from "cheerio";
import type { RecipeCard } from "./chat-types";
const BASE = "https://www.kotikokki.net";
export const TARJA_PROFILE = `${BASE}/kayttajat/tarja2/`;
const classics = ["29526/Pizza./", "60834/vadelmarahka/", "348693/Tarjan%20appelsiinikakku%20helppo./", "172952/Salaatti6./", "19094/NEKUT/", "23535/mansikkariisi/"];
function safeUrl(value: string | undefined, image = false) {
    if (!value) return undefined;
    try { const url = new URL(value, BASE); return url.origin === BASE && (image ? url.pathname.startsWith("/media/cache/") && url.pathname.includes("recipeimage") : /^\/reseptit\/nayta\/\d+\//.test(url.pathname)) ? url.href : undefined; } catch { return undefined; }
}
async function page(url: string) {
    const response = await fetch(url, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(8000), redirect: "error" });
    if (!response.ok) throw new Error("Recipe source unavailable");
    const html = await response.text();
    if (html.length > 2000000) throw new Error("Recipe source too large");
    return load(html);
}
export async function getTarjaRecipes(): Promise<RecipeCard[]> {
    const cards = new Map<string, RecipeCard>();
    try {
        const $ = await page(TARJA_PROFILE);
        $(".recipe-grid-item").each((_, element) => {
            const item = $(element), url = safeUrl(item.find("a").first().attr("href"));
            const title = item.find(".recipe-grid-item__title").text().trim().slice(0, 140);
            if (url && title) cards.set(url, { id: new URL(url).pathname.split("/")[3], title, url, image: safeUrl(item.find("img").attr("src"), true) });
        });
    } catch { /* Classic pages can still supply verified recommendations. */ }
    await Promise.all(classics.map(async path => {
        const url = `${BASE}/reseptit/nayta/${path}`;
        try {
            const $ = await page(url);
            const author = $("a[href]").toArray().some(element => {
                const href = $(element).attr("href")?.replace(/\/$/, "");
                return href === "/kayttajat/tarja2" || href === TARJA_PROFILE.slice(0, -1);
            });
            const title = $("h1").first().text().trim().slice(0, 140);
            if (author && title) cards.set(url, { id: path.split("/")[0], title, url, image: safeUrl($('meta[property="og:image"]').attr("content"), true) });
        } catch { /* Never invent recipes or photos when a source fails. */ }
    }));
    return [...cards.values()].slice(0, 20);
}
export async function withRecipeIngredients(recipe: RecipeCard): Promise<RecipeCard> {
    const url = safeUrl(recipe.url);
    if (!url) return recipe;
    try {
        const $ = await page(url);
        const ingredients = $(".recipe-ingredients tr[data-view-element='ingredient']").toArray().map(element => {
            const row = $(element);
            return ["amount", "unit", "name"].map(field => row.find(`[data-view-element='${field}']`).text().trim()).filter(Boolean).join(" ");
        }).filter(Boolean).slice(0, 40);
        return { ...recipe, ingredients };
    } catch { return recipe; }
}
