import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { useAuth } from "./lib/auth";
import { Forgot, Login, ResetPassword, Signup } from "./pages/AuthPages";
import { Dashboard } from "./pages/Dashboard";
import { Insights } from "./pages/Insights";
import { Landing } from "./pages/Landing";
import { Pantry } from "./pages/Pantry";
import { EditProduct, NewProduct, ProductDetail } from "./pages/ProductPages";
import { Profile } from "./pages/Profile";
import { Recipes } from "./pages/Recipes";
import { Scan } from "./pages/Scan";
import { Shopping } from "./pages/Shopping";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-dvh place-items-center text-muted">Opening your pantry…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pantry" element={<Pantry />} />
        <Route path="pantry/new" element={<NewProduct />} />
        <Route path="pantry/:id" element={<ProductDetail />} />
        <Route path="pantry/:id/edit" element={<EditProduct />} />
        <Route path="scan" element={<Scan />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="shopping" element={<Shopping />} />
        <Route path="insights" element={<Insights />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
