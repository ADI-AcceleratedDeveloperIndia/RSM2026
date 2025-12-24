# Regional Districts Setup Guide

## Overview
The system now includes **all 33 districts of Telangana** with complete templates ready for RTA member information.

## Current Status

### ✅ Completed Districts (2)
1. **Karimnagar** - Sri Padala Rahul Garu
2. **Rajanna Sircilla** - Sri Sangeetham Sreenath Garu

### ⏳ Pending Districts (31)
All other districts are set up with "To Be Announced" placeholders and are ready to receive:
- RTA Member photos
- RTA Member names

## How to Add/Update District Information

### Step 1: Add the Photo
1. Save the RTA member's photo in: `/public/assets/leadership/`
2. Recommended naming: `{district-code}-rta-member.jpg` or `.png` or `.webp`
3. Example: `hyderabad-rta-member.jpg`

### Step 2: Update the Regional Data
Open `/lib/regional.ts` and find the district entry. Update these fields:

```typescript
hyderabad: {
  code: "hyderabad",
  district: "Hyderabad",
  officerName: "Sri [Full Name] Garu",  // ← Update this
  officerTitle: "Regional Transport Authority Member, Hyderabad",
  photo: "/assets/leadership/hyderabad-rta-member.jpg",  // ← Update this
  description: "Managing road safety awareness and traffic compliance initiatives in Hyderabad city.",
},
```

### Step 3: Test
1. Visit `/certificates/regional` to see the district card
2. Click "Generate Certificate" to test certificate creation
3. Verify the photo and name appear correctly on the certificate

## All Districts List

1. Adilabad
2. Bhadradri Kothagudem
3. Hyderabad
4. Jagtial
5. Jangaon
6. Jayashankar Bhupalpally
7. Jogulamba Gadwal
8. Kamareddy
9. **Karimnagar** ✅
10. Khammam
11. Kumuram Bheem Asifabad
12. Mahabubabad
13. Mahabubnagar
14. Mancherial
15. Medak
16. Medchal-Malkajgiri
17. Mulugu
18. Nagarkurnool
19. Nalgonda
20. Narayanpet
21. Nirmal
22. Nizamabad
23. Peddapalli
24. **Rajanna Sircilla** ✅
25. Ranga Reddy
26. Sangareddy
27. Siddipet
28. Suryapet
29. Vikarabad
30. Wanaparthy
31. Warangal
32. Hanumakonda
33. Yadadri Bhuvanagiri

## File Locations

- **Regional Data**: `/lib/regional.ts`
- **Photos Directory**: `/public/assets/leadership/`
- **Regional Page**: `/app/certificates/regional/page.tsx`
- **Certificate Component**: `/components/certificates/Certificate.tsx`

## Features Already Implemented

✅ All 33 districts with complete data structure  
✅ Placeholder system for districts without photos  
✅ Certificate generation with RTA member photo  
✅ Regional events page showing all districts  
✅ Preview and download functionality  
✅ Proper alignment and formatting  

## Example Update

To add Hyderabad RTA Member "Sri Ramesh Kumar Garu":

1. Save photo as `/public/assets/leadership/hyderabad-rta-member.jpg`
2. Update in `/lib/regional.ts`:
```typescript
hyderabad: {
  code: "hyderabad",
  district: "Hyderabad",
  officerName: "Sri Ramesh Kumar Garu",
  officerTitle: "Regional Transport Authority Member, Hyderabad",
  photo: "/assets/leadership/hyderabad-rta-member.jpg",
  description: "Managing road safety awareness and traffic compliance initiatives in Hyderabad city.",
},
```
3. Done! The district card and certificates will automatically update.

## Notes

- The `code` field should match the object key (lowercase, no spaces)
- Use "Sri [Name] Garu" format for consistency
- Photos should be professional quality
- Recommended photo size: at least 320×320 pixels
- Supported formats: JPG, PNG, WEBP

