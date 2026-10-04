import { APP_DEFS } from "./config.js";
import { icon } from "./icons.js";
import { appMeta, renderApp, mountApp } from "./apps.js";

const layer = document.querySelector("#window-layer");
const taskList = document.querySelector("#task-list");
const windows = new Map();
let topZ = 25;
let stackOffset = 0;
let activeId = null;
let dragState = null;
let toastCallback = () => {};

export function setWindowToast(callback) { toastCallback = callback; }
export function getActiveWindow() { return activeId ? windows.get(activeId) || null : null; }
export function getWindow(id) { return windows.get(id) || null; }
export function getOpenWindowIds() { return [...windows.keys()]; }

export function openApp(id) {
  const definition = APP_DEFS[id];
  if (!definition || !layer) return null;
  const current = windows.get(id);
  if (current) {
    restoreWindow(id);
    focusWindow(id);
    return current;
  }

  const [baseWidth, baseHeight] = definition.size || [640, 470];
  const viewportWidth = layer.clientWidth || window.innerWidth;
  const viewportHeight = layer.clientHeight || window.innerHeight - 42;
  const mobile = window.matchMedia("(max-width: 620px)").matches;
  const width = mobile ? viewportWidth - 14 : Math.min(baseWidth, viewportWidth - 28);
  const height = mobile ? viewportHeight - 14 : Math.min(baseHeight, viewportHeight - 28);
  const offset = (stackOffset++ % 7) * 24;
  const left = mobile ? 7 : Math.max(8, Math.min((viewportWidth - width) / 2 + offset - 42, viewportWidth - width - 8));
  const top = mobile ? 7 : Math.max(8, Math.min((viewportHeight - height) / 2 + offset - 30, viewportHeight - height - 8));

  const win = document.createElement("section");
  win.className = "xp-window is-active";
  win.dataset.appId = id;
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", definition.title);
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.zIndex = String(++topZ);
  const appContent = renderApp(id);
  win.innerHTML = `
    <header class="title-bar" data-drag-handle>
      <div class="title-text">${icon(definition.icon, "", 18)}<span>${definition.title}</span></div>
      <div class="window-controls">
        <button class="window-control minimize-control" type="button" data-window-action="minimize" aria-label="Minimize" title="Minimize">−</button>
        <button class="window-control maximize-control" type="button" data-window-action="maximize" aria-label="Maximize or restore" title="Maximize">□</button>
        <button class="window-control close-control" type="button" data-window-action="close" aria-label="Close" title="Close">×</button>
      </div>
    </header>
    <nav class="window-menu-bar" aria-label="Program menu">
      <button class="window-menu-button" type="button" data-app-menu="file">File</button>
      <button class="window-menu-button" type="button" data-app-menu="edit">Edit</button>
      <button class="window-menu-button" type="button" data-app-menu="view">View</button>
      <button class="window-menu-button" type="button" data-app-menu="help">Help</button>
    </nav>
    <div class="window-toolbar" aria-label="Program toolbar">
      <button class="toolbar-button" type="button" data-action="app-back" title="Back"><span class="toolbar-glyph">‹</span><span>Back</span></button>
      <button class="toolbar-button" type="button" data-action="app-forward" title="Forward"><span class="toolbar-glyph">›</span></button>
      <button class="toolbar-button" type="button" data-action="app-up" title="Up one level"><span class="toolbar-glyph">↑</span><span>Up</span></button>
      <span class="toolbar-separator"></span>
      <button class="toolbar-button" type="button" data-action="app-search" title="Search"><span class="toolbar-glyph">⌕</span><span>Search</span></button>
      <button class="toolbar-button" type="button" data-action="app-home" title="Home"><span class="toolbar-glyph">⌂</span><span>Home</span></button>
    </div>
    <div class="window-body">${appContent}</div>
    <footer class="window-status"><span>${definition.status || "Ready"}</span></footer>
  `;
  layer.append(win);
  windows.set(id, win);
  addTaskButton(id, definition);
  focusWindow(id);
  mountApp(id, win, { toast: toastCallback });
  return win;
}

