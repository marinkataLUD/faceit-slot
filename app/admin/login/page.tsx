 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error || "Грешна парола.");
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="page">
      <form className="login card" onSubmit={login}>
        <h1>🔐 Admin Login</h1>
        <p>Въведи администраторската парола.</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Парола" autoFocus />
        <button>Вход</button>
        {error && <div className="error">{error}</div>}
        <a href="/">← Към слотовете</a>
      </form>
    </main>
  );
}