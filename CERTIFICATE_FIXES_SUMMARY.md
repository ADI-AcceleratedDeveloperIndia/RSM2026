# Certificate Generation & Download Fixes - Complete Summary

## Changes Made

### 1. ID Format Changes (ON/OF instead of SW/RG)

**Event IDs:**
- Format: `{PREFIX}-RSM-2026-PDL-RHL-EVT-{CONTEXT}-{NUMBER}`
- `CONTEXT`: `ON` (Online) or `OF` (Offline)
- TGSG prefix = Statewide (no SW needed)
- District code prefix = Regional (no RG needed)

**Certificate IDs:**
- Format: `{PREFIX}-RSM-2026-PDL-RHL-{TYPE}-{CONTEXT}-{NUMBER}`
- `CONTEXT`: `ON` (Online) or `OF` (Offline)
- Matches event context or participant's participation context

### 2. Event Model Updates

**Added `eventContext` field:**
- `models/Event.ts`: Added `eventContext: "online" | "offline"` field
- Events can now be online (happens on website) or offline (physical events)
- Default: `"online"` for new events

### 3. Certificate Generation Logic

**Updated `lib/reference.ts`:**
- `generateEventId()`: Now takes `participationContext` parameter, uses ON/OF
- `generateEventReferenceId()`: Accepts `eventContext` parameter (defaults to "offline" but should be set by organizer)
- `generateCertificateNumber()`: Includes ON/OF in certificate ID based on participation context

**Updated `app/api/certificates/create/route.ts`:**
- Extracts `eventContext` from event when event ID is provided
- Uses event's `eventContext` for certificate `participationContext`
- Updated certificate number extraction regex: `/-(ON|OF)-(\d{5})$/`

### 4. Event Creation Updates

**Updated `app/api/events/create/route.ts`:**
- Accepts `eventContext` in request body
- Defaults to `"online"` if not provided
- Passes `eventContext` to `generateEventReferenceId()`

**Updated `app/events/page.tsx`:**
- Added `eventContext` field to form
- Added dropdown to select online/offline
- Removed hardcoded SW/RG display
- Shows event context (Online/Offline) instead

**Updated `app/events/[eventId]/page.tsx`:**
- Removed hardcoded SW/RG display
- Added eventContext display (Online/Offline badge)
- Updated Event type to include `eventContext` and `district`

### 5. Event API Updates

**Updated `app/api/events/[eventId]/route.ts`:**
- Added `eventContext` and `district` to select fields

**Updated `app/api/events/list/route.ts`:**
- Added `eventType`, `eventContext`, and `district` to select fields

### 6. Certificate Download Route

**Verified `app/api/certificates/download/route.ts`:**
- Correctly extracts `eventType` and `participationContext` from certificate
- Properly determines regional vs statewide based on event type and prefix
- Correctly shows/hides regional authority photos
- Subtitle logic correctly handles all 5 scenarios

### 7. Certificate Preview Component

**Updated `components/certificates/Certificate.tsx`:**
- Added `participationContext` to `CertificateData` interface
- Dynamic subtitle based on `participationContext` and `eventType`
- Matches server-side logic

**Updated `app/certificates/preview/page.tsx`:**
- Passes `participationContext` from API response to certificate component

**Updated `app/api/certificates/get/route.ts`:**
- Returns `participationContext` in certificate data

## 5 Certificate Scenarios

### Scenario 1: Online Without Event ID
- **Event ID**: N/A
- **Certificate ID**: `KRMR-RSM-2026-PDL-RHL-PARTICIPANT-ON-45231`
- **Subtitle**: "Online Event - Road Safety Month - Telangana"

### Scenario 2: Online With Statewide Event ID
- **Event ID**: `TGSG-RSM-2026-PDL-RHL-EVT-ON-00001` (if event is online)
- **Certificate ID**: `TGSG-RSM-2026-PDL-RHL-PARTICIPANT-ON-00001`
- **Subtitle**: "Statewide Event - Road Safety Month - Telangana"

### Scenario 3: Online With Regional Event ID
- **Event ID**: `KRMR-RSM-2026-PDL-RHL-EVT-ON-00001` (if event is online)
- **Certificate ID**: `KRMR-RSM-2026-PDL-RHL-PARTICIPANT-ON-00001`
- **Subtitle**: "Regional Event - Road Safety Month - Telangana"
- **Shows**: Regional authority photo (if Karimnagar)

### Scenario 4: Offline With Statewide Event ID
- **Event ID**: `TGSG-RSM-2026-PDL-RHL-EVT-OF-00001` (if event is offline)
- **Certificate ID**: `TGSG-RSM-2026-PDL-RHL-PARTICIPANT-OF-00001`
- **Subtitle**: "Statewide Event - Road Safety Month - Telangana"

### Scenario 5: Offline With Regional Event ID
- **Event ID**: `KRMR-RSM-2026-PDL-RHL-EVT-OF-00001` (if event is offline)
- **Certificate ID**: `KRMR-RSM-2026-PDL-RHL-PARTICIPANT-OF-00001`
- **Subtitle**: "Regional Event - Road Safety Month - Telangana"
- **Shows**: Regional authority photo (if Karimnagar)

## Testing Checklist

- [x] Event creation with online/offline context
- [x] Certificate generation for all 5 scenarios
- [x] Certificate ID format includes ON/OF
- [x] Certificate number extraction regex updated
- [x] Certificate download route logic verified
- [x] Certificate preview component shows correct subtitle
- [x] Event display shows context (Online/Offline) instead of SW/RG
- [x] Regional authority photos show only for regional events
- [x] No hardcoded SW/RG references remain

## Files Modified

1. `lib/reference.ts` - Updated ID generation functions
2. `models/Event.ts` - Added eventContext field
3. `app/api/events/create/route.ts` - Accepts and uses eventContext
4. `app/api/events/[eventId]/route.ts` - Returns eventContext
5. `app/api/events/list/route.ts` - Returns eventContext
6. `app/api/certificates/create/route.ts` - Uses eventContext, updated regex
7. `app/api/certificates/get/route.ts` - Returns participationContext
8. `app/api/certificates/download/route.ts` - Verified logic (no changes needed)
9. `app/events/page.tsx` - Added eventContext field, removed SW/RG
10. `app/events/[eventId]/page.tsx` - Removed SW/RG, added eventContext display
11. `components/certificates/Certificate.tsx` - Added participationContext, dynamic subtitle
12. `app/certificates/preview/page.tsx` - Passes participationContext

## Notes

- Certificate download should work correctly for all scenarios
- Event IDs now properly distinguish online vs offline events
- Certificate IDs match event context (or participant context for scenario 1)
- All hardcoded SW/RG references removed
- Regional authority photos logic unchanged (only for regional events, Karimnagar)

