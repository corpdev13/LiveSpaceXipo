---
name: SPCX password authentication
description: Password storage and compatibility rules for investor registration and sign-in.
---

New investor passwords are stored only as salted scrypt hashes and are never returned by the API. Credential columns remain nullable so records created before password authentication can be migrated without a destructive schema change; those legacy records need a separate reset flow.

**Why:** Requiring non-null credentials would make the existing investor rows fail during schema migration, while accepting missing passwords would weaken the new sign-in requirement.

**How to apply:** Keep password verification server-side, return only safe investor fields, and preserve the pending status gate after successful credential verification.