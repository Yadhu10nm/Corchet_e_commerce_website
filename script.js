/*************************************************
 * ELEMENT REFERENCES
 *************************************************/
const productList = document.getElementById("productList");
const loader = document.getElementById("loader");
const suggestionsBox = document.getElementById("suggestions");
const popup = document.getElementById("welcomePopup");
const searchInput = document.getElementById("searchInput");

/*************************************************
 * GLOBAL DATA
 *************************************************/
let allProducts = [];

// ✅ GOOGLE SHEET JSON URL (OPENSHEET)
const SHEET_URL =
  "https://opensheet.elk.sh/1UglRFt6MylhszasX9AyxuXuX3QTEUM05AoMcne4evEo/Sheet1";

/*************************************************
 * WELCOME POPUP
 *************************************************/
window.onload = () => {
  if (popup) popup.style.display = "flex";
};

function closePopup() {
  if (popup) popup.style.display = "none";
}

/*************************************************
 * GOOGLE DRIVE LINK CONVERTER
 * Client pastes ORIGINAL Drive link.
 * This converts it internally for <img>.
 *************************************************/
function convertDriveLink(originalLink) {
  if (!originalLink) return "";

  const match = originalLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) return originalLink;

  const fileId = match[1];

  // 🔥 MOST RELIABLE GOOGLE DRIVE IMAGE URL
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/*************************************************
 * FETCH PRODUCTS FROM GOOGLE SHEET
 *************************************************/
fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    allProducts = data;

    // ✅ Default load: hair accessories
    const defaultProducts = allProducts.filter(
      p => p.group && p.group.toLowerCase() === "hair accessories"
    );

    renderProducts(defaultProducts);
  })
  .catch(err => {
    console.error("Failed to load products:", err);
    productList.innerHTML =
      "<p style='text-align:center'>Failed to load products</p>";
  });

/*************************************************
 * RENDER PRODUCTS
 *************************************************/
function renderProducts(list) {
  productList.innerHTML = "";

  if (!list || list.length === 0) {
    productList.innerHTML =
      "<p style='text-align:center'>No products found</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    // 🔥 Convert Drive link ONLY for image rendering
    const imageUrl = convertDriveLink(p.image);

    card.innerHTML = `
      <img src="${imageUrl}" alt="${p.name}">
      <div class="product-content">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price}</div>

        <button class="details-btn" onclick="toggleDetails(this)">
          View Details
        </button>

        <div class="product-desc">${p.desc}</div>

        <button class="order-btn"
          onclick="orderWhatsApp(
            '${p.id}',
            '${p.name}',
            '${p.price}',
            '${p.image}'
          )">
          Order on WhatsApp
        </button>
      </div>
    `;

    productList.appendChild(card);
  });
}

/*************************************************
 * TOGGLE PRODUCT DETAILS
 *************************************************/
function toggleDetails(btn) {
  const desc = btn.nextElementSibling;
  if (!desc) return;

  desc.style.display =
    desc.style.display === "block" ? "none" : "block";
}

/*************************************************
 * SEARCH SUGGESTIONS (GROUPS)
 *************************************************/
function showSuggestions() {
  const value = searchInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";

  if (!value) {
    suggestionsBox.style.display = "none";
    return;
  }

  // Unique groups
  const groups = [
    ...new Set(
      allProducts
        .map(p => p.group)
        .filter(Boolean)
        .map(g => g.toLowerCase())
    )
  ];

  const matches = groups.filter(g => g.includes(value));

  if (matches.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  matches.forEach(m => {
    const div = document.createElement("div");
    div.innerText = m;
    div.onclick = () => selectSuggestion(m);
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
}

function selectSuggestion(text) {
  searchInput.value = text;
  suggestionsBox.style.display = "none";
  searchProducts();
}

/*************************************************
 * SEARCH PRODUCTS
 *************************************************/
function searchProducts() {
  const key = searchInput.value.toLowerCase().trim();

  if (!key) return;

  loader.style.display = "block";

  setTimeout(() => {
    const filtered = allProducts.filter(
      p => p.group && p.group.toLowerCase().includes(key)
    );

    loader.style.display = "none";
    renderProducts(filtered);
  }, 500);
}

/*************************************************
 * WHATSAPP ORDER
 * Sends ORIGINAL Drive link (seller friendly)
 *************************************************/
function orderWhatsApp(id, name, price, image) {
  const msg = `Hi, I want to order:

Product ID: ${id}
Product Name: ${name}
Price: ₹${price}
Image: ${image}`;

  window.open(
    `https://wa.me/918111835438?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}
