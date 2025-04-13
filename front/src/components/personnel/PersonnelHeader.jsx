import Header from "@/components/common/HeaderBase";

const menuItems = [
  { label: "組織メンバー", href: "/personnel/organization_members" },
  { label: "組織構造", href: "/personnel/organization_structure" }, 
  { label: "サーベイ設定", href: "/personnel/settings" },
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
  // ... 他の通知データ
];

export default function PersonnelHeader({ showNav = true, showTenantName = false }) {
  return (
    <Header 
      UserRole="人事部" 
      menuItems={menuItems} 
      bgColor="bg-brand-darkBlue" 
      showNav={showNav} 
      showTenantName={showTenantName}
      iconPath="/personnel/dashboard"
      notifications={notifications}
    />
  );
}