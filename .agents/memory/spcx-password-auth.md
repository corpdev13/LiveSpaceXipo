---
name: SPCX password authentication
description: Password storage and compatibility rules for investor registration and sign-in.
---

New investor passwords are stored only as salted scrypt hashes and are never returned by the API. Credential columns remain nullable so records created before password authentication can be migrated without a destructive schema change. Legacy records can establish a password through the email-first, short-lived, single-use setup-token flow.

**Why:** Requiring non-null credentials would make the existing investor rows fail during schema migration, while accepting missing passwords without a controlled setup path would leave old investors unable to sign in.

**How to apply:** Keep password verification server-side, return only safe investor fields, hash setup tokens before storage, expire them quickly, allow one use only, and preserve the pending status gate after successful credential verification.