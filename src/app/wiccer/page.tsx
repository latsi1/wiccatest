"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageAttachment, useImageAttachment } from "./ImageAttachment";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import styles from "./wiccer.module.css";
type Member = {
    id: string;
    name: string;
    bio: string;
    color: string;
    createdAt: string;
    followers: number;
    following: number;
    followed: boolean;
    postCount: number;
    archived: boolean;
};
type Post = {
    id: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    author: Member;
    likes: number;
    liked: boolean;
    reposts: number;
    reposted: boolean;
    replies: number;
    bookmarked: boolean;
    image?: { url: string; width: number; height: number; alt: string };
};
type Feed = {
    posts: Post[];
    next: string | null;
    members: Member[];
    trends: {
        tag: string;
        count: number;
    }[];
    totalMembers: number;
    profile: Member | null;
    user: Member | null;
};
type View = "all" | "following" | "explore" | "bookmarks" | "profile";
type IconName = "home" | "search" | "bookmark" | "person" | "spark" | "reply" | "heart" | "repost" | "send" | "close" | "logout" | "arrow" | "refresh";
const iconPaths: Record<IconName, string> = {
    home: "M3 10 12 3l9 7v10H15v-6H9v6H3Z", search: "M21 21l-5-5M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14", bookmark: "M6 3h12v18l-6-4-6 4Z", person: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M12 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8", spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z", reply: "M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5Z", heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z", repost: "m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3", send: "m22 2-7 20-4-9-9-4Z M22 2 11 13", close: "m6 6 12 12M6 18 18 6", logout: "M9 21H4V3h5m5 5 5 4-5 4m-5-4h10", arrow: "M5 12h14m-6-6 6 6-6 6", refresh: "M21 3v6h-6M3 21v-6h6M3.5 9a9 9 0 0 1 15-5L21 9M3 15l2.5 5a9 9 0 0 0 15-5"
};
function Icon({ name, size = 20 }: {
    name: IconName;
    size?: number;
}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]}/></svg>; }
function Avatar({ member, large = false }: {
    member: Pick<Member, "name" | "color">;
    large?: boolean;
}) { return <span className={`${styles.avatar} ${large ? styles.avatarLarge : ""}`} data-tone={member.color} aria-hidden="true">{member.name.slice(0, 2).toUpperCase()}</span>; }
function Modal({ children, title, onClose, wide = false }: {
    children: ReactNode;
    title: string;
    onClose: () => void;
    wide?: boolean;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
    return <dialog ref={ref} className={`${styles.dialog} ${wide ? styles.wideDialog : ""}`} onCancel={event => { event.preventDefault(); onClose(); }} aria-label={title} onClick={event => { if (event.target === ref.current) {
        const box = ref.current.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
            onClose();
    } }}><button type="button" className={styles.closeDialog} aria-label="Close" onClick={onClose}><Icon name="close"/></button>{children}</dialog>;
}
async function api<T>(url: string, body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { method: body ? "POST" : "GET", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, signal, cache: "no-store" });
    const data = await response.json();
    if (!response.ok)
        throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
}
function timeAgo(value: string, fi: boolean) { const delta = Math.max(0, Date.now() - new Date(value).getTime()); if (delta < 60000)
    return fi ? "nyt" : "now"; if (delta < 3600000)
    return `${Math.floor(delta / 60000)} min`; if (delta < 86400000)
    return `${Math.floor(delta / 3600000)} h`; return new Date(value).toLocaleDateString(fi ? "fi-FI" : "en-GB", { day: "numeric", month: "short" }); }
