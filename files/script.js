/* ==========================================================
   Cardoso Churrascaria e Choperia - comportamentos da página
   Sem bibliotecas. Funciona apenas com o que existe no index.html.
   ========================================================== */
(function () {
  "use strict";

  var raiz = document.documentElement;
  raiz.classList.add("js");

  /* ---------- Topo: fundo ao rolar a página ---------- */
  var topo = document.getElementById("topo");

  function atualizarTopo() {
    if (topo) topo.classList.toggle("rolou", window.scrollY > 40);
  }
  window.addEventListener("scroll", atualizarTopo, { passive: true });
  atualizarTopo();

  /* ---------- Menu móvel ---------- */
  var botaoMenu = document.querySelector("[data-menu-botao]");
  var menu = document.querySelector("[data-menu]");
  var textoMenu = botaoMenu ? botaoMenu.querySelector(".menu-botao-texto") : null;
  var larguraDesktop = window.matchMedia("(min-width: 860px)");

  function definirMenu(aberto) {
    if (!botaoMenu || !menu || !topo) return;
    menu.classList.toggle("aberto", aberto);
    topo.classList.toggle("menu-aberto", aberto);
    botaoMenu.setAttribute("aria-expanded", String(aberto));
    if (textoMenu) textoMenu.textContent = aberto ? "Fechar" : "Menu";
  }

  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", function () {
      definirMenu(botaoMenu.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) definirMenu(false);
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && menu.classList.contains("aberto")) {
        definirMenu(false);
        botaoMenu.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (larguraDesktop.matches) definirMenu(false);
    });
  }

  /* ---------- Fotos reais ----------
     Foto que carrega aparece sobre o espaço reservado.
     Foto que não existe é removida e o espaço reservado continua visível;
     o link de ampliação dessa foto é desativado. */
  function fotoCarregou(img) {
    img.classList.add("carregada");
  }

  function fotoFalhou(img) {
    var link = img.closest("a");
    if (link) {
      link.removeAttribute("href");
      link.removeAttribute("aria-label");
      link.removeAttribute("data-lightbox");
    }
    img.remove();
  }

  Array.prototype.forEach.call(document.querySelectorAll("img[data-foto]"), function (img) {
    if (img.complete) {
      if (img.naturalWidth > 0) fotoCarregou(img);
      else fotoFalhou(img);
      return;
    }
    img.addEventListener("load", function () { fotoCarregou(img); }, { once: true });
    img.addEventListener("error", function () { fotoFalhou(img); }, { once: true });
  });

  /* ---------- Ampliação das fotos ---------- */
  var caixa = document.querySelector("[data-lightbox-janela]");
  if (!caixa) return;

  var imagemGrande = caixa.querySelector("[data-lightbox-img]");
  var legenda = caixa.querySelector("[data-lightbox-legenda]");
  var botaoFechar = caixa.querySelector("[data-lightbox-fechar]");
  var botaoAnterior = caixa.querySelector("[data-lightbox-anterior]");
  var botaoProxima = caixa.querySelector("[data-lightbox-proxima]");
  var lista = [];
  var atual = 0;

  function listarFotos() {
    return Array.prototype.slice.call(document.querySelectorAll("a[data-lightbox][href]"));
  }

  function mostrar(indice) {
    if (!lista.length) return;
    atual = (indice + lista.length) % lista.length;
    var link = lista[atual];
    var miniatura = link.querySelector("img");

    imagemGrande.removeAttribute("src");
    imagemGrande.alt = miniatura ? miniatura.alt : "";
    imagemGrande.src = link.getAttribute("href");
    legenda.textContent = "Foto " + (atual + 1) + " de " + lista.length;

    var varias = lista.length > 1;
    botaoAnterior.hidden = !varias;
    botaoProxima.hidden = !varias;
  }

  imagemGrande.addEventListener("error", function () {
    imagemGrande.removeAttribute("src");
    legenda.textContent = "Não foi possível carregar esta foto.";
  });

  document.addEventListener("click", function (evento) {
    var link = evento.target.closest("a[data-lightbox][href]");
    if (!link) return;

    if (typeof caixa.showModal !== "function") return; // navegador antigo: abre a foto normalmente

    evento.preventDefault();
    try {
      lista = listarFotos();
      mostrar(lista.indexOf(link));
      if (!caixa.open) caixa.showModal();
      raiz.classList.add("lightbox-aberto");
      botaoFechar.focus();
    } catch (erro) {
      window.open(link.getAttribute("href"), "_blank", "noopener");
    }
  });

  botaoFechar.addEventListener("click", function () { caixa.close(); });
  botaoAnterior.addEventListener("click", function () { mostrar(atual - 1); });
  botaoProxima.addEventListener("click", function () { mostrar(atual + 1); });

  // Clique fora da foto e dos botões fecha a janela
  caixa.addEventListener("click", function (evento) {
    if (evento.target === caixa) caixa.close();
  });

  // A tecla Esc já fecha o <dialog>; aqui tratamos as setas
  document.addEventListener("keydown", function (evento) {
    if (!caixa.open || lista.length < 2) return;
    if (evento.key === "ArrowLeft") { evento.preventDefault(); mostrar(atual - 1); }
    if (evento.key === "ArrowRight") { evento.preventDefault(); mostrar(atual + 1); }
  });

  caixa.addEventListener("close", function () {
    raiz.classList.remove("lightbox-aberto");
    imagemGrande.removeAttribute("src");
  });
})();
