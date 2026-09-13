"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2, AlertCircle, Sparkles, UserPlus } from "lucide-react";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check if initial setup is needed
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/admin/setup");
        if (res.ok) {
          const data = await res.json();
          if (data.needsSetup) {
            setNeedsSetup(true);
          }
        }
      } catch (e) {
        console.warn("Could not check setup state:", e);
      }
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsSetup) {
          setNeedsSetup(true);
        }
        setError(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // Success
      router.push("/admin");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.backRow}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Public Site</span>
          </Link>
        </div>

        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <ShieldCheck size={28} />
          </div>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>
            Sign in to manage your CV sections, personal data, and export security.
          </p>
        </div>

        {needsSetup && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-subtle)",
              border: "1px solid var(--primary-border)",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                color: "var(--primary)",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <Sparkles size={16} />
              <span>ตรวจพบการเข้าใช้งานครั้งแรก</span>
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              ระบบยังไม่มีบัญชีผู้ดูแลระบบ (Admin) กรุณากำหนด Email และ Password ของท่าน
            </p>
            <Link
              href="/admin/setup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--primary)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 8px var(--primary-glow)",
              }}
            >
              <UserPlus size={15} />
              <span>ไปที่หน้าตั้งค่า Admin ครั้งแรก</span>
            </Link>
          </div>
        )}

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-email">
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com หรืออีเมลของคุณ"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-password">
              Admin Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.fieldIcon} />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
