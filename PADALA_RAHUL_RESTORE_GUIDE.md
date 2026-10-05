# Padala Rahul - Restoration Guide

## Details Saved
All Padala Rahul information is saved in: `padala-rahul-details.json`

## Information Stored
- **Name**: Padala Rahul
- **Post Name**: RTA Member
- **Full Title**: RTA Member, Karimnagar
- **Photo Path**: `/public/assets/leadership/Karimnagarrtamemberpadalarahul.webp`
- **Photo File**: `Karimnagarrtamemberpadalarahul.webp`
- **District**: Karimnagar
- **Designation**: Regional Transport Authority Member

## Current Status
✅ **REMOVED** from certificate generation
- Photo removed from certificate header
- Signature block removed from certificate footer
- All references commented out in code

## To Restore Later

### 1. Photo Display
In `app/api/certificates/download/route.ts`:
- Uncomment the `regionalPhotoPath` variable
- Uncomment the `regionalPhoto` variable
- Uncomment the photo loading logic (lines ~82-94)
- Uncomment the photo display in HTML template (line ~392)

### 2. Signature Block
In `app/api/certificates/download/route.ts`:
- Uncomment the Padala Rahul signature block (lines ~434-439)
- Restore the conditional logic for regional events

### 3. Photo Loading
The photo file is still at:
`/public/assets/leadership/Karimnagarrtamemberpadalarahul.webp`

## Notes
- All code is commented with `// REMOVED:` or `<!-- REMOVED: -->` tags
- Search for "Padala Rahul" or "REMOVED" to find all locations
- The photo file is NOT deleted, just not loaded
- Certificate generation still works, just without Padala Rahul

