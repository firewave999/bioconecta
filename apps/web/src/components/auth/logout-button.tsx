"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { apiRequest, clearStoredTokens, getStoredRefreshToken } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const refreshToken = getStoredRefreshToken();

    try {
      if (refreshToken) {
        await apiRequest<{ success: boolean }, Record<string, unknown>>("/auth/logout", {
          refreshToken,
        });
      }
    } catch {
      // Local logout must still happen when the server is unavailable.
    } finally {
      clearStoredTokens();
      setLoading(false);
      router.push("/login");
    }
  }

  return (
    <Button disabled={loading} onClick={logout} type="button" variant="secondary">
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
