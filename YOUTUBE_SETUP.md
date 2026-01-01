# 🎬 YouTube Video Setup Guide

## ✅ Code Updated - Ready for YouTube Links!

The modal now supports YouTube videos. Just add your YouTube links and you're done!

---

## 📝 How to Add YouTube Videos

### Step 1: Upload Videos to YouTube
1. Go to https://www.youtube.com
2. Upload each video:
   - Helmet
   - Seat belt
   - Phone distraction
   - Way to ambulance

### Step 2: Get YouTube Video IDs
After uploading, you'll get URLs like:
- `https://www.youtube.com/watch?v=ABC123xyz`
- OR: `https://youtu.be/ABC123xyz`

The **video ID** is the part after `v=` or after `youtu.be/` (e.g., `ABC123xyz`)

### Step 3: Add to Code
Open: `components/MinisterMessageModal.tsx`

Find this section (around line 11-18):
```typescript
const VIDEOS: string[] = [
  "", // Helmet - Paste YouTube video ID/URL here
  "", // Seat belt - Paste YouTube video ID/URL here
  "", // Phone distraction - Paste YouTube video ID/URL here
  "", // Way to ambulance - Paste YouTube video ID/URL here
];
```

**Replace the empty strings with your YouTube video IDs or URLs:**

**Option A: Just the video ID (easiest)**
```typescript
const VIDEOS: string[] = [
  "ABC123xyz", // Helmet
  "DEF456uvw", // Seat belt
  "GHI789rst", // Phone distraction
  "JKL012mno", // Way to ambulance
];
```

**Option B: Full YouTube URL (also works)**
```typescript
const VIDEOS: string[] = [
  "https://www.youtube.com/watch?v=ABC123xyz", // Helmet
  "https://youtu.be/DEF456uvw", // Seat belt
  "https://www.youtube.com/watch?v=GHI789rst", // Phone distraction
  "https://youtu.be/JKL012mno", // Way to ambulance
];
```

### Step 4: Test & Deploy
1. Test locally - videos should play in the modal
2. Commit and push
3. Done! ✅

---

## 🎯 Example

If your YouTube video URL is: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

Just use: `"dQw4w9WgXcQ"` in the VIDEOS array.

---

## ✅ Benefits of YouTube

- ✅ **Instant** - No compression needed
- ✅ **Free** - YouTube hosting is free
- ✅ **Reliable** - YouTube's CDN is fast
- ✅ **No Vercel errors** - Videos not in your repo
- ✅ **Easy updates** - Change videos without redeploying

---

## ⚠️ Notes

- Videos will show YouTube player (with YouTube logo)
- Requires internet connection
- YouTube may show related videos at the end (can be minimized with `rel=0`)

---

## 🚀 Ready to Go!

Once you add the YouTube IDs, the modal will automatically:
- Detect YouTube videos
- Embed them properly
- Support navigation between videos
- Work on mobile and desktop

**That's it! Much easier than compression!** 🎉

