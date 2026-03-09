# D&D Campaign Booking

## Project Structure

```
dnd-booking/
├── .env.local                        # DB URL, NextAuth secret, Supabase keys
├── .env.example
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
│
├── prisma/
│   ├── schema.prisma                 # User, Campaign, Booking, Date models
│   └── migrations/
│
├── public/
│   └── images/
│
└── src/
    ├── app/                          # Next.js 14 App Router
    │   ├── layout.tsx
    │   ├── page.tsx                  # Landing page
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── dashboard/page.tsx        # Player dashboard
    │   ├── campaigns/
    │   │   ├── page.tsx              # Browse campaigns
    │   │   ├── [id]/page.tsx         # Campaign detail + booking
    │   │   └── new/page.tsx          # DM: create campaign
    │   ├── bookings/
    │   │   ├── page.tsx              # My bookings
    │   │   └── [id]/page.tsx         # Booking detail / cancel
    │   └── dm/
    │       ├── page.tsx              # DM dashboard
    │       ├── campaigns/page.tsx
    │       └── sessions/page.tsx
    │
    ├── app/api/                      # API Route handlers
    │   ├── auth/[...nextauth]/route.ts
    │   ├── campaigns/route.ts
    │   ├── campaigns/[id]/route.ts
    │   ├── bookings/route.ts
    │   ├── bookings/[id]/route.ts
    │   ├── dates/route.ts
    │   └── dates/[id]/route.ts
    │
    ├── components/
    │   ├── ui/                       # Button, Badge, Modal
    │   ├── layout/                   # Navbar, Sidebar, Footer
    │   ├── campaigns/                # CampaignCard, DifficultyBadge
    │   ├── bookings/                 # BookingCard, StatusBadge
    │   ├── calendar/                 # CalendarGrid, SessionSlot
    │   └── auth/                     # LoginForm, UserMenu
    │
    ├── lib/
    │   ├── prisma.ts                 # Prisma client singleton
    │   ├── auth.ts                   # NextAuth config
    │   ├── supabase.ts               # Supabase client
    │   └── utils.ts                  # Helpers & formatters
    │
    ├── hooks/
    │   ├── useBookings.ts
    │   ├── useCampaigns.ts
    │   └── useSession.ts
    │
    ├── types/
    │   └── index.ts                  # Shared TypeScript types
    │
    └── styles/
        └── globals.css
```