import Header from "@/components/common/HeaderBase";

const MenuItems = [
];

export default function AuthHeader({ showNav = false, showTenantName = false }) {
  return (
    <Header 
      UserRole="" 
      menuItems={MenuItems} 
      bgColor="bg-brand-cyan" 
      showNav={showNav} 
      showTenantName={showTenantName} 
    />
  );
}