export default function WiccerPage() {
    const { language } = useLanguage();
    const fi = language === "finnish";
    const t = (f: string, e: string) => fi ? f : e;
    const [user, setUser] = useState<Member | null>(null), [view, setView] = useState<View>("all"), [profileId, setProfileId] = useState<string | null>(null);
    const [feed, setFeed] = useState<Feed | null>(null), [loading, setLoading] = useState(true), [feedError, setFeedError] = useState("");
    const [search, setSearch] = useState(""), [query, setQuery] = useState(""), [draft, setDraft] = useState(""), [posting, setPosting] = useState(false), [notice, setNotice] = useState("");
    const [auth, setAuth] = useState<"login" | "register" | null>(null), [name, setName] = useState(""), [password, setPassword] = useState(""), [authError, setAuthError] = useState(""), [authBusy, setAuthBusy] = useState(false);
    const [editing, setEditing] = useState(false), [profileName, setProfileName] = useState(""), [bio, setBio] = useState(""), [color, setColor] = useState("sage"), [editError, setEditError] = useState("");
    const [deletingPost, setDeletingPost] = useState<Post | null>(null), [deleteBusy, setDeleteBusy] = useState(false), [deleteError, setDeleteError] = useState("");
    const [deletingAccount, setDeletingAccount] = useState(false), [deletePassword, setDeletePassword] = useState("");
    const [thread, setThread] = useState<Post | null>(null), [replies, setReplies] = useState<Post[]>([]), [replyDraft, setReplyDraft] = useState(""), [threadBusy, setThreadBusy] = useState(false), [threadError, setThreadError] = useState("");
    const [busyIds, setBusyIds] = useState<string[]>([]), [moreBusy, setMoreBusy] = useState(false), [storage, setStorage] = useState<string>("");
    const [followersProfile, setFollowersProfile] = useState<Member | null>(null);
    const [followers, setFollowers] = useState<Member[]>([]);
    const [followersLoading, setFollowersLoading] = useState(false);
    const [followersError, setFollowersError] = useState("");
    const [followersRetry, setFollowersRetry] = useState(0);
    const attachment = useImageAttachment();
    const replyAttachment = useImageAttachment();
    const clearReplyAttachment = replyAttachment.clear;
    const [expandedImage, setExpandedImage] = useState<Post["image"] | null>(null);
    const composer = useRef<HTMLTextAreaElement>(null);
    const requestVersion = useRef(0);
    useEffect(() => {
        if (!followersProfile) return;
        const controller = new AbortController();
        setFollowers([]);
        setFollowersLoading(true);
        setFollowersError("");
        api<{ followers: Member[] }>(`/api/wiccers?followers=${encodeURIComponent(followersProfile.id)}`, undefined, controller.signal)
            .then(data => setFollowers(data.followers))
            .catch(error => { if (error.name !== "AbortError") setFollowersError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setFollowersLoading(false); });
        return () => controller.abort();
    }, [followersProfile, followersRetry]);
    const loadFeed = useCallback(async (signal?: AbortSignal) => {
        const version = ++requestVersion.current;
        setLoading(true);
        setFeedError("");
        const params = new URLSearchParams({ view: view === "profile" || view === "explore" ? "all" : view, q: query });
        if (view === "profile" && profileId)
            params.set("profile", profileId);
        try {
            const data = await api<Feed>(`/api/wiccers?${params}`, undefined, signal);
            if (version === requestVersion.current) {
                setFeed(data);
                setUser(data.user);
            }
        }
        catch (error) {
            if (!(error instanceof DOMException && error.name === "AbortError") && version === requestVersion.current)
                setFeedError((error as Error).message);
        }
        finally {
            if (version === requestVersion.current && !signal?.aborted)
                setLoading(false);
        }
    }, [view, query, profileId]);
    useEffect(() => { const controller = new AbortController(); void loadFeed(controller.signal); return () => controller.abort(); }, [loadFeed]);
    useEffect(() => { const controller = new AbortController(); api<{
        user: Member | null;
        storage: string;
    }>("/api/wiccers/auth", undefined, controller.signal).then(data => { setUser(data.user); setStorage(data.storage); }).catch(() => { }); return () => controller.abort(); }, []);
    useEffect(() => { const timer = setTimeout(() => setQuery(search), 300); return () => clearTimeout(timer); }, [search]);
    useEffect(() => { if (!notice)
        return; const timer = setTimeout(() => setNotice(""), 4000); return () => clearTimeout(timer); }, [notice]);
    useEffect(() => { if (!thread) {
        setReplies([]);
        setReplyDraft("");
        clearReplyAttachment();
        return;
    } const controller = new AbortController(); setThreadBusy(true); setThreadError(""); api<Feed>(`/api/wiccers?thread=${thread.id}`, undefined, controller.signal).then(data => setReplies(data.posts.reverse())).catch(error => { if (error.name !== "AbortError")
        setThreadError(error.message); }).finally(() => { if (!controller.signal.aborted)
        setThreadBusy(false); }); return () => controller.abort(); }, [thread, clearReplyAttachment]);
    const openAuth = (mode: "login" | "register") => { setAuthError(""); setPassword(""); setAuth(mode); };
    const go = (next: View) => { if (!user && ["following", "bookmarks", "profile"].includes(next)) {
        openAuth("register");
        return;
    } setSearch(""); setQuery(""); setView(next); if (next === "profile")
        setProfileId(user!.id); };
    const seeProfile = (member: Member) => { setSearch(""); setQuery(""); setProfileId(member.id); setView("profile"); setThread(null); };
    const focusComposer = () => { setView("all"); setSearch(""); setQuery(""); setTimeout(() => { composer.current?.scrollIntoView({ behavior: "smooth", block: "center" }); composer.current?.focus(); }, 100); };
    const authenticate = async (event: FormEvent) => { event.preventDefault(); setAuthBusy(true); setAuthError(""); try {
        const data = await api<{
            user: Member;
        }>("/api/wiccers/auth", { action: auth, name, password });
        setUser(data.user);
        setAuth(null);
        setPassword("");
        setNotice(t("Tervetuloa piiriin.", "Welcome to the circle."));
        await loadFeed();
    }
    catch (error) {
        setAuthError((error as Error).message);
    }
    finally {
        setAuthBusy(false);
    } };
    const logout = async () => { try {
        await api("/api/wiccers/auth", { action: "logout" });
        setUser(null);
        attachment.clear();
        replyAttachment.clear();
        setView("all");
        setProfileId(null);
        setNotice(t("Olet kirjautunut ulos.", "You’re signed out."));
        await loadFeed();
    }
    catch (error) {
        setNotice((error as Error).message);
    } };
    const submitPost = async (event: FormEvent, reply = false) => { event.preventDefault(); if (!user) {
        openAuth("register");
        return;
    } if (posting) return; const selectedAttachment = reply ? replyAttachment : attachment; const content = reply ? replyDraft : draft; if (!content.trim() && !selectedAttachment.file)
        return; setPosting(true); try {
        const imageId = await selectedAttachment.upload(user.id);
        await api("/api/wiccers", { action: "post", content, imageId, imageAlt: selectedAttachment.alt, parentId: reply ? thread?.id : null });
        selectedAttachment.clear();
        if (reply && thread) {
            setReplyDraft("");
            const result = await api<Feed>(`/api/wiccers?thread=${thread.id}`);
            setReplies(result.posts.reverse());
            setThread({ ...thread, replies: thread.replies + 1 });
        }
        else
            setDraft("");
        setNotice(t("Ajatuksesi on lähetetty tähtiin.", "Your whisper is out in the universe."));
        await loadFeed();
    }
    catch (error) {
        setNotice((error as Error).message);
    }
    finally {
        setPosting(false);
    } };
    const changePost = async (post: Post, action: "like" | "repost" | "bookmark") => { if (!user) {
        openAuth("register");
        return;
    } if (busyIds.includes(post.id))
        return; setBusyIds(ids => [...ids, post.id]); try {
        const data = await api<{
            active: boolean;
            count: number;
        }>("/api/wiccers", { action, postId: post.id });
        const update = (p: Post) => p.id !== post.id ? p : action === "like" ? { ...p, liked: data.active, likes: data.count } : action === "repost" ? { ...p, reposted: data.active, reposts: data.count } : { ...p, bookmarked: data.active };
        setFeed(f => f ? { ...f, posts: f.posts.map(update) } : f);
        setReplies(r => r.map(update));
        setThread(p => p ? update(p) : p);
        if (action === "bookmark")
            setNotice(data.active ? t("Tallennettu kokoelmaasi.", "Saved to your collection.") : t("Poistettu kokoelmasta.", "Removed from your collection."));
    }
    catch (error) {
        setNotice((error as Error).message);
    }
    finally {
        setBusyIds(ids => ids.filter(id => id !== post.id));
    } };
    const follow = async (member: Member) => { if (!user) {
        openAuth("register");
        return;
    } try {
        await api("/api/wiccers", { action: "follow", memberId: member.id });
        await loadFeed();
    }
    catch (error) {
        setNotice((error as Error).message);
    } };
    const saveProfile = async (event: FormEvent) => { event.preventDefault(); setAuthBusy(true); setEditError(""); try {
        const data = await api<{
            user: Member;
        }>("/api/wiccers", { action: "profile", name: profileName, bio, color });
        setUser(data.user);
        const updateAuthor = (post: Post) => post.author.id === data.user.id ? { ...post, author: data.user } : post;
        setThread(post => post ? updateAuthor(post) : post);
        setReplies(posts => posts.map(updateAuthor));
        setEditing(false);
        await loadFeed();
        setNotice(t("Profiili päivitetty.", "Profile updated."));
    }
    catch (error) {
        setEditError((error as Error).message);
    }
    finally {
        setAuthBusy(false);
    } };
    const deletePost = async () => {
        if (!deletingPost || deleteBusy) return;
        setDeleteBusy(true); setDeleteError("");
        try {
            await api("/api/wiccers", { action: "delete", postId: deletingPost.id });
            setReplies(posts => posts.filter(post => post.id !== deletingPost.id));
            setThread(post => post?.id === deletingPost.id ? null : post && deletingPost.parentId === post.id ? { ...post, replies: Math.max(0, post.replies - 1) } : post);
            setDeletingPost(null);
            await loadFeed();
            setNotice(t("Kirjoitus poistettu.", "Post deleted."));
        } catch (error) { setDeleteError((error as Error).message); }
        finally { setDeleteBusy(false); }
    };
    const deleteAccount = async (event: FormEvent) => {
        event.preventDefault();
        if (deleteBusy) return;
        setDeleteBusy(true); setDeleteError("");
        try {
            const result = await api<{ imagesRemoved: boolean }>("/api/wiccers/auth", { action: "delete-account", password: deletePassword });
            requestVersion.current++;
            setUser(null); setFeed(null); setThread(null); setFollowersProfile(null); setExpandedImage(null);
            setDeletingPost(null); setEditing(false); setDeletingAccount(false); setDeletePassword("");
            attachment.clear(); replyAttachment.clear(); setDraft(""); setSearch(""); setQuery("");
            setProfileId(null); setView("all");
            setNotice(result.imagesRemoved ? t("Tilisi ja kirjoituksesi on poistettu.", "Your account and posts have been deleted.") : t("Tili poistettu. Kuvatiedostojen poistaminen epäonnistui; ota yhteyttä sivuston ylläpitoon.", "Account deleted. Image file cleanup failed; contact the site owner."));
        } catch (error) { setDeleteError((error as Error).message); }
        finally { setDeleteBusy(false); }
    };
    const loadMore = async () => { if (!feed?.next || moreBusy)
        return; setMoreBusy(true); try {
        const params = new URLSearchParams({ view: view === "profile" || view === "explore" ? "all" : view, q: query, before: feed.next });
        if (view === "profile" && profileId)
            params.set("profile", profileId);
        const data = await api<Feed>(`/api/wiccers?${params}`);
        setFeed(f => f ? { ...data, posts: [...f.posts, ...data.posts] } : data);
    }
    catch (error) {
        setNotice((error as Error).message);
    }
    finally {
        setMoreBusy(false);
    } };
    const renderPost = (post: Post, index = 0, insideThread = false) => <motion.article key={post.id} layout initial={{ opacity: 0, y: 24, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: .35, delay: Math.min(index * .035, .25) }} className={styles.post}>
  {post.reposted && <p className={styles.repostNote}><Icon name="repost" size={12}/>{t("Olet jakanut tämän kuiskauksen", "You echoed this whisper")}</p>}
  <div className={styles.postRow}><button type="button" className={styles.avatarButton} onClick={() => seeProfile(post.author)} aria-label={`${t("Avaa profiili:", "Open profile:")} ${post.author.name}`}><Avatar member={post.author}/></button><div className={styles.postMain}>
  <div className={styles.postHeading}><button type="button" onClick={() => seeProfile(post.author)}>{post.author.name}</button>{post.author.archived && <span className={styles.archive}>ARCHIVE</span>}<span className={styles.handle}>@{post.author.name.toLowerCase()}</span><span className={styles.time}>· {timeAgo(post.createdAt, fi)}</span></div>
  <p className={styles.postText}>{post.content.split(/(#[\p{L}\p{N}_]+)/gu).map((part, i) => part.startsWith("#") ? <button type="button" className={styles.hashtag} key={i} onClick={() => { setSearch(part); setView("explore"); setThread(null); }}>{part}</button> : part)}</p>
  {post.image && <button type="button" className={styles.postImageButton} onClick={() => setExpandedImage(post.image!)} aria-label={t("Avaa kuva", "Expand image")}><Image src={post.image.url} width={post.image.width} height={post.image.height} alt={post.image.alt || t("Kuiskauksen kuva", "Whisper attachment")} unoptimized className={styles.postImage}/></button>}
  <div className={styles.postActions}><button type="button" aria-label={t("Avaa keskustelu", "Open conversation")} onClick={() => { if (!insideThread)
        setThread(post);
    else
        document.getElementById("reply-draft")?.focus(); }}><Icon name="reply" size={17}/><span>{post.replies || ""}</span></button><button type="button" className={post.reposted ? styles.activeAction : ""} aria-label={t("Jaa uudelleen", "Echo whisper")} aria-pressed={post.reposted} disabled={busyIds.includes(post.id)} onClick={() => changePost(post, "repost")}><Icon name="repost" size={17}/><span>{post.reposts || ""}</span></button><button type="button" className={post.liked ? styles.liked : ""} aria-label={t("Tykkää", "Like whisper")} aria-pressed={post.liked} disabled={busyIds.includes(post.id)} onClick={() => changePost(post, "like")}><motion.span animate={post.liked ? { scale: [1, 1.5, 1], rotate: [0, -15, 0] } : { scale: 1 }} key={`${post.id}-${post.liked}`}><Icon name="heart" size={17}/></motion.span><span>{post.likes || ""}</span></button><button type="button" className={post.bookmarked ? styles.activeAction : ""} aria-label={t("Tallenna", "Bookmark whisper")} aria-pressed={post.bookmarked} disabled={busyIds.includes(post.id)} onClick={() => changePost(post, "bookmark")}><Icon name="bookmark" size={16}/></button>{user?.id === post.author.id && <button type="button" className={styles.deletePostButton} aria-label={post.parentId ? t("Poista oma kommentti", "Delete your comment") : t("Poista oma kirjoitus", "Delete your post")} disabled={busyIds.includes(post.id)} onClick={() => { setDeleteError(""); setDeletingPost(post); }}>{t("Poista", "Delete")}</button>}</div>
  </div></div></motion.article>;
    const navItems: {
        view: View;
        icon: IconName;
        fi: string;
        en: string;
    }[] = [{ view: "all", icon: "home", fi: "Koti", en: "Home" }, { view: "explore", icon: "search", fi: "Löydä", en: "Explore" }, { view: "following", icon: "spark", fi: "Oma piiri", en: "My circle" }, { view: "bookmarks", icon: "bookmark", fi: "Kokoelma", en: "Bookmarks" }, { view: "profile", icon: "person", fi: "Profiili", en: "Profile" }];
    const selectedProfile = view === "profile" ? feed?.profile : null;
    return <MotionConfig reducedMotion="user"><main id="main-content" className={styles.world}>
  <div className={styles.aurora} aria-hidden="true"/><div className={styles.grain} aria-hidden="true"/>
  <div className={styles.layout}>
   <aside className={styles.leftRail}><Link href="/wiccer" className={styles.brand}><span aria-hidden="true">☾</span> Wiccers<span className={styles.brandSpark}>✦</span></Link><p className={styles.brandCaption}>A LITTLE SOCIAL MAGIC</p><nav className={styles.sideNav} aria-label={t("Wiccers-navigaatio", "Wiccers navigation")}>{navItems.map(item => <button type="button" key={item.view} className={view === item.view ? styles.selectedNav : ""} onClick={() => go(item.view)}><Icon name={item.icon}/>{fi ? item.fi : item.en}{view === item.view && <motion.span layoutId="nav-star" className={styles.navStar}>✦</motion.span>}</button>)}</nav><motion.button type="button" whileHover={{ scale: 1.035 }} whileTap={{ scale: .95 }} className={styles.whisperButton} onClick={focusComposer}><Icon name="spark" size={18}/>{t("Uusi kuiskaus", "New whisper")}<Icon name="send" size={16}/></motion.button><div className={styles.railNote}><span>✧</span><p>{t("Jokainen ajatus on pieni tähti.", "Every thought is a little star.")}</p></div><div className={styles.account}>{user ? <><button className={styles.accountProfile} type="button" onClick={() => seeProfile(user)}><Avatar member={user}/><span><strong>{user.name}</strong><small>@{user.name.toLowerCase()}</small></span></button><button type="button" className={styles.iconButton} onClick={logout} aria-label={t("Kirjaudu ulos", "Sign out")}><Icon name="logout" size={17}/></button></> : <><button type="button" className={styles.signIn} onClick={() => openAuth("login")}>{t("Kirjaudu sisään", "Sign in")} ↗</button><small>{t("Löydä paikkasi piirissä.", "Find your place in the circle.")}</small></>}</div></aside>
   <section className={styles.feedColumn} aria-label={t("Yhteisön kuiskaukset", "Community whispers")}>
    <header className={styles.feedHeader}><div><h1>{view === "profile" ? t("Profiili", "Profile") : view === "bookmarks" ? t("Kokoelmasi", "Your collection") : view === "explore" ? t("Löydä uusia polkuja", "Explore the universe") : t("Yhteinen piiri", "The gathering")}</h1><p>{t("Ajatuksia tähtien välissä", "Thoughts between the stars")}</p></div><button type="button" className={styles.iconButton} disabled={loading} onClick={() => void loadFeed()} aria-label={t("Päivitä syöte", "Refresh feed")}><Icon name="spark"/></button></header>
    {selectedProfile ? <section className={styles.profileCard}><div className={styles.profileCover}><span>☾</span><span>✦</span></div><div className={styles.profileDetails}><Avatar member={selectedProfile} large/><div className={styles.profileControls}>{user?.id === selectedProfile.id ? <button type="button" className={styles.outlineButton} onClick={() => { setProfileName(user.name); setBio(user.bio); setColor(user.color); setEditError(""); setEditing(true); }}>{t("Muokkaa profiilia", "Edit profile")}</button> : <button type="button" className={styles.outlineButton} onClick={() => follow(selectedProfile)}>{selectedProfile.followed ? t("Seurataan", "Following") : t("Liity piiriin", "Follow")}</button>}</div><h2>{selectedProfile.name}</h2><p className={styles.handle}>@{selectedProfile.name.toLowerCase()}{selectedProfile.archived ? " · ARCHIVE" : ""}</p><p className={styles.profileBio}>{selectedProfile.bio || t("Oma polku, oma tarina.", "Your own path, your own story.")}</p><p className={styles.joined}>{t("Liittynyt", "Joined")} {new Date(selectedProfile.createdAt).toLocaleDateString(fi ? "fi-FI" : "en-GB", { month: "long", year: "numeric" })}</p><div className={styles.profileStats}><span><b>{selectedProfile.following}</b> {t("seurattua", "following")}</span><button type="button" className={styles.followersCount} aria-label={t("Näytä seuraajat", "View followers")} onClick={() => setFollowersProfile(selectedProfile)}><b>{selectedProfile.followers}</b> {t("seuraajaa", "followers")}</button><span><b>{selectedProfile.postCount}</b> {t("kuiskausta", "whispers")}</span></div></div></section> : view === "all" ? <section className={styles.cover}><div className={styles.coverStars} aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div><div className={styles.coverMoon} aria-hidden="true"/><p className={styles.eyebrow}>{t("TERVETULOA OMAAN MAAILMAAMME", "WELCOME TO OUR LITTLE UNIVERSE")}</p><h2>{t("Anna ajatuksesi", "Let your thoughts")}<br /><em>{t("loistaa.", "become stars.")}</em></h2><p>{t("Pieniä kuiskauksia. Suuria yhteyksiä.", "Little whispers. Cosmic connections.")}</p><div className={styles.coverBadge}><span /> {t("YHTEINEN PIIRI", "THE CIRCLE IS OPEN")}</div></section> : null}
    {(view === "all" || view === "following") && <><div className={styles.tabs}><button type="button" className={view === "all" ? styles.activeTab : ""} onClick={() => go("all")}>{t("Kaikille", "For you")}</button><button type="button" className={view === "following" ? styles.activeTab : ""} onClick={() => go("following")}>{t("Oma piiri", "Following")}</button></div><form className={styles.composer} onSubmit={event => submitPost(event)}><Avatar member={user ?? { name: "✧", color: "sage" }}/><div className={styles.composerMain}><label className={styles.srOnly} htmlFor="whisper-draft">{t("Uusi kuiskaus", "New whisper")}</label><textarea ref={composer} id="whisper-draft" value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} placeholder={user ? t("Mitä universumissasi tapahtuu?", "What’s happening in your universe?") : t("Mitä mielessäsi on?", "What’s on your mind?")} rows={3} disabled={posting}/><ImageAttachment attachment={attachment} disabled={posting} fi={fi}/><div className={styles.composerBottom}><span className={styles.composerHint}><Icon name="spark" size={14}/>{t("Pelkkä ajatus riittää.", "A thought is all it takes.")}</span><span className={`${styles.charCount} ${draft.length > 450 ? styles.nearLimit : ""}`}>{draft.length}/500</span><motion.button whileTap={{ scale: .94 }} type="submit" className={styles.postButton} disabled={posting || (!draft.trim() && !attachment.file && !!user)}>{posting ? t("Lähetetään…", "Sending…") : user ? t("Kuiskaa", "Whisper") : t("Liity & kuiskaa", "Join & whisper")}<Icon name="spark" size={14}/></motion.button></div></div></form></>}
    {view === "explore" && <div className={styles.exploreIntro}><Icon name="search" size={28}/><h2>{t("Seuraa uteliaisuuttasi.", "Follow your curiosity.")}</h2><p>{t("Etsi nimellä, ajatuksella tai aihetunnisteella.", "Search by name, thought, or hashtag.")}</p><input aria-label={t("Etsi kuiskauksia", "Search whispers")} placeholder={t("Etsi tästä maailmasta…", "Search this universe…")} value={search} onChange={e => setSearch(e.target.value)}/></div>}
    {feedError ? <div className={styles.empty}><Icon name="refresh" size={28}/><h3>{t("Piiri on hetken hiljaa.", "The circle is quiet for a moment.")}</h3><p role="alert">{feedError}</p><button type="button" className={styles.outlineButton} onClick={() => void loadFeed()}>{t("Yritä uudelleen", "Try again")}</button></div> : loading ? <div className={styles.skeletons} aria-label={t("Ladataan kuiskauksia", "Loading whispers")}>{[1, 2, 3].map(n => <div key={n} className={styles.skeleton}><div /><span /><span /><span /></div>)}</div> : feed?.posts.length ? <div><AnimatePresence initial={false}>{feed.posts.map((post, index) => renderPost(post, index))}</AnimatePresence>{feed.next && <button type="button" className={styles.loadMore} disabled={moreBusy} onClick={loadMore}>{moreBusy ? t("Ladataan…", "Loading…") : t("Lisää kuiskauksia ↓", "More whispers ↓")}</button>}</div> : <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={styles.empty}><span className={styles.emptyStar}>✧</span><h3>{query ? t("Täältä ei löytynyt kuiskauksia.", "No whispers found here.") : view === "bookmarks" ? t("Oma pieni tähtikokoelmasi.", "Your own little constellation.") : view === "following" ? t("Kasvata omaa piiriäsi.", "Let your circle grow.") : t("Ensimmäinen tähti voi olla sinun.", "The first star could be yours.")}</h3><p>{view === "following" ? t("Seuraa ihmisiä nähdäksesi heidän kuiskauksensa täällä.", "Follow people to see their whispers here.") : view === "bookmarks" ? t("Tallenna kuiskauksia kirjanmerkkipainikkeella.", "Bookmark whispers to return to them later.") : query ? t("Kokeile toista sanaa tai aihetunnistetta.", "Try a different word or hashtag.") : t("Jaa ajatus ja aloita uusi keskustelu.", "Share a thought and start a conversation.")}</p>{view === "all" && <button type="button" className={styles.outlineButton} onClick={focusComposer}>{t("Luo ensimmäinen kuiskaus", "Write the first whisper")} ↗</button>}</motion.div>}
    <p className={styles.feedEnd}>✦ <span>{t("Olet omassa pienessä maailmassasi.", "You’re in your own little universe.")}</span> ✦</p>
   </section>
   <aside className={styles.rightRail}><form className={styles.searchBox} onSubmit={event => { event.preventDefault(); setQuery(search); setView("explore"); }}><Icon name="search" size={18}/><input aria-label={t("Etsi yhteisöstä", "Search the community")} placeholder={t("Etsi tästä maailmasta", "Search this universe")} value={search} onChange={e => setSearch(e.target.value)}/><kbd>↵</kbd></form>
   {!user && <section className={styles.joinCard}><span className={styles.joinSymbol}>☾</span><p className={styles.eyebrow}>{t("OMA PAIKKASI TÄHTIEN ALLA", "YOUR PLACE UNDER THE STARS")}</p><h2>{t("Tule osaksi piiriä.", "Find your people.")}</h2><p>{t("Nimi ja salasana. Siinä kaikki. Ei sähköpostia, vain sinä.", "A name and a password. That’s all. No email. Just you.")}</p><button type="button" className={styles.postButton} onClick={() => openAuth("register")}>{t("Luo profiili", "Create a profile")}<Icon name="arrow" size={16}/></button><button type="button" className={styles.textButton} onClick={() => openAuth("login")}>{t("Onko sinulla jo profiili? Kirjaudu", "Already in the circle? Sign in")}</button></section>}
   <section className={styles.sideCard}><div className={styles.sideCardHeading}><h2>{t("Piirissä pinnalla", "Constellations")}</h2><Icon name="spark" size={17}/></div>{feed?.trends.length ? feed.trends.map(trend => <button type="button" key={trend.tag} className={styles.trend} onClick={() => { setSearch(trend.tag); setView("explore"); }}><span>{t("Yhteisön aihe", "In the circle")}</span><strong>{trend.tag}</strong><small>{trend.count} {t("kuiskausta", "whispers")}</small></button>) : <div className={styles.sideEmpty}><p>{t("Mikä liikuttaa maailmaasi?", "What moves your universe?")}</p><span>{t("Lisää kuiskaukseen #aihetunniste, niin yhteiset aiheet ilmestyvät tähän.", "Add a #hashtag to your whisper. Shared topics will appear here.")}</span></div>}</section>
   <section className={styles.sideCard}><div className={styles.sideCardHeading}><h2>{t("Uusia tähtiä", "New stars")}</h2><span>✧</span></div>{feed?.members.length ? feed.members.slice(0, 4).map(member => <div className={styles.memberRow} key={member.id}><button type="button" className={styles.memberIdentity} onClick={() => seeProfile(member)}><Avatar member={member}/><span><strong>{member.name}</strong><small>@{member.name.toLowerCase()}</small></span></button><button type="button" className={`${styles.followButton} ${member.followed ? styles.followed : ""}`} aria-label={`${member.followed ? t("Lopeta seuraaminen:", "Unfollow:") : t("Seuraa:", "Follow:")} ${member.name}`} onClick={() => follow(member)}>{member.followed ? "✓" : "+"}</button></div>) : <div className={styles.sideEmpty}><p>{t("Jokainen piiri alkaa jostain.", "Every circle starts somewhere.")}</p><span>{t("Uudet profiilit ilmestyvät tähän.", "New profiles will appear here.")}</span></div>}</section>
   <section className={styles.manifesto}><span>✦</span><p>{t("Ole utelias. Ole ystävällinen. Jätä vähän magiaa jälkeesi.", "Stay curious. Be kind. Leave a little magic behind.")}</p><small>THE WICCERS WAY</small></section><p className={styles.sideFooter}><Link href="/">Wiccoset</Link> · {feed?.totalMembers ?? 0} {t("jäsentä", "members")}<br />{storage === "local" ? t("Paikallinen kehitysympäristö", "Local development environment") : ""}</p></aside>
  </div>
  <AnimatePresence>{notice && <motion.div role="status" className={styles.toast} initial={{ opacity: 0, y: 35, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15 }}><Icon name="spark" size={17}/>{notice}<button type="button" aria-label={t("Sulje ilmoitus", "Dismiss notification")} onClick={() => setNotice("")}><Icon name="close" size={14}/></button></motion.div>}</AnimatePresence>
  {expandedImage && <Modal wide title={t("Kuva", "Image")} onClose={() => setExpandedImage(null)}><Image src={expandedImage.url} width={expandedImage.width} height={expandedImage.height} alt={expandedImage.alt || t("Kuiskauksen kuva", "Whisper attachment")} unoptimized className={styles.expandedImage}/>{expandedImage.alt && <p className={styles.modalSubtitle}>{expandedImage.alt}</p>}</Modal>}
  {auth && <Modal title={auth === "register" ? t("Luo profiili", "Create a profile") : t("Kirjaudu sisään", "Sign in")} onClose={() => { setAuth(null); setPassword(""); }}><div className={styles.modalMoon}>☾</div><p className={styles.eyebrow}>ENTER THE CIRCLE</p><h2 className={styles.modalTitle}>{auth === "register" ? t("Oma tähtesi odottaa.", "Your star is waiting.") : t("Tervetuloa takaisin.", "Welcome back.")}</h2><p className={styles.modalSubtitle}>{t("Vain nimi ja salasana. Ei mitään ylimääräistä.", "Just a name and password. Nothing extra.")}</p><form className={styles.authForm} onSubmit={authenticate}><label htmlFor="profile-name">{t("Nimi", "Name")}</label><input id="profile-name" value={name} onChange={e => setName(e.target.value)} minLength={3} maxLength={24} autoComplete="username" placeholder={t("Oma nimimerkkisi", "Your name in the circle")} required/><small>{t("3–24 kirjainta, numeroa, _ tai -", "3–24 letters, numbers, _ or -")}</small><label htmlFor="profile-password">{t("Salasana", "Password")}</label><input id="profile-password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} maxLength={128} autoComplete={auth === "register" ? "new-password" : "current-password"} placeholder={t("Vähintään 8 merkkiä", "At least 8 characters")} required/>{authError && <p role="alert" className={styles.error}>{authError}</p>}<button type="submit" className={styles.postButton} disabled={authBusy}>{authBusy ? t("Hetkinen…", "One moment…") : auth === "register" ? t("Luo profiili & liity piiriin", "Create profile & join the circle") : t("Astu takaisin piiriin", "Step back into the circle")}<Icon name="spark" size={16}/></button></form>{auth === "register" && <p className={styles.passwordNote}>{t("Pidä salasanasi tallessa. Koska emme kerää sähköpostia, sähköpostipalautusta ei ole.", "Keep your password safe. Without an email address, there’s no email password recovery.")}</p>}<button type="button" className={styles.textButton} onClick={() => { setAuth(auth === "register" ? "login" : "register"); setAuthError(""); setPassword(""); }}>{auth === "register" ? t("Olen jo piirissä. Kirjaudu →", "Already in the circle? Sign in →") : t("Uusi täällä? Luo profiili →", "New here? Create a profile →")}</button></Modal>}
  {followersProfile && <Modal title={t("Seuraajat", "Followers")} onClose={() => setFollowersProfile(null)}>
    <p className={styles.eyebrow}>{t("TÄMÄN TÄHDEN PIIRI", "THIS STAR’S CIRCLE")}</p>
    <h2 className={styles.modalTitle}>{t("Seuraajat", "Followers")}</h2>
    <p className={styles.modalSubtitle}>@{followersProfile.name.toLowerCase()}</p>
    {followersLoading ? <p role="status" className={styles.threadStatus}>{t("Ladataan seuraajia…", "Loading followers…")}</p> : followersError ? <div><p role="alert" className={styles.error}>{followersError}</p><button type="button" className={styles.outlineButton} onClick={() => setFollowersRetry(value => value + 1)}>{t("Yritä uudelleen", "Try again")}</button></div> : followers.length ? <ul className={styles.followersList}>{followers.map(member => <li key={member.id}><button type="button" className={styles.followerLink} onClick={() => { setFollowersProfile(null); seeProfile(member); }}><Avatar member={member}/><span><strong>{member.name}</strong><small>@{member.name.toLowerCase()}</small>{member.bio && <span className={styles.followerBio}>{member.bio}</span>}</span><Icon name="arrow" size={16}/></button></li>)}</ul> : <p className={styles.followersEmpty}>{t("Tällä käyttäjällä ei vielä ole seuraajia.", "This member doesn’t have any followers yet.")}</p>}
  </Modal>}
  {editing && user && <Modal title={t("Muokkaa profiilia", "Edit profile")} onClose={() => setEditing(false)}><p className={styles.eyebrow}>YOUR LITTLE UNIVERSE</p><h2 className={styles.modalTitle}>{t("Oman näköinen profiili.", "Make it yours.")}</h2><div className={styles.avatarPreview}><Avatar member={{ name: profileName || user.name, color }} large/></div><form className={styles.authForm} onSubmit={saveProfile}><label htmlFor="edit-profile-name">{t("Nimimerkki", "Username")}</label><input id="edit-profile-name" value={profileName} onChange={event => setProfileName(event.target.value)} minLength={3} maxLength={24} autoComplete="username" required/><small>{t("3–24 kirjainta, numeroa, _ tai -. Kirjaudu jatkossa uudella nimimerkillä; salasana pysyy samana.", "3–24 letters, numbers, _ or -. Sign in with your new username; your password stays the same.")}</small><fieldset className={styles.colors}><legend>{t("Tähtesi väri", "Your star’s color")}</legend>{["sage", "violet", "amber", "rose"].map(c => <label key={c} data-tone={c}><input type="radio" name="avatar-color" value={c} checked={color === c} onChange={() => setColor(c)}/><span>{c}</span></label>)}</fieldset><label htmlFor="profile-bio">{t("Pieni esittely", "A little about you")}</label><textarea id="profile-bio" value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3} placeholder={t("Kerro jotain itsestäsi…", "Tell us a little about yourself…")}/><small>{bio.length}/160</small>{editError && <p role="alert" className={styles.error}>{editError}</p>}<button type="submit" className={styles.postButton} disabled={authBusy}>{authBusy ? t("Tallennetaan…", "Saving…") : t("Tallenna profiili", "Save profile")}<Icon name="spark" size={16}/></button></form><div className={styles.accountDanger}><h3>{t("Tilin poistaminen", "Delete account")}</h3><p>{t("Poista tilisi, omat kirjoituksesi ja kommenttisi pysyvästi.", "Permanently delete your account, posts and comments.")}</p><button type="button" className={styles.dangerButton} disabled={authBusy} onClick={() => { setEditing(false); setDeleteError(""); setDeletePassword(""); setDeletingAccount(true); }}>{t("Poista tilini…", "Delete my account…")}</button></div></Modal>}
  {thread && <Modal wide title={t("Keskustelu", "Conversation")} onClose={() => setThread(null)}><p className={styles.eyebrow}>{t("AJATUKSESTA KESKUSTELUKSI", "A THOUGHT BECOMES A CONVERSATION")}</p><h2 className={styles.modalTitle}>{t("Tähtien välissä.", "Between the stars.")}</h2>{renderPost(thread, 0, true)}{threadBusy ? <p className={styles.threadStatus}>{t("Ladataan vastauksia…", "Loading replies…")}</p> : threadError ? <p role="alert" className={styles.error}>{threadError}</p> : <div className={styles.threadReplies}>{replies.map((reply, i) => renderPost(reply, i, true))}</div>}<form className={styles.replyComposer} onSubmit={e => submitPost(e, true)}><label className={styles.srOnly} htmlFor="reply-draft">{t("Vastauksesi", "Your reply")}</label><textarea id="reply-draft" value={replyDraft} onChange={e => setReplyDraft(e.target.value)} maxLength={500} placeholder={t("Lisää oma ajatuksesi…", "Add your thought to the conversation…")} rows={3} disabled={posting}/><ImageAttachment attachment={replyAttachment} disabled={posting} fi={fi}/><div><span className={styles.charCount}>{replyDraft.length}/500</span><button type="submit" className={styles.postButton} disabled={posting || (!replyDraft.trim() && !replyAttachment.file && !!user)}>{user ? t("Vastaa", "Reply") : t("Liity & vastaa", "Join & reply")}<Icon name="send" size={15}/></button></div></form></Modal>}

  {deletingPost && <Modal title={t("Poista kirjoitus", "Delete post")} onClose={() => { if (!deleteBusy) setDeletingPost(null); }}>
    <h2 className={styles.modalTitle}>{deletingPost.parentId ? t("Poistetaanko kommentti?", "Delete this comment?") : t("Poistetaanko kirjoitus?", "Delete this post?")}</h2>
    <p className={styles.modalSubtitle}>{deletingPost.parentId ? t("Kommentti poistetaan pysyvästi.", "This comment will be permanently deleted.") : t("Kirjoitus ja kaikki sen kommentit poistetaan pysyvästi, myös muiden käyttäjien vastaukset.", "This post and all its comments, including replies from other users, will be permanently deleted.")}</p>
    {deletingPost.content && <p className={styles.postText}>{deletingPost.content}</p>}
    {deleteError && <p role="alert" className={styles.error}>{deleteError}</p>}
    <div className={styles.confirmActions}><button type="button" className={styles.outlineButton} disabled={deleteBusy} onClick={() => setDeletingPost(null)}>{t("Peruuta", "Cancel")}</button><button type="button" className={styles.dangerButton} disabled={deleteBusy} onClick={deletePost}>{deleteBusy ? t("Poistetaan…", "Deleting…") : t("Poista pysyvästi", "Delete permanently")}</button></div>
  </Modal>}
  {deletingAccount && user && <Modal title={t("Poista tili", "Delete account")} onClose={() => { if (!deleteBusy) { setDeletingAccount(false); setDeletePassword(""); } }}>
    <h2 className={styles.modalTitle}>{t("Poistetaanko tilisi?", "Delete your account?")}</h2>
    <p className={styles.modalSubtitle}>{t("Tili", "Account")} <strong>@{user.name}</strong>{t(" sekä omat kirjoituksesi, kommenttisi, seuraamisesi, tykkäyksesi ja jaot poistetaan pysyvästi. Myös omien kirjoitustesi keskustelut poistetaan. Poistamista ei voi perua.", ", your posts, comments, follows, likes and reposts will be permanently deleted, including conversations under your posts. This cannot be undone.")}</p>
    <form className={styles.authForm} onSubmit={deleteAccount}><label htmlFor="delete-account-password">{t("Vahvista nykyisellä salasanallasi", "Confirm with your current password")}</label><input id="delete-account-password" type="password" autoComplete="current-password" value={deletePassword} onChange={event => setDeletePassword(event.target.value)} maxLength={128} disabled={deleteBusy} required/>
    {deleteError && <p role="alert" className={styles.error}>{deleteError}</p>}
    <div className={styles.confirmActions}><button type="button" className={styles.outlineButton} disabled={deleteBusy} onClick={() => { setDeletingAccount(false); setDeletePassword(""); }}>{t("Peruuta", "Cancel")}</button><button type="submit" className={styles.dangerButton} disabled={deleteBusy || !deletePassword}>{deleteBusy ? t("Poistetaan…", "Deleting…") : t("Poista tilini pysyvästi", "Permanently delete my account")}</button></div></form>
  </Modal>}
 </main></MotionConfig>;
}
