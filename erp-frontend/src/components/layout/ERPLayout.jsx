import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Tag, ShoppingBag, Users,
  Boxes, Truck, ShoppingCart, Coins, Navigation, BarChart3,
  UserCheck, Settings, LogOut, Menu, X, ChevronRight, ShieldCheck, User,
  Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ERPLayout = () => {
  const { user, logout, isSuperAdmin, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    { label: 'Products', path: '/products', icon: Package, module: 'products' },
    { label: 'Categories', path: '/categories', icon: FolderTree, module: 'categories' },
    { label: 'Promotions', path: '/promotions', icon: Tag, module: 'promotions' },
  ];

  const filteredNav = navItems.filter((item) => {
    if (item.adminOnly && !isSuperAdmin) return false;
    return hasPermission(item.module);
  });

  const getPageTitle = () => {
    const active = navItems.find((item) => location.pathname.startsWith(item.path));
    return active ? active.label : 'ERP Management';
  };

  return (
    <div className="min-h-screen flex bg-white text-black antialiased">

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 bg-[#F8F1E5] text-black flex flex-col justify-between
          border-r border-[#EFE5D5] transition-all duration-300 ease-in-out shadow-xs
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        <div>
          {/* LOGO & BRAND HEADER */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#EFE5D5] bg-[#F8F1E5]">
            <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EFE5D5] text-black flex items-center justify-center font-serif font-bold text-sm tracking-wider shrink-0 shadow-2xs group-hover:border-[#C99A35] transition-colors">
                <span className="text-black font-serif">R</span>
                <span className="text-[#C99A35] font-serif">B</span>
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h1 className="font-serif text-sm tracking-widest font-bold uppercase truncate text-black">
                    RAJ BARATHAM
                  </h1>
                  <span className="text-[10px] uppercase tracking-wider text-[#C99A35] font-semibold block">
                    Enterprise ERP
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-black hover:bg-[#F3EBDD] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* NAVIGATION ITEMS */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-[#F6E2B5] text-black font-bold shadow-2xs border-l-4 border-[#C99A35]'
                        : 'text-[#333333] hover:bg-[#F3EBDD] hover:text-black'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 text-black`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C99A35]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE & LOGOUT */}
        <div className="p-3 border-t border-[#EFE5D5] bg-[#F8F1E5]">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white/70 border border-[#EFE5D5]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#F6E2B5] border border-[#C99A35] text-black flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {user?.username?.charAt(0) || 'A'}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-black truncate">
                    {user?.full_name || user?.username}
                  </p>
                  <span className="text-[10px] text-[#C99A35] font-semibold uppercase tracking-wider block truncate">
                    {user?.role?.replace('_', ' ') || 'Staff'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-black hover:text-[#C99A35] hover:bg-[#F3EBDD] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA (PURE WHITE WORKSPACE) */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 bg-white
          ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#EFE5D5] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#EFE5D5] text-black hover:bg-[#F8F1E5] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-xl border border-[#EFE5D5] text-black hover:bg-[#F8F1E5] transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline font-medium text-[#333333]">RAJ BARATHAM NEEDS</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C99A35] hidden sm:inline" />
              <span className="font-bold text-black uppercase tracking-wider">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ROLE BADGE */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F1E5] border border-[#EFE5D5] text-xs font-semibold text-black">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C99A35]" />
              <span>{user?.role?.replace('_', ' ') || 'ADMINISTRATOR'}</span>
            </div>

            {/* LIVE STOREFRONT SHORTCUT */}
            <a
              href={import.meta.env.VITE_STOREFRONT_URL || 'https://rajbarathamneeds-demo-1.onrender.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE5D5] text-xs font-semibold text-black hover:bg-[#F8F1E5] hover:text-[#C99A35] transition-all"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-[#C99A35]" />
            </a>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-white">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default ERPLayout;
