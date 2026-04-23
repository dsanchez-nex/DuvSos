'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from '@/components/SidebarContext';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = React.useState<any>(null);
    const [expiringCount, setExpiringCount] = React.useState(0);

    const {
        isExpanded,
        isCollapsed,
        isMobileOverlayOpen,
        toggle,
        closeMobileOverlay,
    } = useSidebar();

    const toggleRef = useRef<HTMLButtonElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const firstFocusableRef = useRef<HTMLAnchorElement>(null);

    React.useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(res => res.ok ? res.json() : null),
            fetch('/api/checklists').then(res => res.ok ? res.json() : []),
        ]).then(([userData, checklists]) => {
            if (userData?.user) setUser(userData.user);
            const days = userData?.user?.checklistAlertDays ?? 3;
            if (days > 0) {
                const now = new Date();
                const list = Array.isArray(checklists) ? checklists : [];
                setExpiringCount(list.filter((c: any) => {
                    if (!c.endDate) return false;
                    const d = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / 86400000);
                    return d >= 0 && d <= days;
                }).length);
            }
        }).catch(err => console.error('Failed to fetch sidebar data', err));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        const baseClass = "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group whitespace-nowrap";
        const activeClass = "bg-primary/10 text-primary";
        const inactiveClass = "text-slate-500 hover:bg-primary/5 hover:text-primary";

        return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
    };

    // Focus trap for mobile overlay
    useEffect(() => {
        if (!isMobileOverlayOpen) return;

        const sidebar = sidebarRef.current;
        if (!sidebar) return;

        const focusableElements = sidebar.querySelectorAll<HTMLElement>(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        // Move focus to first element when overlay opens
        firstElement?.focus();

        sidebar.addEventListener('keydown', handleKeyDown);
        return () => sidebar.removeEventListener('keydown', handleKeyDown);
    }, [isMobileOverlayOpen]);

    // Return focus to toggle when mobile overlay closes
    useEffect(() => {
        if (!isMobileOverlayOpen) {
            toggleRef.current?.focus();
        }
    }, [isMobileOverlayOpen]);

    const handleBackdropClick = useCallback(() => {
        closeMobileOverlay();
    }, [closeMobileOverlay]);

    const handleToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    };

    const sidebarWidthClass = isExpanded ? 'w-64' : 'w-20';

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isMobileOverlayOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                id="main-sidebar"
                className={`
                    bg-white dark:bg-background-dark/50 border-r border-primary/10 flex flex-col py-8 fixed h-full z-40
                    ${isMobileOverlayOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${sidebarWidthClass}
                    transition-transform duration-300 ease-in-out
                    motion-reduce:transition-none
                `}
            >
                {/* Toggle Button */}
                <button
                    ref={toggleRef}
                    onClick={toggle}
                    onKeyDown={handleToggleKeyDown}
                    aria-expanded={isExpanded || isMobileOverlayOpen}
                    aria-controls="main-sidebar"
                    aria-label={isExpanded || isMobileOverlayOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    className="absolute -right-3 top-8 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 hidden lg:flex"
                >
                    <span className="material-symbols-outlined text-sm">
                        {isExpanded ? 'chevron_left' : 'chevron_right'}
                    </span>
                </button>

                {/* Logo */}
                <div className="px-6 mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                        <span className="material-symbols-outlined">grid_view</span>
                    </div>
                    <span className={`
                        text-xl font-bold text-slate-900 dark:text-white tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300
                        ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                    `}>
                        DuvSos
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full px-4 space-y-1 overflow-y-auto">
                    <Link href="/" className={getLinkClass('/')}
                        ref={pathname === '/' ? firstFocusableRef : undefined}>
                        <span className="material-symbols-outlined shrink-0">dashboard</span>
                        <span className={`
                            font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>Dashboard</span>
                    </Link>
                    <Link href="/todos" className={getLinkClass('/todos')}>
                        <span className="material-symbols-outlined shrink-0">check_circle</span>
                        <span className={`
                            font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>To-Do List</span>
                    </Link>
                    <Link href="/checklists" className={getLinkClass('/checklists')}>
                        <span className="material-symbols-outlined shrink-0">fact_check</span>
                        <span className={`
                            font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>Checklists</span>
                        {expiringCount > 0 && isExpanded && (
                            <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {expiringCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/finances" className={getLinkClass('/finances')}>
                        <span className="material-symbols-outlined shrink-0">payments</span>
                        <span className={`
                            font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>Finances</span>
                    </Link>
                    <Link href="/reminders" className={getLinkClass('/reminders')}>
                        <span className="material-symbols-outlined shrink-0">notifications_active</span>
                        <span className={`
                            font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>Reminders</span>
                    </Link>
                    <Link href="/habits" className={getLinkClass('/habits')}>
                        <span className="material-symbols-outlined shrink-0">routine</span>
                        <span className={`
                            font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>Habits</span>
                    </Link>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link href="/settings" className={getLinkClass('/settings')}>
                            <span className="material-symbols-outlined shrink-0">settings</span>
                            <span className={`
                                font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                                ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                            `}>Settings</span>
                        </Link>
                        <Link href="/support" className={getLinkClass('/support')}>
                            <span className="material-symbols-outlined shrink-0">help_outline</span>
                            <span className={`
                                font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                                ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                            `}>Support</span>
                        </Link>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="px-4 w-full mt-auto">
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src={user?.image || "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=random"}
                                alt="User Profile"
                                className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover shrink-0"
                            />
                            <div className={`
                                overflow-hidden transition-all duration-300
                                ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                            `}>
                                <p className="text-sm font-bold truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.tagline || "Productivity Enthusiast"}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Logout"
                            aria-label="Logout"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header Toggle */}
            <button
                onClick={toggle}
                onKeyDown={handleToggleKeyDown}
                aria-expanded={isMobileOverlayOpen}
                aria-controls="main-sidebar"
                aria-label={isMobileOverlayOpen ? 'Close sidebar' : 'Open sidebar'}
                className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-background-dark/80 border border-primary/10 rounded-lg shadow-sm lg:hidden"
            >
                <span className="material-symbols-outlined">{isMobileOverlayOpen ? 'close' : 'menu'}</span>
            </button>
        </>
    );
}
