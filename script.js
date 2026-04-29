// ========== КОНФИГУРАЦИЯ JSONBin.io ==========
const JSONBIN_CONFIG = {
    PRODUCTS_BIN_ID: "69dd3d5daaba882197f5c316",
    USERS_BIN_ID: "69de7ba0856a68218933614c",
    API_KEY: "$2a$10$6y01Iebw0r.mdVsi896kWucQh1Fm.0WL0UDZMORskX/qjbrhRNwCK",
    BASE_URL: "https://api.jsonbin.io/v3/b"
};

// ========== ДАННЫЕ ПО УМОЛЧАНИЮ ==========
const defaultProducts = [
    {
        id: 1,
        name: "WHIEDA Immun Boost",
        shortDescription: "Натуральный комплекс для иммунитета",
        fullDescription: "Immun Boost — мощный комплекс на основе эхинацеи, витамина C и цинка. Специально разработан для укрепления иммунной системы в осенне-зимний период.",
        price: 1890,
        category: "БАДы",
        image: "https://placehold.co/600x600/e8f5e9/2e7d32?text=Immun+Boost",
        gallery: [],
        features: ["100% натуральные компоненты", "Без ГМО и консервантов", "Курс: 30 дней"],
        variants: []
    },
    {
        id: 2,
        name: "WHIEDA Detox Complex",
        shortDescription: "Детокс-комплекс для очищения",
        fullDescription: "Detox Complex помогает естественному очищению организма от токсинов и шлаков. В составе: расторопша, артишок, зеленый чай.",
        price: 2150,
        category: "Детокс",
        image: "https://placehold.co/600x600/e8f5e9/2e7d32?text=Detox+Complex",
        gallery: [],
        features: ["Естественное очищение", "Улучшает метаболизм", "Курс: 14-28 дней"],
        variants: []
    },
    {
        id: 3,
        name: "WHIEDA Collagen",
        shortDescription: "Морской коллаген для молодости",
        fullDescription: "Морской коллаген с гиалуроновой кислотой и витамином C. Способствует улучшению состояния кожи, волос и ногтей.",
        price: 2450,
        category: "Коллагены",
        image: "https://placehold.co/600x600/e8f5e9/2e7d32?text=Collagen",
        gallery: [],
        features: ["Морской коллаген I типа", "Гиалуроновая кислота", "Витамин C для усвоения"],
        variants: []
    },
    {
        id: 4,
        name: "WHIEDA Green Clean",
        shortDescription: "Эко-средство для посуды",
        fullDescription: "Безопасное средство для мытья посуды на растительной основе. Не содержит агрессивной химии, фосфатов и парабенов.",
        price: 890,
        category: "Эко-товары",
        image: "https://placehold.co/600x600/e8f5e9/2e7d32?text=Green+Clean",
        gallery: [],
        features: ["100% биоразлагаемый", "Без запаха", "Гипоаллергенно"],
        variants: []
    },
    {
        id: 5,
        name: "WHIEDA Face Serum",
        shortDescription: "Антивозрастная сыворотка",
        fullDescription: "Интенсивная антивозрастная сыворотка с гиалуроновой кислотой, витамином C и пептидами. Глубоко увлажняет, разглаживает морщины.",
        price: 3250,
        category: "Косметика",
        image: "https://placehold.co/600x600/e8f5e9/2e7d32?text=Face+Serum",
        gallery: [],
        features: ["Гиалуроновая кислота 2%", "Стабильный витамин C", "Пептидный комплекс"],
        variants: []
    },
    {
        id: 6,
        name: "WHIEDA Omega-3",
        shortDescription: "Омега-3 высшей очистки",
        fullDescription: "Высококачественные Омега-3 жирные кислоты из норвежского лосося. Очищены от тяжелых металлов и примесей.",
        price: 1790,
        category: "БАДы",
        image: "https://placehold.co/600x600/e8f5e9/2e7d32?text=Omega-3",
        gallery: [],
        features: ["1000 мг Омега-3 в капсуле", "Молекулярная дистилляция", "Без рыбного вкуса"],
        variants: []
    }
];

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let products = [];
let currentUser = null;
let cart = [];
let usersCache = [];
let currentProduct = null;
let currentQty = 1;
let selectedVariant = null;

