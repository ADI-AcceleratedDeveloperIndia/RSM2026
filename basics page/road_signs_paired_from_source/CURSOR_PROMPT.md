# Cursor Prompt for Basics Page Implementation

## 📁 Folder Path
```
C:\Users\DELL\TRAFFIC SIGNS\road_signs_paired_from_source\
```

## 🎯 Copy This Prompt to Cursor:

---

**"I have 87 road signs with their descriptions extracted from Maruti Suzuki Driving School website. Each image is 100% verified and paired with its exact description from the source page.**

**Folder location: `road_signs_paired_from_source/`**

**Files to use:**
- `road_signs_paired_verified.json` - Complete data with all 87 signs
- Images in: `mandatory/`, `cautionary/`, `informatory/` folders

**Requirements:**
1. Replace the current road signs implementation in the Basics page
2. Use the data from `road_signs_paired_verified.json`
3. Implement hover tooltips that show the sign name and description when hovering over images
4. Create an interactive quiz/test feature with:
   - Multiple choice questions (show image, ask what it means)
   - Category filtering (Mandatory, Cautionary, Informatory)
   - Progress tracking and scoring
5. Include learn mode (browse signs with descriptions) and quiz mode
6. Make it mobile-responsive and modern UI

**Data Structure:**
Each sign has:
- `image`: path to image file
- `name`: sign name
- `description`: full description
- `hover_text`: ready-to-use hover text ("Name: Description")
- `tooltip`: object with title, description, category

**Hover Implementation:**
Use the `hover_text` field directly or the `tooltip` object for advanced tooltips.

**Source Attribution:**
Include: 'Road signs and descriptions sourced from Maruti Suzuki Driving School's educational materials. Used for educational purposes only.'

**Please implement this on the Basics page with a modern, clean design."**

---

## 📋 Quick Reference

**Folder**: `road_signs_paired_from_source/`
**Data File**: `road_signs_paired_verified.json`
**Total Signs**: 87 (32 mandatory, 36 cautionary, 19 informatory)
**Status**: 100% verified - each image paired with its description from source


