
The user wants a pixel-perfect web clone of an Agriculture E-commerce mobile UI kit (Agri Farming). The mockups show a mobile app with green primary (#00B354), white background, Onest font, and rounded shapes. I'll build this as a mobile-first responsive web app with a phone-frame-style layout on desktop.

Key screens visible in mockups:
1. Home (greeting, search, promo banner, "Freshly Stocked" grid, bottom tab nav)
2. Shop (categories grid: Vegetables, Fruits, Grains & Pulses, Machinery, Spices, Oil & Ghee, Dairy, Coffee & Tea)
3. Freshly Stocked (full product grid)
4. Product Detail (image carousel, description, qty selector, related products, Add to Cart)
5. Top Market Moves (list view with prices)
6. My Cart (line items with qty steppers, Checkout button)
7. Checkout (order summary, promo, totals, Continue)
8. E-Receipt (barcode, items, totals, Download)
9. My Order (order history with status badges)
10. My Favorite (favorites grid)
11. Profile (placeholder)

Design tokens (from Design System slide):
- Primary green #00B354, light green #E1F8EC
- Secondary yellow #F9B327
- Grayscale: #000, #5E5E5E, #B0B0B0, #F3F3F3, #F6F6F6, #FFF
- Success #319D3E, Error #C93838
- Font: Onest (Google Font)
- Rounded buttons (pill), rounded image cards

## Plan

### 1. Design system & fonts
- Update `src/styles.css` with the Agri Farming palette in oklch (primary green, light green, yellow, grays, success, destructive). Set radius to match pill/rounded card style.
- Load Onest from Google Fonts in `__root.tsx` head links and set as default sans family.

### 2. Shared layout
- Create `src/components/PhoneFrame.tsx` — centers content in a max-w-[420px] mobile column with subtle device shadow on desktop, full-width on mobile.
- Create `src/components/BottomTabBar.tsx` — fixed bottom nav with Home / Shop / Cart / Profile, active state in primary green.
- Create `src/components/TopBar.tsx` — reusable header with back button + centered title (used on inner pages).

### 3. Mock data
- `src/lib/data.ts` — products (id, name, price, image, category, description), categories, market-moves, orders, favorites. Use Unsplash URLs matching produce shown (cabbage, paprika, peas, ladyfinger, cauliflower, spinach, broccoli, apple, cherry, lime, avocado, wheat, onion, cardamom, rice, corn, oat, quinoa, garlic, pumpkin).

### 4. Routes (each its own file with proper head metadata)
- `src/routes/index.tsx` — Home: avatar greeting, location, bell, search input, promo carousel card ("Fresh Sales, Fast Profits 25% Off" with Start Shopping button), "Freshly Stocked" header + View all link, 2-col product grid with heart icon overlay, "Top Market Moves" preview list.
- `src/routes/shop.tsx` — Shop: centered title, 3-col category grid with rounded square images and labels.
- `src/routes/freshly-stocked.tsx` — full product grid with filter icon.
- `src/routes/product.$id.tsx` — Product detail: hero image with carousel dots, title overlay header, description, price, qty stepper, Related Products row, sticky Add to Cart button.
- `src/routes/market-moves.tsx` — list rows: thumbnail + name + brand + price.
- `src/routes/cart.tsx` — cart line items with qty steppers, sticky Checkout button.
- `src/routes/checkout.tsx` — items summary, order date, promo code, subtotal/discount/tax/total, Continue.
- `src/routes/receipt.tsx` — back header, barcode (SVG), items, order details, Download E-Receipt.
- `src/routes/orders.tsx` — order history with status pills (Pending/Cancelled/Completed colored).
- `src/routes/favorites.tsx` — 2-col favorites grid.
- `src/routes/profile.tsx` — simple profile placeholder with avatar and menu items.

Each route gets its own title/description meta. Per-route og:image set to the most prominent image where applicable.

### 5. Reusable UI pieces
- `ProductCard` (image + heart toggle + name + price)
- `CategoryTile` (square image + label)
- `QtyStepper` (− count +)
- `StatusBadge` (Pending/Cancelled/Completed)
- `SectionHeader` (title + optional "View all" link)

### 6. Polish
- All buttons use pill radius and primary green with white text matching mockup.
- Heart icons toggle local state (no backend in v1).
- Bottom tab bar shows on main tabs (Home, Shop, Cart, Profile); inner pages use TopBar with back arrow instead.
- Smooth hover/active states; focus rings using ring color.

### Notes
- This is frontend-only with mock data — no auth, no DB. If you want real product/cart/order persistence later, we can add Lovable Cloud + Stripe/Shopify in a follow-up.
- Images sourced from Unsplash (free, hotlinkable) to match the produce shown in mockups.

```text
Routes:
/                     Home (tab)
/shop                 Shop (tab)
/cart                 Cart (tab)
/profile              Profile (tab)
/freshly-stocked      Full product grid
/product/$id          Product detail
/market-moves         Market list
/checkout             Checkout
/receipt              E-Receipt
/orders               Order history
/favorites            Favorites
```
