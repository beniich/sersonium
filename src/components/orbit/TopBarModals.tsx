import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Building2,
  Check,
  Crown,
  ShieldCheck,
  Users,
  Sparkles,
  UserPlus,
  LogIn,
  LogOut,
  Trash2,
  Copy,
  CreditCard,
  Receipt,
  Lock,
} from 'lucide-react';
import type { OrgMember, OrgPlan, Organization } from '../../data/organizations';
import {
  type BillingCycle,
  PLAN_CATALOG,
  type PlanCode,
  type PlanDefinition,
  normalizePlanCode,
} from '../../data/plans';
import {
  type InvoiceRecord,
  type PendingInvitationSummary,
  bridgeApi,
  iamApi,
  paypalApi,
} from '../../services/orbitApiClient';
import { formatQuotaCompact } from '../../utils/organizations';
import type { TopBarModalType } from './TopNavBar';

interface TopBarModalsProps {
  activeModal: TopBarModalType;
  activeOrg: Organization;
  members: OrgMember[];
  authUser: OrgMember | null;
  authPromptReason: string | null;
  isGoogleConnected: boolean;
  connectedEmail: string | null;
  onClose: () => void;
  onSwitchToModal: (modal: TopBarModalType) => void;
  onRegisterUser: (params: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    invitationToken?: string;
  }) => Promise<void>;
  onLoginUser: (params: { email: string; password: string }) => Promise<void>;
  onLogoutUser: () => Promise<void>;
  onCreateOrganization: (name: string, plan: OrgPlan) => Promise<void>;
  onSyncOrganization: (org: Organization) => void;
  onSyncMembers: (members: OrgMember[]) => void;
  onToggleGoogleConnection: () => Promise<void>;
  onNotify: (tone: 'success' | 'error', message: string) => void;
}

