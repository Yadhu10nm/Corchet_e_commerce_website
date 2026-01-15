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
  onclick="orderWhatsApp('${p.id}','${p.name}','${p.price}','${p.image}', this)">
  Order on WhatsApp
</button>

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
function orderWhatsApp(id, name, price, image, btn) {
  // Button animation
  btn.classList.add("loading");

  // Fly animation dot
  const dot = document.createElement("div");
  dot.className = "fly-dot";
  document.body.appendChild(dot);

  const rect = btn.getBoundingClientRect();
  dot.style.left = rect.left + rect.width / 2 + "px";
  dot.style.top = rect.top + rect.height / 2 + "px";

  // Success animation
  setTimeout(() => {
    btn.classList.remove("loading");
    btn.classList.add("success");
  }, 500);

  // Open WhatsApp after animation
  setTimeout(() => {
    const msg = `Hi, I want to order:
Product ID: ${id}
Product Name: ${name}
Price: ₹${price}
Image: ${image}`;

    window.open(
      `https://wa.me/918111835438?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    dot.remove();
  }, 900);
}

function openHelpdesk() {
  document.getElementById("helpdeskOverlay").style.display = "flex";
}

function closeHelpdesk() {
  document.getElementById("helpdeskOverlay").style.display = "none";
}

function showHelpAnswer(id) {
  const answerBox = document.getElementById("helpdeskAnswer");
  let answer = "";

  switch (id) {
    case 1:
      answer = "Browse products by scrolling or using the search bar. Products are grouped for easy access.";
      break;
    case 2:
      answer = "Click the 'Order on WhatsApp' button below any product. All details will be sent automatically.";
      break;
    case 3:
      answer = "Delivery is available across India. Shipping charges depend on your location.";
      break;
    case 4:
      answer = "Prices are fixed as shown. Custom pricing may apply for special crochet orders.";
      break;
    case 5:
      answer = "Yes, custom crochet items can be requested based on availability.";
      break;
  }

  answerBox.innerText = answer;
  answerBox.style.display = "block";
}

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
    `https://wa.me/918111835438?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

// ================= HEADER PARTICLE EFFECT =================

// Run only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const headerParticles = document.querySelector(".header-particles");

  // Safety check (prevents JS errors)
  if (!headerParticles) return;

  /* THREAD LINES (BACKGROUND TEXTURE) */
  function createThreadLine() {
    const line = document.createElement("div");
    line.className = "thread-line";

    line.style.left = Math.random() * 100 + "%";
    line.style.animationDuration = (2 + Math.random() * 2) + "s";
    line.style.opacity = (0.3 + Math.random() * 0.4).toFixed(2);

    headerParticles.appendChild(line);

    // Auto cleanup
    setTimeout(() => {
      line.remove();
    }, 4000);
  }

  /* 🧶 THREAD BALL EMOJI (FOREGROUND BRAND ELEMENT) */
  function createThreadEmoji() {
    const emoji = document.createElement("div");
    emoji.className = "thread-emoji";
    emoji.textContent = "🧶";

    emoji.style.left = Math.random() * 100 + "%";
    emoji.style.fontSize = (14 + Math.random() * 10) + "px";
    emoji.style.animationDuration = (3 + Math.random() * 3) + "s";

    headerParticles.appendChild(emoji);

    // Auto cleanup
    setTimeout(() => {
      emoji.remove();
    }, 6000);
  }

  /* INTERVAL CONTROLS (BALANCED FOR PERFORMANCE) */
  const lineInterval = setInterval(createThreadLine, 220);
  const emojiInterval = setInterval(createThreadEmoji, 450);

  /* OPTIONAL: Pause animation when tab is inactive */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(lineInterval);
      clearInterval(emojiInterval);
    }
  });
});

// ================= ABOUT SECTION SINGLE LINE TYPE → ERASE → LOOP =================
document.addEventListener("DOMContentLoaded", () => {
  const aboutEl = document.querySelector(".about-card p");
  if (!aboutEl) return;

  const text = 
  `Crochet is a handmade brand dedicated to creating elegant, durable, and
  unique crochet products. Each item is carefully crafted using quality
  materials, attention to detail, and a passion for handmade art. From everyday accessories to custom-made designs, we believe in
  delivering products that feel personal, meaningful, and timeless.`
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 35;   // typing speed
  const deletingSpeed = 20; // deleting speed
  const pauseAfterType = 1200;
  const pauseAfterDelete = 600;

  function animate() {
    if (!isDeleting) {
      // Typing
      aboutEl.textContent = text.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === text.length) {
        setTimeout(() => (isDeleting = true), pauseAfterType);
      }
    } else {
      // Deleting
      aboutEl.textContent = text.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        setTimeout(() => {}, pauseAfterDelete);
      }
    }

    setTimeout(
      animate,
      isDeleting ? deletingSpeed : typingSpeed
    );
  }

  animate();
});

// ================= NAV MENU =================
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("show");
}

function closeMenu() {
  document.getElementById("navMenu").classList.remove("show");
}
