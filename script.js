/*************************************************
 * ELEMENT REFERENCES
 *************************************************/
const productList = document.getElementById("productList");
const loader = document.getElementById("loader");
const suggestionsBox = document.getElementById("suggestions");
const popup = document.getElementById("welcomePopup");
const searchInput = document.getElementById("searchInput");
const typeSelect = document.getElementById("typeSelect");

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
 *************************************************/
function convertDriveLink(originalLink) {
  if (!originalLink) return "";

  const match = originalLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) return originalLink;

  return `https://lh3.googleusercontent.com/d/${match[1]}`;
}

/*************************************************
 * FETCH PRODUCTS FROM GOOGLE SHEET
 *************************************************/
fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    allProducts = data;

    loadTypes(allProducts); // 🔥 populate dropdown

    // ✅ DEFAULT LOAD
    const defaultType = typeSelect.value;
    const defaultProducts = allProducts.filter(
      p => p.group && p.group.toLowerCase() === defaultType
    );

    renderProducts(defaultProducts);
  })
  .catch(err => {
    console.error("Failed to load products:", err);
    productList.innerHTML =
      "<p style='text-align:center'>Failed to load products</p>";
  });

/*************************************************
 * LOAD TYPES INTO DROPDOWN
 *************************************************/
function loadTypes(products) {
  if (!typeSelect) return;

  const types = [
    ...new Set(
      products
        .map(p => p.group)
        .filter(Boolean)
        .map(g => g.toLowerCase())
    )
  ];

  typeSelect.innerHTML = "";

  types.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    typeSelect.appendChild(opt);
  });

  // ✅ DEFAULT SELECT FIRST TYPE
  typeSelect.value = types[0];
}

/*************************************************
 * FILTER BY TYPE (DROPDOWN)
 *************************************************/
function filterByType() {
  const selectedType = typeSelect.value;

  const filtered = allProducts.filter(
    p => p.group && p.group.toLowerCase() === selectedType
  );

  renderProducts(filtered);
}

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
          onclick="orderWhatsApp('${p.id}','${p.name}','${p.price}','${p.image}', this)">
          Order on WhatsApp
        </button>
      </div>
    `;

    productList.appendChild(card);
  });
}

/*************************************************
 * TOGGLE DETAILS
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
    div.onclick = () => {
      searchInput.value = m;
      suggestionsBox.style.display = "none";
      typeSelect.value = m;
      filterByType();
    };
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
}

/*************************************************
 * SEARCH PRODUCTS (TEXT)
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
 *************************************************/
function orderWhatsApp(id, name, price, image, btn) {
  btn.classList.add("loading");

  setTimeout(() => {
    btn.classList.remove("loading");
    btn.classList.add("success");
  }, 500);

  setTimeout(() => {
    const msg = `Hi, I want to order:
Product ID: ${id}
Product Name: ${name}
Price: ₹${price}
Image: ${image}`;

    window.open(
      `https://wa.me/919035711527?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  }, 900);
}

/*************************************************
 * CUSTOM PRODUCT ORDER
 *************************************************/
function orderCustomProduct() {
  const input = document.getElementById("customInput").value.trim();

  if (!input) {
    alert("Please describe your custom requirement");
    return;
  }

  const msg = `Hi, I want a CUSTOM crochet product.

Requirement:
${input}

Price starts from ₹500`;

  window.open(
    `https://wa.me/919035711527?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/*************************************************
 * HELPDESK
 *************************************************/
function openHelpdesk() {
  document.getElementById("helpdeskOverlay").style.display = "flex";
}

function closeHelpdesk() {
  document.getElementById("helpdeskOverlay").style.display = "none";
}

function showHelpAnswer(id) {
  const box = document.getElementById("helpdeskAnswer");
  const answers = {
    1: "Browse products using category filter or search bar.",
    2: "Click Order on WhatsApp. Details are sent automatically.",
    3: "Delivery available across India.",
    4: "Prices shown are fixed. Custom orders may vary.",
    5: "Yes, custom crochet products are supported."
  };

  box.innerText = answers[id] || "";
  box.style.display = "block";
}

/*************************************************
 * NAV MENU
 *************************************************/
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("show");
}

function closeMenu() {
  document.getElementById("navMenu").classList.remove("show");
}

/*************************************************
 * ABOUT SECTION TYPING EFFECT
 * Single line | Type → Pause → Erase → Loop
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const aboutEl = document.querySelector(".about-card p");
  if (!aboutEl) return;

  const text =
  "Crochet is a handmade brand dedicated to creating elegant, durable, and unique crochet products. Every piece is thoughtfully designed and carefully handcrafted using premium yarns and quality materials. From everyday accessories to custom-made creations, we focus on comfort, style, and attention to detail. Our mission is to deliver meaningful products that feel personal, timeless, and made with love.";

  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 35;
  const deletingSpeed = 20;
  const pauseAfterType = 1200;
  const pauseAfterDelete = 600;

  function typeLoop() {
    if (!isDeleting) {
      aboutEl.textContent = text.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === text.length) {
        setTimeout(() => (isDeleting = true), pauseAfterType);
      }
    } else {
      aboutEl.textContent = text.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        setTimeout(() => {}, pauseAfterDelete);
      }
    }

    setTimeout(
      typeLoop,
      isDeleting ? deletingSpeed : typingSpeed
    );
  }

  typeLoop();
});

