import React, { useState, useEffect } from "react";
import { 
  FileText, Mail, Calendar, Video, LayoutTemplate, 
  LogIn, LogOut, CheckCircle, RefreshCcw, LayoutDashboard, Search, ShieldAlert, FileSpreadsheet
} from "lucide-react";
import { GlobalState } from "../types";
import { initAuth, googleSignIn, logout, getAccessToken } from "../firebase";
import { User } from "firebase/auth";

interface WorkspacePageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "ws-1", label: "Overview", icon: LayoutDashboard },
  { id: "ws-2", label: "Gmail", icon: Mail },
  { id: "ws-3", label: "Calendar", icon: Calendar },
  { id: "ws-4", label: "Meet", icon: Video },
  { id: "ws-5", label: "Sheets & Slides", icon: FileText }
];

export default function WorkspacePage({ isDark, activeItemId = "ws-1", onSelectTab }: WorkspacePageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "ws-1";
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Data states
  const [emails, setEmails] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!needsAuth && token) {
      if (currentTab === "ws-1") {
        fetchEmails();
        fetchEvents();
        fetchDriveFiles();
      }
      if (currentTab === "ws-2") fetchEmails();
      if (currentTab === "ws-3") fetchEvents();
      if (currentTab === "ws-5") fetchDriveFiles();
    }
  }, [currentTab, needsAuth, token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchEmails = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.messages) {
        const fullMessages = await Promise.all(data.messages.map(async (m: any) => {
          const mRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return mRes.json();
        }));
        setEmails(fullMessages);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingData(false);
  };

  const fetchEvents = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const timeMin = new Date().toISOString();
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&orderBy=startTime&singleEvents=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data.items || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingData(false);
  };

  const fetchDriveFiles = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const query = encodeURIComponent("(mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.google-apps.presentation') and trashed=false");
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=8&fields=files(id,name,mimeType,webViewLink,modifiedTime,iconLink)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingData(false);
  };

  const createMeet = async () => {
    if (!token) return;
    try {
      const res = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.meetingUri) {
        window.open(data.meetingUri, '_blank');
      } else {
        console.error('Could not generate meeting link. Please check permissions.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const GoogleSignInButton = () => (
    <button onClick={handleLogin} disabled={isLoggingIn} className="gsi-material-button bg-white text-gray-600 border border-gray-300 rounded px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
      <span className="font-medium">{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
    </button>
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.spreadsheet') return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (mimeType === 'application/vnd.google-apps.presentation') return <LayoutTemplate className="w-5 h-5 text-yellow-500" />;
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace Integrations</h1>
          <p className="text-neutral-500 mt-1">Connect your Google Workspace accounts to manage data.</p>
        </div>
        <div className="flex items-center gap-4">
          {!needsAuth && user ? (
            <div className="flex items-center gap-3 bg-white dark:bg-[#15151a] border border-neutral-200 dark:border-white/10 px-4 py-2 rounded-xl">
              {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />}
              <div className="text-sm">
                <p className="font-medium">{user.displayName}</p>
                <p className="text-neutral-500 text-xs">{user.email}</p>
              </div>
              <button onClick={logout} className="ml-2 text-neutral-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton />
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-white/10">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-t-lg
                ${isActive 
                  ? "border-b-2 border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-500/10" 
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5 border-b-2 border-transparent"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {needsAuth ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0c0c11] border border-neutral-200 dark:border-white/10 rounded-2xl">
          <ShieldAlert className="w-16 h-16 text-orange-500 mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-neutral-500 text-center max-w-md mb-6">
            Please sign in with your Google account to access your Gmail, Calendar, Meet, Sheets, and Slides integrations.
          </p>
          <GoogleSignInButton />
        </div>
      ) : (
        <div className="space-y-6">
          {currentTab === "ws-1" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => onSelectTab && onSelectTab("ws-2")} className="p-6 bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Connected</span>
                  </div>
                  <h3 className="font-medium text-lg">Gmail</h3>
                  <p className="text-sm text-neutral-500 mt-1">Access and send emails</p>
                </div>
                <div onClick={() => onSelectTab && onSelectTab("ws-3")} className="p-6 bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Connected</span>
                  </div>
                  <h3 className="font-medium text-lg">Calendar</h3>
                  <p className="text-sm text-neutral-500 mt-1">Manage events and schedules</p>
                </div>
                <div onClick={() => onSelectTab && onSelectTab("ws-4")} className="p-6 bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Connected</span>
                  </div>
                  <h3 className="font-medium text-lg">Google Meet</h3>
                  <p className="text-sm text-neutral-500 mt-1">Create instant meetings</p>
                </div>
                <div onClick={() => onSelectTab && onSelectTab("ws-5")} className="p-6 bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Connected</span>
                  </div>
                  <h3 className="font-medium text-lg">Sheets & Slides</h3>
                  <p className="text-sm text-neutral-500 mt-1">Manage infrastructure reports</p>
                </div>
              </div>

              {/* Unified Dashboard Previews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Emails & Events */}
                <div className="space-y-6">
                  {/* Calendar Widget */}
                  <div className="bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
                    <div className="px-5 py-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500"/> Upcoming Maintenance (Calendar)</h3>
                    </div>
                    <div className="divide-y divide-neutral-200 dark:divide-white/10">
                      {events.slice(0, 3).map((event: any) => {
                        const start = event.start?.dateTime || event.start?.date;
                        return (
                          <div key={event.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <p className="font-medium text-sm">{event.summary || '(No Title)'}</p>
                            <p className="text-xs text-neutral-500 mt-1">{new Date(start).toLocaleString()}</p>
                          </div>
                        );
                      })}
                      {events.length === 0 && <div className="p-4 text-sm text-neutral-500 text-center">No upcoming events.</div>}
                    </div>
                  </div>

                  {/* Gmail Widget */}
                  <div className="bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
                    <div className="px-5 py-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500"/> Recent Alerts (Gmail)</h3>
                    </div>
                    <div className="divide-y divide-neutral-200 dark:divide-white/10">
                      {emails.slice(0, 3).map((email: any) => {
                        const subjectHeader = email.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'subject');
                        return (
                          <div key={email.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <p className="font-medium text-sm truncate">{subjectHeader ? subjectHeader.value : '(No Subject)'}</p>
                            <p className="text-xs text-neutral-500 mt-1 truncate">{email.snippet}</p>
                          </div>
                        );
                      })}
                      {emails.length === 0 && <div className="p-4 text-sm text-neutral-500 text-center">No recent emails.</div>}
                    </div>
                  </div>
                </div>

                {/* Sheets & Slides Widget */}
                <div className="bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden h-full flex flex-col">
                  <div className="px-5 py-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500"/> Recent Documents (Sheets & Slides)</h3>
                  </div>
                  <div className="divide-y divide-neutral-200 dark:divide-white/10 flex-grow">
                    {driveFiles.map((file: any) => (
                      <div key={file.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex justify-between items-center group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {getFileIcon(file.mimeType)}
                          <div className="truncate">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a href={file.webViewLink} target="_blank" rel="noreferrer" className="text-xs font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Open
                        </a>
                      </div>
                    ))}
                    {driveFiles.length === 0 && <div className="p-8 text-sm text-neutral-500 text-center flex flex-col items-center justify-center h-full">No recent spreadsheets or presentations found.</div>}
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentTab === "ws-2" && (
            <div className="bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500"/> Recent Emails</h3>
                <button onClick={fetchEmails} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <RefreshCcw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="divide-y divide-neutral-200 dark:divide-white/10">
                {emails.length === 0 && !loadingData ? (
                  <div className="p-6 text-center text-neutral-500">No emails found or loading failed.</div>
                ) : (
                  emails.map((email: any) => {
                    const subjectHeader = email.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'subject');
                    const fromHeader = email.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'from');
                    return (
                      <div key={email.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <p className="font-medium truncate">{subjectHeader ? subjectHeader.value : '(No Subject)'}</p>
                        <p className="text-sm text-neutral-500 truncate">{fromHeader ? fromHeader.value : 'Unknown Sender'}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentTab === "ws-3" && (
            <div className="bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500"/> Upcoming Events</h3>
                <button onClick={fetchEvents} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <RefreshCcw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="divide-y divide-neutral-200 dark:divide-white/10">
                {events.length === 0 && !loadingData ? (
                  <div className="p-6 text-center text-neutral-500">No upcoming events found.</div>
                ) : (
                  events.map((event: any) => {
                    const start = event.start?.dateTime || event.start?.date;
                    return (
                      <div key={event.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex justify-between items-center">
                        <div>
                          <p className="font-medium">{event.summary || '(No Title)'}</p>
                          <p className="text-sm text-neutral-500">{new Date(start).toLocaleString()}</p>
                        </div>
                        {event.htmlLink && (
                          <a href={event.htmlLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm font-medium">View in Calendar</a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentTab === "ws-4" && (
            <div className="bg-white dark:bg-[#15151a] p-8 rounded-xl border border-neutral-200 dark:border-white/10 text-center max-w-2xl mx-auto mt-10">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Google Meet Integrations</h3>
              <p className="text-neutral-500 mb-8">
                Generate instant Google Meet links for incident response, infrastructure troubleshooting, or team syncs.
              </p>
              <button 
                onClick={createMeet}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto shadow-sm"
              >
                <Video className="w-5 h-5" />
                Generate Instant Meeting
              </button>
            </div>
          )}

          {currentTab === "ws-5" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#15151a] p-6 rounded-xl border border-neutral-200 dark:border-white/10 flex flex-col items-center text-center">
                   <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Export to Google Sheets</h3>
                  <p className="text-neutral-500 text-sm mb-6 flex-grow">
                    Export global infrastructure analytics, CAFM work orders, and billing invoices directly into a new spreadsheet.
                  </p>
                  <button className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 font-medium py-2 rounded-lg transition-colors">
                    Create Sheet Export
                  </button>
                </div>

                <div className="bg-white dark:bg-[#15151a] p-6 rounded-xl border border-neutral-200 dark:border-white/10 flex flex-col items-center text-center">
                   <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                    <LayoutTemplate className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Generate Presentation</h3>
                  <p className="text-neutral-500 text-sm mb-6 flex-grow">
                    Create a Google Slides presentation summarizing the current month's global traffic and zero trust access policies.
                  </p>
                  <button className="w-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 font-medium py-2 rounded-lg transition-colors">
                    Generate Slides
                  </button>
                </div>
              </div>

              {/* List of files in tab 5 */}
              <div className="bg-white dark:bg-[#15151a] rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-500"/> Recent Sheets & Slides</h3>
                  <button onClick={fetchDriveFiles} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <RefreshCcw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="divide-y divide-neutral-200 dark:divide-white/10">
                  {driveFiles.length === 0 && !loadingData ? (
                    <div className="p-6 text-center text-neutral-500">No files found or loading failed.</div>
                  ) : (
                    driveFiles.map((file: any) => (
                      <div key={file.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.mimeType)}
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a href={file.webViewLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-orange-500 border border-orange-500/30 px-3 py-1 rounded hover:bg-orange-500/10 transition-colors">
                          Open in Workspace
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
