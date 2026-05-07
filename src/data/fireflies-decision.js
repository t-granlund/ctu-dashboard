export const firefliesDecision = {
  title: 'Microsoft Teams + Copilot Licensing Decision',
  updated: 'May 7, 2026',
  owner: 'Tyler Granlund, IT Director, HTT Brands',
  status: 'Decision made by COO. Implementation phase active.',
  summary: 'Teams Premium is removed. Microsoft 365 Copilot is not being pursued. Kristin selected Fireflies.ai Pro as the meeting-AI path.',
  decisionCards: [
    ['Decision', 'Fireflies.ai Pro selected at $10/user/month annual. Treat Kristin’s decision as final and frame future work as execution.'],
    ['Microsoft path', 'Teams Premium and Copilot Business were evaluated but deliberately not pursued after the COO decision.'],
    ['Ticket impact', 'Ticket #10333 for Kayla Bramlet and Jill should close only after personal follow-up confirms Fireflies resolves the lost AI-summary need.'],
  ],
  identityReality: [
    ['OIDC login', 'Sign in with Microsoft is available through approved app consent and Conditional Access at login.'],
    ['Not SAML', 'Do not promise SAML SSO. Fireflies SAML is Enterprise-tier, not Pro.'],
    ['Not SCIM', 'Pro tier does not provide SCIM auto-provisioning/deprovisioning; offboarding needs manual admin work or automation.'],
  ],
  risks: [
    ['AI credits', 'Pro has a small workspace credit pool; heavy use can create overage and budget surprise.', 'Configure 50/75/90% alerts within one week of go-live.'],
    ['Visible bot', 'Fireflies.ai Notetaker joins meetings as a visible participant; external attendees will see it.', 'Define internal-only default or meeting-host disclosure before broad rollout.'],
    ['Storage cap', 'Pro caps storage minutes per seat and older recordings may auto-delete unless favorited.', 'Confirm retention/export/deletion policy and exec tier exceptions.'],
    ['Data governance', 'Recordings live in Fireflies cloud, not OneDrive/Purview.', 'Add vendor-risk/register note and retention divergence by May 28.'],
    ['No SCIM', 'Disabled Entra users can remain active in Fireflies unless manually removed.', 'Build Power Automate or admin API offboarding workaround by May 21.'],
  ],
  actions: [
    ['Confirm exact Fireflies tier and seat count', 'Tyler', '48 hours after admin access', 'Needs workspace admin access'],
    ['Verify Teams Premium SKU removal across all 5 tenants', 'Tyler', 'May 9', 'Use Get-MgSubscribedSku'],
    ['Document OIDC login path in HTT IT KB', 'Tyler', 'May 14', 'Tell users not to create separate Fireflies passwords'],
    ['Define bot auto-join policy', 'Kristin + Tyler', 'Before all-HTT email', 'Recommend internal-only default'],
    ['Build Fireflies offboarding workaround', 'Tyler', 'May 21', 'Close SCIM gap'],
    ['Personal outreach to Kayla and Jill', 'Tyler', 'Day of rollout', 'Resolve Ticket #10333 warmly'],
    ['Configure credit threshold alerts', 'Tyler', 'Within 1 week of go-live', '50%, 75%, 90%'],
    ['Document Fireflies cloud vs Purview divergence', 'Tyler', 'May 28', 'Retention and eDiscovery note'],
  ],
};
