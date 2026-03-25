"use client";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import EntranceModal from "../components/EntranceModal";

export default function Providers({ children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const ok = localStorage.getItem("tm_entrance") === "true";
    setAuthorized(ok);
  }, []);

  if (authorized === null) return null;

  return (
    <SessionProvider>
      {!authorized && (
        <EntranceModal onSuccess={() => setAuthorized(true)} />
      )}
      {authorized && children}
    </SessionProvider>
  );
}