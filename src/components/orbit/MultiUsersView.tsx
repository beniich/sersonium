import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Trash2,
  Copy,
  Crown,
  Building2,
  Plus,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import type { OrgMember, Organization } from '../../data/organizations';
import { PLAN_BY_CODE, normalizePlanCode } from '../../data/plans';
import { iamApi, type PendingInvitationSummary } from '../../services/orbitApiClient';

interface MultiUsersViewProps {
  organizations: Organization[];
  activeOrg: Organization;
  members: OrgMember[];
  authUser: OrgMember | null;
  onSelectOrg: (orgId: string) => void;
  onSyncMembers: (members: OrgMember[]) => void;
  onOpenAuth: () => void;
  onOpenSubscription: () => void;
  onOpenCreateOrg: () => void;
  onNotify: (tone: 'success' | 'error', message: string) => void;
}

const ROLE_DESCRIPTIONS: Record<
  OrgMember['role'],
  { label: string; scope: string; badgeClass: string }
> = {
  Owner: {
    label: 'Owner',
    scope: 'Full control: PayPal billing, organizations, IAM, and agents',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30',
  },
  Admin: {
    label: 'Admin',
    scope: 'Manage members, invitations, Zero-Trust policies, and agents',
    badgeClass:
      'bg-orange-100 text-orange-800 border-orange-300 dark:bg-[#D96B43]/15 dark:text-orange-200 dark:border-[#D96B43]/30',
  },
  Operator: {
    label: 'Operator',
    scope: 'Run all 36 AI agents, workflows, and operational approvals',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-[#4edea3] dark:border-emerald-500/30',
  },
  Viewer: {
    label: 'Viewer',
    scope: 'Read-only access to run history and Preview window',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/[0.08] dark:text-slate-300 dark:border-white/10',
  },
};

export function MultiUsersView({
  organizations,
  activeOrg,
  members,
  authUser,
  onSelectOrg,
  onSyncMembers,
  onOpenAuth,
  onOpenSubscription,
  onOpenCreateOrg,
  onNotify,
}: MultiUsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | OrgMember['role']>('all');

  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitationSummary[]>([]);
  const [maxUsersLimit, setMaxUsersLimit] = useState<number>(() => {
    const plan = PLAN_BY_CODE[normalizePlanCode(activeOrg.planCode ?? activeOrg.plan)];
    return plan.maxUsers;
  });
  const [isLoading, setIsLoading] = useState(false);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgMember['role']>('Operator');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [latestInviteToken, setLatestInviteToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const onSyncMembersRef = React.useRef(onSyncMembers);
  useEffect(() => {
    onSyncMembersRef.current = onSyncMembers;
  });

  const currentPlan = useMemo(
    () => PLAN_BY_CODE[normalizePlanCode(activeOrg.planCode ?? activeOrg.plan)],
    [activeOrg.planCode, activeOrg.plan]
  );

  const loadIamDirectory = useCallback(async () => {
    if (!authUser) {
      setMaxUsersLimit(currentPlan.maxUsers);
      return;
    }
    setIsLoading(true);
    try {
      const data = await iamApi.listMembers();
      onSyncMembersRef.current(data.members);
      setPendingInvitations(data.pendingInvitations);
      setMaxUsersLimit(data.maxUsers);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to load IAM members.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [authUser, currentPlan.maxUsers, onNotify]);

  useEffect(() => {
    void loadIamDirectory();
  }, [loadIamDirectory, activeOrg.id]);

  const orgScopedMembers = useMemo(() => {
    const scoped = members.filter(
      (m) => !m.tenantId || m.tenantId === activeOrg.id
    );
    return scoped.length > 0 ? scoped : members;
  }, [members, activeOrg.id]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orgScopedMembers.filter((m) => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      );
    });
  }, [orgScopedMembers, searchQuery, roleFilter]);

  const isOwnerOrAdmin = authUser?.role === 'Owner' || authUser?.role === 'Admin';
  const seatCount = orgScopedMembers.length;
  const seatPct = maxUsersLimit > 0 ? Math.min(100, Math.round((seatCount / maxUsersLimit) * 100)) : 0;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      onOpenAuth();
      return;
    }
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Name and email address are required.');
      return;
    }
    setInviteBusy(true);
    setInviteError(null);
    setLatestInviteToken(null);
    try {
      const res = await iamApi.inviteMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setLatestInviteToken(res.invitationToken);
      setInviteName('');
      setInviteEmail('');
      await loadIamDirectory();
      onNotify('success', `Invitation sent to ${res.invitation.email} (${res.invitation.role}).`);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Error creating invitation.');
    } finally {
      setInviteBusy(false);
    }
  };

  const handleRoleChange = async (userId: string, nextRole: OrgMember['role']) => {
    try {
      await iamApi.updateMemberRole(userId, nextRole);
      await loadIamDirectory();
      onNotify('success', `Role updated to ${nextRole}.`);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to update role.'
      );
    }
  };

  const handleRemoveMember = async (member: OrgMember) => {
    try {
      await iamApi.removeMember(member.id);
      await loadIamDirectory();
      onNotify('success', `${member.name} removed from ${activeOrg.name}.`);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to remove this collaborator.'
      );
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await iamApi.revokeInvitation(invitationId);
      await loadIamDirectory();
      onNotify('success', 'Invitation revoked.');
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to revoke this invitation.'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Auth Callout Banner if guest */}
      {!authUser && (
        <div className="p-4 rounded-[20px] bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Authenticated session required for multi-user actions
              </h3>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Sign in or create an administrator account to invite collaborators, assign RBAC roles, and revoke access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in / Sign up</span>
          </button>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#8E929C]">
            <span>Active Users</span>
            <Users className="w-4 h-4 text-[#D96B43]" />
          </div>
          <p className="text-2xl font-bold text-[#111317] dark:text-white mt-1 tabular-nums">
            {seatCount} <span className="text-sm font-normal text-[#8E929C]">/ {maxUsersLimit}</span>
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-[#D96B43] rounded-full transition-all"
              style={{ width: `${seatPct}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#8E929C]">
            <span>Pending Invitations</span>
            <UserPlus className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-[#111317] dark:text-white mt-1 tabular-nums">
            {pendingInvitations.length}
          </p>
          <p className="text-[11px] text-[#8E929C] mt-1">7-day validity · Secure token</p>
        </div>

        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#8E929C]">
            <span>Plan &amp; Seats</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#111317] dark:text-white mt-1">
            {currentPlan.displayName}
          </p>
          <button
            type="button"
            onClick={onOpenSubscription}
            className="text-[11px] font-semibold text-[#D96B43] hover:underline mt-1"
          >
            Upgrade user limit →
          </button>
        </div>

        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-[#8E929C]">
            <span>Active Workspace</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-base font-bold text-[#111317] dark:text-white mt-1 truncate">
            {activeOrg.name}
          </p>
          <p className="text-[11px] text-[#8E929C] mt-1">
            {organizations.length} configured organization{organizations.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Main Grid: Team Directory (left 2 cols) + Invite & RBAC Panel (right 1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Team Directory */}
        <div className="xl:col-span-2 bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[20px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                User Directory · {activeOrg.name}
              </h2>
              <p className="text-[11px] text-[#8E929C]">
                Manage collaborators, update RBAC roles, and control tenant access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadIamDirectory()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search & Role Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E929C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name or email..."
                aria-label="Search user"
                className="w-full bg-white dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D96B43]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-[#282a2d] overflow-x-auto">
              {(['all', 'Owner', 'Admin', 'Operator', 'Viewer'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                    roleFilter === r
                      ? 'bg-white dark:bg-[#333538] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Members List */}
          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {filteredMembers.length === 0 ? (
              <div className="py-12 px-6 text-center text-xs text-[#8E929C]">
                No users match the selected filters.
              </div>
            ) : (
              filteredMembers.map((m) => {
                const isSelf = authUser?.id === m.id;
                const roleMeta = ROLE_DESCRIPTIONS[m.role];
                return (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#282a2d] border border-slate-300/60 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white shrink-0">
                        {m.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {m.name}
                          </span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-[#4edea3] text-[10px] font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8E929C] truncate">{m.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {authUser && isOwnerOrAdmin && m.role !== 'Owner' ? (
                        <>
                          <select
                            aria-label={`Role for ${m.name}`}
                            value={m.role}
                            onChange={(e) =>
                              void handleRoleChange(m.id, e.target.value as OrgMember['role'])
                            }
                            className="bg-white dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Operator">Operator</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => void handleRemoveMember(m)}
                              aria-label={`Remove ${m.name}`}
                              title="Remove from organization"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${roleMeta.badgeClass}`}
                        >
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Invite Form + Pending Invites + RBAC + Organizations */}
        <div className="space-y-4">
          {/* Invite Collaborator Card */}
          <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[20px] p-5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#D96B43]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Invite Collaborator
              </h3>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-2.5">
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Full name"
                aria-label="Collaborator full name"
                className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.io"
                aria-label="Collaborator email"
                className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OrgMember['role'])}
                aria-label="Assigned role"
                className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="Operator">Operator (Run agents & workflows)</option>
                <option value="Admin">Admin (Team & security management)</option>
                <option value="Viewer">Viewer (Read-only & Preview)</option>
              </select>

              {inviteError && <p className="text-[11px] text-rose-500">{inviteError}</p>}

              <button
                type="submit"
                disabled={inviteBusy}
                className="w-full py-2 rounded-xl bg-[#D96B43] hover:bg-[#c55d37] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {inviteBusy
                  ? 'Creating invitation...'
                  : authUser
                  ? 'Generate secure invitation'
                  : 'Sign in to invite'}
              </button>
            </form>

            {latestInviteToken && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#4edea3]/10 border border-emerald-200 dark:border-[#4edea3]/30 text-xs space-y-2">
                <div className="font-semibold text-emerald-800 dark:text-[#4edea3]">
                  Invitation token generated (7 days):
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-[11px] truncate text-emerald-700 dark:text-[#c4c7c9]">
                    {latestInviteToken}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(latestInviteToken);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedToken ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {pendingInvitations.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08] space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                  Pending invitations ({pendingInvitations.length})
                </div>
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#282a2d] text-[11px]"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {inv.name}
                      </div>
                      <div className="text-[10px] text-[#8E929C] truncate">{inv.email}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {inv.role}
                      </span>
                      {isOwnerOrAdmin && (
                        <button
                          type="button"
                          onClick={() => void handleRevokeInvitation(inv.id)}
                          aria-label={`Revoke invitation for ${inv.email}`}
                          title="Revoke invitation"
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Tenant Organizations Switcher */}
          <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[20px] p-5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E929C]">
                Organizations ({organizations.length})
              </h3>
              <button
                type="button"
                onClick={onOpenCreateOrg}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D96B43] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {organizations.map((org) => {
                const isActive = org.id === activeOrg.id;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => onSelectOrg(org.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                      isActive
                        ? 'bg-[#FDF0EA] dark:bg-[#D96B43]/15 border border-[#D96B43]/40 text-slate-900 dark:text-white font-semibold'
                        : 'bg-slate-50 dark:bg-[#282a2d] hover:bg-slate-100 dark:hover:bg-[#333538] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] font-mono text-[#8E929C] shrink-0">
                      {org.membersCount} {org.membersCount === 1 ? 'member' : 'members'} · {org.plan}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RBAC Role Guide */}
          <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[20px] p-5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E929C]">
              RBAC Permissions
            </h3>
            <div className="space-y-2">
              {(['Owner', 'Admin', 'Operator', 'Viewer'] as const).map((r) => (
                <div key={r} className="text-[11px] flex items-start gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md border font-semibold shrink-0 ${ROLE_DESCRIPTIONS[r].badgeClass}`}
                  >
                    {r}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 leading-snug">
                    {ROLE_DESCRIPTIONS[r].scope}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
