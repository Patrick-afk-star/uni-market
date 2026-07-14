import { useState, useEffect } from "react";
import { Bell, Settings, Info, CheckCircle, AlertTriangle, Check, Trash2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import type { AppNotification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function NotificationsView() {
  const [activeTab, setActiveTab] = useState<"Recent" | "All">("Recent");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuth();

  const fetchNotifications = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const endpoint = activeTab === "Recent" ? "/api/v1/notifications/?filter=recent" : "/api/v1/notifications/";
      const res = await fetch(getApiUrl(endpoint), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, accessToken]);

  const handleMarkAllAsRead = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(getApiUrl("/api/v1/notifications/read-all"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all as read");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(getApiUrl(`/api/v1/notifications/${id}/`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_read: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } else {
        toast.error("Failed to mark as read");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(getApiUrl(`/api/v1/notifications/${id}/`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok || res.status === 204) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "alert":
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-[#bb740a]" />;
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your notifications
          </p>
        </div>
        <Button
          disabled
          className="shrink-0 bg-[#bb740a]/50 text-white/50 font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-none cursor-not-allowed"
        >
          <Settings className="w-4 h-4" />
          Configure Preferences
        </Button>
      </div>

      {/* Tabs & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex bg-[#1a1a1a] p-1 rounded-xl w-fit">
          {(["Recent", "All"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#2a2a2a] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#2a2a2a]/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-white/[0.06]"
          >
            <CheckSquare className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#bb740a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 flex gap-4 group ${
                !notification.is_read
                  ? "bg-[#1a1a1a] border-[#bb740a]/30 shadow-[0_4px_24px_-8px_rgba(187,116,10,0.15)]"
                  : "bg-[#121212] border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  !notification.is_read ? "bg-[#bb740a]/10" : "bg-white/[0.04]"
                }`}
              >
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h4 className={`text-base font-medium truncate ${!notification.is_read ? "text-foreground" : "text-foreground/80"}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm mt-1 line-clamp-2 ${!notification.is_read ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                  {notification.message}
                </p>
              </div>
              
              <div className="flex items-center self-center shrink-0 ml-2 gap-2">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-[#bb740a] hover:bg-[#bb740a]/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {!notification.is_read && (
                  <div className="flex items-center ml-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#bb740a] shadow-[0_0_8px_rgba(187,116,10,0.6)]"></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl bg-[#121212] border border-white/[0.06] text-center min-h-[260px]">
          <Bell className="w-10 h-10 text-muted-foreground/40 mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-foreground/80 mb-2">
            No {activeTab.toLowerCase()} notifications found
          </h3>
          <p className="text-sm text-muted-foreground">
            Your notifications will appear here when they arrive
          </p>
        </div>
      )}
    </div>
  );
}
