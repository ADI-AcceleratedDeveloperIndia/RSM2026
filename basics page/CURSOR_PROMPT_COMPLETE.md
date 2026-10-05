# Complete Cursor Prompt: Road Signs Implementation for Basics Page

## 📋 INSTRUCTIONS FOR CURSOR AI

You are implementing a road signs learning and quiz system on the Basics page. This replaces any existing road signs implementation.

---

## 📁 FOLDER STRUCTURE TO USE

The road signs data is in a folder called `road_signs_paired_from_source`. This folder contains:

```
road_signs_paired_from_source/
├── mandatory/
│   ├── mandatory_01.jpg
│   ├── mandatory_02.jpg
│   ├── ... (32 images total)
│   └── mandatory_32.jpg
├── cautionary/
│   ├── cautionary_01.jpg
│   ├── cautionary_02.jpg
│   ├── ... (36 images total)
│   └── cautionary_36.jpg
├── informatory/
│   ├── informatory_01.jpg
│   ├── informatory_02.jpg
│   ├── ... (19 images total)
│   └── informatory_19.jpg
└── road_signs_paired_verified.json
```

**Total: 87 road sign images + 1 JSON data file**

---

## 📄 DATA FILE

**File to use:** `road_signs_paired_from_source/road_signs_paired_verified.json`

This JSON file contains all 87 signs with:
- Image paths (relative to the folder)
- Sign names
- Descriptions
- Hover text (ready to use)
- Tooltip data

**Data Structure Example:**
```json
{
  "source": {
    "name": "Maruti Suzuki Driving School",
    "url": "https://www.marutisuzukidrivingschool.com/mock-llr-road-sign",
    "attribution": "Road signs and descriptions sourced from Maruti Suzuki Driving School's educational materials. Used for educational purposes only."
  },
  "totalSigns": 87,
  "categories": {
    "mandatory": {
      "id": "mandatory",
      "name": "Mandatory Signs",
      "description": "These road signals and signs are used to make road users aware of specific laws and regulations that must be followed.",
      "count": 32,
      "signs": [
        {
          "id": 1,
          "image": "road_signs_paired_from_source/mandatory/mandatory_01.jpg",
          "name": "No Entry",
          "description": "This sign indicates that it is a no entry or restricted area ahead and no traffic is allowed.",
          "hover_text": "No Entry: This sign indicates that it is a no entry or restricted area ahead and no traffic is allowed.",
          "tooltip": {
            "title": "No Entry",
            "description": "This sign indicates that it is a no entry or restricted area ahead and no traffic is allowed.",
            "category": "mandatory"
          }
        }
        // ... more signs
      ]
    },
    "cautionary": { /* 36 signs */ },
    "informatory": { /* 19 signs */ }
  }
}
```

---

## 🎯 IMPLEMENTATION REQUIREMENTS

### 1. **Replace Existing Implementation**
- Remove all current road signs images and quiz data from the Basics page
- Use ONLY the data from `road_signs_paired_verified.json`
- Use ONLY the images from `road_signs_paired_from_source/` folders

### 2. **Two Main Modes**

#### **Mode 1: Learn Mode (Browse Signs)**
- Display all signs in a grid layout
- Show signs organized by category (Mandatory, Cautionary, Informatory)
- Category filter tabs/buttons to switch between categories
- Each sign image should have:
  - **Hover tooltip** showing the sign name and description
  - Use the `hover_text` field directly: `title={sign.hover_text}`
  - Or implement a custom tooltip using `tooltip.title` and `tooltip.description`
- Responsive grid: 3-4 columns on desktop, 2 on tablet, 1 on mobile
- Click on a sign to see full details (optional enhancement)

