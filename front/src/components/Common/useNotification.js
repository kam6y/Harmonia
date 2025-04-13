// UseNotification.js
import { useState, useEffect } from "react";
import NotificationService from "./NotificationService"; // NotificationService のパスは適宜調整してください

export default function UseNotification(tenantId = 1) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // localStorage から "role" を取得し、JSON.parse() でパースして正しい文字列にする
  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("role");
        return stored ? JSON.parse(stored) : "manager";
      } catch (e) {
        console.error("role のパースエラー:", e);
        return "manager";
      }
    }
    return "manager";
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const notifs = await NotificationService.getNotifications(tenantId);
      
      // デバッグ用ログ：取得した role と各通知オブジェクトのフラグを確認
      console.log("現在の role:", role);
      console.log("取得した通知一覧:", notifs);

      const filteredNotifs = notifs.filter((n) => {
        // 各通知のフラグ情報を出力して、条件の確認をする
        console.log(
          "フィルタ前通知:",
          n.id,
          "管理者:",
          n.mention_is_admin,
          "管理職:",
          n.mention_is_manager,
          "人事:",
          n.mention_is_personnel
        );
        return (
          (role === "admin" && n.mention_is_admin) ||
          (role === "manager" && n.mention_is_manager) ||
          (role === "personnel" && n.mention_is_personnel)
        );
      });

      console.log("フィルタ後通知:", filteredNotifs);

      setNotifications(filteredNotifs);
      setUnreadCount(filteredNotifs.filter((n) => !n.replied).length);
    } catch (err) {
      setError("通知の取得に失敗しました");
      console.error("通知取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, replied: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("既読更新失敗:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, replied: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("全通知既読更新エラー:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [tenantId, role]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    role,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}