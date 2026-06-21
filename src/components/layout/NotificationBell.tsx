"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2, TriangleAlert, Info, PartyPopper, X } from "lucide-react";
import { ClientNotification } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

const TYPE_ICON: Record<string, { icon: typeof Info; tone: string }> = {
  budget_warning: { icon: TriangleAlert, tone: "text-gold-600 bg-gold-100" },
  budget_exceeded: { icon: TriangleAlert, tone: "text-coral-600 bg-coral-100" },
  welcome: { icon: PartyPopper, tone: "text-sage-600 bg-sage-100" },
  info: { icon: Info, tone: "text-sage-600 bg-sage-100" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await apiFetch<{ notifications: ClientNotification[]; unreadCount: number }>(
      "/api/notifications"
    );
    if (res.ok && res.data) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await apiFetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  async function removeOne(id: string) {
    const wasUnread = notifications.find((n) => n.id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await apiFetch("/api/notifications/read-all", { method: "POST" });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-sage-50 hover:text-ink transition-colors"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-paper-raised shadow-xl z-50 bw-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-paper-raised">
            <h3 className="font-display text-sm font-semibold text-ink">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-sage-600 hover:text-sage-700"
                >
                  Tout marquer lu
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-ink-soft hover:text-ink lg:hidden"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-soft">
              Aucune notification pour le moment.
            </div>
          ) : (
            <ul>
              {notifications.map((n) => {
                const conf = TYPE_ICON[n.type] || TYPE_ICON.info;
                const Icon = conf.icon;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b border-line/60 last:border-0",
                      !n.read && "bg-sage-50/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        conf.tone
                      )}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-ink-soft/70 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          aria-label="Marquer comme lu"
                          className="text-ink-soft hover:text-sage-600"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => removeOne(n.id)}
                        aria-label="Supprimer"
                        className="text-ink-soft hover:text-coral-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
