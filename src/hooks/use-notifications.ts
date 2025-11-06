/**
 * use-notifications.ts
 *
 * Hook for Web Notifications API
 * Requests permission and provides notify function
 */

"use client";

import { useState, useEffect, useCallback } from "react";

type NotificationPermission = "default" | "granted" | "denied";

interface UseNotificationsReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  notify: (title: string, body?: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission>(() =>
    isSupported
      ? (Notification.permission as NotificationPermission)
      : "default"
  );

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        console.warn("[notifications] Not supported in this browser");
        return "denied";
      }

      if (Notification.permission === "granted") {
        return "granted";
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result as NotificationPermission);
        return result as NotificationPermission;
      } catch (error) {
        console.error("[notifications] Permission request failed:", error);
        return "denied";
      }
    }, [isSupported]);

  const notify = useCallback(
    (title: string, body?: string, options?: NotificationOptions) => {
      if (!isSupported) {
        console.warn("[notifications] Not supported");
        return;
      }

      if (Notification.permission !== "granted") {
        console.warn("[notifications] Permission not granted");
        return;
      }

      try {
        new Notification(title, {
          body,
          icon: "/icon-192.png", // Adjust to your app icon
          badge: "/icon-192.png",
          ...options,
        });
      } catch (error) {
        console.error("[notifications] Failed to create notification:", error);
      }
    },
    [isSupported]
  );

  return {
    permission,
    requestPermission,
    notify,
    isSupported,
  };
}
