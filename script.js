const API_BASE = 'https://estore-production-906a.up.railway.app/api';
        let categories = [];

        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            event.target.classList.add('active');

            if (sectionId === 'products') loadProducts();
            if (sectionId === 'categories') loadCategories();
            if (sectionId === 'add-product') {
                resetForm();
                loadCategoriesForForm();
            }
        }

        async function loadProducts() {
            const container = document.getElementById('products-container');
            container.className = 'loading';
            container.innerHTML = 'Loading products...';

            try {
                const response = await fetch(`${API_BASE}/products`);
                const products = await response.json();
                
                if (products.length === 0) {
                    container.innerHTML = '<p>No products found. Add your first product!</p>';
                    container.className = '';
                    return;
                }

                container.className = 'product-grid';
                container.innerHTML = products.map(p => `
                    <div class="product-card">
                        <h3>${p.name}</h3>
                        <div class="price">$${p.price}</div>
                        <p>${p.description}</p>
                        <p><strong>Brand:</strong> ${p.brand}</p>
                        <p><strong>Quantity:</strong> ${p.quantity}</p>
                        <div>
                            ${p.category ? `<span class="badge category-badge">${p.category.name}</span>` : ''}
                            <span class="badge ${p.availability ? 'available' : 'unavailable'}">
                                ${p.availability ? 'Available' : 'Out of Stock'}
                            </span>
                        </div>
                        <div style="margin-top: 16px;">
                            <button class="btn btn-edit" onclick="editProduct(${p.prodId})">Edit</button>
                            <button class="btn btn-delete" onclick="deleteProduct(${p.prodId})">Delete</button>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                container.className = 'error';
                container.innerHTML = 'Error loading products. Make sure the server is running.';
            }
        }

        async function loadCategories() {
            const container = document.getElementById('categories-container');
            container.className = 'loading';
            container.innerHTML = 'Loading categories...';

            try {
                const response = await fetch(`${API_BASE}/categories`);
                categories = await response.json();
                
                if (categories.length === 0) {
                    container.innerHTML = '<p>No categories found.</p>';
                    container.className = '';
                    return;
                }

                container.className = 'category-list';
                container.innerHTML = categories.map(c => `
                    <div class="category-item">
                        <h3>${c.name}</h3>
                        <p>${c.description}</p>
                    </div>
                `).join('');
            } catch (error) {
                container.className = 'error';
                container.innerHTML = 'Error loading categories.';
            }
        }

        async function loadCategoriesForForm() {
            try {
                const response = await fetch(`${API_BASE}/categories`);
                categories = await response.json();
                const select = document.getElementById('category');
                select.innerHTML = '<option value="">Select a category...</option>' + 
                    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        }

        async function editProduct(id) {
            try {
                const response = await fetch(`${API_BASE}/products/${id}`);
                const product = await response.json();
                
                document.getElementById('form-title').textContent = 'Edit Product';
                document.getElementById('prodId').value = product.prodId;
                document.getElementById('name').value = product.name;
                document.getElementById('price').value = product.price;
                document.getElementById('description').value = product.description;
                document.getElementById('brand').value = product.brand;
                document.getElementById('quantity').value = product.quantity;
                document.getElementById('availability').checked = product.availability;
                
                if (product.releaseDate) {
                    const date = new Date(product.releaseDate);
                    document.getElementById('releaseDate').value = date.toISOString().split('T')[0];
                }
                
                if (product.category) {
                    document.getElementById('category').value = product.category.id;
                }
                
                showSection('add-product');
                document.querySelectorAll('.nav button')[2].classList.add('active');
            } catch (error) {
                alert('Error loading product details');
            }
        }

        async function deleteProduct(id) {
            if (!confirm('Are you sure you want to delete this product?')) return;

            try {
                await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
                showMessage('Product deleted successfully!', 'success');
                loadProducts();
            } catch (error) {
                showMessage('Error deleting product', 'error');
            }
        }

        document.getElementById('product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const prodId = document.getElementById('prodId').value;
            const categoryId = document.getElementById('category').value;
            const category = categories.find(c => c.id == categoryId);
            
            const product = {
                prodId: prodId ? parseInt(prodId) : undefined,
                name: document.getElementById('name').value,
                price: parseInt(document.getElementById('price').value),
                description: document.getElementById('description').value,
                brand: document.getElementById('brand').value,
                quantity: parseInt(document.getElementById('quantity').value),
                releaseDate: document.getElementById('releaseDate').value,
                availability: document.getElementById('availability').checked,
                category: category
            };

            try {
                const url = prodId ? `${API_BASE}/products` : `${API_BASE}/products`;
                const method = prodId ? 'PUT' : 'POST';
                
                await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });

                showMessage(prodId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
                resetForm();
                setTimeout(() => {
                    showSection('products');
                    document.querySelectorAll('.nav button')[0].click();
                }, 1500);
            } catch (error) {
                showMessage('Error saving product', 'error');
            }
        });

        function resetForm() {
            document.getElementById('product-form').reset();
            document.getElementById('prodId').value = '';
            document.getElementById('form-title').textContent = 'Add New Product';
            document.getElementById('form-message').innerHTML = '';
        }

        function showMessage(message, type) {
            const messageDiv = document.getElementById('form-message');
            messageDiv.className = type;
            messageDiv.textContent = message;
            setTimeout(() => messageDiv.innerHTML = '', 3000);
        }

        loadProducts();
        loadCategoriesForForm();