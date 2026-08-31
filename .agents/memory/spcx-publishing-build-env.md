---
name: SPCX publishing build environment
description: Build-time environment behavior for the SPCX web artifact.
---

The publishing builder does not provide the web artifact's runtime-only `PORT` and `BASE_PATH` variables during its production build. The Vite config must therefore provide defaults that match the artifact settings, while still honoring those variables when the development workflow supplies them.

**Why:** A production publish can fail before Vite starts if the config treats runtime service variables as mandatory build inputs.

**How to apply:** When changing SPCX artifact deployment settings or Vite configuration, validate the production build with `PORT` and `BASE_PATH` unset.