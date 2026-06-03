---
name: Gorilla Guardians orders data shape
description: Mismatch between real API order shape and demo-data shape in admin/orders.tsx
---

## Rule
The real `/api/orders` response returns orders with these fields:
- Customer name: derived from `shippingAddress` (format: "Name, street, city, postal, country") — NOT `customer.name`
- Item names: `item.productName` (string column in `order_items`) — NOT `item.product.name`

The demo fallback in `admin/orders.tsx` uses `o.customer.name` and `i.product.name`.

**Why:** The `buildOrder()` function in `orders.ts` spreads the raw DB row (which has `shippingAddress`, `userId`) and maps `orderItemsTable` rows (which have `productName`). There's no `customer` join or `product` sub-object.

## How to apply
When displaying order customer or item data from the real API, always use:
- `o.shippingAddress?.split(",")[0]` for customer name
- `i.productName` for item name
Use the pattern in `admin/orders.tsx` where `_customerName` and `_itemNames` are computed once and reused.