// ========== РАБОТА С ПОЛЬЗОВАТЕЛЯМИ ==========
async function loadUsersFromCloud() {
    const localUsers = localStorage.getItem('whieda_users_backup');
    if (localUsers) {
        usersCache = JSON.parse(localUsers);
    }
    
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.USERS_BIN_ID}/latest`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.record && data.record.users && data.record.users.length > 0) {
                usersCache = data.record.users;
                localStorage.setItem('whieda_users_backup', JSON.stringify(usersCache));
            }
        }
    } catch (error) {
        console.warn('Ошибка загрузки из облака, используем локальные данные');
    }
    
    return usersCache;
}

async function saveUsersToCloud() {
    localStorage.setItem('whieda_users_backup', JSON.stringify(usersCache));
    
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.USERS_BIN_ID}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users: usersCache })
        });
        return response.ok;
    } catch (error) {
        console.warn('Ошибка сохранения в облако');
        return false;
    }
}

async function findUserByEmail(email) {
    await loadUsersFromCloud();
    return usersCache.find(u => u.email?.toLowerCase() === email.toLowerCase());
}

async function findUserByPhone(phone) {
    await loadUsersFromCloud();
    return usersCache.find(u => u.phone === phone);
}

async function registerUser(userData) {
    await loadUsersFromCloud();
    
    if (await findUserByEmail(userData.email)) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    if (await findUserByPhone(userData.phone)) {
        return { success: false, error: 'Пользователь с таким телефоном уже существует' };
    }
    
    const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: btoa(userData.password),
        createdAt: new Date().toISOString(),
        isBanned: false,
        notifications: []
    };
    
    usersCache.push(newUser);
    await saveUsersToCloud();
    
    return { success: true, user: newUser };
}

async function loginUser(login, password) {
    await loadUsersFromCloud();
    const user = usersCache.find(u => 
        (u.email?.toLowerCase() === login.toLowerCase() || u.phone === login) && 
        atob(u.password) === password
    );
    
    if (user) {
        if (user.isBanned) {
            return { success: false, error: 'Ваш аккаунт заблокирован' };
        }
        return { success: true, user: user };
    }
    return { success: false, error: 'Неверный email/телефон или пароль' };
}

async function updateUserInCloud(userId, updates) {
    await loadUsersFromCloud();
    const index = usersCache.findIndex(u => u.id === userId);
    if (index !== -1) {
        if (updates.password) {
            updates.password = btoa(updates.password);
        }
        usersCache[index] = { ...usersCache[index], ...updates };
        await saveUsersToCloud();
        
        if (currentUser && currentUser.id === userId) {
            currentUser = usersCache[index];
            sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
            if (document.getElementById('profileModal') && document.getElementById('profileModal').style.display === 'flex') {
                renderUserNotifications();
                renderUserProfile();
            }
        }
        return true;
    }
    return false;
}

async function markNotificationAsRead(userId, notificationId) {
    await loadUsersFromCloud();
    const userIndex = usersCache.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const notifIndex = usersCache[userIndex].notifications?.findIndex(n => n.id === notificationId);
        if (notifIndex !== -1) {
            usersCache[userIndex].notifications[notifIndex].isRead = true;
            await saveUsersToCloud();
            
            if (currentUser && currentUser.id === userId) {
                currentUser = usersCache[userIndex];
                sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
                renderUserNotifications();
            }
        }
    }
}

async function deleteNotificationFromCloud(userId, notificationId) {
    await loadUsersFromCloud();
    const userIndex = usersCache.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        usersCache[userIndex].notifications = usersCache[userIndex].notifications?.filter(n => n.id !== notificationId) || [];
        await saveUsersToCloud();
        
        if (currentUser && currentUser.id === userId) {
            currentUser = usersCache[userIndex];
            sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
            renderUserNotifications();
        }
    }
}

// ========== ЗАГРУЗКА ТОВАРОВ ==========
async function loadProducts() {
    const localProducts = localStorage.getItem('whieda_products_backup');
    if (localProducts) {
        products = JSON.parse(localProducts);
        renderProducts();
        updateCartUI();
    }
    
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.PRODUCTS_BIN_ID}/latest`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.record && data.record.products && data.record.products.length > 0) {
                products = data.record.products;
                localStorage.setItem('whieda_products_backup', JSON.stringify(products));
                console.log('Товары загружены из облака:', products.length);
            } else {
                if (!localProducts) {
                    products = [...defaultProducts];
                    await saveProducts();
                }
            }
        }
    } catch (error) {
        console.warn('Ошибка загрузки товаров из облака, используем локальные');
        if (!localProducts) {
            products = [...defaultProducts];
        }
    }
    
    renderProducts();
    updateCartUI();
}

