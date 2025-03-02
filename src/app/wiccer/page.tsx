"use client";

import React, { useState, useEffect } from "react";
import styles from "./wiccer.module.css";
import { useLanguage } from "../context/LanguageContext";
import LoadingText from "../components/LoadingText";

interface Post {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
}

export default function WiccerPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Admin state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();

    // Check if admin is already logged in (from localStorage)
    const savedAdminStatus = localStorage.getItem("wiccersAdminLoggedIn");
    if (savedAdminStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  // Function to fetch posts from the API
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(
        language === "finnish"
          ? "Viestien lataaminen epäonnistui. Yritä myöhemmin uudelleen."
          : "Failed to load posts. Please try again later."
      );
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim() || !content.trim()) {
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
        body: JSON.stringify({ nickname, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      // Clear the form
      setContent("");

      // Refresh the posts
      fetchPosts();
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
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={translations.enterNickname}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="content">{translations.message}</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={translations.shareThoughts}
                required
                className={styles.textarea}
                maxLength={280}
              />
              <div className={styles.charCount}>{content.length}/280</div>
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
          <h2>{translations.messages}</h2>
          {isLoadingPosts ? (
            <div className={styles.loadingContainer}>
              <LoadingText text={translations.loading} />
            </div>
          ) : posts.length === 0 ? (
            <p className={styles.noPosts}>{translations.noMessages}</p>
          ) : (
            <div className={styles.posts}>
              {posts.map((post) => (
                <div key={post.id} className={styles.post}>
                  <div className={styles.postHeader}>
                    <span className={styles.nickname}>{post.nickname}</span>
                    <span className={styles.date}>
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <div className={styles.postContent}>{post.content}</div>
                  {isAdmin && (
                    <div className={styles.adminActions}>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeletePost(post.id)}
                      >
                        {translations.delete}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
