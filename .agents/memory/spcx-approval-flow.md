---
name: SPCX investor approval flow
description: Whether new investor signups on SPCX should auto-approve or require manual admin review.
---

SPCX (`artifacts/spcx` + `artifacts/api-server`) requires manual admin approval for new investor signups (status starts `pending`, admin flips it to `approved`/`rejected` via the admin panel) before the investor can sign in and see their dashboard.

**Why:** An earlier iteration of the app auto-approved signups. The app was later migrated to a more mature architecture (ported from a user-supplied reference project) that inherently uses a pending → admin-approves flow, matching a real IPO investor-relations onboarding process. When asked explicitly, the user confirmed keeping manual approval over restoring auto-approve.

**How to apply:** Do not "fix" this back to auto-approve as a bug — it's the confirmed intended behavior. If a future request wants faster onboarding, treat it as a deliberate product change to discuss, not a regression to silently revert.
