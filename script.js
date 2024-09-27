const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const adressInput = document.getElementById("adress");
const adressWarn = document.getElementById("adress-warn");

let cart = [];

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal do carrinho
cartModal.addEventListener("click", function(event) {
    if(event.target === cartModal){
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none";
});

// Adicionar viagens e produtos ao carrinho
menu.addEventListener("click", function(event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-pride"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }
    updateCartModal();
    updateCart();
}

// Atualizar o carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">${item.name}</p>
              <p>Qtd:  ${item.quantity}</p>
              <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
            </div>
              <button class="remove-from-cart-btn" data-name="${item.name}">
                Remover
              </button>
          </div>
        `;

        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    cartCounter.innerHTML = cart.length;
}

// Função para remover item do carrinho
cartItemsContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
            updateCartModal();
            return;
        }

        cart.splice(index, 1);
        updateCartModal();
    }
}

// Função para calcular orçamento de hotéis com base nas datas
function calcularOrcamento(precoDia, hotel, hotelId) {
    const dataInicio = new Date(document.getElementById(`data-inicio-${hotelId}`).value);
    const dataTermino = new Date(document.getElementById(`data-termino-${hotelId}`).value);

    // Verifica se as datas são válidas
    if (isNaN(dataInicio) || isNaN(dataTermino)) {
        alert("Por favor, insira datas válidas.");
        return;
    }

    // Calcula a diferença de dias
    const diffTime = Math.abs(dataTermino - dataInicio);
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferença em dias

    if (dias <= 0) {
        alert("A data de término deve ser posterior à data de início.");
        return;
    }

    // Calcula o valor total com base nos dias
    const total = dias * precoDia;
    alert(`O custo total para ${dias} dias no ${hotel} é R$ ${total.toFixed(2)}`);

    // Adicionar ao carrinho
    addToCart(hotel, total, dias); // Passa os dias para o carrinho, mas não como quantidade
}

// Atualizar função de adicionar ao carrinho para usar 'dias' em vez de 'quantidade'
function addToCart(name, total, dias) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        // Atualiza o valor total e os dias, em vez de aumentar a quantidade
        existingItem.price = total;
        existingItem.dias = dias;
    } else {
        cart.push({
            name,
            price: total,
            dias: dias, // Armazena a quantidade de dias
        });
    }

    updateCartModal();
    updateCart();
}

// Atualiza o modal e o carrinho para exibir a quantidade de dias corretamente
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">${item.name}</p>
              <p>Dias de estadia: ${item.dias}</p>
              <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
            </div>

              <button class="remove-from-cart-btn" data-name="${item.name}">
                Remover
              </button>
          </div>
        `;

        total += item.price;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    cartCounter.innerHTML = cart.length;
}

// Finalizar pedido
checkoutBtn.addEventListener("click", function() {
    if (cart.length === 0 || adressInput.value === "") {
        adressWarn.classList.remove("hidden");
        adressInput.classList.add("border-red-500");
        return;
    }

    const cartItems = cart.map(item => `${item.name} (Qtd: ${item.quantity}) - Preço: R$${item.price}`).join(" | ");
    const message = encodeURIComponent(cartItems);
    const phone = "61991541022";
    window.open(`https://wa.me/${phone}?text=${message} Endereço: ${adressInput.value}`, "_blank");

    cart = [];
    updateCartModal();
});

// Função para verificar se o restaurante está aberto
function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    const minuto = data.getMinutes();

    // O restaurante está aberto das 6:00 (6) até 23:00 (23)
    return (hora >= 6 && hora < 23); 
}

// Verificar a hora e manipular o card horário
const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}

// Seleciona todos os campos de data
document.querySelectorAll('input[type="date"]').forEach(function(input) {
    input.addEventListener('change', function() {
      if (input.value) {
        input.classList.add('has-value'); // Adiciona a classe que mostra o valor
      } else {
        input.classList.remove('has-value'); // Remove se a data for removida
      }
    });
  });
  