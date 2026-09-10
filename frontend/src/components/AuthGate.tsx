"use client";

import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LoginForm } from "@/components/LoginForm";
import { fetchCurrentUser, logout, type SessionUser } from "@/lib/auth";

type AuthStatus = "loading" | "loggedOut" | "loggedIn";

export const AuthGate = () => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetchCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setStatus(currentUser ? "loggedIn" : "loggedOut");
    });
  }, []);

  const handleLoginSuccess = (loggedInUser: SessionUser) => {
    setUser(loggedInUser);
    setStatus("loggedIn");
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setStatus("loggedOut");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
        Loading...
      </div>
    );
  }

  if (status === "loggedOut") {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return <KanbanBoard username={user?.username} onLogout={handleLogout} />;
};