async function saveProducts() {
    try {
        localStorage.setItem('whieda_products_backup', JSON.stringify(products));
        
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.PRODUCTS_BIN_ID}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ products: products })
        });
        return response.ok;
    } catch (error) {
        console.warn('Ошибка сохранения товаров');
        return false;
    }
}

// ========== КОРЗИНА ==========
function loadCart() {
    const saved = localStorage.getItem('whieda_cart');
    return saved ? JSON.parse(saved) : [];
}

function saveCart() {
    localStorage.setItem('whieda_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    renderCartModal();
}

function addToCart(productId, quantity = 1, variant = null) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let cartItem = {
        id: productId,
        quantity: quantity,
        name: product.name,
        price: product.price
    };
    
    if (variant) {
        cartItem.variant = variant;
        cartItem.price = variant.price || product.price;
        cartItem.displayName = `${product.name} (${variant.name})`;
    } else {
        cartItem.displayName = product.name;
    }
    
    const existingIndex = cart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    saveCart();
    showNotification('Товар добавлен в корзину');
}

function updateQuantity(productId, delta, variant) {
    const index = cart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
    }
}

function clearCart() {
    cart = [];
    saveCart();
    showNotification('Корзина очищена');
}

// ========== ОТОБРАЖЕНИЕ ТОВАРОВ ==========
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 60px;">Нет товаров в каталоге</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-wrapper">
                <img class="product-image" src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x600/e8f5e9/2e7d32?text=Product'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.shortDescription || (product.fullDescription ? product.fullDescription.substring(0, 60) : ''))}...</p>
                <div class="product-price">${(product.price || 0).toLocaleString()} ₽</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> В корзину
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart')) {
                const id = parseInt(card.dataset.id);
                openProductModal(id);
            }
        });
    });
    
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addToCart(id, 1, null);
        });
    });
}

