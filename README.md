dnd-booking/
├── .env.local                        # DB URL, NextAuth secret, Supabase keys
├── .env.example
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
│
├── prisma/                           # DB schema & migrations
│   ├── schema.prisma                 # User, Campaign, Booking, Date models
│   └── migrations/
│
├── public/
│   └── images/
│
└── src/
    ├── app/                          # Next.js 14 App Router
    │   ├── layout.tsx                # Root layout (font, providers)
    │   ├── page.tsx                  # Landing page
    │   │
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   ├── dashboard/
    │   │   └── page.tsx              # Player dashboard (upcoming sessions)
    │   │
    │   ├── campaigns/
    │   │   ├── page.tsx              # Browse all campaigns
    │   │   ├── [id]/page.tsx         # Campaign detail + booking CTA
    │   │   └── new/page.tsx          # DM: create campaign
    │   │
    │   ├── bookings/
    │   │   ├── page.tsx              # My bookings list
    │   │   └── [id]/page.tsx         # Booking detail / cancel
    │   │
    │   └── dm/
    │       ├── page.tsx              # DM dashboard
    │       ├── campaigns/page.tsx    # Manage campaigns
    │       └── sessions/page.tsx     # Manage dates / confirm bookings
    │
    ├── api/                          # Next.js API Routes (App Router)
    │   ├── auth/
    │   │   └── [...nextauth]/route.ts
    │   │
    │   ├── campaigns/
    │   │   ├── route.ts              # GET /list, POST /create
    │   │   └── [id]/route.ts         # GET, PATCH, DELETE
    │   │
    │   ├── bookings/
    │   │   ├── route.ts              # POST /create
    │   │   └── [id]/route.ts         # GET, PATCH (status), DELETE
    │   │
    │   └── dates/
    │       ├── route.ts              # POST /create
    │       └── [id]/route.ts         # GET, PATCH, DELETE
    │
    ├── components/
    │   ├── ui/                       # Reusable primitives (Button, Badge, Modal)
    │   ├── layout/                   # Navbar, Sidebar, Footer
    │   ├── campaigns/                # CampaignCard, CampaignForm, DifficultyBadge
    │   ├── bookings/                 # BookingCard, StatusBadge, BookingForm
    │   ├── calendar/                 # CalendarGrid, SessionSlot, TimezonePicker
    │   └── auth/                     # LoginForm, UserMenu
    │
    ├── lib/
    │   ├── prisma.ts                 # Prisma client singleton
    │   ├── auth.ts                   # NextAuth config (providers, callbacks)
    │   ├── supabase.ts               # Supabase client (storage / realtime)
    │   └── utils.ts                  # Date helpers, formatters
    │
    ├── hooks/
    │   ├── useBookings.ts
    │   ├── useCampaigns.ts
    │   └── useSession.ts             # Auth session helper
    │
    ├── types/
    │   └── index.ts                  # User, Campaign, Booking, Date TS types
    │
    └── styles/
        └── globals.css               # Tailwind base imports