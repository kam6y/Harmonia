import Header from "@/components/common/HeaderBase";

const MenuItems = [
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

export default function ManagerHeader({ showNav = true, showTenantName = false }) {
  return (
    <Header 
      UserRole="" 
      menuItems={MenuItems} 
      bgColor="bg-brand-cyan" 
      showNav={showNav} 
      showTenantName={showTenantName} 
      iconPath="/manager/dashboard_survey"
      notifications={notifications}
    />
  );
}