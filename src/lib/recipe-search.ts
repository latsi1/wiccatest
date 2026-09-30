import type { RecipeCard } from "./chat-types";

type Turn = { role: "user" | "assistant"; content: string; recipeIds?: string[] };
const filters = [
    { pattern: /juustokak/iu, terms: ["juustokakku"], dish: true },
    { pattern: /pizza/iu, terms: ["pizza"], dish: true },
    { pattern: /piirak/iu, terms: ["piirakka"], dish: true },
    { pattern: /(?<!juusto)kak(?:ku|kua|un)/iu, terms: ["kakku"], dish: true },
    { pattern: /salaat/iu, terms: ["salaatti"], dish: true },
    { pattern: /keitto|keittoa/iu, terms: ["keitto"], dish: true },
    { pattern: /pasta/iu, terms: ["pasta"], dish: true },
    { pattern: /voileip/iu, terms: ["voileip"], dish: true },
    { pattern: /mokka/iu, terms: ["mokka"], dish: true },
    { pattern: /hillo/iu, terms: ["hillo"], dish: true },
    { pattern: /kurkk|kurku/iu, terms: ["kurkku", "kurkkua", "kurkun", "kurkut"], dish: false },
    { pattern: /mait[ou]|maid[oa]/iu, terms: ["maito", "maitoa", "maitoa", "maitoon", "maitua"], dish: false },
    { pattern: /mustik/iu, terms: ["mustik"], dish: false },
    { pattern: /mansik/iu, terms: ["mansik"], dish: false },
    { pattern: /vadelm/iu, terms: ["vadelm"], dish: false },
    { pattern: /omena|omppu|ompu/iu, terms: ["omena", "omppu", "ompu"], dish: false },
    { pattern: /appelsiin/iu, terms: ["appelsiin"], dish: false },
    { pattern: /suklaa/iu, terms: ["suklaa"], dish: false },
    { pattern: /loh[ie]|lohta/iu, terms: ["lohi", "lohta", "lohen"], dish: false },
    { pattern: /jauhelih/iu, terms: ["jauhelih"], dish: false },
    { pattern: /\bkanaa?\b/iu, terms: ["kana", "kanaa", "kananliha", "broileri"], dish: false },
    { pattern: /perun/iu, terms: ["perun"], dish: false },
    { pattern: /riis/iu, terms: ["riis"], dish: false },
    { pattern: /tee(?:n)?\s+res|res.*\btee\b|\bteetä\b/iu, terms: ["tee", "teetä", "teen"], dish: false },
];

export function selectRecipes(catalog: RecipeCard[], messages: Turn[], random = Math.random) {
    const latest = messages.filter(m => m.role === "user").at(-1)?.content.toLocaleLowerCase("fi") ?? "";
    const isRandom = /satun|yllätä|arvo|arpais/iu.test(latest);
    const alternative = /\b(muita|muuta|muu|toinen|toista|toisen|vaihda|vaihtoehto|eri)\b/iu.test(latest);
    const browse = /resept|respet|ruokaidea|suosittele|kokat|kokka|mitä.*(?:ruo|syö)|mitään.*ruok/iu.test(latest);
    const selectedFilters = filters.filter(filter => filter.pattern.test(latest));
    const shown = new Set(messages.filter(m => m.role === "assistant").flatMap(m => [
        ...(m.recipeIds ?? []), ...catalog.filter(recipe => m.content.includes(recipe.title)).map(recipe => recipe.id),
    ]));
    const lastShown = new Set(messages.filter(m => m.role === "assistant").at(-1)?.recipeIds ?? []);
    if (!selectedFilters.length && !isRandom && !alternative && !browse) return { recipes: [], kind: "chat" as const };
    let candidates = catalog.filter(recipe => selectedFilters.every(filter => {
        const text = filter.dish ? recipe.title : `${recipe.title} ${(recipe.ingredients ?? []).join(" ")}`;
        const normalized = text.toLocaleLowerCase("fi");
        return filter.terms.some(term => filter.dish ? normalized.includes(term) : normalized.split(/[^\p{L}]+/u).some(word => word === term || (term.length >= 5 && word.startsWith(term))));
    }));
    // A dietary claim requires verified dietary metadata, not a title guess.
    if (/vegaan|gluteenit|maidot|ilman\s+|ei\s+.*(?:maito|mait|pähkin|gluteen)/iu.test(latest)) candidates = [];
    if (selectedFilters.length && !candidates.length) return { recipes: [], kind: "no-match" as const };
    if (isRandom || alternative || !selectedFilters.length) {
        const unseen = candidates.filter(recipe => !shown.has(recipe.id));
        candidates = unseen.length ? unseen : candidates.filter(recipe => !lastShown.has(recipe.id));
        if (!candidates.length) return { recipes: [], kind: "exhausted" as const };
        const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
        return { recipes: [candidates[index]], kind: isRandom ? "random" as const : "alternative" as const };
    }
    return { recipes: candidates.slice(0, 3), kind: "match" as const };
}
