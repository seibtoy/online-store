/* jshint esversion: 6 */

const bins = Array.from(document.getElementsByClassName('bin'));

const bag = document.getElementById('bag');

const bagXmark = document.getElementById('bag-xmark');

const overlay = document.querySelector('.overlay'); 

const dots = document.getElementById('dots');

const navMenu = document.getElementById('nav-menu');

const body = document.getElementById('body');

const xmarkMobile = document.getElementById('xmark-mobile');

const firstProdContainer = document.getElementById('first-prod-container');

const secondProdContainer = document.getElementById('second-prod-container');

const valueProduct = document.getElementById('counter');

const bagContainer = document.getElementById('bag-container');

let totalPrice = 0;

bins.forEach(bin => {
    bin.addEventListener('click', () => {
        bag.classList.add('container-visibility');
        overlay.classList.add('overlay-visible');
    });
});
bagXmark.addEventListener('click', () => {
    bag.classList.remove('container-visibility');
    overlay.classList.remove('overlay-visible');
});
dots.addEventListener('click', () => {
    navMenu.classList.toggle('nav-menu-visible');
});
xmarkMobile.addEventListener('click', () => {
    navMenu.classList.remove('nav-menu-visible');
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {

            if (firstProdContainer || secondProdContainer) {
                renderCard(firstProdContainer, data, 0, 3);
                renderCard(secondProdContainer, data, 4, 7);
            }

            
            const savedCart = localStorage.getItem('shoppingCart');
            if (savedCart) {
                bagContainer.innerHTML = savedCart;
                updateTotalPriceFromCart(); 
            }

            const addButton = Array.from(document.getElementsByClassName('add-button'));

            addButton.forEach(button => {
                button.addEventListener('mousedown', () => {
                    button.classList.add('img-button-pressed');
                });
                button.addEventListener('mouseup', () => {
                    button.classList.remove('img-button-pressed');

                    const productId = button.getAttribute('data-id');
                    const productName = button.getAttribute('data-name');
                    const productPrice = parseFloat(button.getAttribute('data-price'));

                    const existingProduct = document.querySelector(`.bag-container-child[data-id="${productId}"]`);

                    if (existingProduct) {
                        const counterElement = existingProduct.querySelector('.counter .quantity #counter');
                        let count = parseInt(counterElement.textContent);
                        counterElement.textContent = ++count;
                        updateTotalPrice(productPrice);
                    } else {
                        const productHTML = `
                            <div class="bag-container-child" data-id="${productId}">
                                <div class="bag-img-container">
                                    <img src="${button.parentNode.querySelector('img').src}">
                                    <div class="bag-info">
                                        <span>${productName}</span>
                                        <span>$${productPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div class="counter">
                                    <div class="quantity">
                                        <i class="fa-solid fa-minus quantity-minus"></i>
                                        <div id="counter">1</div>
                                        <i class="fa-solid fa-plus quantity-plus"></i>
                                    </div>
                                    <div class="remove">
                                        <div>
                                            <span>Remove</span>
                                        </div>
                                        <div class="circle">
                                            <i class="fa-solid fa-xmark removal-button"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        bagContainer.innerHTML += productHTML;
                        updateTotalPrice(productPrice);
                    }

                    
                    saveCart();
                });
            });

            bagContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('quantity-plus')) {
                    const counterElement = event.target.previousElementSibling;
                    let count = parseInt(counterElement.textContent);
                    counterElement.textContent = ++count;

                    const productElement = event.target.closest('.bag-container-child');
                    const productPrice = parseFloat(productElement.querySelector('.bag-info span:nth-child(2)').textContent.replace('$', ''));
                    updateTotalPrice(productPrice);

                    
                    saveCart();
                }
                if (event.target.classList.contains('quantity-minus')) {
                    const counterElement = event.target.nextElementSibling;
                    let count = parseInt(counterElement.textContent);
                    const productElement = event.target.closest('.bag-container-child');
                    const productPrice = parseFloat(productElement.querySelector('.bag-info span:nth-child(2)').textContent.replace('$', ''));

                    if (count > 0) {
                        counterElement.textContent = --count;
                        updateTotalPrice(-productPrice);
                    }
                    if (count === 0) {
                        productElement.remove();
                    }

                    
                    saveCart();
                }
                if (event.target.classList.contains('removal-button')) {
                    const productElement = event.target.closest('.bag-container-child');
                    const productPrice = parseFloat(productElement.querySelector('.bag-info span:nth-child(2)').textContent.replace('$', ''));
                    const quantity = parseInt(productElement.querySelector('.quantity #counter').textContent);
                    updateTotalPrice(-productPrice * quantity);
                    productElement.remove();

                    
                    saveCart();
                }
            });

            function updateTotalPrice(amount) {
                totalPrice += amount;
                document.getElementById('total').textContent = '$' + totalPrice.toFixed(2);
            }

            
            function saveCart() {
                localStorage.setItem('shoppingCart', bagContainer.innerHTML);
            }

            
            function updateTotalPriceFromCart() {
                totalPrice = 0;
                const products = bagContainer.querySelectorAll('.bag-container-child');
                products.forEach(product => {
                    const productPrice = parseFloat(product.querySelector('.bag-info span:nth-child(2)').textContent.replace('$', ''));
                    const quantity = parseInt(product.querySelector('.quantity #counter').textContent);
                    totalPrice += productPrice * quantity;
                });
                document.getElementById('total').textContent = '$' + totalPrice.toFixed(2);
            }

            const filteringButtons = Array.from(document.getElementsByClassName('filtering-button'));

            filteringButtons.forEach(button => {
                button.addEventListener('mouseover', () => {
                    button.classList.add('button-hovered');
                });
                button.addEventListener('mouseout', () => {
                    button.classList.remove('button-hovered');
                });

                button.addEventListener('click', () => {
                    const category = button.getAttribute('data-category').toLowerCase();
                    filterProducts(category);
                });
            });

            const searchButton = document.getElementById('search-button');
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('search-input');
                const searchText = searchInput.value.toLowerCase();
                filterProducts(searchText);
            });

            function renderCard(container, data, startIndex, endIndex) {
                if (container) {
                    for (let i = startIndex; i <= endIndex; i++) {
                        const productDiv = `
                            <div class="products" data-name="${data[i].name.toLowerCase()}" data-category="${data[i].category}">
                                <div class="img-container">
                                    <div class="img">
                                        <img src="${data[i].image}">
                                        <button class="add-button" data-id="${data[i].id}" data-name="${data[i].name}" data-price="${data[i].price}">
                                            <i class="fa-solid fa-plus"></i>
                                            Add
                                        </button>
                                    </div>
                                </div>
                                <div class="product-info">
                                    <span>${data[i].name}</span>
                                    <span>${'$' + (data[i].price).toFixed(2)}</span>
                                    <div class="rating">
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                    </div>
                                    <span>${data[i].category}</span>
                                </div>
                            </div>`;
                        container.innerHTML += productDiv;
                    }
                }
            }

            function filterProducts(filter) {
                const products = Array.from(document.getElementsByClassName('products'));
                products.forEach(product => {
                    const productName = product.getAttribute('data-name');
                    const productCategory = product.getAttribute('data-category').toLowerCase();
                    if (filter === 'all' || productCategory === filter || productName.includes(filter)) {
                        product.style.display = '';
                    } else {
                        product.style.display = 'none';
                    }
                });
            }
        });
});
