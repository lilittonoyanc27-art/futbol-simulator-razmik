// Estado de entrada compartido entre teclado, controles táctiles y el motor.
export type InputState = {
  x: number; // derecha (+) / izquierda (-) en pantalla
  y: number; // adelante (+) / atrás (-) en pantalla
  sprint: boolean;
  shootHeld: boolean;
  pass: boolean; // pulsación (flanco)
  jump: boolean; // pulsación (flanco)
};

export const createInput = (): InputState => ({ x: 0, y: 0, sprint: false, shootHeld: false, pass: false, jump: false });

export function attachKeyboard(input: InputState) {
  const keys = new Set<string>();
  const update = () => {
    let x = 0,
      y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y -= 1;
    const len = Math.hypot(x, y) || 1;
    input.x = x / len;
    input.y = y / len;
    input.sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
    input.shootHeld = keys.has('KeyK') || keys.has('KeyC');
  };
  const down = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (!keys.has(e.code)) {
      if (e.code === 'KeyJ' || e.code === 'KeyX' || e.code === 'KeyL') input.pass = true;
      if (e.code === 'Space') input.jump = true;
    }
    keys.add(e.code);
    update();
  };
  const up = (e: KeyboardEvent) => {
    keys.delete(e.code);
    update();
  };
  const blur = () => {
    keys.clear();
    update();
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', blur);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
    window.removeEventListener('blur', blur);
  };
}
