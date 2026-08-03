---
name: SPCX Resend account is in sandbox mode
description: Investor status-change emails fail to deliver to real investor addresses until a sending domain is verified on the connected Resend account.
---

The Resend account behind `RESEND_API_KEY` in this project is unverified (no sending domain added). Resend's sandbox mode only allows delivery to the account owner's own verified email address — any send to a different investor address returns a 403 with `"You can only send testing emails to your own email address"`.

**Why:** confirmed via a live test send during development; this is an account-level restriction on the Resend side, not a bug in the email code. The app already swallows this failure (logs and continues) so it never blocks the underlying action (e.g. investor approval still succeeds).

**How to apply:** if the user reports investor notification emails aren't arriving, check the api-server logs for a 403 `validation_error` from Resend before assuming the code is broken. Tell the user they need to verify a sending domain at resend.com/domains and update the `from` address to use that domain before emails can reach real investors.
