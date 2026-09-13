"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Lock,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import styles from "./setup.module.css";

export default function AdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cvDownloadPassword, setCvDownloadPassword] = useState("download123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if initial setup is actually needed
    const checkSetupStatus = async () => {
      try {
        const res = await fetch("/api/admin/setup");
        if (res.ok) {
          const data = await res.json();
          if (!data.needsSetup) {
            // Already configured, redirect to login
            router.replace("/admin/login");
            return;
          }
        }
      } catch (e) {
        console.warn("Setup check error:", e);
      } finally {
        setChecking(false);
      }
    };

    checkSetupStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านผู้ดูแลระบบต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          cvDownloadPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการตั้งค่าผู้ดูแลระบบ");
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingCenter}>
            <Loader2 size={32} className="animate-spin" />
            <span>กำลังตรวจสอบสถานะระบบ...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.backRow}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>กลับหน้าหลัก</span>
          </Link>
          <div className={styles.setupBadge}>
            <Sparkles size={13} />
            <span>First-Time Setup</span>
          </div>
        </div>

        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <UserPlus size={28} />
          </div>
          <h1 className={styles.title}>ตั้งค่าผู้ดูแลระบบ (Admin)</h1>
          <p className={styles.subtitle}>
            ยินดีต้อนรับสู่ระบบ Portfolio & CV กรุณากำหนดบัญชีผู้ดูแลระบบในครั้งแรก
            เพื่อความปลอดภัยสูงสุดในการเข้าจัดการข้อมูล
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <CheckCircle2 size={48} style={{ color: "#10b981" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              ตั้งค่าบัญชีผู้ดูแลสำเร็จ!
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              กำลังนำท่านเข้าสู่ Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="setup-name">
                <span>ชื่อผู้ดูแลระบบ (Administrator Name)</span>
              </label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.fieldIcon} />
                <input
                  id="setup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น John Doe หรือ ดร. สมชาย ใจดี"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="setup-email">
                <span>อีเมลสำหรับเข้าสู่ระบบ (Admin Email)</span>
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.fieldIcon} />
                <input
                  id="setup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com หรืออีเมลของคุณ"
                  className={styles.input}
                />
              </div>
              <span className={styles.helperText}>
                อีเมลนี้จะใช้สำหรับ Login เข้าสู่ระบบ Admin และจะปรากฏในช่องทางติดต่อหน้าเว็บ
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="setup-password">
                <span>กำหนดรหัสผ่าน (Admin Password)</span>
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  id="setup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="setup-confirm-password">
                <span>ยืนยันรหัสผ่าน (Confirm Password)</span>
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  id="setup-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: "0.5rem" }}>
              <label className={styles.label} htmlFor="setup-cv-password">
                <span>รหัสผ่านสำหรับคนทั่วไปดาวน์โหลด CV (CV Download Key)</span>
                <span className={styles.labelOptional}>(เปลี่ยนภายหลังได้)</span>
              </label>
              <div className={styles.inputWrapper}>
                <KeyRound size={18} className={styles.fieldIcon} />
                <input
                  id="setup-cv-password"
                  type="text"
                  value={cvDownloadPassword}
                  onChange={(e) => setCvDownloadPassword(e.target.value)}
                  placeholder="เช่น download123"
                  className={styles.input}
                />
              </div>
              <span className={styles.helperText}>
                รหัสผ่านที่ผู้เข้าชมทั่วไปต้องกรอกเมื่อต้องการ Export ไฟล์ PDF หรือ Word
              </span>
            </div>

            <div className={styles.infoBox}>
              <ShieldAlert size={18} className={styles.infoIcon} />
              <div>
                เมื่อสร้างบัญชีแล้ว หน้านี้จะถูกปิดใช้งานถาวรเพื่อความปลอดภัย
                และท่านจะสามารถแก้ไขข้อมูลหรือรหัสผ่านได้จากแผงควบคุม Admin Settings
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>กำลังตั้งค่าระบบและเข้าสู่ระบบ...</span>
                </>
              ) : (
                <span>ยืนยันและเปิดใช้งานระบบ Admin</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
