const SIZE = 9;
const MINES = 10;

export function startMineGame(grid, toast = () => {}) {
  if (!grid) return;
  const host = grid.closest(".xp-window") || document;
  const counter = host.querySelector("#mine-count");
  const clock = host.querySelector("#mine-clock");
  const face = host.querySelector("[data-action='mine-new']");
  let cells = [];
  let started = false;
  let finished = false;
  let seconds = 0;
  let timer = null;
  let firstReveal = true;

  const stopTimer = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  const reset = () => {
    stopTimer();
    started = false;
    finished = false;
    seconds = 0;
    firstReveal = true;
    if (clock) clock.textContent = "000";
    if (counter) counter.textContent = String(MINES).padStart(3, "0");
    if (face) face.textContent = "🙂";
    cells = Array.from({ length: SIZE * SIZE }, (_, index) => ({ index, mine: false, count: 0, revealed: false, flagged: false }));
    grid.innerHTML = "";
    grid.setAttribute("aria-label", `Minesweeper board, ${SIZE} by ${SIZE}`);
    cells.forEach((cell) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mine-cell";
      button.dataset.index = String(cell.index);
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", `Covered square ${Math.floor(cell.index / SIZE) + 1}, ${cell.index % SIZE + 1}`);
      grid.append(button);
    });
  };

  const placeMines = (safeIndex) => {
    const forbidden = new Set([safeIndex, ...neighbors(safeIndex)]);
    let placed = 0;
    while (placed < MINES) {
      const index = Math.floor(Math.random() * cells.length);
      if (forbidden.has(index) || cells[index].mine) continue;
      cells[index].mine = true;
      placed += 1;
    }
    cells.forEach((cell) => {
      if (!cell.mine) cell.count = neighbors(cell.index).filter((index) => cells[index].mine).length;
    });
  };

  const updateCounter = () => {
    const left = Math.max(0, MINES - cells.filter((cell) => cell.flagged).length);
    if (counter) counter.textContent = String(left).padStart(3, "0");
  };

  const paintCell = (cell) => {
    const button = grid.querySelector(`[data-index="${cell.index}"]`);
    if (!button) return;
    button.classList.toggle("revealed", cell.revealed);
    button.classList.toggle("flagged", cell.flagged);
    if (cell.flagged && !cell.revealed) {
      button.textContent = "⚑";
      button.setAttribute("aria-label", `Flagged square ${Math.floor(cell.index / SIZE) + 1}, ${cell.index % SIZE + 1}`);
    } else if (cell.revealed && cell.mine) {
      button.textContent = "✹";
      button.setAttribute("aria-label", "Mine");
    } else if (cell.revealed && cell.count > 0) {
      button.textContent = String(cell.count);
      button.dataset.number = String(cell.count);
      button.setAttribute("aria-label", `${cell.count} nearby mines`);
    } else if (cell.revealed) {
      button.textContent = "";
      button.setAttribute("aria-label", "Empty square");
    }
  };

  const revealRegion = (startIndex) => {
    const stack = [startIndex];
    const visited = new Set();
    while (stack.length) {
      const index = stack.pop();
      if (visited.has(index)) continue;
      visited.add(index);
      const cell = cells[index];
      if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      paintCell(cell);
      if (cell.count === 0) neighbors(index).forEach((next) => stack.push(next));
    }
  };

  const finish = (won) => {
    finished = true;
    stopTimer();
    if (face) face.textContent = won ? "😎" : "😵";
    if (!won) {
      cells.filter((cell) => cell.mine).forEach((cell) => { cell.revealed = true; paintCell(cell); });
      toast("Boom. The board has been reset; try another route.");
    } else {
      toast("Nicely done. Every safe square is clear.");
    }
  };

  const toggleFlag = (index) => {
    if (finished || cells[index].revealed) return;
    cells[index].flagged = !cells[index].flagged;
    paintCell(cells[index]);
    updateCounter();
  };

  const reveal = (index) => {
    const cell = cells[index];
    if (finished || !cell || cell.revealed || cell.flagged) return;
    if (firstReveal) {
      placeMines(index);
      firstReveal = false;
      started = true;
      timer = setInterval(() => {
        seconds = Math.min(999, seconds + 1);
        if (clock) clock.textContent = String(seconds).padStart(3, "0");
      }, 1000);
    }
    if (cell.mine) {
      cell.revealed = true;
      paintCell(cell);
      finish(false);
      return;
    }
    revealRegion(index);
    const safeCells = cells.filter((item) => !item.mine).length;
    if (cells.filter((item) => item.revealed).length >= safeCells) finish(true);
  };

  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".mine-cell");
    if (!button) return;
    reveal(Number(button.dataset.index));
  });
  grid.addEventListener("contextmenu", (event) => {
    const button = event.target.closest(".mine-cell");
    if (!button) return;
    event.preventDefault();
    toggleFlag(Number(button.dataset.index));
  });
  let holdTimer = null;
  grid.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    const button = event.target.closest(".mine-cell");
    if (!button) return;
    holdTimer = setTimeout(() => {
      toggleFlag(Number(button.dataset.index));
      button.dataset.longPressed = "true";
    }, 520);
  });
  grid.addEventListener("pointerup", () => { if (holdTimer) clearTimeout(holdTimer); holdTimer = null; });
  grid.addEventListener("pointercancel", () => { if (holdTimer) clearTimeout(holdTimer); holdTimer = null; });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".mine-cell");
    if (button?.dataset.longPressed) {
      delete button.dataset.longPressed;
      event.stopImmediatePropagation();
    }
  }, true);
  face?.addEventListener("click", reset);
  reset();
}

function neighbors(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const list = [];
  for (let y = Math.max(0, row - 1); y <= Math.min(SIZE - 1, row + 1); y += 1) {
    for (let x = Math.max(0, col - 1); x <= Math.min(SIZE - 1, col + 1); x += 1) {
      const next = y * SIZE + x;
      if (next !== index) list.push(next);
    }
  }
  return list;
}
