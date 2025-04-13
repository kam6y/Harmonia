import { useState, useRef, useEffect } from "react";

// 時間を相対表示にするユーティリティ関数
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffSeconds = Math.floor((now - date) / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds}秒前`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分前`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}時間前`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)}日前`;
  if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)}ヶ月前`;
  return `${Math.floor(diffSeconds / 31536000)}年前`;
};

// 通知APIとの連携
const useNotification = (tenantId = 1) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  // 初期状態を 'manager' に設定
  const [userRole, setUserRole] = useState('manager');

  // ユーザーロールをローカルストレージから取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = window.localStorage.getItem('userRole');
      if (role) {
        setUserRole(role);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      // localStorage から部門IDを取得（なければ null）
      const departmentId = window.localStorage.getItem('department_id')
        ? parseInt(window.localStorage.getItem('department_id'), 10)
        : null;
  
      // APIリクエストに tenant_id と department_id、そして role を含める
      const response = await fetch('http://localhost/api/notifications/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenant_id: tenantId,
          department_id: departmentId,
          role: userRole // ユーザーロールをAPIに送信
        })
      });
      
      const data = await response.json();
      console.log("fetchNotifications API response:", data);
      
      if (data.success) {
        // APIから取得した通知をセット
        let filteredData = data.notifications || [];
        
        // クライアント側でもユーザーロールに基づくフィルタリングを行う
        filteredData = filteredData.filter(notif => {
          return (userRole === 'admin' && notif.mention_is_admin) ||
                 (userRole === 'personnel' && notif.mention_is_personnel) ||
                 (userRole === 'manager' && notif.mention_is_manager);
        });
        
        setNotifications(filteredData);
        
        // 未読通知のカウント
        const unreadCount = filteredData.filter(n => !n.replied).length;
        setUnreadCount(unreadCount);
      } else {
        throw new Error(data.message || '通知の取得に失敗しました');
      }
    } catch (err) {
      console.error("通知取得エラー:", err);
      setError(err.message || "通知の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // 1分ごとに通知を更新
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [tenantId, userRole]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('http://localhost/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });
      
      const data = await response.json();
      console.log("markAsRead API response:", data);
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, replied: true } : n)
        );
        
        // 既読にした通知が自分の役割に関連しているかチェック
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && (
          (userRole === 'admin' && notification.mention_is_admin) ||
          (userRole === 'personnel' && notification.mention_is_personnel) ||
          (userRole === 'manager' && notification.mention_is_manager)
        )) {
          setUnreadCount(prev => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error("既読更新エラー:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenant_id: tenantId,
          role: userRole
        })
      });
      
      const data = await response.json();
      console.log("markAllAsRead API response:", data);
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(n => {
            if ((userRole === 'admin' && n.mention_is_admin) ||
                (userRole === 'personnel' && n.mention_is_personnel) ||
                (userRole === 'manager' && n.mention_is_manager)) {
              return { ...n, replied: true };
            }
            return n;
          })
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("全既読更新エラー:", err);
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    userRole,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};

export default function NotificationWithDropdown({ showTenantName = true, defaultTenantId = 1 }) {
  const [tenantId, setTenantId] = useState(defaultTenantId);
  
  // localStorageからtenantIdを取得（あれば）
  useEffect(() => {
    const storedTenantId = window.localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(parseInt(storedTenantId, 10));
    }
  }, []);
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unreplied");
  const dropdownRef = useRef(null);

  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    userRole,
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotification(tenantId);

  // ユーザーロールに合わせた通知のみをフィルタリング
  const relevantNotifications = notifications.filter(notif => {
    return (userRole === 'admin' && notif.mention_is_admin) ||
           (userRole === 'personnel' && notif.mention_is_personnel) ||
           (userRole === 'manager' && notif.mention_is_manager);
  });

  // 未確認／すべてのタブでさらに既読・未読でフィルタリング
  const filteredNotifications =
    activeTab === "unreplied"
      ? relevantNotifications.filter(notif => !notif.replied)
      : relevantNotifications;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  // 通知クリック時の処理（リダイレクト先を変更）
  const handleNotificationClick = async (notificationId, targetId) => {
    await markAsRead(notificationId);
    if (targetId) {
      let basePath = '/personnel';
      if (userRole === 'manager') {
        basePath = '/manager';
      } else if (userRole === 'admin') {
        basePath = '/admin';
      }
      window.location.href = `${basePath}/dashboard_improvement?measureId=${targetId}`;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <li className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-white/20 rounded-full p-1 transition relative"
        aria-label="通知"
      >
        <img src="/images/notifications.svg" alt="Notifications" className="w-8 h-8 rounded-full" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-[35vw] bg-white shadow-lg rounded-lg p-3 text-black z-50">
          <h4 className="font-bold text-lg">通知一覧</h4>
          <div className="flex border-b w-1/2 mb-2">
            <button
              className={`flex-1 py-1 text-sm text-center ${activeTab === "unreplied" ? "border-b-2 border-brand-orange text-sm font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab("unreplied")}
            >
              未確認 ({unreadCount})
            </button>
            <button
              className={`flex-1 py-1 text-sm text-center ${activeTab === "all" ? "border-b-2 border-brand-orange text-sm font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab("all")}
            >
              すべて
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center p-4">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-brand-teal rounded-full"></div>
                <p className="text-gray-500 mt-2">読み込み中...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4">
                <p className="text-red-500">{error}</p>
                <button 
                  className="text-brand-teal text-sm mt-2 hover:underline"
                  onClick={fetchNotifications}
                >
                  再読み込み
                </button>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <ul className="mt-2">
                {filteredNotifications.map((notif, index) => (
                  <li
                    key={`${notif.id}-${index}`}
                    className="flex space-x-3 p-4 mr-2 rounded-lg hover:bg-gray-100 transition relative cursor-pointer"
                    onClick={() => handleNotificationClick(notif.id, notif.targetId)}
                  >
                    <img 
                      src={notif.userImg || "/images/Generic_avatar.svg"} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      {showTenantName && notif.tenantName && (
                        <p className="text-xs font-bold text-brand-teal">{notif.tenantName}</p>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold">{notif.department || notif.department_name}</p>
                          <p className="text-xs text-gray-600">{notif.title}</p>
                          <p className="text-xs text-gray-800 mt-1">{notif.comment}</p>
                          {notif.measure_text && (
                            <p className="text-xs text-brand-teal mt-1">施策: {notif.measure_text}</p>
                          )}
                        </div>
                        <span className="text-xs w-[4vw] text-gray-500 ml-2">{formatRelativeTime(notif.time)}</span>
                      </div>
                      
                      {(notif.mention_is_admin || notif.mention_is_manager || notif.mention_is_personnel) && (
                        <div className="mt-2 text-xs">
                          <span className="inline-flex items-center px-2 py-1 bg-brand-lightGray text-brand-darkBlue rounded-full">
                            {notif.mention_is_admin && (
                              <span className={`flex items-center ${userRole === 'admin' ? 'text-brand-teal font-semibold' : 'text-gray-500'}`}>
                                管理者向け
                              </span>
                            )}
                            {notif.mention_is_personnel && (
                              <span className={`flex items-center ${notif.mention_is_admin ? 'ml-1' : ''} ${userRole === 'personnel' ? 'text-brand-cyan font-semibold' : 'text-gray-500'}`}>
                                人事担当者向け
                              </span>
                            )}
                            {notif.mention_is_manager && (
                              <span className={`flex items-center ${(notif.mention_is_admin || notif.mention_is_personnel) ? 'ml-1' : ''} ${userRole === 'manager' ? 'text-brand-orange font-semibold' : 'text-gray-500'}`}>
                                管理職向け
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {notif.sender && (
                        <div className="mt-1 text-xs text-gray-500 flex items-center">
                          <span>送信者: {notif.sender.name}</span>
                        </div>
                      )}
                    </div>
                    {!notif.replied && (
                      <span className="absolute top-2 right-2 bg-brand-coral w-3 h-3 rounded-full"></span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-500">
                  {activeTab === "unreplied" ? "未確認の通知はありません" : "通知はありません"}
                </p>
              </div>
            )}
          </div>
          {unreadCount > 0 && activeTab === "unreplied" && (
            <div className="p-2 bg-gray-50 text-center mt-2 rounded">
              <button 
                className="text-sm text-brand-teal hover:text-brand-cyan transition"
                onClick={handleMarkAllAsRead}
              >
                すべて既読にする
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}