#### **Mode 2: Quiz Mode (Interactive Test)**
- Multiple choice quiz format
- Show one sign image at a time
- Question: "What does this road sign mean?"
- 4 answer options:
  - 1 correct answer (the sign's actual name/description)
  - 3 wrong answers (randomly selected from other signs in the same category)
- Features:
  - Progress indicator (e.g., "Question 5 of 10")
  - Score tracking
  - Immediate feedback on answer selection
  - Show correct answer if wrong
  - Final score screen at the end
  - Option to retake quiz
  - Category selection (quiz only Mandatory, only Cautionary, only Informatory, or All)

### 3. **UI/UX Requirements**
- Modern, clean design
- Mobile-responsive (works on all screen sizes)
- Smooth transitions and animations
- Clear visual hierarchy
- Accessible (keyboard navigation, screen reader friendly)
- Loading states for images
- Error handling if images don't load

### 4. **Technical Implementation**

#### **Loading Data:**
```javascript
// Example (adjust to your framework)
import roadSignsData from './road_signs_paired_from_source/road_signs_paired_verified.json';

// Or fetch if needed
const response = await fetch('/road_signs_paired_from_source/road_signs_paired_verified.json');
const roadSignsData = await response.json();
```

#### **Image Paths:**
- Use the `image` field from JSON (e.g., `road_signs_paired_from_source/mandatory/mandatory_01.jpg`)
- Ensure images are accessible from your public/assets folder
- Handle image loading errors gracefully

#### **Hover Implementation:**
```jsx
// Simple approach
<img 
  src={sign.image} 
  alt={sign.name}
  title={sign.hover_text}
/>

// Or custom tooltip component
<Tooltip title={sign.tooltip.title} description={sign.tooltip.description}>
  <img src={sign.image} alt={sign.name} />
</Tooltip>
```

#### **Quiz Options Generation:**
```javascript
function generateQuizOptions(correctSign, allSigns, category) {
  // Get all signs from same category
  const categorySigns = allSigns.filter(s => s.tooltip.category === category);
  
  // Remove correct sign
  const wrongSigns = categorySigns.filter(s => s.id !== correctSign.id);
  
  // Randomly select 3 wrong answers
  const wrongOptions = wrongSigns
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(s => s.name);
  
  // Create options array
  const options = [
    correctSign.name,
    ...wrongOptions
  ].sort(() => Math.random() - 0.5); // Shuffle
  
  return {
    question: "What does this road sign mean?",
    image: correctSign.image,
    options: options,
    correctAnswer: correctSign.name,
    correctIndex: options.indexOf(correctSign.name),
    explanation: correctSign.description
  };
}
```

### 5. **Source Attribution**
Add this text somewhere on the Basics page (footer or info section):
> "Road signs and descriptions sourced from Maruti Suzuki Driving School's educational materials. Used for educational purposes only."

---

## ✅ CHECKLIST

Before completing, ensure:
- [ ] All 87 signs are loaded and displayed correctly
- [ ] Images are showing (not broken links)
- [ ] Hover tooltips work on all signs
- [ ] Category filtering works (Mandatory, Cautionary, Informatory)
- [ ] Quiz mode generates questions correctly
- [ ] Quiz options are shuffled properly
- [ ] Correct answers match the sign shown
- [ ] Mobile responsive design works
- [ ] Source attribution is included
- [ ] No old/previous road signs data is being used

---

## 🚀 START IMPLEMENTATION

1. **Locate the Basics page** in your project
2. **Read the JSON file** from `road_signs_paired_from_source/road_signs_paired_verified.json`
3. **Copy the images folder** `road_signs_paired_from_source/` to your project's public/assets directory (or wherever static assets are stored)
4. **Implement Learn Mode** with hover tooltips
5. **Implement Quiz Mode** with multiple choice questions
6. **Add category filtering** for both modes
7. **Make it mobile responsive**
8. **Add source attribution**
9. **Test thoroughly** - verify all 87 signs work correctly

---

## 📝 NOTES

- **All images are 100% verified** - each image is correctly paired with its description from the source website
- **Total signs:** 87 (32 Mandatory + 36 Cautionary + 19 Informatory)
- **Data is ready to use** - no additional processing needed
- **Use relative paths** - don't hardcode absolute paths
- **Framework agnostic** - adapt the examples to your framework (React, Vue, Next.js, etc.)

---

## 🎨 DESIGN SUGGESTIONS

- Use a card-based layout for signs in Learn Mode
- Add category badges/colors (e.g., Red for Mandatory, Yellow for Cautionary, Blue for Informatory)
- Smooth hover effects on sign cards
- Progress bar for quiz mode
- Confetti or celebration animation on quiz completion
- Dark mode support (optional but nice)

---

**Now implement this on the Basics page. Replace all existing road signs implementation with this new system.**

