// ===================== CARRINHO =====================
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let cupomAtivo = null;

// Elementos HTML
const lista = document.getElementById("itens-carrinho"); // container para os itens
const subtotalElem = document.getElementById("subtotal");
const descontoElem = document.getElementById("desconto");
const totalElem = document.getElementById("total");
const cupomInput = document.getElementById("cupom");
const btnAplicarCupom = document.getElementById("aplicar-cupom");
const btnFinalizar = document.getElementById("finalizar");
const toast = document.getElementById("mensagem-toast");

// Atualiza o carrinho na tela
function atualizarCarrinho() {
  lista.innerHTML = "";
  let subtotal = 0;

  carrinho.forEach((item, index) => {
    subtotal += item.preco;
    lista.innerHTML += `
      <div class="item">
        <img src="${item.imagem}" alt="${item.nome}">
        <span>${item.nome}</span>
        <strong>R$ ${item.preco.toFixed(2)}</strong>
        <button onclick="removerItem(${index})">❌</button>
      </div>
    `;
  });

  // Calcula desconto
  let desconto = 0;
  if (cupomAtivo === "DESCONTO10") desconto = subtotal * 0.1;
  if (cupomAtivo === "PROMO25") desconto = subtotal * 0.25;
  if (cupomAtivo === "BLACK50") desconto = subtotal * 0.5;

  let total = subtotal - desconto;

  subtotalElem.textContent = `Subtotal: R$ ${subtotal.toFixed(2)}`;
  descontoElem.textContent = desconto ? `Desconto: R$ ${desconto.toFixed(2)} (${cupomAtivo})` : "";
  totalElem.textContent = `Total: R$ ${total.toFixed(2)}`;

  // Atualiza localStorage
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Remove item do carrinho
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
  mostrarToast("Item removido do carrinho", "erro");
}

// Aplica cupom
btnAplicarCupom.addEventListener("click", () => {
  const codigo = cupomInput.value.trim().toUpperCase();
  const cuponsValidos = ["DESCONTO10", "PROMO25", "BLACK50"];
  if (cuponsValidos.includes(codigo)) {
    cupomAtivo = codigo;
    mostrarToast(`Cupom "${codigo}" aplicado!`, "sucesso");
  } else {
    cupomAtivo = null;
    mostrarToast("Cupom inválido", "erro");
  }
  atualizarCarrinho();
});

// Finalizar compra via WhatsApp
btnFinalizar.addEventListener("click", () => {
  if (carrinho.length === 0) {
    mostrarToast("Carrinho vazio!", "erro");
    return;
  }

  let mensagem = "🛒 Resumo do Pedido:\n\n";
  let subtotal = 0;

  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}. ${item.nome} — R$ ${item.preco.toFixed(2)}\n`;
    subtotal += item.preco;
  });

  let desconto = 0;
  if (cupomAtivo === "DESCONTO10") desconto = subtotal * 0.1;
  if (cupomAtivo === "PROMO25") desconto = subtotal * 0.25;
  if (cupomAtivo === "BLACK50") desconto = subtotal * 0.5;

  let total = subtotal - desconto;

  mensagem += `\nSubtotal: R$ ${subtotal.toFixed(2)}\n`;
  if (cupomAtivo) mensagem += `Desconto: ${cupomAtivo} (-R$ ${desconto.toFixed(2)})\n`;
  mensagem += `Total: R$ ${total.toFixed(2)}\n\n✅ Envie este pedido para confirmar!`;

  const numero = "5547996626904"; // Seu WhatsApp
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
});

// Toast
function mostrarToast(texto, tipo = "sucesso", duracao = 3000) {
  if (!toast) return;
  toast.textContent = texto;
  toast.className = "mensagem-toast " + (tipo === "sucesso" ? "sucesso" : "erro") + " show";

  if (toast._timeout) clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duracao);
}

// Inicializa
atualizarCarrinho();
