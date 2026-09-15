# AeroNex Security Specification (Firestore Security Rules)

## 1. Data Invariants
1. **User Scope & Isolation**: All user-authored records (simulations, watchlists, saved reports, profiles) reside strictly within the `/users/{userId}` path hierarchy.
2. **Identity Invariant**: `request.auth.uid == userId` for every read, write, update, and delete operation. Cross-tenant access is strictly blocked.
3. **No Blanket Reads**: No blanket `allow read: if isSignedIn();` queries. All reads enforce `request.auth.uid == userId`.
4. **Immutability Invariant**: `userId`, `id`, and `createdAt` are immutable after creation.
5. **Volumetric Boundaries**: String fields enforce strict maximum size bounds (e.g., titles <= 150 chars, reports <= 25,000 chars, IDs <= 128 chars matching `^[a-zA-Z0-9_\-]+$`).
6. **No Unsolicited Fields**: Strict key whitelisting via validation helpers on create and updates.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Cross-User Profile Hijack**: Authenticated user B attempting to write to `/users/userA`.
2. **Anonymous Write Attack**: Unauthenticated request attempting to create a profile or simulation.
3. **Id Poisoning Attack**: Attempting to write with an ID consisting of 1.5KB buffer or illegal characters (e.g. `../` or special control chars).
4. **Immutability Breach**: Attempting to update `userId` or `createdAt` on an existing simulation document.
5. **Ghost Field Injection**: Adding `{ "isAdmin": true, "unvettedEscalation": 1 }` to UserProfile.
6. **Report Content Flooding**: Injecting a 2MB payload into `SavedReport.content` exceeding the 25,000 char boundary.
7. **Cross-Tenant Subcollection Query**: User B querying `collectionGroup('simulations')` without scoped user partition.
8. **Invalid Enum Attack**: Updating `preferredMethod` to `"random_heuristic"` instead of allowed `["laspeyres", "fisher", "paasche", "jevons"]`.
9. **Negative Threshold Attack**: Setting `alertThreshold` or `fuelShockPercent` to arbitrary out-of-spec types (e.g. nested objects or executable scripts).
10. **Unauthenticated Read**: Attempting to read `/users/{userId}/savedReports` while `request.auth == null`.
11. **Spoofed User UID in Payload**: Authenticated user A attempting to write a simulation under `/users/userA` with payload `{ "userId": "userB" }`.
12. **Foreign Root Access**: Any read or write attempting to touch arbitrary collections outside `/users/` (e.g. `/systemConfig/secrets`).