function addTaskButton(id, definition) {
  const button = document.createElement("button");
  button.className = "task-button";
  button.type = "button";
  button.dataset.windowFocus = id;
  button.title = definition.title;
  button.innerHTML = `${icon(definition.icon, "", 17)}<span>${definition.title}</span>`;
  taskList?.append(button);
}

export function focusWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  activeId = id;
  topZ += 1;
  windows.forEach((other, key) => {
    const active = key === id;
    other.classList.toggle("is-active", active);
    if (active) other.style.zIndex = String(topZ);
  });
  taskList?.querySelectorAll(".task-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.windowFocus === id);
  });
  layer?.classList.toggle("has-maximized", Boolean(win.classList.contains("is-maximized")));
}

export function closeWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.remove();
  windows.delete(id);
  taskList?.querySelector(`[data-window-focus="${id}"]`)?.remove();
  if (activeId === id) {
    activeId = null;
    const next = [...windows.entries()].filter(([, item]) => !item.classList.contains("is-minimized")).at(-1);
    if (next) focusWindow(next[0]);
  }
  layer?.classList.toggle("has-maximized", [...windows.values()].some((item) => item.classList.contains("is-maximized")));
}

export function minimizeWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.classList.add("is-minimized");
  taskList?.querySelector(`[data-window-focus="${id}"]`)?.classList.remove("is-active");
  if (activeId === id) {
    activeId = null;
    const next = [...windows.entries()].filter(([, item]) => !item.classList.contains("is-minimized")).at(-1);
    if (next) focusWindow(next[0]);
  }
}

export function restoreWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.classList.remove("is-minimized");
  focusWindow(id);
}

export function toggleMaximize(id) {
  const win = windows.get(id);
  if (!win) return;
  if (win.classList.contains("is-maximized")) {
    const restore = win.dataset.restoreBounds;
    if (restore) {
      try {
        const bounds = JSON.parse(restore);
        for (const [key, value] of Object.entries(bounds)) win.style[key] = value;
      } catch {}
    }
    win.classList.remove("is-maximized");
  } else {
    win.dataset.restoreBounds = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
    win.classList.add("is-maximized");
  }
  focusWindow(id);
  layer?.classList.toggle("has-maximized", [...windows.values()].some((item) => item.classList.contains("is-maximized")));
}

export function minimizeAllWindows() {
  for (const id of windows.keys()) minimizeWindow(id);
}

export function closeAllWindows() {
  [...windows.keys()].forEach(closeWindow);
}

export function handleWindowLayerPointerDown(event) {
  const win = event.target.closest(".xp-window");
  if (!win) return;
  const id = win.dataset.appId;
  focusWindow(id);
  const title = event.target.closest("[data-drag-handle]");
  if (!title || event.target.closest("button") || win.classList.contains("is-maximized") || event.button === 2) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const rect = win.getBoundingClientRect();
  dragState = { id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, moved: false };
  title.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

export function handleWindowLayerPointerMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const win = windows.get(dragState.id);
  if (!win) return;
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  if (Math.abs(dx) + Math.abs(dy) > 2) dragState.moved = true;
  const maxLeft = Math.max(0, layer.clientWidth - 70);
  const maxTop = Math.max(0, layer.clientHeight - 35);
  const left = Math.min(maxLeft, Math.max(0, dragState.left + dx));
  const top = Math.min(maxTop, Math.max(0, dragState.top + dy));
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
}

export function handleWindowLayerPointerUp(event) {
  if (dragState && event.pointerId === dragState.pointerId) dragState = null;
}

export function windowForTarget(target) {
  return target.closest(".xp-window");
}

export function showAllWindows() {
  const visible = [...windows.entries()].filter(([, win]) => !win.classList.contains("is-minimized"));
  visible.forEach(([id]) => focusWindow(id));
}
