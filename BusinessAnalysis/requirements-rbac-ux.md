# Requirements — RBAC UX & Permission Model (WMS)

**Date:** 2026-04-19  
**Scope:** Role/Permission behavior and user experience across Backend (BE) + Frontend (FE)

## 1) Problem Statement Brief

### Problem
Users with limited rights are currently experiencing inconsistent and confusing access behavior:
- Some screens appear but fail to load data (403), while others abruptly show a “no permission” page.
- Menu visibility and page access can disagree with backend enforcement.
- The system’s permission model exists (codes/groups) but is not consistently enforced (e.g., Customers module).

### Who is affected
- **Operational roles** (Warehouse Staff/Manager, Store Keeper, Purchasing Staff, Sales Staff, Accountant): get blocked unpredictably, lose trust, waste time.
- **Admins/Superadmins**: harder to reason about “who can do what”; support burden increases.

### Current workaround
- Users retry, navigate back, or request Admin help.
- Admins rely on trial-and-error (or backend knowledge) to diagnose missing rights.

### Desired outcome
- Access behavior is predictable: the UI shows only what the user can access, and backend enforces the same rules.
- When access is denied, messaging is consistent, actionable, and immediate.

## 2) Key Decisions (Confirmed)

1) **Dashboard visibility**: roles allowed to view dashboard are:
   - Admin
   - Warehouse Manager
   - Accountant

2) **RBAC UI (Role & Permission management)**:
   - Only **Superadmin** can use RBAC management UI.

3) **Customers module**:
   - Must be permission-controlled (needs `getCustomers/manageCustomers`).

## 3) Constraints & Assumptions

### Constraints (facts)
- BE uses route-level `auth('permissionCode')` checks and returns JSON error `{ code, message }`.
- BE calculates grouped permissions as `permissionsByGroup`.
- FE uses Redux slices `auth` and `user` separately and uses a custom `usePermission(module)` to gate UI.

### Assumptions (to validate)
- Permission codes follow the `getX` / `manageX` naming convention for all modules.
- For a module, having `manageX` implies also being allowed to *view* the module.
- A user without dashboard permission should not see dashboard menu nor access dashboard route.

### Risks
- If FE and BE contracts differ (field names / shape), FE gating becomes unreliable and creates false-deny UX.
- If some routes use `auth()` without rights while FE expects permissions, UI/BE drift will grow over time.

## 4) Need Hierarchy (What the system must accomplish)

### Must (V1)
1) **Single permissions contract**
   - The FE must consume the same permission structure BE provides (or BE must provide a compatible alias), so that all gating decisions use one canonical source.

2) **Consistent denial UX**
   - Any 403 from BE results in a consistent UX (either a “No permission” screen or a consistent inline state), not silent failures or empty screens.

3) **Menu + route alignment**
   - A screen that is hidden in the menu must also be inaccessible by direct URL.
   - A screen that is visible must not immediately fail due to missing rights.

4) **Customers enforcement**
   - Customers endpoints must enforce `getCustomers` for read and `manageCustomers` for write.

5) **Dashboard enforcement**
   - Dashboard endpoint and FE access must align with the allowed roles/permissions.

6) **RBAC management UI is Superadmin-only**
   - RBAC pages (roles/permissions) must be hidden and blocked unless user is Superadmin.

### Should (V1.1)
- Show “why denied” in a user-friendly way (e.g., module name and a short action statement) without exposing internal codes.
- Avoid “flash deny”: while permissions are still loading, show loading state rather than denying.

### Could (Later)
- Central policy map for FE that maps routes/actions → required permission codes.
- A “Request access” workflow (notify admin) if business wants it.

## 5) Acceptance Scenarios (Testable)

### A) Permission loading and gating
- **Given** the user logs in successfully
- **When** permissions are being fetched
- **Then** protected screens do not show “no permission” until the permission fetch completes.

### B) Dashboard access
- **Given** a user with role Admin/Warehouse Manager/Accountant (or equivalent permission)
- **When** they open Dashboard
- **Then** Dashboard loads and API returns 200.

- **Given** a user without dashboard permission
- **When** they open Dashboard by URL
- **Then** they see the standard “No permission” UX and API returns 403.

### C) RBAC UI access
- **Given** a user that is not Superadmin
- **When** they open the Roles/Permissions UI by URL
- **Then** they are blocked with “No permission” UX.

### D) Customers module enforcement
- **Given** a user with `getCustomers` but not `manageCustomers`
- **When** they list customers
- **Then** request succeeds (200)
- **And when** they create/update/delete a customer
- **Then** request fails with 403 and FE shows standard denial UX.

### E) Consistent 403 handling
- **Given** any page performs an API call
- **When** the API responds 403
- **Then** FE shows the standard denial UX (not just console error or blank).

## 6) UX Gaps Observed (Symptoms to fix)

1) **Contract mismatch** between BE and FE permissions payload shape (FE expects `permissions`, BE provides `permissionsByGroup`).
2) `usePermission()` uses selectors that can misread the store shape (auth vs user slice), causing false-deny.
3) In FE, 401 is handled globally but 403 is not consistently handled.
4) Dashboard currently has no FE permission guard and menu always shows it.
5) Route-to-permission mapping for RBAC pages uses the wrong module grouping (roles page gates as `user`).
6) Customers endpoints in BE use `auth()` without rights, not matching the permission model.

## 7) Scope Definition

### In scope (V1)
- Align FE with BE permission contract
- Standard 403 handling UX
- Dashboard permission gating (FE + BE)
- Customers permission enforcement (BE)
- Restrict RBAC UI to Superadmin

### Out of scope (V1)
- Building new RBAC admin UX features beyond gating/consistency
- Introducing new permission taxonomy beyond existing `getX/manageX` pattern
- Approval workflows for permission requests

## 8) Open Questions

1) Do you want to treat `manageX` as automatically granting view access to `getX`? (Recommended: yes)
2) Is dashboard permission intended to be a dedicated permission (`getDashboard`) or implied by role? (Recommended: explicit permission)
3) Should “No permission” UX always be a full-page result, or sometimes inline (e.g., inside a widget)?

---

## Appendix — Reference objects (for implementation later)

- Permission codes should remain stable (e.g., `getProducts`, `manageProducts`, `getCustomers`, `manageCustomers`, `getDashboard`).
- Permission grouping should remain stable and human-meaningful (e.g., `customers`, `dashboard`).
