/** Підказка біля курсора, коли миша над бісеринкою. */
export function initBeadTooltip(
  svg: SVGSVGElement,
  tip: HTMLElement,
  keyAt: (e: MouseEvent) => string | null,
  textFor: (key: string) => string | null
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
    const key = keyAt(e);
    if (!key) {
      if (!tip.hidden) hide();
      return;
    }
    if (key !== current || tip.hidden) {
      const text = textFor(key);
      if (!text) {
        hide();
        return;
      }
      current = key;
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
