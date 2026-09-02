<div align="center">

# ✦ Our Little Universe ✦
*a quiet corner in the vast digital cosmos, built for two.*

<br/>

```text
       .      *       .        .        *         .
   *      .       .        *       .       .       *
       .     ✦   [ 📸 polaroid ]   .      ✦       .
  .         *       \    /       .        *
     *   .           \  /    .       .       .
 .          .         \/          *       .      *
     ✦       "every little second with you"       ✦
```

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Storage-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Gentle%20Physics-rose?style=flat-square)](https://www.framer.com/motion/)

<br/>

> *"This is not a productivity app, nor a social network.*  
> *No follower counts, no relationship timers, no anniversary pressure.*  
> *Just a living scrapbook of candid laughs, uncurated moments, and secret notes."*

</div>

---

### 📖 The Philosophy

In a world obsessed with public feeds, streaks, and milestone counters, **Our Little Universe** is an intentional sanctuary. 

- **No Chronological Pressure:** Life isn't lived in strict linear timelines. Memories drift naturally, shuffled organically like loose polaroids spilled across a warm wooden desk.
- **Organic Physics:** Everything breathes. Polaroids bob gently in non-synchronized floating cycles, paper cards respond with subtle 3D tilts, and hearts drift upward like stardust.
- **Two Keys Only:** While the front window showcases a soft constellation of memories, the inner desk is sealed with Supabase RLS—accessible only by the two of us.

---

### 🌸 Features & Craft

| Space | Experience |
| :--- | :--- |
| **🌌 The Constellation (`/`)** | Scattered floating polaroids with independent float physics (`4s–7s`), handwritten quotes, and ambient upward-drifting sparkles. |
| **🗺️ The Album (`/moments`)** | Two quiet collections: *First Adventures* (major journeys) and *Random Little Things* (the chaotic, beautiful everyday). |
| **🕯️ The Journal Desk (`/ruang-kita`)** | Warm radial spotlight, paper noise textures, and a floating glassmorphic pill navigation. |
| **💌 Secret Memos (`/ruang-kita/catatan`)** | Single random note pinned with a vintage brass thumbtack, accompanied by an animated breathing notebook. |
| **✉️ The Open Envelope (`/ruang-kita/upload`)** | An illustrated love-letter dropzone with automatic client-side `.HEIC` conversion for instant iPhone photo compatibility. |

---

### 🗝️ Lighting Up the Stars (Setup)

For those who wish to build their own private haven:

#### 1. Requirements
- Node.js 18+
- A [Supabase](https://supabase.com) project (PostgreSQL + Auth + Storage)

#### 2. Database Schema
Execute [`schema.sql`](./schema.sql) in your Supabase SQL Editor. This sets up:
- The `moments`, `media`, and `notes` tables.
- The `memories` storage bucket.
- Row Level Security (RLS) ensuring private notes and unreleased memories remain strictly confidential.

#### 3. Environment Secrets
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to visit the universe.

---

### 📦 Tech Palette

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom paper torn borders, authentic washi tape shaders
- **Typography**: Google Fonts (*Outfit*, *Inter*, & *Caveat* handwriting)
- **Physics**: Framer Motion
- **Media**: Client-side `heic2any` pipeline directly to Supabase Storage

---

<div align="center">

*“Two hearts, one quiet room in the infinite web.”* ‧₊˚❀

</div>
