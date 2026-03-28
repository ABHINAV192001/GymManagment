"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { logout } from "@/lib/api";
import { FaUserCircle, FaSignOutAlt, FaTimes, FaBars, FaBell, FaExclamationCircle, FaClock, FaEnvelope } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { getProfile } from "@/lib/api/user";
import { getNotifications, getUnreadCount, markAsRead } from "@/lib/api/chat";
import { initStomp, subscribeToTopic } from "@/lib/socket";
import { getSession, voteSession } from "@/lib/api/sessions";
import { USER_NAV_LINKS } from "@/constants/navigation";

export default function Navbar({ links, profileLink = "/profile/edit", homeLink = "/" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();

  // State for Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAllNotificationsOpen, setIsAllNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Responsive State (JS-based failsafe)
  const [isDesktop, setIsDesktop] = useState(true);

  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notification Detail State
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Detect Screen Size & Fetch Profile
  useEffect(() => {
    setMounted(true);
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);

    const fetchInitialData = async () => {
      try {
        const userProfile = await getProfile();
        setProfile(userProfile);
        if (userProfile) {
          const [notifs, count] = await Promise.all([
            getNotifications(userProfile.username),
            getUnreadCount(userProfile.username)
          ]);
          setNotifications(notifs);
          setUnreadCount(count);

          // WebSocket Subscription
          initStomp(() => {
            subscribeToTopic(`/topic/notifications/${userProfile.username}`, (newNotif) => {
              setNotifications(prev => [newNotif, ...prev]);
              setUnreadCount(prev => prev + 1);
            });
          });
        }
      } catch (err) {
        console.error("Navbar data fetch failed", err);
      }
    };
    fetchInitialData();

    // Click outside listener
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('resize', checkSize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ensure only one card is open
  useEffect(() => {
    if (isNotificationsOpen) {
      setIsProfileMenuOpen(false);
      window.dispatchEvent(new CustomEvent('closeChatWidget'));
    }
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (isProfileMenuOpen) {
      setIsNotificationsOpen(false);
      window.dispatchEvent(new CustomEvent('closeChatWidget'));
    }
  }, [isProfileMenuOpen]);

  // Handle opening chat (listener for other components)
  useEffect(() => {
    const handleCloseAll = () => {
      setIsNotificationsOpen(false);
      setIsProfileMenuOpen(false);
    };
    window.addEventListener('closeNavbarCards', handleCloseAll);
    return () => window.removeEventListener('closeNavbarCards', handleCloseAll);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/auth/login');
  };

  const handleNotificationClick = async (notif, closePanelsCallback) => {
    console.log("Notification clicked:", notif);

    // 1. Mark as read immediately for better UX
    if (!notif.isRead) {
      try {
        markAsRead(notif.id).catch(err => console.error("Async markAsRead failed", err));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read local state", err);
      }
    }

    // 2. Handle Routing vs Modal
    if (notif.type === 'SESSION') {
      try {
        const sessionId = notif.actionLink?.split('/').pop();
        console.log("Extracted Session ID:", sessionId);

        if (sessionId && !isNaN(sessionId)) {
          // Open modal first with notification content as placeholder if possible
          setSelectedSession({
            sessionType: notif.type,
            description: notif.content,
            loading: true
          });
          setIsDetailModalOpen(true);
          if (closePanelsCallback) closePanelsCallback();

          const session = await getSession(sessionId);
          if (session) {
            console.log("Fetched Session Details:", session);
            setSelectedSession(session);
          } else {
            console.warn("Session not found for ID:", sessionId);
            // If session not found, we still show the notification content in the modal
            setSelectedSession({
              sessionType: notif.type,
              description: notif.content,
              isError: true
            });
          }
        } else {
          console.log("No valid session ID found, redirecting to:", notif.actionLink);
          if (notif.actionLink) router.push(notif.actionLink);
          if (closePanelsCallback) closePanelsCallback();
        }
      } catch (err) {
        console.error("Failed to fetch session details", err);
        if (notif.actionLink) router.push(notif.actionLink);
        if (closePanelsCallback) closePanelsCallback();
      }
    } else {
      // For other types, show a simple info modal or redirect
      console.log("Non-session notification, redirecting...");
      if (notif.actionLink) {
        router.push(notif.actionLink);
      } else {
        // Just show info if no link
        setSelectedSession({
          sessionType: notif.type,
          description: notif.content,
          sessionTime: new Date(notif.createdAt).toLocaleTimeString()
        });
        setIsDetailModalOpen(true);
      }
      if (closePanelsCallback) closePanelsCallback();
    }
  };

  const handleVote = async (sessionId, vote) => {
    setIsVoting(true);
    try {
      await voteSession(sessionId, vote, profile?.username);
      // Update local state if needed, or just close and refresh
      setIsDetailModalOpen(false);
      alert(`You've marked yourself as ${vote === 'IN' ? 'GOING' : 'NOT GOING'}.`);
    } catch (err) {
      console.error("Voting failed", err);
      alert("Failed to record vote.");
    } finally {
      setIsVoting(false);
    }
  };

  const navLinks = links || USER_NAV_LINKS;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/90 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto h-[80px] px-6 flex items-center justify-between">

          {/* LOGO */}
          <Link href={homeLink} className="text-2xl font-extrabold tracking-wider text-black dark:text-white hover:opacity-80 transition-opacity">
            GYM<span className="text-lime-600 dark:text-lime-500">bross</span>
          </Link>

          {/* DESKTOP NAV - Render only if Desktop */}
          {mounted && isDesktop && (
            <ul className="flex items-center gap-6 ml-auto mr-8" data-testid="desktop-menu">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-200 
                  ${pathname === link.href
                        ? "text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-900/20"
                        : "text-slate-800 dark:text-slate-200 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-slate-50 dark:hover:bg-neutral-800"
                      }`}
                  >
                    {link.icon && <span className="text-lg">{link.icon}</span>}
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* ACTIONS (Theme + Profile) - Render only if Desktop */}
          {mounted && isDesktop && (
            <div className="flex items-center gap-4">



              {/* NOTIFICATIONS */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors relative"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <FaBell className="text-xl text-slate-700 dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900 text-[8px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={profileRef}>
                <button
                  className="text-3xl text-slate-700 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  suppressHydrationWarning
                >
                  <FaUserCircle />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-[120%] right-0 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-neutral-700 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                    <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:text-lime-700 dark:hover:text-lime-400 transition-colors">Home</Link>
                    <Link href="/whats-new" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:text-lime-700 dark:hover:text-lime-400 transition-colors">Whats New</Link>
                    <Link href="/user/profile" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:text-lime-700 dark:hover:text-lime-400 transition-colors">My Account</Link>

                    <div className="h-px bg-gray-100 dark:bg-neutral-700 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOBILE TOGGLES - Render only if NOT Desktop */}
          {mounted && !isDesktop && (
            <div className="flex items-center gap-4">


              <button
                className="text-2xl text-slate-800 dark:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU */}
        <div className={`fixed inset-x-0 top-[80px] bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 shadow-xl transition-all duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}>
          <ul className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-lg font-bold uppercase tracking-wide 
                  ${pathname === link.href
                      ? "text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-900/20"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <div className="h-px bg-gray-100 dark:bg-neutral-800 my-2"></div>
            <li><Link href="/" className="block px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-lime-600" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            <li><Link href="/user/profile" className="block px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-lime-600" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link></li>

            <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 font-medium">Logout</button></li>
          </ul>
        </div>
      </nav>

      {/* CENTERED NOTIFICATIONS LIST MODAL */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <FaBell className="text-[var(--primary)]" /> Notifications
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-lime-600 dark:text-lime-500 font-black uppercase tracking-widest cursor-pointer hover:opacity-70 transition">Mark all read</span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="max-h-[60dvh] overflow-y-auto p-2">
              {notifications.length > 0 ? notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-all border-b border-gray-50 dark:border-white/5 last:border-0 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => handleNotificationClick(notif, () => setIsNotificationsOpen(false))}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${notif.type === 'SESSION' ? 'bg-purple-100 text-purple-500 dark:bg-purple-900/30' :
                      notif.type === 'MESSAGE' ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30' :
                        'bg-red-100 text-red-500 dark:bg-red-900/30'
                      }`}>
                      {notif.type === 'SESSION' ? <FaClock className="text-xl" /> : notif.type === 'MESSAGE' ? <FaEnvelope className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-base ${!notif.isRead ? 'font-black' : 'font-bold'} text-slate-800 dark:text-slate-200 uppercase tracking-tight`}>{notif.type}</p>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">{notif.content}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBell className="text-slate-300 dark:text-slate-700 text-2xl" />
                  </div>
                  <p className="text-slate-400 font-medium italic">No new notifications</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-center">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-sm font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION DETAIL MODAL */}
      {isDetailModalOpen && selectedSession && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <FaClock className="text-purple-500" /> Session Detail
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {selectedSession.loading ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Fetching Details...</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-800/50">
                      {selectedSession.sessionPeriod || 'INFO'} {selectedSession.sessionType || ''}
                    </span>
                    <h3 className="mt-4 text-3xl font-black text-slate-800 dark:text-white leading-tight">
                      {selectedSession.sessionType}
                    </h3>
                    {(selectedSession.sessionTime || selectedSession.isError) && (
                      <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                        {selectedSession.isError ? "Full details unavailable" : `Scheduled for ${selectedSession.sessionTime}`}
                      </p>
                    )}
                    {selectedSession.sessionDate && (
                      <p className="text-xs text-slate-400 mt-1 font-bold italic">
                        Date: {selectedSession.sessionDate}
                      </p>
                    )}
                  </div>

                  {selectedSession.description && (
                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "{selectedSession.description}"
                      </p>
                    </div>
                  )}

                  {selectedSession.pollEnabled ? (
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-black uppercase tracking-tighter text-slate-500">Live Participation</p>
                        <p className="text-xs font-bold text-slate-400">{selectedSession.inCount + selectedSession.outCount} Responses</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          disabled={isVoting}
                          onClick={() => handleVote(selectedSession.id, 'IN')}
                          className="group flex flex-col items-center gap-2 p-4 bg-lime-50 dark:bg-lime-900/20 hover:bg-lime-100 dark:hover:bg-lime-900/40 border border-lime-200 dark:border-lime-700/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">✅</span>
                          <span className="text-xs font-black text-lime-700 dark:text-lime-400 uppercase">I'm Going</span>
                          <span className="text-lg font-black text-lime-800 dark:text-lime-200">{selectedSession.inCount}</span>
                        </button>
                        <button
                          disabled={isVoting}
                          onClick={() => handleVote(selectedSession.id, 'OUT')}
                          className="group flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-700/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">❌</span>
                          <span className="text-xs font-black text-red-700 dark:text-red-400 uppercase">Not Today</span>
                          <span className="text-lg font-black text-red-800 dark:text-red-200">{selectedSession.outCount}</span>
                        </button>
                      </div>
                    </div>
                  ) : selectedSession.isError && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl text-center">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">This session may have been updated or removed.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-center">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                Close Detail View
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-in {
            animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