export function TopBarModals({
  activeModal,
  activeOrg,
  members,
  authUser,
  authPromptReason,
  isGoogleConnected,
  connectedEmail,
  onClose,
  onSwitchToModal,
  onRegisterUser,
  onLoginUser,
  onLogoutUser,
  onCreateOrganization,
  onSyncOrganization,
  onSyncMembers,
  onToggleGoogleConnection,
  onNotify,
}: TopBarModalsProps) {
  // Create Org state
  const [orgName, setOrgName] = useState('');
  const [orgPlan, setOrgPlan] = useState<OrgPlan>('Pro');
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgBusy, setOrgBusy] = useState(false);

  // IAM Members state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgMember['role']>('Operator');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitationSummary[]>([]);
  const [maxUsersLimit, setMaxUsersLimit] = useState<number>(5);
  const [latestInviteToken, setLatestInviteToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Auth modal state
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOrgName, setAuthOrgName] = useState('');
  const [authInviteToken, setAuthInviteToken] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Subscription & PayPal state
  const [plans, setPlans] = useState<PlanDefinition[]>(PLAN_CATALOG);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: string;
    planCode: PlanCode;
    amountEur: number;
    cycle: BillingCycle;
  } | null>(null);
  const [subError, setSubError] = useState<string | null>(null);
  const [subBusy, setSubBusy] = useState(false);

  // Org security policy state
  const [onboardingName, setOnboardingName] = useState(activeOrg.name);
  const [settingsBusy, setSettingsBusy] = useState(false);

  const onSyncMembersRef = React.useRef(onSyncMembers);
  const onSyncOrganizationRef = React.useRef(onSyncOrganization);
  useEffect(() => {
    onSyncMembersRef.current = onSyncMembers;
    onSyncOrganizationRef.current = onSyncOrganization;
  });

  const loadIamState = useCallback(async () => {
    if (!authUser) return;
    try {
      const data = await iamApi.listMembers();
      onSyncMembersRef.current(data.members);
      setPendingInvitations(data.pendingInvitations);
      setMaxUsersLimit(data.maxUsers);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Unable to load members.');
    }
  }, [authUser]);

  const loadBillingState = useCallback(async () => {
    try {
      const catalog = await bridgeApi.getPlans();
      if (Array.isArray(catalog.plans) && catalog.plans.length > 0) {
        setPlans(catalog.plans);
      }
      if (authUser) {
        const summary = await paypalApi.getBillingSummary();
        onSyncOrganizationRef.current(summary.organization);
        setInvoices(summary.invoices);
      }
    } catch {
      // keep catalog defaults
    }
  }, [authUser]);

  useEffect(() => {
    setOrgError(null);
    setInviteError(null);
    setAuthError(null);
    setSubError(null);
    setLatestInviteToken(null);
    setPendingOrder(null);
    setOnboardingName(activeOrg.name);
    // Only reset modal transient state when the modal type itself opens/changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === 'members' && authUser) {
      void loadIamState();
    }
    if (activeModal === 'subscription') {
      void loadBillingState();
    }
  }, [activeModal, authUser, loadIamState, loadBillingState]);

  useEffect(() => {
    if (!activeModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  const currentPlanCode = normalizePlanCode(activeOrg.planCode ?? activeOrg.plan);
  const isOwnerOrAdmin = authUser?.role === 'Owner' || authUser?.role === 'Admin';

  const handleCreateOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      setOrgError('Sign in to provision a new organization.');
      return;
    }
    if (!orgName.trim()) {
      setOrgError('Organization name is required.');
      return;
    }
    setOrgBusy(true);
    setOrgError(null);
    try {
      await onCreateOrganization(orgName.trim(), orgPlan);
      setOrgName('');
      onClose();
    } catch (err) {
      setOrgError(err instanceof Error ? err.message : 'Creation failed.');
    } finally {
      setOrgBusy(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      setInviteError('Sign in as Owner or Admin to send invitations.');
      return;
    }
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Name and email are required to invite a member.');
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
      await loadIamState();
      onNotify('success', `Invitation created for ${res.invitation.email} (${res.invitation.role}).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating invitation.';
      setInviteError(message);
    } finally {
      setInviteBusy(false);
    }
  };

  const handleRoleChange = async (userId: string, role: OrgMember['role']) => {
    try {
      await iamApi.updateMemberRole(userId, role);
      await loadIamState();
      onNotify('success', `Role updated to ${role}.`);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Role update rejected.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await iamApi.removeMember(userId);
      await loadIamState();
      onNotify('success', 'Collaborator removed from organization.');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Removal failed.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (authTab === 'register') {
        if (!authName.trim() || !authEmail.trim() || authPassword.length < 8) {
          setAuthError('Name, valid email, and password (min. 8 characters) are required.');
          setAuthBusy(false);
          return;
        }
        if (!authInviteToken.trim() && !authOrgName.trim()) {
          setAuthError('Provide an organization name or an invitation token.');
          setAuthBusy(false);
          return;
        }
        await onRegisterUser({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          organizationName: authOrgName.trim(),
          invitationToken: authInviteToken.trim() || undefined,
        });
      } else {
        if (!authEmail.trim() || !authPassword) {
          setAuthError('Email and password are required.');
          setAuthBusy(false);
          return;
        }
        await onLoginUser({
          email: authEmail.trim(),
          password: authPassword,
        });
      }
      setAuthPassword('');
      onClose();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleActivateTrial = async () => {
    if (!authUser) {
      onSwitchToModal('signup');
      return;
    }
    setSubBusy(true);
    setSubError(null);
    try {
      const res = await bridgeApi.activateTrial();
      onSyncOrganization(res.organization);
      onNotify('success', '10-Day Discovery Pass activated with PRO quota (100k).');
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'Unable to activate Pass.');
    } finally {
      setSubBusy(false);
    }
  };

  const handleStartPayPalCheckout = async (planCode: PlanCode) => {
    if (!authUser) {
      onSwitchToModal('signup');
      return;
    }
    if (planCode === 'FREE') {
      setSubError('The FREE plan is included by default without PayPal checkout.');
      return;
    }
    setSubBusy(true);
    setSubError(null);
    try {
      const order = await paypalApi.createOrder({
        planCode,
        cycle: billingCycle,
      });
      setPendingOrder({
        orderId: order.orderId,
        planCode: order.planCode,
        amountEur: order.amountEur,
        cycle: order.cycle,
      });
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'Unable to create PayPal order.');
    } finally {
      setSubBusy(false);
    }
  };

  const handleCapturePayPalOrder = async () => {
    if (!pendingOrder) return;
    setSubBusy(true);
    setSubError(null);
    try {
      const captured = await paypalApi.captureOrder(pendingOrder.orderId);
      onSyncOrganization(captured.organization);
      setPendingOrder(null);
      await loadBillingState();
      onNotify(
        'success',
        `PayPal payment confirmed (€${pendingOrder.amountEur}). ${captured.organization.plan} plan activated.`
      );
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'PayPal capture failed.');
    } finally {
      setSubBusy(false);
    }
  };

  const handleSaveOrgSettings = async () => {
    if (!authUser) {
      onSwitchToModal('signup');
      return;
    }
    setSettingsBusy(true);
    try {
      const res = await iamApi.updateOnboarding({
        organizationName: onboardingName.trim() || undefined,
      });
      onSyncOrganization(res.organization);
      onNotify('success', `Settings saved for ${res.organization.name}.`);
      onClose();
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : 'Update rejected.');
    } finally {
      setSettingsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#1a1c1f] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-[#e2e2e6] max-h-[90vh] flex flex-col">
        {/* CREATE / JOIN ORGANIZATION */}
        {activeModal === 'create-org' && (
          <form onSubmit={handleCreateOrgSubmit} className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Create an organization</h2>
                  <p className="text-[11px] text-[#8E929C]">
                    Provision a new isolated multi-tenant workspace.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!authUser && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/30 flex items-center justify-between gap-3 text-xs">
                <span className="text-amber-800 dark:text-amber-200">
                  Sign in to create a persisted organization.
                </span>
                <button
                  type="button"
                  onClick={() => onSwitchToModal('signup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-[11px] font-semibold shrink-0"
                >
                  Sign in
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="new-org-name"
                  className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
                >
                  Organization name
                </label>
                <input
                  id="new-org-name"
                  type="text"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    setOrgError(null);
                  }}
                  placeholder="e.g., Sensorium Labs"
                  className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                />
                {orgError && <p className="mt-1 text-[11px] text-rose-500">{orgError}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1">
                  Initial plan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Free', 'Starter', 'Pro', 'Enterprise'] as OrgPlan[]).map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setOrgPlan(plan)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition ${
                        orgPlan === plan
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-[#111317] border-transparent'
                          : 'bg-slate-50 dark:bg-[#282a2d] text-slate-700 dark:text-[#c4c7c9] border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={orgBusy}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {orgBusy ? 'Creating...' : 'Create workspace'}
              </button>
            </div>
          </form>
        )}

        {/* ORG SETTINGS */}
        {activeModal === 'org-settings' && (
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  Workspace Settings · {activeOrg.name}
                </h2>
                <p className="text-[11px] text-[#8E929C]">
                  Security, SLA, and persisted quotas for your organization.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label
                htmlFor="settings-org-name"
                className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
              >
                Display name
              </label>
              <input
                id="settings-org-name"
                type="text"
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                disabled={!authUser || !isOwnerOrAdmin}
                className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-[#8E929C] mb-1">
                  Active Plan
                </div>
                <div className="font-semibold">
                  {activeOrg.plan} ({activeOrg.subscriptionStatus ?? 'active'})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-[#8E929C] mb-1">
                  Members
                </div>
                <div className="font-semibold tabular-nums">{activeOrg.membersCount} members</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-[#8E929C] mb-1">
                  Zero-Trust Security
                </div>
                <div className="font-semibold text-emerald-600 dark:text-[#4edea3] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ZT 100% Active
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200/80 dark:border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-[#8E929C] mb-1">
                  Monthly quota
                </div>
                <div className="font-semibold tabular-nums">
                  {formatQuotaCompact(activeOrg.quotaUsed)} /{' '}
                  {formatQuotaCompact(activeOrg.quotaLimit)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#8E929C]"
              >
                Close
              </button>
              {authUser && isOwnerOrAdmin && (
                <button
                  type="button"
                  disabled={settingsBusy}
                  onClick={handleSaveOrgSettings}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-xs font-semibold disabled:opacity-50"
                >
                  {settingsBusy ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* MEMBERS & ROLES (REAL IAM) */}
        {activeModal === 'members' && (
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8E929C]" />
                <div>
                  <h2 className="text-sm font-bold">Members &amp; Roles · {activeOrg.name}</h2>
                  <p className="text-[11px] text-[#8E929C]">
                    {members.length} / {maxUsersLimit} seats used ({currentPlanCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!authUser && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/30 flex items-center justify-between gap-3 text-xs">
                <span className="text-amber-800 dark:text-amber-200">
                  Sign in to invite collaborators or modify roles.
                </span>
                <button
                  type="button"
                  onClick={() => onSwitchToModal('signup')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-[11px] font-semibold shrink-0"
                >
                  Sign in
                </button>
              </div>
            )}

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200/70 dark:border-white/[0.06]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-[#333538] flex items-center justify-center text-[10px] font-bold shrink-0">
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{m.name}</div>
                      <div className="text-[10px] text-[#8E929C] truncate">{m.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {authUser && isOwnerOrAdmin && m.role !== 'Owner' ? (
                      <>
                        <select
                          aria-label={`Role for ${m.name}`}
                          value={m.role}
                          onChange={(e) =>
                            void handleRoleChange(m.id, e.target.value as OrgMember['role'])
                          }
                          className="bg-white dark:bg-[#1a1c1f] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Operator">Operator</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                        {m.id !== authUser.id && (
                          <button
                            type="button"
                            onClick={() => void handleRemoveMember(m.id)}
                            aria-label={`Remove ${m.name}`}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-600 dark:text-[#c4c7c9]">
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pendingInvitations.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-[#8E929C] font-semibold">
                  Pending invitations ({pendingInvitations.length})
                </div>
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-white/[0.04] text-[11px]"
                  >
                    <span className="truncate">
                      {inv.name} · <span className="text-[#8E929C]">{inv.email}</span>
                    </span>
                    <span className="font-mono text-[10px] text-amber-600 dark:text-amber-300">
                      {inv.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {latestInviteToken && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-[#4edea3]/10 border border-emerald-200 dark:border-[#4edea3]/30 text-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-emerald-800 dark:text-[#4edea3]">
                    Invitation token generated (valid 7 days)
                  </div>
                  <div className="font-mono text-[11px] truncate text-emerald-700 dark:text-[#c4c7c9]">
                    {latestInviteToken}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(latestInviteToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            <form
              onSubmit={handleInviteSubmit}
              className="pt-3 border-t border-slate-100 dark:border-white/[0.08] space-y-2.5"
            >
              <div className="text-xs font-semibold">Invite a collaborator</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Name"
                  aria-label="Member name"
                  className="bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs"
                />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@company.io"
                  aria-label="Member email"
                  className="bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrgMember['role'])}
                  aria-label="Member role"
                  className="bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs"
                >
                  <option value="Operator">Operator</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              {inviteError && <p className="text-[11px] text-rose-500">{inviteError}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={inviteBusy || !authUser}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-xs font-semibold disabled:opacity-50"
                >
                  {inviteBusy ? 'Sending...' : 'Send invitation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBSCRIPTION, TRIAL & PAYPAL */}
        {activeModal === 'subscription' && (
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Subscription, 10-Day Pass &amp; PayPal</h2>
                  <p className="text-[11px] text-[#8E929C]">
                    {activeOrg.name} · {activeOrg.plan} Plan ({activeOrg.subscriptionStatus ?? 'active'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authPromptReason && !authUser && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {authPromptReason}
              </div>
            )}

            {/* 10-Day Discovery Pass banner */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    {activeOrg.trialUsedAt
                      ? `Discovery Pass active · Quota ${formatQuotaCompact(activeOrg.quotaUsed)} / ${formatQuotaCompact(activeOrg.quotaLimit)}`
                      : `10-Day Discovery Pass (100k PRO executions)`}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300/80 tabular-nums">
                    Current usage: {formatQuotaCompact(activeOrg.quotaUsed)} /{' '}
                    {formatQuotaCompact(activeOrg.quotaLimit)} runs
                  </div>
                </div>
              </div>
              {!activeOrg.trialUsedAt && (
                <button
                  type="button"
                  disabled={subBusy}
                  onClick={() => void handleActivateTrial()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold shrink-0 disabled:opacity-50"
                >
                  Activate 10-Day Pass
                </button>
              )}
            </div>

            {/* Billing Cycle Switch */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-[#c4c7c9]">
                SENSORIUM Unified Plans
              </span>
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#282a2d] p-0.5 border border-slate-200 dark:border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-[#1a1c1f] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-[#8E929C]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    billingCycle === 'yearly'
                      ? 'bg-white dark:bg-[#1a1c1f] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-[#8E929C]'
                  }`}
                >
                  Annual (-17%)
                </button>
              </div>
            </div>

            {/* Unified Plan Catalog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {plans.map((tier) => {
                const isSelected = currentPlanCode === tier.code;
                const price =
                  billingCycle === 'yearly' ? tier.priceYearlyEur : tier.priceMonthlyEur;
                return (
                  <div
                    key={tier.code}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-[#111317] border-transparent'
                        : 'bg-slate-50 dark:bg-[#282a2d] border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{tier.displayName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-sm font-semibold mt-1 tabular-nums">
                        {price === 0
                          ? '€0/mo'
                          : `€${price}/${billingCycle === 'yearly' ? 'yr' : 'mo'}`}
                      </div>
                      <div
                        className={`text-[10px] mt-1 ${
                          isSelected ? 'opacity-80' : 'text-[#8E929C]'
                        }`}
                      >
                        {formatQuotaCompact(tier.quotaLimit)} runs · {tier.maxUsers} max users
                      </div>
                    </div>

                    {tier.code !== 'FREE' && (
                      <button
                        type="button"
                        disabled={subBusy}
                        onClick={() => void handleStartPayPalCheckout(tier.code)}
                        className={`w-full mt-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${
                          isSelected
                            ? 'bg-white/15 dark:bg-slate-900/15 hover:opacity-90'
                            : 'bg-[#0070BA] hover:bg-[#005ea6] text-white'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Renew via PayPal' : 'Pay with PayPal'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PayPal Capture Confirmation Step */}
            {pendingOrder && (
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 dark:text-sky-200">
                    PayPal order ready · {pendingOrder.planCode}
                  </span>
                  <span className="font-mono font-bold text-sky-800 dark:text-sky-300">
                    €{pendingOrder.amountEur.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-sky-700 dark:text-sky-300/80 font-mono">
                  Order ID: {pendingOrder.orderId}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingOrder(null)}
                    className="px-3 py-1.5 rounded-lg text-[11px] text-[#8E929C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={subBusy}
                    onClick={() => void handleCapturePayPalOrder()}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0070BA] text-white text-[11px] font-semibold disabled:opacity-50"
                  >
                    {subBusy ? 'Validating...' : 'Confirm & capture payment'}
                  </button>
                </div>
              </div>
            )}

            {subError && <p className="text-[11px] text-rose-500">{subError}</p>}

            {/* Recent Invoices */}
            {invoices.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8E929C]">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Recent Invoices ({invoices.length})</span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {invoices.slice(0, 5).map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#282a2d] text-[11px]"
                    >
                      <span className="font-mono">
                        {inv.id} · {inv.planCode} ({inv.cycle})
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-[#4edea3] tabular-nums">
                        €{inv.amountEur.toFixed(2)} · {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GOOGLE CONNECTED */}
        {activeModal === 'google' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Google Workspace Connection</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold">
                  {isGoogleConnected ? 'Google Account Connected' : 'No Google account linked'}
                </div>
                <div className="text-[11px] text-[#8E929C]">
                  {isGoogleConnected
                    ? connectedEmail || authUser?.email || 'google@workspace.io'
                    : 'Connect Google to sync Gmail, Calendar, and Drive.'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void onToggleGoogleConnection();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-xs font-semibold shrink-0"
              >
                {isGoogleConnected ? 'Disconnect' : 'Connect Google'}
              </button>
            </div>
          </div>
        )}

        {/* REAL AUTH: REGISTER / LOGIN / LOGOUT */}
        {activeModal === 'signup' && (
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8E929C]" />
                <h2 className="text-sm font-bold">
                  {authUser ? 'Active Operator Session' : 'Sign Up & Secure Sign In'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authPromptReason && !authUser && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/30 text-xs text-amber-800 dark:text-amber-200">
                {authPromptReason}
              </div>
            )}

            {authUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#4edea3] flex items-center justify-center text-xs font-bold shrink-0">
                      {authUser.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{authUser.name}</div>
                      <div className="text-[11px] text-[#8E929C] truncate">{authUser.email}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-[#4edea3] font-mono mt-0.5">
                        {authUser.role} · {activeOrg.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSwitchToModal('members')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#282a2d] text-xs font-medium"
                    >
                      Members ({activeOrg.membersCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchToModal('subscription')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#282a2d] text-xs font-medium"
                    >
                      Billing ({activeOrg.plan})
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void onLogoutUser();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#282a2d]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('register');
                      setAuthError(null);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      authTab === 'register'
                        ? 'bg-white dark:bg-[#1a1c1f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-[#8E929C]'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError(null);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      authTab === 'login'
                        ? 'bg-white dark:bg-[#1a1c1f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-[#8E929C]'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign in
                  </button>
                </div>

                {authTab === 'register' && (
                  <>
                    <div>
                      <label
                        htmlFor="auth-name"
                        className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
                      >
                        Full name
                      </label>
                      <input
                        id="auth-name"
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Dana Kim"
                        className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label
                          htmlFor="auth-org-name"
                          className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
                        >
                          Organization
                        </label>
                        <input
                          id="auth-org-name"
                          type="text"
                          value={authOrgName}
                          onChange={(e) => setAuthOrgName(e.target.value)}
                          placeholder="Sensorium Studio"
                          className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="auth-invite-token"
                          className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
                        >
                          Invitation token (optional)
                        </label>
                        <input
                          id="auth-invite-token"
                          type="text"
                          value={authInviteToken}
                          onChange={(e) => setAuthInviteToken(e.target.value)}
                          placeholder="To join a workspace"
                          className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
                  >
                    Work email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@company.io"
                    className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1"
                  >
                    Password (8+ characters)
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {authError && <p className="text-[11px] text-rose-500">{authError}</p>}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#8E929C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={authBusy}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#111317] text-xs font-semibold disabled:opacity-50"
                  >
                    {authBusy
                      ? 'Processing...'
                      : authTab === 'register'
                        ? 'Create my account'
                        : 'Sign in'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
