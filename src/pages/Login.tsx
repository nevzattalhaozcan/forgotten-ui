import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../lib/auth";

const Login: React.FC = () => {
  const nav = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loc = useLocation() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      const to = loc.state?.from ?? "/discover";
      nav(to, { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.detail?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3">
        Tip: use a user from your backend; the collection shows a demo body for login.
      </p>
    </div>
  );
};

export default Login;
