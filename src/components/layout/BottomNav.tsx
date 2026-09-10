'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Map, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useSelectedLanguage, t } from '@/lib/language-store';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Marine Map', icon: Map },
  { href: '/assistant', label: 'JalSaathi AI', icon: Bot },
  { href: '/login', label: 'Account', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const language = useSelectedLanguage();
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-navy-950/95 backdrop-blur-md border-t border-navy-700/50 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-teal-400 bg-teal-500/10 font-bold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {item.href === '/login' && user && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-navy-950" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {t(item.label, language).split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
