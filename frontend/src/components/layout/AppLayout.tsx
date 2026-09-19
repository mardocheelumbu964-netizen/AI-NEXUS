import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-col overflow-hidden lg:pl-[270px]">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main
          className={[
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden page-theme",
            `page-theme-${location.pathname.replace("/", "").replace("/", "-") || "dashboard"}`,
          ].join(" ")}
        >
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

