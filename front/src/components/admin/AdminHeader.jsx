import Header from "@/components/common/HeaderBase";

const MenuItems = [
  { label: "テナント一覧", href: "/admin/tenants" },
  { label: "サーベイ設定", href: "/admin/settings" },
];

// 通知のダミーデータ
const notifications = [
  {
    id: 1,
    userImg: "/images/user1.jpg",
    tenantName: "株式会社○○",
    department: "営業部 営業課",
    title: "施策○○",
    comment: "やり方がわからないです",
    time: "2025-03-07 14:30:00",
    replied: false,
  },
  {
    id: 2,
    userImg: "/images/user2.jpg",
    tenantName: "株式会社△△",
    department: "マーケティング部",
    title: "キャンペーン戦略",
    comment: "このアイデアどう思いますか？",
    time: "2025-03-06 10:15:00",
    replied: false,
  },
  // ... 他の通知データ
];

export default function AdminHeader({ showNav = true, showTenantName = true }) {
  return (
    <Header 
      UserRole="管理者" 
      menuItems={MenuItems} 
      bgColor="bg-brand-teal" 
      showNav={showNav} 
      showTenantName={showTenantName} 
      iconPath="/admin/tenants"
      notifications={notifications}
    />
  );
}