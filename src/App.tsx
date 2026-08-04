import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SignIn, useAuth } from "@/features/auth";
import Layout from "@/layout";
import HomePage from "@/pages/HomePage";
import ExhibitionsPage from "@/pages/ExhibitionsPage";

export default function App() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-600">
        Loading…
      </div>
    );
  }

  if (auth.status === "signed-out" || !auth.user) {
    return <SignIn onCredential={auth.applyToken} error={auth.error} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* key remounts the app if a different account signs in */}
        <Route
          element={<Layout user={auth.user} onSignOut={auth.signOut} key={auth.user.email} />}
        >
          <Route index element={<HomePage />} />
          <Route path="exhibitions" element={<ExhibitionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
