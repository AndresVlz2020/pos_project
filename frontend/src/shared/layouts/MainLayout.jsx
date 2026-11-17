import { Outlet } from "react-router-dom";
import AppShell from "./AppShell";

export function MainLayout() {
  return (
    <AppShell showFooter>
      <Outlet />
    </AppShell>
  );
}

export default MainLayout;
