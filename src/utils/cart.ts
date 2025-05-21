// Ambil user dari localStorage
const userStr = typeof window !== "undefined" ? localStorage.getItem('user') : null;
const user = userStr ? JSON.parse(userStr) : null;
const cartKey = user ? `cart_${user.id}` : 'cart';

export function addToCart(product, cartKey: string) {
  let cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
  const idx = cart.findIndex((item) => item.productId === product.productId)
  if (idx > -1) {
    cart[idx].qty += product.qty
  } else {
    cart.push(product)
  }
  localStorage.setItem(cartKey, JSON.stringify(cart))
}

export function getCart(cartKey: string) {
  return JSON.parse(localStorage.getItem(cartKey) || '[]');
}

export function removeFromCart(productId: number, cartKey: string) {
  let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  cart = cart.filter(item => item.productId !== productId);
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

export function clearCart(cartKey: string) {
  localStorage.removeItem(cartKey);
}

// Tambahkan di src/app/page.tsx atau utils/cart.ts
export async function saveCartToDB(userId: number, cart: any[]) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items: cart }),
  })
}

export function updateCartQty(productId: number, qty: number, cartKey: string) {
  let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  cart = cart.map((item: any) =>
    item.productId === productId ? { ...item, qty: Math.max(1, qty) } : item
  );
  localStorage.setItem(cartKey, JSON.stringify(cart));
}