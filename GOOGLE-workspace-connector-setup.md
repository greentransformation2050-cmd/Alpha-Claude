# Google Connector Setup — Status & Guide

**Account:** greentransformation2050@gmail.com
**Verified:** 2026-08-02
**Status: ✅ Everything you need is already connected and working.**

## What is connected right now

All three Google connectors were tested live from this Claude session and responded successfully:

| Connector | Status | Verified by |
|---|---|---|
| Gmail | ✅ Working | Listed mailbox labels (INBOX, Notes/GT2050, ETS_ICAP, etc.) |
| Google Calendar | ✅ Working | Listed 5 calendars, including "Green Bridges – Virtual Exchanges for Climate Action and Social Innovation" |
| Google Drive | ✅ Working | Listed recent files (BOOK folder, Claude Code guides, study guide doc) |

No further installation is required. Claude can already search and read email, manage calendar events, and search/read/create Drive files on this account.

## About the four "official Google Workspace connector" links

The links that came up earlier are **enterprise administration tools for organizations running Google Workspace on their own domain** (e.g. `@yourcompany.com`). They are **not needed** — and mostly **not applicable** — for a personal `@gmail.com` account:

1. **Google Cloud Directory Sync (GCDS)** — syncs a corporate LDAP/Active Directory server into a Workspace domain. Requires a Workspace admin account and an on-premise directory server. *Not applicable to a personal Gmail account.*
2. **SSO (SAML) for Google Workspace** — lets a company's identity provider (Okta, Azure AD, etc.) handle sign-in for a Workspace domain. Requires domain admin rights. *Not applicable here.*
3. **Admin SDK — Directory API** — programmatic user/group management for a Workspace domain. Requires a Workspace domain. *Not applicable here.*
4. **Google Workspace Marketplace** — an app store for add-ons inside Docs/Sheets/Gmail. Usable with a personal account, but unrelated to connecting Google to Claude.

**Bottom line:** the right "connector" for this account is the Claude ↔ Google integration (Gmail, Calendar, Drive), and it is already set up.

## How to manage or re-connect later

- Connectors are managed at **claude.ai → Settings → Connectors** (or the connectors menu in the Claude apps).
- If a connector ever stops responding or asks to re-authenticate, disconnect and reconnect Google there, approving the Gmail/Calendar/Drive permission scopes when Google prompts.
- Each new Claude session can use these connectors without reinstalling anything.

## What you can ask Claude to do now

- "Search my email for the latest GCF correspondence and summarize it."
- "What's on my calendar next week? Add a prep block before the Green Bridges call."
- "Find the Claude Code guide PDF in my Drive and extract the chapter on skills."
- Cross-tool work: e.g. draft an email from a Drive document, or turn an email thread into calendar events.
