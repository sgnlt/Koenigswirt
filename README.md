This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Takeaway ordering & table reservations

- **Takeaway ordering**: Guests order on `/menus` and check out on `/bestellung`. A Server Action validates the order and emails it to the restaurant via Resend. Orders are not stored.
- **Table reservations**: Guests request a table on `/reservierung`. A Server Action validates the reservation details (no automated capacity check) and emails the request to `ADMIN_EMAIL` (with `reply_to` set to the guest's email so the owner can confirm directly).

### Environment variables

Copy `.env.example` to `.env.local`. All are server-only.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `ADMIN_EMAIL` | Recipient of takeaway order and reservation emails |
| `ORDER_FROM_EMAIL` | Optional sender address; defaults to `onboarding@resend.dev` when unset |

If any required variable is missing in production, the server logs which one and the guest sees the fallback error with the restaurant's phone number.

### Turning ordering on

Ordering stays off until `content/takeaway.json` holds these owner-supplied facts. Until then no cart controls appear and the server rejects every order.

| Key | Meaning | Required |
| --- | --- | --- |
| `orderableItemIds` | Item `id`s from `content/menu.json` that can be ordered | Yes |
| `pickupWindows` | `{ "weekday": 1, "from": "17:00", "to": "21:00" }`, Europe/Berlin, weekday 1 = Monday | Yes |
| `leadTimeMinutes` | Minimum kitchen lead time | Yes |
| `privacyNotice` | Notice shown at checkout, worded by the owner or legal adviser | Yes |
| `maxAdvanceDays` | How far ahead a pickup can be booked; placeholder until the owner confirms | Has default |
| `minOrderCents`, `maxOrderCents` | Order value limits; `null` means none | No |
| `paymentNote`, `allergenNote` | Shown at checkout; `null` hides them | No |

Before launch, also update `/privacy-policy` (`content/legal.json`) with the owner's wording. Prices in `variants` must stay in step with the display `lines`; `pnpm test` checks this.

Rate limiting is in memory, so on serverless hosting it applies per instance.
