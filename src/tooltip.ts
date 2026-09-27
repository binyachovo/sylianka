/** Підказка біля курсора над трафаретом: текст для точки дає textAt (null — сховати). */
export function initTooltip(
  svg: SVGSVGElement,
  tip: HTMLElement,
  textAt: (e: MouseEvent) => string | null
): { hide(): void } {
  let current = "";

  function hide(): void {
    tip.hidden = true;
    current = "";
  }

  function place(x: number, y: number): void {
    const pad = 14;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let left = x + pad;
    let top = y + pad;
    if (left + w > window.innerWidth - 8) left = Math.max(8, x - pad - w);
    if (top + h > window.innerHeight - 8) top = Math.max(8, y - pad - h);
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }

  svg.addEventListener("pointermove", (e) => {
    // Під час малювання підказка заважає.
    if (e.pointerType !== "mouse" || e.buttons !== 0 || document.body.classList.contains("clean")) {
      if (!tip.hidden) hide();
      return;
    }
    const text = textAt(e);
    if (!text) {
      if (!tip.hidden) hide();
      return;
    }
    if (text !== current || tip.hidden) {
      current = text;
      tip.textContent = text;
      tip.hidden = false;
    }
    place(e.clientX, e.clientY);
  });
  svg.addEventListener("pointerleave", hide);
  svg.addEventListener("pointerdown", hide);
  window.addEventListener("scroll", hide, { passive: true, capture: true });

  return { hide };
}