// ========== МОДАЛЬНОЕ ОКНО ТОВАРА ==========
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    currentQty = 1;
    selectedVariant = null;
    
    const categoryEl = document.getElementById('productCategory');
    const nameEl = document.getElementById('productName');
    const fullDescEl = document.getElementById('productFullDescription');
    const priceEl = document.getElementById('productPrice');
    const featuresList = document.getElementById('productFeatures');
    const mainImage = document.getElementById('productMainImage');
    const thumbnailList = document.getElementById('thumbnailList');
    const qtyEl = document.getElementById('productQty');
    const variantsContainer = document.getElementById('productVariants');
    const variantsButtons = document.getElementById('variantsButtons');
    
    if (categoryEl) categoryEl.textContent = product.category || '';
    if (nameEl) nameEl.textContent = product.name || '';
    if (fullDescEl) fullDescEl.textContent = product.fullDescription || '';
    
    if (priceEl) {
        if (product.variants && product.variants.length > 0) {
            const minPrice = Math.min(...product.variants.map(v => v.price || product.price));
            priceEl.textContent = `от ${(minPrice || 0).toLocaleString()} ₽`;
        } else {
            priceEl.textContent = `${(product.price || 0).toLocaleString()} ₽`;
        }
    }
    
    if (featuresList) {
        featuresList.innerHTML = (product.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
    }
    
    if (mainImage) mainImage.src = product.image || 'https://placehold.co/600x600/e8f5e9/2e7d32?text=Product';
    
    const allImages = [product.image, ...(product.gallery || [])].filter(img => img);
    if (thumbnailList) {
        thumbnailList.innerHTML = allImages.map((img, idx) => `
            <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-image="${img}">
                <img src="${img}" alt="Фото ${idx + 1}">
            </div>
        `).join('');
        
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                if (mainImage) mainImage.src = thumb.dataset.image;
            });
        });
    }
    
    // Варианты товара
    if (product.variants && product.variants.length > 0 && variantsContainer && variantsButtons) {
        variantsContainer.style.display = 'block';
        
        variantsButtons.innerHTML = product.variants.map((variant, index) => {
            const variantPrice = variant.price || product.price;
            const isOutOfStock = variant.stock === 0;
            return `
                <div class="variant-option ${index === 0 ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                     data-index="${index}"
                     data-name="${escapeHtml(variant.name)}"
                     data-price="${variantPrice}"
                     data-stock="${variant.stock || 'много'}"
                     data-out-of-stock="${isOutOfStock}">
                    ${escapeHtml(variant.name)}
                    ${variantPrice !== product.price ? `<span class="variant-price-info">${(variantPrice || 0).toLocaleString()} ₽</span>` : ''}
                    ${variant.stock ? `<span class="variant-stock-info">(в наличии: ${variant.stock})</span>` : ''}
                </div>
            `;
        }).join('');
        
        const firstAvailable = product.variants.findIndex(v => v.stock !== 0);
        if (firstAvailable !== -1) {
            selectedVariant = product.variants[firstAvailable];
            const finalPrice = selectedVariant.price || product.price;
            if (priceEl) priceEl.textContent = `${(finalPrice || 0).toLocaleString()} ₽`;
        } else if (product.variants[0]) {
            selectedVariant = product.variants[0];
        }
        
        document.querySelectorAll('.variant-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (option.classList.contains('out-of-stock')) {
                    showNotification('Этот вариант временно отсутствует', true);
                    return;
                }
                
                document.querySelectorAll('.variant-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                const index = parseInt(option.dataset.index);
                selectedVariant = product.variants[index];
                const finalPrice = selectedVariant.price || product.price;
                if (priceEl) priceEl.textContent = `${(finalPrice || 0).toLocaleString()} ₽`;
            });
        });
    } else if (variantsContainer) {
        variantsContainer.style.display = 'none';
    }
    
    if (qtyEl) qtyEl.value = currentQty;
    
    openModal('productModal');
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            const scrollY = document.body.style.top;
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }, 200);
    }
}

function closeAllModals() {
    const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
    openModals.forEach(modal => {
        closeModal(modal.id);
    });
}

// ========== КОРЗИНА (рендер) ==========
function renderCartModal() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    const cartDetails = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return null;
        return {
            ...item,
            product,
            total: (item.price || 0) * item.quantity,
            displayName: item.variant ? `${product.name} (${item.variant.name})` : product.name
        };
    }).filter(item => item !== null);
    
    const total = cartDetails.reduce((sum, item) => sum + (item.total || 0), 0);
    
    if (cartDetails.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Корзина пуста</p><p style="font-size: 0.8rem; margin-top: 8px;">Добавьте товары из каталога</p></div>';
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.textContent = '0 ₽';
        return;
    }
    
    container.innerHTML = cartDetails.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(item.displayName)}</div>
                <div class="cart-item-price">${(item.price || 0).toLocaleString()} ₽ / шт</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus-btn" data-id="${item.id}" data-variant='${JSON.stringify(item.variant)}'>-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus-btn" data-id="${item.id}" data-variant='${JSON.stringify(item.variant)}'>+</button>
            </div>
            <div class="cart-item-total">${(item.total || 0).toLocaleString()} ₽</div>
        </div>
    `).join('');
    
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `${(total || 0).toLocaleString()} ₽`;
    
    // Обработчики для кнопок + и -
    document.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            let variant = null;
            try {
                variant = btn.dataset.variant ? JSON.parse(btn.dataset.variant) : null;
            } catch (e) {
                variant = null;
            }
            updateQuantity(id, -1, variant);
        });
    });
    
    document.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            let variant = null;
            try {
                variant = btn.dataset.variant ? JSON.parse(btn.dataset.variant) : null;
            } catch (e) {
                variant = null;
            }
            updateQuantity(id, 1, variant);
        });
    });
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
function showOrderPreview() {
    const cartDetails = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return null;
        return {
            ...item,
            product,
            total: (item.price || 0) * item.quantity,
            displayName: item.variant ? `${product.name} (${item.variant.name})` : product.name
        };
    }).filter(item => item !== null);
    
    const previewContainer = document.getElementById('orderPreview');
    const totalSpan = document.getElementById('orderPreviewTotal');
    
    if (cartDetails.length === 0) {
        if (previewContainer) previewContainer.innerHTML = '<p style="color: red;">Корзина пуста</p>';
        if (totalSpan) totalSpan.textContent = '0 ₽';
        return;
    }
    
    if (previewContainer) {
        previewContainer.innerHTML = cartDetails.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span>${escapeHtml(item.displayName)} x ${item.quantity}</span>
                <span>${(item.total || 0).toLocaleString()} ₽</span>
            </div>
        `).join('');
    }
    
    const total = cartDetails.reduce((sum, item) => sum + (item.total || 0), 0);
    if (totalSpan) totalSpan.textContent = `${(total || 0).toLocaleString()} ₽`;
}

