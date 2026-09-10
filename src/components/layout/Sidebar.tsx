'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bot, Map, Fish, Route, CloudSun, Waves,
  AlertTriangle, Settings, ChevronLeft, ChevronRight, Brain,
  Menu, X, Database, Info, Anchor, Ship, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PitchDeckDemoModal } from '@/components/cards/PitchDeckDemoModal';

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
  { href: '/intelligence', label: 'ORCA Intelligence', icon: Brain },
];

import { User } from 'lucide-react';
import { useSettings } from '@/lib/settings-store';
import { t } from '@/lib/i18n-engine';

const BOTTOM_ITEMS = [
  { href: '/login', label: 'Account / Firebase', icon: User },
  { href: '/data-sources', label: 'Data Sources', icon: Database },
  { href: '/about', label: 'About', icon: Info },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const { settings } = useSettings();

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
        <span className="truncate">{t(item.label, settings.language)}</span>
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
          <span className="text-lg font-bold text-white">ORCA</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-navy-900 border-r border-navy-700/40 flex flex-col"
          >
            <div className="p-4 flex items-center gap-3 border-b border-navy-700/30 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <Anchor className="w-6 h-6 text-navy-950" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">ORCA</h1>
                <p className="text-[10px] text-teal-400/70 tracking-wider uppercase">Ocean Intelligence</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
              </nav>
              <div className="pt-2 border-t border-navy-700/30 space-y-1">
                {BOTTOM_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
              </div>
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
        <div className={cn('p-3.5 px-4 flex items-center border-b border-navy-700/20 shrink-0', collapsed ? 'justify-center' : 'gap-3')}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0 glow-teal">
              <Anchor className="w-5 h-5 text-navy-950" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-none">ORCA</h1>
                <p className="text-[9px] text-teal-400/80 tracking-wider uppercase font-semibold mt-0.5">Ocean Intelligence</p>
              </div>
            )}
          </Link>
        </div>

        {/* Unified Scrollable Center: All primary nav and secondary links in a single fluid container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2 space-y-2.5">
          {/* Primary Nav */}
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? t(item.label, settings.language) : undefined}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group relative',
                  collapsed && 'justify-center px-2',
                  isActive(item.href)
                    ? 'bg-teal-500/15 text-teal-300 font-semibold shadow-sm shadow-teal-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                {isActive(item.href) && (
                  <motion.div
                    layoutId="desktopActiveNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive(item.href) ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300')} />
                {!collapsed && <span className="truncate">{t(item.label, settings.language)}</span>}
              </Link>
            ))}
          </nav>

          {/* Secondary Preferences & System Links */}
          <div className="border-t border-navy-700/30 pt-2 space-y-0.5">
            {BOTTOM_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? t(item.label, settings.language) : undefined}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group relative',
                  collapsed && 'justify-center px-2',
                  isActive(item.href)
                    ? 'bg-teal-500/15 text-teal-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                {isActive(item.href) && (
                  <motion.div
                    layoutId="desktopActiveBottom"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive(item.href) ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300')} />
                {!collapsed && <span className="truncate">{t(item.label, settings.language)}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Pinned Bottom Controls (Pitch deck & Collapse) */}
        <div className="p-2.5 border-t border-navy-700/30 bg-navy-950/40 shrink-0 space-y-1">
          <button
            onClick={() => setShowPitchDeck(true)}
            title="SIH Pitch Deck & Demo Mode"
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 text-teal-300 border border-teal-500/30 cursor-pointer',
              collapsed && 'justify-center px-1'
            )}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            {!collapsed && <span className="truncate">{t('SIH Pitch Deck', settings.language)}</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 w-full transition-all cursor-pointer',
              collapsed && 'justify-center px-1'
            )}
            title={collapsed ? t('Expand', settings.language) || 'Expand' : undefined}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            {!collapsed && <span>{t('Collapse', settings.language)}</span>}
          </button>
        </div>
      </aside>

      {/* Pitch Deck Modal */}
      <PitchDeckDemoModal
        isOpen={showPitchDeck}
        onClose={() => setShowPitchDeck(false)}
      />
    </>
  );
}
