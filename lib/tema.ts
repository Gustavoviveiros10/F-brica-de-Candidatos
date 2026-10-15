// Roda no <head> antes da pintura: aplica o tema salvo sem piscar e trata os cliques
// nos botões [data-tema-set] (auto/claro/escuro) e [data-tema-trocar] (alterna claro/escuro).
// "auto" segue o sistema: sem data-theme, valem as regras de prefers-color-scheme.
export const TEMA_SCRIPT = `(function(){var d=document.documentElement,K="tema";
function ef(){return d.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}
function ap(t){if(t!=="claro"&&t!=="escuro")t="auto";d.setAttribute("data-tema",t);if(t==="auto")d.removeAttribute("data-theme");else d.setAttribute("data-theme",t==="claro"?"light":"dark")}
var t;try{t=localStorage.getItem(K)}catch(e){}ap(t);
document.addEventListener("click",function(e){var el=e.target instanceof Element?e.target.closest("[data-tema-set],[data-tema-trocar]"):null;if(!el)return;
var n=el.getAttribute("data-tema-set")||(ef()==="dark"?"claro":"escuro");ap(n);try{localStorage.setItem(K,n)}catch(e){}})})();`;