// ========== ОТПРАВКА ЗАКАЗА В TELEGRAM ==========
async function submitOrder() {
    // Проверяем авторизацию
    if (!currentUser) {
        closeModal('orderModal');
        openAuthModal();
        showNotification('Войдите в аккаунт для оформления заказа');
        return;
    }
    
    // Получаем данные из формы
    const name = document.getElementById('customerName')?.value.trim();
    const phone = document.getElementById('customerPhone')?.value.trim();
    const address = document.getElementById('customerAddress')?.value.trim();
    const comment = document.getElementById('customerComment')?.value.trim() || '';
    
    if (!name || !phone || !address) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    // Получаем детали корзины
    const cartDetails = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return null;
        return {
            ...item,
            product,
            total: (item.price || 0) * item.quantity,
            displayName: item.variant ? `${product.name} (${item.variant.name})` : product.name
        };
    }).filter(item => item !== null);
    
    if (cartDetails.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    // Рассчитываем итоговую сумму
    const total = cartDetails.reduce((sum, item) => sum + (item.total || 0), 0);
    
    // Формируем список товаров для сообщения
    const orderItems = cartDetails.map(item => 
        `└ ${item.displayName} — ${item.quantity} шт. × ${(item.price || 0).toLocaleString()} ₽ = ${(item.total || 0).toLocaleString()} ₽`
    ).join('\n');
    
    // Формируем полное сообщение для Telegram
    const message = `🟢 *НОВЫЙ ЗАКАЗ WHIEDA VikVik* 🟢%0A%0A` +
        `👤 *Клиент:* ${name}%0A` +
        `📞 *Телефон:* ${phone}%0A` +
        `📍 *Адрес доставки:* ${address}%0A` +
        `💬 *Комментарий:* ${comment || '—'}%0A%0A` +
        `📦 *СОСТАВ ЗАКАЗА:*%0A${orderItems}%0A%0A` +
        `💰 *ИТОГО К ОПЛАТЕ:* ${(total || 0).toLocaleString()} ₽%0A%0A` +
        `🕐 *Время заказа:* ${new Date().toLocaleString()}`;
    
    // Кодируем сообщение для URL
    const encodedMessage = encodeURIComponent(message);
    
    // Ссылка на Telegram с нашим менеджером @order_101
    const telegramUrl = `https://t.me/order_101?text=${encodedMessage}`;
    
    // Открываем Telegram с готовым сообщением
    window.open(telegramUrl, '_blank');
    
    // Очищаем корзину и закрываем модальное окно
    clearCart();
    closeModal('orderModal');
    
    // Показываем уведомление об успешной отправке
    setTimeout(() => {
        alert('✅ Заказ отправлен менеджеру! Менеджер свяжется с вами в ближайшее время.');
    }, 500);
}

// ========== ЛИЧНЫЙ КАБИНЕТ ==========
function openAuthModal() {
    const loginForm = document.getElementById('loginFormContent');
    const registerForm = document.getElementById('registerFormContent');
    const authTitle = document.getElementById('authTitle');
    
    // Очищаем поля перед открытием
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const regName = document.getElementById('regName');
    const regEmail = document.getElementById('regEmail');
    const regPhone = document.getElementById('regPhone');
    const regPassword = document.getElementById('regPassword');
    const regPasswordConfirm = document.getElementById('regPasswordConfirm');
    
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    if (regName) regName.value = '';
    if (regEmail) regEmail.value = '';
    if (regPhone) regPhone.value = '';
    if (regPassword) regPassword.value = '';
    if (regPasswordConfirm) regPasswordConfirm.value = '';
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (authTitle) authTitle.innerHTML = '<i class="fas fa-sign-in-alt"></i> Вход в личный кабинет';
    openModal('authModal');
}

