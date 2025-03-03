"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./wiccer.module.css";
import { useLanguage } from "../context/LanguageContext";
import LoadingText from "../components/LoadingText";

interface Post {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  parent_id: number | null;
  replies: Post[];
  votes: number;
}

export default function WiccerPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ nickname: "", content: "" });
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Reply state
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyNickname, setReplyNickname] = useState("");

  // Admin state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Function to fetch posts from the API
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoadingPosts(true);
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setIsLoadingPosts(false);
      setIsLoading(false);
    }
  }, []);

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();

    // Check if admin is already logged in (from localStorage)
    const savedAdminStatus = localStorage.getItem("wiccersAdminLoggedIn");
    if (savedAdminStatus === "true") {
      setIsAdmin(true);
    }
  }, [fetchPosts]);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.nickname.trim() || !newPost.content.trim()) {
      setError(
        language === "finnish"
          ? "Nimimerkki ja viesti ovat pakollisia"
          : "Nickname and content are required"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const { post } = await response.json();

      // Add the new post to the beginning of the posts array
      setPosts((prevPosts) => [
        {
          ...post,
          replies: [],
        },
        ...prevPosts,
      ]);

      // Clear the form
      setNewPost({ nickname: "", content: "" });
    } catch (error) {
      console.error("Error creating post:", error);
      setError(
        language === "finnish"
          ? "Viestin lähettäminen epäonnistui. Yritä uudelleen."
          : "Failed to create post. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle reply submission
  const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();

    if (!replyNickname.trim() || !replyContent.trim()) {
      setError(
        language === "finnish"
          ? "Nimimerkki ja vastaus ovat pakollisia"
          : "Nickname and reply are required"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: replyNickname,
          content: replyContent,
          parent_id: parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create reply");
      }

      const { post } = await response.json();

      // Update posts state to add the new reply
      setPosts((prevPosts) => {
        const updatePost = (posts: Post[]): Post[] => {
          return posts.map((p) => {
            if (p.id === parentId) {
              return {
                ...p,
                replies: [...p.replies, { ...post, replies: [] }],
              };
            }
            if (p.replies.length > 0) {
              return {
                ...p,
                replies: updatePost(p.replies),
              };
            }
            return p;
          });
        };
        return updatePost(prevPosts);
      });

      // Clear the form and close reply section
      setReplyContent("");
      setReplyNickname("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error creating reply:", error);
      setError(
        language === "finnish"
          ? "Vastauksen lähettäminen epäonnistui. Yritä uudelleen."
          : "Failed to create reply. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle admin login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    // Check credentials
    if (adminUsername === "yucca" && adminPassword === "kallu") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      // Save admin status to localStorage
      localStorage.setItem("wiccersAdminLoggedIn", "true");
    } else {
      setAdminError(
        language === "finnish"
          ? "Virheelliset tunnukset"
          : "Invalid credentials"
      );
    }
  };

  // Function to handle admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminUsername("");
    setAdminPassword("");
    // Remove admin status from localStorage
    localStorage.removeItem("wiccersAdminLoggedIn");
  };

  // Function to sort posts by date
  const sortPosts = (posts: Post[], order: "asc" | "desc"): Post[] => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  };

  // Function to handle sort order toggle
  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Function to delete a post
  const handleDeletePost = async (postId: number) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Refresh posts after deletion
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Function to handle voting
  const handleVote = async (postId: number, vote: "up" | "down") => {
    // Get existing votes from localStorage
    const existingVotes = JSON.parse(localStorage.getItem("postVotes") || "{}");
    console.log("Current votes:", existingVotes);
    console.log("Attempting to vote:", { postId, vote });

    // If user has already voted on this post
    if (existingVotes[postId]) {
      console.log("Already voted:", existingVotes[postId]);

      // If clicking the same button again, remove the vote
      if (existingVotes[postId] === vote) {
        console.log("Removing vote");
        const response = await fetch("/api/posts", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: postId,
            vote: vote === "up" ? "down" : "up",
            undo: true,
            voteValue: vote === "up" ? -1 : 1, // Add voteValue to specify how much to change
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update vote");
        }

        const { post } = await response.json();

        // Update posts state
        setPosts((prevPosts) => {
          const updatePost = (posts: Post[]): Post[] => {
            return posts.map((p) => {
              if (p.id === postId) {
                return {
                  ...p,
                  votes: post.votes,
                };
              }
              if (p.replies.length > 0) {
                return {
                  ...p,
                  replies: updatePost(p.replies),
                };
              }
              return p;
            });
          };
          return updatePost(prevPosts);
        });

        // Remove vote from localStorage
        delete existingVotes[postId];
        localStorage.setItem("postVotes", JSON.stringify(existingVotes));
      } else {
        // If clicking the opposite button, change the vote
        console.log("Changing vote from", existingVotes[postId], "to", vote);
        const response = await fetch("/api/posts", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: postId,
            vote,
            change: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update vote");
        }

        const { post } = await response.json();

        // Update posts state
        setPosts((prevPosts) => {
          const updatePost = (posts: Post[]): Post[] => {
            return posts.map((p) => {
              if (p.id === postId) {
                return {
                  ...p,
                  votes: post.votes,
                };
              }
              if (p.replies.length > 0) {
                return {
                  ...p,
                  replies: updatePost(p.replies),
                };
              }
              return p;
            });
          };
          return updatePost(prevPosts);
        });

        // Update vote in localStorage
        existingVotes[postId] = vote;
        localStorage.setItem("postVotes", JSON.stringify(existingVotes));
      }
    } else {
      // If no previous vote, add new vote
      console.log("Adding new vote:", vote);
      const response = await fetch("/api/posts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: postId, vote }),
      });

      if (!response.ok) {
        throw new Error("Failed to update vote");
      }

      const { post } = await response.json();

      // Update posts state
      setPosts((prevPosts) => {
        const updatePost = (posts: Post[]): Post[] => {
          return posts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                votes: post.votes,
              };
            }
            if (p.replies.length > 0) {
              return {
                ...p,
                replies: updatePost(p.replies),
              };
            }
            return p;
          });
        };
        return updatePost(prevPosts);
      });

      // Save vote to localStorage
      existingVotes[postId] = vote;
      localStorage.setItem("postVotes", JSON.stringify(existingVotes));
    }
  };

  // Function to get vote status for a post
  const getVoteStatus = (postId: number): "up" | "down" | null => {
    try {
      const existingVotes = JSON.parse(
        localStorage.getItem("postVotes") || "{}"
      );
      return existingVotes[postId] || null;
    } catch (error) {
      console.error("Error getting vote status:", error);
      return null;
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === "finnish" ? "fi-FI" : "en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to render a post and its replies recursively
  const renderPost = (post: Post, level: number = 0) => {
    const voteStatus = getVoteStatus(post.id);
    return (
      <div
        key={post.id}
        className={styles.post}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className={styles.postHeader}>
          <span className={styles.nickname}>{post.nickname}</span>
          <span className={styles.date}>{formatDate(post.created_at)}</span>
        </div>
        <div className={styles.postContent}>{post.content}</div>
        <div className={styles.postActions}>
          <div className={styles.voteButtons}>
            <button
              className={`${styles.voteButton} ${
                voteStatus === "up" ? styles.voteButtonActive : ""
              }`}
              onClick={() => handleVote(post.id, "up")}
              title={translations.upvote}
            >
              ↑
            </button>
            <span className={styles.voteCount}>{post.votes}</span>
            <button
              className={`${styles.voteButton} ${
                voteStatus === "down" ? styles.voteButtonActive : ""
              }`}
              onClick={() => handleVote(post.id, "down")}
              title={translations.downvote}
            >
              ↓
            </button>
          </div>
          {isAdmin && (
            <button
              className={styles.deleteButton}
              onClick={() => handleDeletePost(post.id)}
            >
              {translations.delete}
            </button>
          )}
          <button
            className={styles.replyButton}
            onClick={() => setReplyingTo(post.id)}
          >
            {translations.reply}
          </button>
        </div>

        {replyingTo === post.id && (
          <div className={styles.replyForm}>
            <form onSubmit={(e) => handleReplySubmit(e, post.id)}>
              <div className={styles.formGroup}>
                <label htmlFor={`replyNickname-${post.id}`}>
                  {translations.nickname}
                </label>
                <input
                  type="text"
                  id={`replyNickname-${post.id}`}
                  value={replyNickname}
                  onChange={(e) => setReplyNickname(e.target.value)}
                  placeholder={translations.enterNickname}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`replyContent-${post.id}`}>
                  {translations.reply}
                </label>
                <textarea
                  id={`replyContent-${post.id}`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={translations.writeReply}
                  required
                  className={styles.textarea}
                  maxLength={280}
                />
                <div className={styles.charCount}>
                  {replyContent.length}/280
                </div>
              </div>
              <div className={styles.replyActions}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.button}
                >
                  {isLoading ? translations.sending : translations.send}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setReplyingTo(null)}
                >
                  {translations.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {post.replies && post.replies.length > 0 && (
          <div className={styles.replies}>
            {post.replies.map((reply) => renderPost(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const translations = {
    title: language === "finnish" ? "Wiccers" : "Wiccers",
    whatsMind:
      language === "finnish" ? "Mitä mielessä?" : "What's on your mind?",
    nickname: language === "finnish" ? "Nimimerkki" : "Nickname",
    enterNickname:
      language === "finnish" ? "Kirjoita nimimerkkisi" : "Enter your nickname",
    message: language === "finnish" ? "Viesti" : "Message",
    shareThoughts:
      language === "finnish"
        ? "Jaa ajatuksesi yhteisön kanssa..."
        : "Share your thoughts with the community...",
    sending: language === "finnish" ? "Lähetetään..." : "Sending...",
    send: language === "finnish" ? "Lähetä" : "Send",
    messages: language === "finnish" ? "Viestit" : "Messages",
    noMessages:
      language === "finnish"
        ? "Ei vielä viestejä. Ole ensimmäinen!"
        : "No messages yet. Be the first!",
    loading:
      language === "finnish" ? "Ladataan viestejä..." : "Loading posts...",
    adminLogin:
      language === "finnish" ? "Ylläpitäjän kirjautuminen" : "Admin Login",
    username: language === "finnish" ? "Käyttäjätunnus" : "Username",
    password: language === "finnish" ? "Salasana" : "Password",
    login: language === "finnish" ? "Kirjaudu" : "Login",
    logout: language === "finnish" ? "Kirjaudu ulos" : "Logout",
    delete: language === "finnish" ? "Poista" : "Delete",
    adminPanel: language === "finnish" ? "Ylläpitäjän paneeli" : "Admin Panel",
    reply: language === "finnish" ? "Vastaa" : "Reply",
    writeReply:
      language === "finnish"
        ? "Kirjoita vastauksesi..."
        : "Write your reply...",
    cancel: language === "finnish" ? "Peruuta" : "Cancel",
    sortByDate: language === "finnish" ? "Päivämäärä" : "Date",
    sortAsc: language === "finnish" ? "Vanhimmasta uusimpaan" : "Oldest first",
    sortDesc: language === "finnish" ? "Uusimmasta vanhimpaan" : "Newest first",
    upvote: language === "finnish" ? "Äänestä ylös" : "Upvote",
    downvote: language === "finnish" ? "Äänestä alas" : "Downvote",
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{translations.title}</h1>
      </header>

      <div className={styles.adminControls}>
        {isAdmin ? (
          <button className={styles.adminButton} onClick={handleAdminLogout}>
            {translations.logout}
          </button>
        ) : (
          <button
            className={styles.adminButton}
            onClick={() => setShowAdminLogin(!showAdminLogin)}
          >
            {translations.adminLogin}
          </button>
        )}
      </div>

      {showAdminLogin && !isAdmin && (
        <div className={styles.adminLoginContainer}>
          <h2>{translations.adminLogin}</h2>
          <form onSubmit={handleAdminLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="adminUsername">{translations.username}</label>
              <input
                type="text"
                id="adminUsername"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="adminPassword">{translations.password}</label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            {adminError && <div className={styles.error}>{adminError}</div>}
            <button type="submit" className={styles.button}>
              {translations.login}
            </button>
          </form>
        </div>
      )}

      <div className={styles.content}>
        <section className={styles.postForm}>
          <h2>{translations.whatsMind}</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="nickname">{translations.nickname}</label>
              <input
                type="text"
                id="nickname"
                value={newPost.nickname}
                onChange={(e) =>
                  setNewPost({ ...newPost, nickname: e.target.value })
                }
                placeholder={translations.enterNickname}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="content">{translations.message}</label>
              <textarea
                id="content"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                placeholder={translations.shareThoughts}
                required
                className={styles.textarea}
                maxLength={280}
              />
              <div className={styles.charCount}>
                {newPost.content.length}/280
              </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? translations.sending : translations.send}
            </button>
          </form>
        </section>

        <section className={styles.timeline}>
          <div className={styles.timelineHeader}>
            <h2>{translations.messages}</h2>
            <button
              className={styles.sortButton}
              onClick={handleSortToggle}
              title={
                sortOrder === "asc"
                  ? translations.sortAsc
                  : translations.sortDesc
              }
            >
              {translations.sortByDate} {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
          {isLoadingPosts ? (
            <div className={styles.loadingContainer}>
              <LoadingText text={translations.loading} />
            </div>
          ) : posts.length === 0 ? (
            <p className={styles.noPosts}>{translations.noMessages}</p>
          ) : (
            <div className={styles.posts}>
              {sortPosts(posts, sortOrder).map((post) => renderPost(post))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
