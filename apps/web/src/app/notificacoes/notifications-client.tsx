"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Notification = {
  actionUrl: string | null;
  createdAt: string;
  id: string;
  message: string;
  readAt: string | null;
  title: string;
  type: string;
};

type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};

export function NotificationsClient() {
  const [state, setState] = useState<NotificationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para ver suas notificacoes.");
      return;
    }

    apiFetch<NotificationsResponse>("/notifications/mine", { token })
      .then(setState)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar notificacoes."),
      );
  }

  async function markAllAsRead() {
    const token = getStoredAccessToken();

    if (!token) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiFetch<NotificationsResponse>("/notifications/read-all", {
        method: "PUT",
        token,
      });
      setState(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar notificacoes.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function markAsRead(notificationId: string) {
    const token = getStoredAccessToken();

    if (!token) {
      return;
    }

    setIsUpdating(true);
    try {
      await apiFetch<{ notification: Notification }>(`/notifications/${notificationId}/read`, {
        method: "PUT",
        token,
      });
      loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar a notificacao.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/login">Ir para login</Link>
        </Button>
      </div>
    );
  }

  if (!state) {
    return <p className="text-slate-600">Carregando notificacoes...</p>;
  }

  return (
    <section className="grid gap-4">
      <div className="soft-card flex flex-col gap-3 rounded-[8px] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Nao lidas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{state.unreadCount}</p>
        </div>
        <Button disabled={isUpdating || state.unreadCount === 0} onClick={markAllAsRead}>
          Marcar todas como lidas
        </Button>
      </div>

      {state.notifications.length ? (
        state.notifications.map((notification) => (
          <article
            className={`rounded-[8px] border p-5 ${
              notification.readAt ? "soft-card bg-white" : "border-cyan-200 bg-cyan-50"
            }`}
            key={notification.id}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  {formatDate(notification.createdAt)}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{notification.title}</h2>
                <p className="mt-2 text-slate-600">{notification.message}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {notification.actionUrl ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={notification.actionUrl}>Abrir</Link>
                  </Button>
                ) : null}
                {!notification.readAt ? (
                  <Button
                    disabled={isUpdating}
                    onClick={() => void markAsRead(notification.id)}
                    size="sm"
                  >
                    Marcar lida
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          description="Avisos de candidatura, retorno de empresa e atualizacoes importantes aparecerao aqui."
          title="Nenhuma notificacao por enquanto"
        />
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
