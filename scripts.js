// scripts.js
// Lógica unificada para site: adicionar ao carrinho, contador, toast, galeria, menu mobile e render do carrinho.

// ===================== UTIL & STATE =====================
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let cupomAtivo = null;

// ===================== TOAST =====================
const globalToast = (() => {
  let el = null;
  function ensure() {
    if (!el) {
      el = document.getElementById("mensagem-toast");
    }
    return el;
  }
  return {
    show(texto, tipo = "sucesso", duracao = 3000) {
      const toast = ensure();
      if (!toast) return;
      toast.textContent = texto;
      toast.className = "mensagem-toast " + (tipo === "sucesso" ? "sucesso" : "erro") + " show";
      if (toast._timeout) clearTimeout(toast._timeout);
      toast._timeout = setTimeout(() => toast.classList.remove("show"), duracao);
    }
  };
})();

// ===================== CONTADOR =====================
function atualizarContador() {
  const contador = document.getElementById("quantidade-carrinho");
  if (contador) contador.textContent = carrinho.length;
}
window.atualizarContador = atualizarContador; // expor

// ===================== ADICIONAR AO CARRINHO =====================
function adicionarAoCarrinho(nome, preco, imagem) {
  // Garante preço como number
  const precoNum = typeof preco === "string" ? parseFloat(preco.replace(",", ".").replace(/[^0-9.\-]/g, "")) || 0 : Number(preco) || 0;
  const item = { nome, preco: precoNum, imagem };
  carrinho.push(item);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarContador();
  globalToast.show(`"${nome}" adicionado ao carrinho!`, "sucesso");
}
window.adicionarAoCarrinho = adicionarAoCarrinho; // expor para onclick inline

// ===================== RENDER CARRINHO =====================
function renderCart() {
  // Só tenta renderizar se estiver na página do carrinho (ex.: existe #itens-carrinho)
  const container = document.getElementById("itens-carrinho");
  const subtotalElem = document.getElementById("subtotal");
  const descontoElem = document.getElementById("desconto");
  const totalElem = document.getElementById("total");
  if (!container || !subtotalElem || !descontoElem || !totalElem) return;

  container.innerHTML = "";
  let subtotal = 0;
  carrinho.forEach((item, i) => {
    subtotal += Number(item.preco) || 0;
    container.innerHTML += `
      <div class="item">
        <img src="${item.imagem}" alt="${item.nome}">
        <span>${item.nome}</span>
        <strong>R$ ${Number(item.preco).toFixed(2)}</strong>
        <button data-index="${i}" class="remover-btn">❌</button>
      </div>
    `;
  });

  // calcula desconto (aqui você pode substituir por lógica de cupom centralizada)
  let descontoValor = 0;
  if (cupomAtivo === "DESCONTO10") descontoValor = subtotal * 0.10;
  if (cupomAtivo === "PROMO25") descontoValor = subtotal * 0.25;
  if (cupomAtivo === "BLACK50") descontoValor = subtotal * 0.50;

  let total = subtotal - descontoValor;
  if (total < 0) total = 0;

  subtotalElem.textContent = `Subtotal: R$ ${subtotal.toFixed(2)}`;
  descontoElem.textContent = cupomAtivo ? `Cupom "${cupomAtivo}" aplicado: -R$ ${descontoValor.toFixed(2)}` : "";
  totalElem.textContent = `Total: R$ ${total.toFixed(2)}`;

  // ligar eventos dos botões remover
  container.querySelectorAll(".remover-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.dataset.index);
      removerItem(idx);
    });
  });

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}
window.renderCart = renderCart;

// ===================== REMOVER ITEM =====================
function removerItem(index) {
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarContador();
  renderCart();
  globalToast.show("Item removido do carrinho", "erro");
}
window.removerItem = removerItem;

// ===================== APLICAR CUPOM (se houver UI na página do carrinho) =====================
function aplicarCupom(codigo) {
  if (!codigo) {
    cupomAtivo = null;
    globalToast.show("Cupom limpo", "neutro");
    renderCart();
    return;
  }
  const cupons = { "DESCONTO10": 10, "PROMO25": 25, "BLACK50": 50 };
  const code = codigo.trim().toUpperCase();
  if (cupons[code]) {
    cupomAtivo = code;
    globalToast.show(`Cupom "${code}" aplicado!`, "sucesso");
  } else {
    cupomAtivo = null;
    globalToast.show("Cupom inválido", "erro");
  }
  renderCart();
}
window.aplicarCupom = aplicarCupom;

// ===================== FINALIZAR / WHATSAPP =====================
function finalizarCompra(numeroWhats = "5547996626904") {
  if (carrinho.length === 0) {
    globalToast.show("Carrinho vazio!", "erro");
    return;
  }
  let mensagem = "🛒 Resumo do Pedido:\n\n";
  let subtotal = 0;
  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}. ${item.nome} — R$ ${Number(item.preco).toFixed(2)}\n`;
    subtotal += Number(item.preco) || 0;
  });

  let descontoValor = 0;
  if (cupomAtivo === "DESCONTO10") descontoValor = subtotal * 0.1;
  if (cupomAtivo === "") descontoValor = subtotal * 0.25;
  if (cupomAtivo === "") descontoValor = subtotal * 0.5;
  let total = subtotal - descontoValor;
  if (total < 0) total = 0;

  mensagem += `\nSubtotal: R$ ${subtotal.toFixed(2)}\n`;
  if (cupomAtivo) mensagem += `Desconto: ${cupomAtivo} (-R$ ${descontoValor.toFixed(2)})\n`;
  mensagem += `Total: R$ ${total.toFixed(2)}\n\n✅ Envie este pedido para confirmar!`;

  window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagem)}`, "_blank");
}
window.finalizarCompra = finalizarCompra;

// ===================== TROCAR IMAGEM & MENU MOBILE =====================
function trocarImagem(src) {
  const principal = document.getElementById("imagem-principal");
  if (principal) principal.src = src;
}
window.trocarImagem = trocarImagem;

document.addEventListener("DOMContentLoaded", () => {
  // menu hamburger
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("active"));
  }

  // atualizar contador em qualquer página
  atualizarContador();

  // ligar botão aplicar cupom se existir (ex.: carrinho.html)
  const btnAplicar = document.getElementById("aplicar-cupom");
  if (btnAplicar) {
    btnAplicar.addEventListener("click", () => {
      const codigo = (document.getElementById("cupom") || { value: "" }).value;
      aplicarCupom(codigo);
    });
  }

  // ligar botão finalizar se existir
  const btnFinalizar = document.getElementById("finalizar");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => finalizarCompra());
  }

  // Se estivermos na página do carrinho, renderiza
  renderCart();

  // galeria miniaturas: ligação segura
  document.querySelectorAll(".miniaturas img").forEach(img => {
    img.addEventListener("click", () => trocarImagem(img.src));
  });
});

