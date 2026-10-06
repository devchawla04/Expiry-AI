import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Banner, Button, controlClass, Field } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { User } from "../lib/types";

function Frame({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-5xl items-center gap-8 px-5 py-10 md:grid-cols-2">
      <div>
        <Link to="/" className="font-display text-3xl">
          ShelfSense
        </Link>
        <h1 className="mt-6 font-display text-5xl leading-tight">{title}</h1>
        <p className="mt-3 text-muted">{text}</p>
      </div>
      <div className="rounded-[2rem] border border-line bg-card p-6 shadow-card">{children}</div>
    </div>
  );
}

export function Login() {
  const { user, loading, applySession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await api<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: { email, password } });
      applySession(session);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  async function demo() {
    setBusy(true);
    setError("");
    try {
      const session = await api<{ token: string; user: User }>("/api/auth/demo", { method: "POST", body: {} });
      applySession(session);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo kitchen is unavailable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Frame title="Welcome back." text="Your fridge has been keeping score. Sign in to see what needs using.">
      <form onSubmit={submit} className="grid gap-4">
        {error ? <Banner tone="bad">{error}</Banner> : null}
        <Field label="Email">
          <input className={controlClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="Password">
          <input className={controlClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        <Button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <Button type="button" variant="secondary" onClick={demo} disabled={busy}>
          Try the demo kitchen
        </Button>
        <p className="text-sm text-muted">
          Demo login: dev@shelfsense.app / demo1234
        </p>
        <p className="text-sm">
          <Link to="/forgot" className="text-forest">
            Forgot password
          </Link>
          <span className="text-muted"> · </span>
          <Link to="/signup" className="text-forest">
            Create an account
          </Link>
        </p>
      </form>
    </Frame>
  );
}

export function Signup() {
  const { user, loading, applySession } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!loading && user) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await api<{ token: string; user: User }>("/api/auth/signup", {
        method: "POST",
        body: { name, email, password },
      });
      applySession(session);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Frame title="Start a smarter pantry." text="Add food by photo, barcode, or hand. ShelfSense will watch the dates.">
      <form onSubmit={submit} className="grid gap-4">
        {error ? <Banner tone="bad">{error}</Banner> : null}
        <Field label="Name">
          <input className={controlClass} value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Email">
          <input className={controlClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input className={controlClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </Button>
        <p className="text-sm">
          Already have one?{" "}
          <Link to="/login" className="text-forest">
            Sign in
          </Link>
        </p>
      </form>
    </Frame>
  );
}

export function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api<{ ok: true; devResetUrl?: string }>("/api/auth/forgot", { method: "POST", body: { email } });
      setMessage("If that email has an account, a reset link is ready.");
      setResetUrl(result.devResetUrl ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start a reset");
    }
  }

  return (
    <Frame title="Reset your password." text="In local development the reset link appears here. In production you would email it.">
      <form onSubmit={submit} className="grid gap-4">
        {error ? <Banner tone="bad">{error}</Banner> : null}
        {message ? <Banner>{message}</Banner> : null}
        {resetUrl ? (
          <a className="break-all text-sm text-forest" href={resetUrl}>
            {resetUrl}
          </a>
        ) : null}
        <Field label="Email">
          <input className={controlClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Button type="submit">Send reset link</Button>
        <Link to="/login" className="text-sm text-forest">
          Back to sign in
        </Link>
      </form>
    </Frame>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/auth/reset", { method: "POST", body: { token: params.get("token"), password } });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password");
    }
  }

  return (
    <Frame title="Choose a new password." text="Use at least 8 characters. Then sign in with it.">
      <form onSubmit={submit} className="grid gap-4">
        {error ? <Banner tone="bad">{error}</Banner> : null}
        <Field label="New password">
          <input className={controlClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        <Button type="submit">Update password</Button>
      </form>
    </Frame>
  );
}