function renderUserProfile() {
    if (!currentUser) return;
    
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    const dateEl = document.getElementById('profileDate');
    const editNameEl = document.getElementById('editName');
    const editPhoneEl = document.getElementById('editPhone');
    const editEmailEl = document.getElementById('editEmail');
    const editPasswordEl = document.getElementById('editPassword');
    
    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
    if (phoneEl) phoneEl.textContent = currentUser.phone;
    if (dateEl) dateEl.textContent = new Date(currentUser.createdAt).toLocaleDateString('ru-RU');
    if (editNameEl) editNameEl.value = currentUser.name;
    if (editPhoneEl) editPhoneEl.value = currentUser.phone;
    if (editEmailEl) editEmailEl.value = currentUser.email;
    if (editPasswordEl) editPasswordEl.value = '';
    
    renderUserNotifications();
}

async function renderUserNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    await loadUsersFromCloud();
    const updatedUser = usersCache.find(u => u.id === currentUser?.id);
    if (updatedUser) {
        currentUser = updatedUser;
        sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
    }
    
    const notifications = currentUser?.notifications || [];
    
    if (notifications.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">У вас нет уведомлений</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.isRead ? 'read' : 'unread'}" data-id="${notif.id}">
            <div class="notification-icon ${notif.type}">
                <i class="fas ${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${escapeHtml(notif.title)}</div>
                <div class="notification-message">${escapeHtml(notif.message)}</div>
                <div class="notification-date">${new Date(notif.createdAt).toLocaleDateString('ru-RU')} ${new Date(notif.createdAt).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
            <button class="notification-delete" onclick="deleteNotificationFromCloud(${currentUser.id}, ${notif.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-delete')) {
                const id = parseInt(item.dataset.id);
                markNotificationAsRead(currentUser.id, id);
            }
        });
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'discount': return 'fa-tag';
        default: return 'fa-bell';
    }
}

async function updateUserProfile() {
    const newName = document.getElementById('editName')?.value.trim();
    const newPhone = document.getElementById('editPhone')?.value.trim();
    const newEmail = document.getElementById('editEmail')?.value.trim();
    const newPassword = document.getElementById('editPassword')?.value;
    
    if (!newName || !newPhone || !newEmail) {
        alert('Заполните все поля');
        return;
    }
    
    if (newEmail !== currentUser.email) {
        const existingUser = await findUserByEmail(newEmail);
        if (existingUser && existingUser.id !== currentUser.id) {
            alert('Этот email уже используется другим пользователем');
            return;
        }
    }
    
    if (newPhone !== currentUser.phone) {
        const existingUser = await findUserByPhone(newPhone);
        if (existingUser && existingUser.id !== currentUser.id) {
            alert('Этот телефон уже используется другим пользователем');
            return;
        }
    }
    
    const updates = { name: newName, phone: newPhone, email: newEmail };
    if (newPassword) {
        if (newPassword.length < 6) {
            alert('Пароль должен быть не менее 6 символов');
            return;
        }
        updates.password = newPassword;
    }
    
    const success = await updateUserInCloud(currentUser.id, updates);
    if (success) {
        renderUserProfile();
        showNotification('Профиль обновлен');
    } else {
        showNotification('Ошибка обновления', true);
    }
}

function logoutUser() {
    currentUser = null;
    sessionStorage.removeItem('whieda_current_user');
    closeModal('profileModal');
    showNotification('Вы вышли из аккаунта');
    updateAuthButton();
}

