'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bot, Map, Fish, Route, CloudSun, Waves,
  AlertTriangle, Settings, ChevronLeft, ChevronRight,
  Menu, X, Database, Info, Anchor, Ship, AlertOctagon, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOSEmergencyModal } from '@/components/cards/SOSEmergencyModal';
import { useSelectedLanguage, t } from '@/lib/language-store';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
  { href: '/map', label: 'Marine Map', icon: Map },
  { href: '/fishing-zones', label: 'Fishing Zones', icon: Fish },
  { href: '/routes', label: 'Safe Routes', icon: Route },
  { href: '/weather', label: 'Weather', icon: CloudSun },
  { href: '/ocean', label: 'Ocean Data', icon: Waves },
  { href: '/vessels', label: 'Vessels', icon: Ship },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
];

const BOTTOM_ITEMS = [
  { href: '/login', label: 'Account / Firebase', icon: User },
  { href: '/data-sources', label: 'Data Sources', icon: Database },
  { href: '/about', label: 'About', icon: Info },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const language = useSelectedLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const isActive = (href: string) => pathname === href;

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
        isActive(item.href)
          ? 'bg-teal-500/15 text-teal-300'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      )}
    >
      {isActive(item.href) && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-teal-400 rounded-r-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <item.icon className={cn('w-5 h-5 shrink-0', isActive(item.href) ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300')} />
      {!collapsed && (
        <span className="truncate">{t(item.label, language)}</span>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <Anchor className="w-5 h-5 text-navy-950" />
          </div>
          <span className="text-lg font-bold text-white">JalSaathi</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSOS(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 animate-pulse border border-red-400/30"
          >
            <AlertOctagon className="w-4 h-4 text-white" />
            <span>SOS</span>
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-navy-900 border-r border-navy-700/40 flex flex-col overflow-y-auto"
          >
            <div className="p-4 flex items-center gap-3 border-b border-navy-700/30">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <Anchor className="w-6 h-6 text-navy-950" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">JalSaathi</h1>
                <p className="text-[10px] text-teal-400/70 tracking-wider uppercase">Ocean Intelligence</p>
              </div>
            </div>

            <div className="p-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setShowSOS(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 border border-red-400/30 animate-pulse"
              >
                <AlertOctagon className="w-4 h-4 text-white" />
                <span>{t('EMERGENCY SOS')}</span>
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>
            <div className="p-3 border-t border-navy-700/30 space-y-1">
              {BOTTOM_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-navy-700/30 bg-navy-900/80 backdrop-blur-xl transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        {/* Logo */}
        <div className={cn('p-4 flex items-center border-b border-navy-700/20', collapsed ? 'justify-center' : 'gap-3')}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0 glow-teal">
              <Anchor className="w-6 h-6 text-navy-950" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">JalSaathi</h1>
                <p className="text-[10px] text-teal-400/70 tracking-wider uppercase">Ocean Intelligence</p>
              </div>
            )}
          </Link>
        </div>

        {/* SOS Emergency persistent button in sidebar */}
        <div className="p-3 pb-1">
          <button
            onClick={() => setShowSOS(true)}
            title="EMERGENCY SOS DISTRESS"
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 border border-red-400/40 glow-danger animate-pulse',
              collapsed && 'justify-center px-0'
            )}
          >
            <AlertOctagon className="w-5 h-5 shrink-0 text-white" />
            {!collapsed && <span className="truncate tracking-wider uppercase">{t('EMERGENCY SOS')}</span>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? t(item.label) : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                collapsed && 'justify-center',
                isActive(item.href)
                  ? 'bg-teal-500/15 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              {isActive(item.href) && (
                <motion.div
                  layoutId="desktopActiveNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-teal-400 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn('w-5 h-5 shrink-0', isActive(item.href) ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {!collapsed && <span className="truncate">{t(item.label, language)}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-navy-700/20 space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? t(item.label, language) : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200',
                collapsed && 'justify-center',
                isActive(item.href)
                  ? 'bg-teal-500/15 text-teal-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{t(item.label, language)}</span>}
            </Link>
          ))}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 w-full transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Bottom mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-navy-700/30 px-2 py-1 flex items-center justify-around">
        {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[8]].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors min-w-[48px]',
              isActive(item.href) ? 'text-teal-400' : 'text-slate-500'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{t(item.label.split(' ')[0])}</span>
          </Link>
        ))}
      </nav>

      {/* Emergency SOS Modal */}
      <SOSEmergencyModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
      />
    </>
  );
}
