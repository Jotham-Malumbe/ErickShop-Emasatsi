/* =========================================================
   GLOBAL STATE
   ========================================================= */

let products = [];
let cart = [];

// Load cart from localStorage (persistence feature)
window.addEventListener("load", () => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  loadProducts();
  renderCart();
  updateCartUI();
});

/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

function loadProducts() {
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts(products);
    })
    .catch(err => console.error("Error loading products:", err));
}

/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(items) {
  const grid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyProducts");

  grid.innerHTML = "";

  if (items.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  } else {
    emptyState.classList.add("hidden");
  }

  items.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="info">
        <h3>${product.name}</h3>
        <p>KSH ${product.price}</p>
      </div>
      <button onclick="addToCart('${product.name}', ${product.price})">
        Add to Cart
      </button>
    `;

    grid.appendChild(card);
  });
}

/* =========================================================
   SEARCH FUNCTIONALITY
   ========================================================= */

document.getElementById("searchInput").addEventListener("input", function (e) {
  const value = e.target.value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );

  renderProducts(filtered);
});

/* =========================================================
   CART FUNCTIONS
   ========================================================= */

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  saveCart();
  renderCart();
  updateCartUI();
  showToast("Product added to order");
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
  renderCart();
  updateCartUI();
}

function increaseQty(name) {
  const item = cart.find(i => i.name === name);
  if (item) item.qty += 1;

  saveCart();
  renderCart();
  updateCartUI();
}

function decreaseQty(name) {
  const item = cart.find(i => i.name === name);

  if (!item) return;

  item.qty -= 1;

  if (item.qty <= 0) {
    removeFromCart(name);
    return;
  }

  saveCart();
  renderCart();
  updateCartUI();
}

/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const emptyCart = document.getElementById("emptyCart");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    emptyCart.style.display = "block";
    return;
  } else {
    emptyCart.style.display = "none";
  }

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>
        KSH ${item.price * item.qty}
      </span>
      <div>
        <button onclick="decreaseQty('${item.name}')">-</button>
        <button onclick="increaseQty('${item.name}')">+</button>
      </div>
    `;

    cartItems.appendChild(div);
  });
}

/* =========================================================
   CART TOTALS + UI UPDATE
   ========================================================= */

function updateCartUI() {
  let subtotal = 0;
  let count = 0;

  cart.forEach(item => {
    subtotal += item.price * item.qty;
    count += item.qty;
  });

  const deliveryOption = document.getElementById("deliveryOption").value;
  const deliveryFeeInput = document.getElementById("deliveryFee");

  let deliveryFee = 0;

  if (deliveryOption === "delivery") {
    deliveryFeeInput.classList.remove("hidden");
    deliveryFee = Number(deliveryFeeInput.value || 0);
  } else {
    deliveryFeeInput.classList.add("hidden");
  }

  const total = subtotal + deliveryFee;

  document.getElementById("cartSubtotal").innerText = `KSH ${subtotal}`;
  document.getElementById("cartTotal").innerText = `KSH ${total}`;
  document.getElementById("cartCount").innerText = count;
}

/* update totals when delivery changes */
document.getElementById("deliveryOption").addEventListener("change", updateCartUI);
document.getElementById("deliveryFee").addEventListener("input", updateCartUI);

/* =========================================================
   WHATSAPP ORDER GENERATOR
   ========================================================= */

document.getElementById("whatsappBtn").addEventListener("click", sendToWhatsApp);

function sendToWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "🛒 NEW ORDER%0A-------------------%0A";

  let subtotal = 0;

  cart.forEach(item => {
    const total = item.price * item.qty;
    subtotal += total;

    message += `${item.name} x${item.qty} = KSH ${total}%0A`;
  });

  const deliveryOption = document.getElementById("deliveryOption").value;
  const deliveryFee = Number(document.getElementById("deliveryFee").value || 0);

  let grandTotal = subtotal;

  message += "%0A";

  if (deliveryOption === "delivery") {
    message += `Delivery Fee: KSH ${deliveryFee}%0A`;
    grandTotal += deliveryFee;
  } else {
    message += `Pickup: FREE%0A`;
  }

  message += `TOTAL: KSH ${grandTotal}%0A`;

  const phone = "254115652612"; // Erick's Shop WhatsApp number

  const url = `https://wa.me/${phone}?text=${message}`;

  window.open(url, "_blank");
}

/* =========================================================
   LOCAL STORAGE (PERSIST CART)
   ========================================================= */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */

function showToast(msg) {
  const toast = document.createElement("div");
  toast.innerText = msg;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#25D366";
  toast.style.color = "white";
  toast.style.padding = "10px 15px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}