const products = [
  {
    id: 1,
    name: "Men's Jacket",
    price: 2499,
    category: "Men",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"
  },
  {
    id: 2,
    name: "Women's Dress",
    price: 1999,
    category: "Women",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkEtq_7vua54IdsAukLv1eHfRLr-dULQYu_Q&s"
  },
  {
    id: 3,
    name: "Men's T-Shirt",
    price: 999,
    category: "Men",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
  },
  {
    id: 4,
    name: "Women's Top",
    price: 1299,
    category: "Women",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
  },
  {
    id: 5,
    name: "Men's Jeans",
    price: 2199,
    category: "Men",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d"
  },
  {
    id: 6,
    name: "Women's Watch",
    price: 2799,
    category: "Women",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  },
  {
    id: 7,
    name: "Men's Sneakers",
    price: 3499,
    category: "Men",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77"
  },
  {
    id: 8,
    name: "Women's Heels",
    price: 2999,
    category: "Women",
    image: "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f"
  },
  {
    id: 9,
    name: "Men's Watch",
    price: 4999,
    category: "Men",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  },
  {
    id: 10,
    name: "Women's Sunglasses",
    price: 1599,
    category: "Women",
    image: "https://images.unsplash.com/photo-1516575150278-77136aed6920"
  }
];


let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* PRODUCT PAGE */
function displayProducts(list) {
  const productList = document.getElementById("productList");
  if (!productList) return;

  productList.innerHTML = "";
  list.forEach(p => {
    productList.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <img src="${p.image}">
          <div class="card-body text-center">
            <h5>${p.name}</h5>
            <p>₹${p.price}</p>
            <button class="btn btn-add" onclick="addToCart(${p.id})">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function addToCart(id) {
  const item = cart.find(p => p.id === id);
  if (item) {
    item.qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

function filterProducts(category) {
  if (category === "all") displayProducts(products);
  else displayProducts(products.filter(p => p.category === category));
}

/* CART PAGE */
function loadCartPage() {
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");

  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p class='text-muted'>Your cart is empty</p>";
  }

  cart.forEach(item => {
    total += item.price * item.qty;
    cartItems.innerHTML += `
      <div class="cart-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${item.name}</strong><br>
          ₹${item.price} × ${item.qty}
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
      </div>
    `;
  });

  totalPrice.innerText = total;
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  loadCartPage();
}

/* Initial Load */
displayProducts(products);
updateCartCount();