function updateAuthButton() {
    const profileBtnNav = document.getElementById('profileBtnNav');
    const profileBtnMobile = document.getElementById('profileBtnMobile');
    
    if (currentUser) {
        if (profileBtnNav) profileBtnNav.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(currentUser.name)}`;
        if (profileBtnMobile) profileBtnMobile.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(currentUser.name)}`;
    } else {
        if (profileBtnNav) profileBtnNav.innerHTML = '<i class="fas fa-user"></i> Личный кабинет';
        if (profileBtnMobile) profileBtnMobile.innerHTML = '<i class="fas fa-user"></i> Личный кабинет';
    }
}

// ========== АВТОРИЗАЦИЯ ==========
async function initAuth() {
    const savedUser = sessionStorage.getItem('whieda_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        await loadUsersFromCloud();
        const freshUser = usersCache.find(u => u.id === currentUser.id);
        if (freshUser) {
            currentUser = freshUser;
            sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
        }
        updateAuthButton();
    }
    
    const profileBtnNav = document.getElementById('profileBtnNav');
    const profileBtnMobile = document.getElementById('profileBtnMobile');
    
    if (profileBtnNav) {
        profileBtnNav.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                renderUserProfile();
                openModal('profileModal');
            } else {
                openAuthModal();
            }
        });
    }
    
    if (profileBtnMobile) {
        profileBtnMobile.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                renderUserProfile();
                openModal('profileModal');
            } else {
                openAuthModal();
            }
        });
    }
    
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = document.getElementById('loginFormContent');
            const registerForm = document.getElementById('registerFormContent');
            const authTitle = document.getElementById('authTitle');
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (authTitle) authTitle.innerHTML = '<i class="fas fa-user-plus"></i> Регистрация';
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = document.getElementById('loginFormContent');
            const registerForm = document.getElementById('registerFormContent');
            const authTitle = document.getElementById('authTitle');
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (authTitle) authTitle.innerHTML = '<i class="fas fa-sign-in-alt"></i> Вход в личный кабинет';
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const login = document.getElementById('loginEmail')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            
            if (!login || !password) {
                alert('Заполните все поля');
                return;
            }
            
            const result = await loginUser(login, password);
            if (result.success) {
                currentUser = result.user;
                sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
                closeModal('authModal');
                updateAuthButton();
                showNotification(`Добро пожаловать, ${currentUser.name}!`);
                const loginEmail = document.getElementById('loginEmail');
                const loginPassword = document.getElementById('loginPassword');
                if (loginEmail) loginEmail.value = '';
                if (loginPassword) loginPassword.value = '';
            } else {
                alert(result.error);
            }
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const name = document.getElementById('regName')?.value.trim();
            const email = document.getElementById('regEmail')?.value.trim();
            const phone = document.getElementById('regPhone')?.value.trim();
            const password = document.getElementById('regPassword')?.value;
            const passwordConfirm = document.getElementById('regPasswordConfirm')?.value;
            
            if (!name || !email || !phone || !password) {
                alert('Заполните все обязательные поля');
                return;
            }
            
            if (password !== passwordConfirm) {
                alert('Пароли не совпадают');
                return;
            }
            
            if (password.length < 6) {
                alert('Пароль должен быть не менее 6 символов');
                return;
            }
            
            const result = await registerUser({ name, email, phone, password });
            if (result.success) {
                currentUser = result.user;
                sessionStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
                closeModal('authModal');
                updateAuthButton();
                showNotification(`Добро пожаловать, ${currentUser.name}!`);
                const regName = document.getElementById('regName');
                const regEmail = document.getElementById('regEmail');
                const regPhone = document.getElementById('regPhone');
                const regPassword = document.getElementById('regPassword');
                const regPasswordConfirm = document.getElementById('regPasswordConfirm');
                if (regName) regName.value = '';
                if (regEmail) regEmail.value = '';
                if (regPhone) regPhone.value = '';
                if (regPassword) regPassword.value = '';
                if (regPasswordConfirm) regPasswordConfirm.value = '';
            } else {
                alert(result.error);
            }
        });
    }
    
    if (updateProfileBtn) updateProfileBtn.addEventListener('click', updateUserProfile);
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    if (closeAuthModal) closeAuthModal.addEventListener('click', () => closeModal('authModal'));
    if (closeProfileModal) closeProfileModal.addEventListener('click', () => closeModal('profileModal'));
    
    // Обновленная обработка табов
    const tabBtns = document.querySelectorAll('.tab-btn');
    const notificationsTab = document.getElementById('notificationsTab');
    const settingsTab = document.getElementById('settingsTab');
    
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (notificationsTab && settingsTab) {
                    if (tab === 'notifications') {
                        notificationsTab.style.display = 'block';
                        settingsTab.style.display = 'none';
                        renderUserNotifications();
                    } else if (tab === 'settings') {
                        notificationsTab.style.display = 'none';
                        settingsTab.style.display = 'block';
                    }
                }
            });
        });
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(text, isError = false) {
    const notif = document.createElement('div');
    notif.textContent = text;
    notif.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${isError ? '#e74c3c' : '#1a5f4b'}; 
        color: white; padding: 12px 24px;
        border-radius: 50px; z-index: 1100; font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
}

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.remove('active');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !menuBtn?.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        }
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM загружен, инициализация...');
    
    cart = loadCart();
    await loadProducts();
    await initAuth();
    
    // ========== ИКОНКА ПРОФИЛЯ В ШАПКЕ ==========
    const profileIconBtn = document.getElementById('profileIconBtn');
    if (profileIconBtn) {
        profileIconBtn.addEventListener('click', () => {
            if (currentUser) {
                renderUserProfile();
                openModal('profileModal');
            } else {
                openAuthModal();
            }
        });
    }
    
    // ========== КНОПКА КОРЗИНЫ ==========
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            openModal('cartModal');
        });
    }
    
    // ========== КНОПКА ЗАКРЫТИЯ КОРЗИНЫ ==========
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => closeModal('cartModal'));
    }
    
    // ========== КНОПКА ОЧИСТКИ КОРЗИНЫ ==========
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // ========== КНОПКА ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА ТОВАРА ==========
    const closeProductModalBtn = document.getElementById('closeProductModalBtn');
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', () => closeModal('productModal'));
    }
    
    // ========== КНОПКА ОФОРМЛЕНИЯ ЗАКАЗА ==========
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Корзина пуста');
                return;
            }
            closeModal('cartModal');
            if (currentUser) {
                const customerName = document.getElementById('customerName');
                const customerPhone = document.getElementById('customerPhone');
                if (customerName) customerName.value = currentUser.name;
                if (customerPhone) customerPhone.value = currentUser.phone;
            }
            showOrderPreview();
            openModal('orderModal');
        });
    }
    
    // ========== КНОПКИ ЗАКАЗА ==========
    const closeOrderModal = document.getElementById('closeOrderModal');
    const cancelOrder = document.getElementById('cancelOrder');
    const submitOrderBtn = document.getElementById('submitOrder');
    
    if (closeOrderModal) closeOrderModal.addEventListener('click', () => closeModal('orderModal'));
    if (cancelOrder) cancelOrder.addEventListener('click', () => closeModal('orderModal'));
    if (submitOrderBtn) submitOrderBtn.addEventListener('click', submitOrder);
    
    // ========== КНОПКИ КОЛИЧЕСТВА В МОДАЛЬНОМ ОКНЕ ТОВАРА ==========
    const decreaseQty = document.getElementById('decreaseQty');
    const increaseQty = document.getElementById('increaseQty');
    const addToCartDetail = document.getElementById('addToCartDetail');
    
    if (decreaseQty) {
        decreaseQty.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                const qtyEl = document.getElementById('productQty');
                if (qtyEl) qtyEl.value = currentQty;
            }
        });
    }
    
    if (increaseQty) {
        increaseQty.addEventListener('click', () => {
            currentQty++;
            const qtyEl = document.getElementById('productQty');
            if (qtyEl) qtyEl.value = currentQty;
        });
    }
    
    if (addToCartDetail) {
        addToCartDetail.addEventListener('click', () => {
            if (currentProduct) {
                addToCart(currentProduct.id, currentQty, selectedVariant);
                closeModal('productModal');
            }
        });
    }
    
    // ========== ЗАКРЫТИЕ МОДАЛОК ПО КЛИКУ НА ФОН ==========
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // ========== ОБРАБОТКА КЛАВИШИ ESCAPE ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // ========== ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // ========== МОБИЛЬНОЕ МЕНЮ ==========
    initMobileMenu();
    
    console.log('Инициализация завершена');
});