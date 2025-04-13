// src/components/common/HeaderBase.jsx
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { jost } from "@/styles/fonts";
import NotificationWithDropdown from "./NotificationWithDropdown";
import { UserIcon, LogoutIcon } from "@heroicons/react/outline";

export default function HeaderBase({
                                     UserRole,
                                     menuItems,
                                     bgColor = "bg-brand-teal",
                                     showTenantName = false,
                                     showNav = false,
                                     iconPath = "/",
                                     notifications = [],
                                   }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      router.push("/auth/login");
    } catch (err) {
      console.error("ログアウトに失敗しました:", err);
    }
  };

  return (
      <header
          className={`${jost.variable} ${bgColor} text-white h-12 px-4 flex justify-between items-center shadow-md fixed top-0 left-0 right-0 w-full z-50`}
      >
        {/* ロゴ＆UserName */}
          <div className="flex items-center cursor-pointer space-x-2">
            <h1 className="text-2xl font-extrabold">Harmonia</h1>
            <span className="text-sm font-semibold">{UserRole}</span>
          </div>

        {/* ナビゲーション */}
        {showNav && (
            <nav>
              <ul className="flex items-center space-x-6">
                {menuItems.map((item, i) => (
                    <li key={i}>
                        <Link href={item.href} passHref>
                          <span className="px-4 py-2 rounded-lg transition-all hover:bg-brand-orange hover:text-white hover:font-bold cursor-pointer">
                            {item.label}
                          </span>
                        </Link>
                    </li>
                ))}

                {/* 通知アイコン */}
                <NotificationWithDropdown
                    showTenantName={showTenantName}
                    notifications={notifications}
                />

                {/* ユーザーアイコン & ドロップダウン */}
                <li className="relative" ref={dropdownRef}>
                  <button
                      onClick={() => setIsOpen((o) => !o)}
                      className="hover:bg-white/20 rounded-full p-1 transition"
                  >
                    <img
                        src="/images/Generic_avatar.svg"
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                  </button>

                  {isOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10">
                        <ul className="divide-y divide-gray-100">
                          <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition text-red-600"
                            >
                              <span className="text-sm font-medium">ログアウト</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                  )}
                </li>
              </ul>
            </nav>
        )}
      </header>
  );
}
