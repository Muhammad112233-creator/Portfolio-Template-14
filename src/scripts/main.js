import { PROFILE, PROJECTS, APP_GROUPS, APP_DEFS } from "./config.js";
import { icon } from "./icons.js";
import { openApp, closeWindow, minimizeWindow, toggleMaximize, restoreWindow, getActiveWindow, getOpenWindowIds, minimizeAllWindows, setWindowToast, handleWindowLayerPointerDown, handleWindowLayerPointerMove, handleWindowLayerPointerUp, windowForTarget } from "./desktop.js";
import { renderProjectDetail } from "./apps.js";
import { playSystemSound, setMasterVolume } from "./sound.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const bootScreen = $("#boot-screen");
const loginScreen = $("#login-screen");
const desktop = $("#desktop");
const shutdownScreen = $("#shutdown-screen");
const powerDialog = $("#power-dialog");
const startMenu = $("#start-menu");
const allProgramsPanel = $("#all-programs-panel");
const categorySubmenu = $("#category-submenu");
const contextMenu = $("#context-menu");
const trayFlyout = $("#tray-flyout");
const clockFlyout = $("#clock-flyout");
const windowLayer = $("#window-layer");
const desktopIcons = $("#desktop-icons");
const toastHost = $("#toast-host");
const APP_NAMES = Object.fromEntries(Object.entries(APP_DEFS).map(([id, item]) => [id, item.title]));
let bootTimer = null;
let previousDesktopTap = null;
let ignoreClickUntil = 0;
let desktopDrag = null;
let backgroundLongPress = null;
let volume = 22;
let calcState = { current: "0", stored: null, operation: null, replace: true, memory: 0 };
let pinballRounds = 0;

function hydrateIdentity() {
  $$('[data-profile="name"]').forEach((element) => { element.textContent = PROFILE.name; });
  $$('[data-profile="role"]').forEach((element) => { element.textContent = PROFILE.role; });
  $$('[data-profile="boot-name"]').forEach((element) => { element.textContent = PROFILE.name.toUpperCase(); });
  $$('[data-profile="login-subtitle"]').forEach((element) => { element.textContent = `to ${PROFILE.name.split(" ")[0]}'s desktop`; });
  $$(".avatar-monogram").forEach((element) => { element.textContent = PROFILE.initials; });
  const userTile = $("#login-user");
  if (userTile) userTile.setAttribute("aria-label", `Log in as ${PROFILE.name}`);
  document.title = `${PROFILE.name} — Desktop Portfolio`;
  const author = $('meta[name="author"]');
  if (author) author.content = PROFILE.name;
}

function fillIcons(root = document) {
  $$('[data-icon]', root).forEach((holder) => {
    const name = holder.dataset.icon;
    const target = holder.querySelector(".icon-slot, .menu-icon") || holder;
    target.innerHTML = icon(name, "", holder.classList.contains("desktop-icon") ? 38 : 27);
  });
  // Add the two tiny utility icons that are only recognizable as compact glyphs.
  const allMarker = $(".all-programs-mark", root);
  if (allMarker) allMarker.innerHTML = icon("windows", "", 21);
}

function boot() {
  clearTimeout(bootTimer);
  bootScreen.hidden = false;
  loginScreen.hidden = true;
  desktop.hidden = true;
  shutdownScreen.hidden = true;
  bootTimer = setTimeout(showLogin, 1650);
}

function showLogin() {
  clearTimeout(bootTimer);
  bootScreen.hidden = true;
  desktop.hidden = true;
  shutdownScreen.hidden = true;
  loginScreen.hidden = false;
  $("#login-user")?.focus({ preventScroll: true });
}

function logIn() {
  clearTimeout(bootTimer);
  bootScreen.hidden = true;
  loginScreen.hidden = true;
  shutdownScreen.hidden = true;
  desktop.hidden = false;
  desktop.classList.remove("wallpaper-dusk");
  document.body.classList.add("desktop-ready", "crt-on");
  setCRT(true);
  playSystemSound("logon");
  window.setTimeout(() => {
    const tip = $("#welcome-tip");
    if (tip) tip.hidden = false;
  }, 500);
  updateClock();
}

function logOff() {
  closeMenus();
  [...getOpenWindowIds()].forEach(closeWindow);
  $("#welcome-tip").hidden = true;
  desktop.hidden = true;
  loginScreen.hidden = false;
  playSystemSound("click");
  $("#login-user")?.focus({ preventScroll: true });
}

function powerOff() {
  closeMenus();
  desktop.hidden = true;
  loginScreen.hidden = true;
  bootScreen.hidden = true;
  shutdownScreen.hidden = false;
}

function openPowerDialog() {
  closeMenus();
  powerDialog.hidden = false;
  $("button[data-action='cancel-power']", powerDialog)?.focus({ preventScroll: true });
}

function closeMenus() {
  startMenu.hidden = true;
  contextMenu.hidden = true;
  trayFlyout.hidden = true;
  clockFlyout.hidden = true;
  powerDialog.hidden = true;
  allProgramsPanel.hidden = true;
  categorySubmenu.hidden = true;
  $("#start-button")?.setAttribute("aria-expanded", "false");
  $("#tray-button")?.setAttribute("aria-expanded", "false");
  $("#clock-button")?.setAttribute("aria-expanded", "false");
  $("#all-programs-button")?.setAttribute("aria-expanded", "false");
  $$(".app-menupopup").forEach((menu) => menu.remove());
  $$("[data-app-menu]").forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function showToast(message, iconName = "help", timeout = 2800) {
  if (!toastHost) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${icon(iconName, "", 23)}<span>${escapeHTML(message)}</span>`;
  toastHost.append(toast);
  window.setTimeout(() => toast.remove(), timeout);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function showStartMenu() {
  const willOpen = startMenu.hidden;
  closeMenus();
  startMenu.hidden = !willOpen;
  $("#start-button").setAttribute("aria-expanded", String(willOpen));
  if (willOpen) $("#all-programs-button").focus({ preventScroll: true });
}

function showAllPrograms() {
  const willOpen = allProgramsPanel.hidden;
  allProgramsPanel.hidden = !willOpen;
  categorySubmenu.hidden = true;
  $("#all-programs-button").setAttribute("aria-expanded", String(willOpen));
}

function showCategory(category) {
  const ids = APP_GROUPS[category] || [];
  const label = { portfolio: "Portfolio", accessories: "Accessories", media: "Media", games: "Games" }[category] || "Programs";
  categorySubmenu.innerHTML = `<div class="all-programs-heading">${label}<span>›</span></div>${ids.map((id) => `<button type="button" data-app="${id}">${icon(APP_DEFS[id]?.icon || "default", "", 23)}<span>${escapeHTML(APP_NAMES[id] || id)}</span></button>`).join("")}`;
  categorySubmenu.hidden = false;
}

function openFromButton(button, event) {
  if (button.classList.contains("desktop-icon")) {
    if (Date.now() < ignoreClickUntil) return;
    $$(".desktop-icon").forEach((iconButton) => iconButton.classList.toggle("selected", iconButton === button));
    const now = Date.now();
    const doubleTap = previousDesktopTap?.button === button && now - previousDesktopTap.time < 420;
    const keyboardOpen = event.detail === 0;
    const nativeDouble = event.detail > 1;
    if (doubleTap || keyboardOpen || nativeDouble) {
      previousDesktopTap = null;
      openApp(button.dataset.app);
      playSystemSound("open");
    } else {
      previousDesktopTap = { button, time: now };
    }
    return;
  }
  closeMenus();
  openApp(button.dataset.app);
  playSystemSound("open");
}

function showContextMenu(x, y) {
  closeMenus();
  contextMenu.hidden = false;
  const width = 205;
  const height = contextMenu.offsetHeight || 190;
  contextMenu.style.left = `${Math.max(4, Math.min(x, window.innerWidth - width - 6))}px`;
  contextMenu.style.top = `${Math.max(4, Math.min(y, window.innerHeight - height - 6))}px`;
}

function addDesktopFolder() {
  const existing = $$(".desktop-icon-label", desktopIcons).map((item) => item.textContent);
  let index = 1;
  let label = "New Folder";
  while (existing.includes(label)) label = `New Folder ${++index}`;
  const iconButton = document.createElement("button");
  iconButton.type = "button";
  iconButton.className = "desktop-icon";
  iconButton.dataset.app = "computer";
  iconButton.dataset.icon = "folder";
  iconButton.style.setProperty("--icon-x", `${105 + ((index - 1) % 3) * 84}px`);
  iconButton.style.setProperty("--icon-y", `${18 + Math.floor((index - 1) / 3) * 92}px`);
  iconButton.innerHTML = `<span class="icon-slot"></span><span class="desktop-icon-label">${escapeHTML(label)}</span>`;
  desktopIcons.append(iconButton);
  fillIcons(iconButton);
  showToast(`${label} created on the desktop.`, "folder");
}

function arrangeDesktopIcons() {
  const icons = $$(".desktop-icon", desktopIcons);
  const spacingX = 84;
  const spacingY = 92;
  icons.forEach((button, index) => {
    const col = Math.floor(index / 6);
    const row = index % 6;
    button.style.setProperty("--icon-x", `${18 + col * spacingX}px`);
    button.style.setProperty("--icon-y", `${18 + row * spacingY}px`);
  });
  showToast("Desktop icons arranged.", "computer");
}

function syncCRT(value) {
  document.body.classList.toggle("crt-on", Boolean(value));
  const trayCheck = $("#crt-checkbox");
  const settingsCheck = $("#settings-crt-checkbox");
  if (trayCheck) trayCheck.checked = Boolean(value);
  if (settingsCheck) settingsCheck.checked = Boolean(value);
}

function setCRT(value) { syncCRT(value); }

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch {
    showToast("Full screen is unavailable in this browser preview. Try your browser’s F11 key.", "fullscreen");
  }
}

function updateClock() {
  const now = new Date();
  const time = $("#clock-time");
  if (time) time.textContent = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(now);
  const monthHeading = $("#calendar-month");
  const daysHost = $("#calendar-days");
  if (!daysHost || !monthHeading) return;
  monthHeading.textContent = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(now);
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const offset = first.getDay();
  const start = new Date(now.getFullYear(), now.getMonth(), 1 - offset);
  daysHost.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const className = ["calendar-day", date.getMonth() !== now.getMonth() ? "is-other-month" : "", date.toDateString() === now.toDateString() ? "is-today" : ""].filter(Boolean).join(" ");
    return `<span class="${className}">${date.getDate()}</span>`;
  }).join("");
}

function toggleDesktopView() { desktopIcons.classList.toggle("large-icons"); }

function toggleShowDesktop() {
  const openIds = getOpenWindowIds();
  if (!openIds.length) return;
  const visible = openIds.filter((id) => !$(".xp-window.is-minimized[data-app-id='" + id + "']"));
  if (visible.length) minimizeAllWindows();
  else {
    const mostRecent = openIds.at(-1);
    restoreWindow(mostRecent);
  }
}

function toggleAppMenu(button) {
  const window = windowForTarget(button);
  if (!window) return;
  const oldMenu = window.querySelector(".app-menupopup");
  if (oldMenu && oldMenu.dataset.menu === button.dataset.appMenu) {
    oldMenu.remove();
    button.setAttribute("aria-expanded", "false");
    return;
  }
  $$(".app-menupopup").forEach((menu) => menu.remove());
  $$("[data-app-menu]").forEach((menuButton) => menuButton.setAttribute("aria-expanded", "false"));
  const menuName = button.dataset.appMenu;
  const options = {
    file: [["New", "new"], ["Save", "save"], ["Print…", "print"], ["Close", "close"]],
    edit: [["Undo", "undo"], ["Copy", "copy"], ["Paste", "paste"], ["Select All", "select-all"]],
    view: [["Zoom In", "zoom-in"], ["Zoom Out", "zoom-out"], ["Full Screen", "fullscreen"]],
    help: [["Contents", "help"], ["About this program", "about"]]
  }[menuName] || [];
  const popup = document.createElement("div");
  popup.className = "app-menupopup";
  popup.dataset.menu = menuName;
  popup.setAttribute("role", "menu");
  popup.innerHTML = options.map(([label, action]) => `<button type="button" role="menuitem" data-action="app-menu-action" data-menu-item="${action}">${escapeHTML(label)}${action === "fullscreen" ? "<span>F11</span>" : ""}</button>`).join("");
  window.append(popup);
  button.setAttribute("aria-expanded", "true");
}

function executeAppMenuAction(action, target) {
  const win = windowForTarget(target);
  if (!win) return;
  const id = win.dataset.appId;
  if (action === "close") return closeWindow(id);
  if (action === "print") { window.print(); return; }
  if (action === "fullscreen") { toggleFullscreen(); return; }
  if (action === "help" || action === "about") { openApp("help"); return; }
  if (action === "new") {
    if (id === "notes") { const area = $("#notepad-text", win); if (area) area.value = ""; }
    else if (id === "minesweeper") $("[data-action='mine-new']", win)?.click();
    else showToast("This program is ready for a new item.", APP_DEFS[id]?.icon || "help");
    return;
  }
  if (action === "save") {
    if (id === "notes") saveNotepad(win);
    else if (id === "paint") savePaint(win);
    else if (id === "resume") window.print();
    else showToast("There is nothing new to save in this window.", APP_DEFS[id]?.icon || "help");
    return;
  }
  if (action === "select-all") {
    const editable = $("textarea, input:not([type=range]):not([type=color]), [contenteditable='true']", win);
    if (editable) { editable.focus(); editable.select?.(); }
    else showToast("Select a text field first.", "help");
    return;
  }
  if (action === "copy" || action === "paste") {
    const editable = $("textarea, input:not([type=range]):not([type=color]), [contenteditable='true']", win);
    if (editable) editable.focus();
    showToast(`${action === "copy" ? "Copy" : "Paste"} is available in the focused field through your keyboard shortcut.`, "help");
    return;
  }
  if (action === "undo") { showToast("Nothing to undo yet.", APP_DEFS[id]?.icon || "help"); return; }
  if (action === "zoom-in" || action === "zoom-out") {
    const body = $(".window-body", win);
    const current = Number(win.dataset.zoom || 100);
    const next = Math.max(80, Math.min(130, current + (action === "zoom-in" ? 10 : -10)));
    win.dataset.zoom = String(next);
    body.style.fontSize = `${next}%`;
    showToast(`Window text set to ${next}%.`, APP_DEFS[id]?.icon || "help");
  }
}

function saveNotepad(win) {
  const textarea = $("#notepad-text", win);
  if (!textarea) return;
  try {
    localStorage.setItem("portfolio-notepad", textarea.value);
    const status = $("#notepad-status", win);
    if (status) status.textContent = "Saved locally · browser storage";
    showToast("Your note was saved in this browser.", "notes");
  } catch {
    showToast("This browser does not allow local storage in the current preview.", "notes");
  }
}

function clearPaint(win) {
  const canvas = $("#paint-canvas", win);
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function savePaint(win) {
  const canvas = $("#paint-canvas", win);
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "portfolio-doodle.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("Your drawing was saved as a PNG.", "paint");
}

function calculate(key, win) {
  const display = $("#calc-display", win);
  const memory = $("#calc-memory", win);
  if (!display) return;
  const state = calcState;
  const operators = { "+": "+", "−": "−", "×": "×", "÷": "÷" };
  if (/^\d$/.test(key)) {
    state.current = state.replace || state.current === "0" ? key : state.current + key;
    state.replace = false;
  } else if (key === ".") {
    if (state.replace) { state.current = "0."; state.replace = false; }
    else if (!state.current.includes(".")) state.current += ".";
  } else if (key === "C") {
    state.current = "0"; state.stored = null; state.operation = null; state.replace = true;
  } else if (key === "±") {
    state.current = String(Number(state.current) * -1); state.replace = false;
  } else if (key === "MC") {
    state.memory = 0; if (memory) memory.textContent = "Memory cleared";
  } else if (key === "MR") {
    state.current = String(state.memory); state.replace = true;
  } else if (operators[key]) {
    if (state.stored !== null && state.operation && !state.replace) applyCalculation(state);
    state.stored = Number(state.current);
    state.operation = key;
    state.replace = true;
    if (memory) memory.textContent = `${state.stored} ${key}`;
  } else if (key === "=") {
    if (state.operation && state.stored !== null) {
      const left = state.stored;
      const right = Number(state.current);
      if (state.operation === "÷" && right === 0) state.current = "Error";
      else {
        const value = state.operation === "+" ? left + right : state.operation === "−" ? left - right : state.operation === "×" ? left * right : left / right;
        state.current = String(Number(value.toPrecision(10)));
      }
      state.stored = null; state.operation = null; state.replace = true;
      if (memory) memory.textContent = "Standard";
    }
  }
  display.textContent = state.current;
}

function applyCalculation(state) {
  const left = state.stored;
  const right = Number(state.current);
  if (state.operation === "+") state.current = String(left + right);
  if (state.operation === "−") state.current = String(left - right);
  if (state.operation === "×") state.current = String(left * right);
  if (state.operation === "÷") state.current = right === 0 ? "Error" : String(left / right);
  state.stored = Number(state.current);
}

function sendContact(event, form) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = String(data.get("subject") || "A note from the portfolio");
  const body = `Hi ${PROFILE.name.split(" ")[0]},\n\n${data.get("message")}\n\nFrom: ${data.get("name")} (${data.get("email")})`;
  const feedback = $(".contact-feedback", form);
  if (feedback) {
    feedback.className = "contact-feedback contact-success";
    feedback.textContent = `Opening your email app to send this to ${PROFILE.email}. If nothing opens, send the note directly to that address.`;
  }
  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function sendMessengerMessage(event, form) {
  event.preventDefault();
  const input = $("input[name='message']", form);
  const value = input?.value.trim();
  if (!value) return;
  const conversation = $("#messenger-conversation", form.closest(".xp-window"));
  appendBubble(conversation, value, true);
  input.value = "";
  const lower = value.toLowerCase();
  const response = lower.includes("project") ? "There are four short case studies in My Projects. Open Start → My Projects to see them." : lower.includes("available") || lower.includes("hire") ? "Availability is listed in About Me. For a real conversation, use the Contact Me form." : lower.includes("hello") || lower.includes("hi") ? `Hi! Nice to meet you. I’m the tiny desktop helper for ${PROFILE.name}.` : "Thanks for the note! This is a local demo chat, so nothing is sent to a server.";
  window.setTimeout(() => appendBubble(conversation, response, false), 420);
}

function appendBubble(host, text, fromYou) {
  if (!host) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble${fromYou ? " from-you" : ""}`;
  bubble.textContent = text;
  host.append(bubble);
  host.scrollTop = host.scrollHeight;
}

function runTerminal(event, form) {
  event.preventDefault();
  const input = $("#terminal-input", form);
  const output = $("#terminal-output", form.closest(".xp-window"));
  const command = input?.value.trim();
  if (!command || !output) return;
  input.value = "";
  const echo = document.createElement("div");
  echo.textContent = `C:\\PORTFOLIO> ${command}`;
  output.append(echo);
  const response = document.createElement("div");
  const lower = command.toLowerCase();
  if (lower === "clear") output.innerHTML = "";
  else if (lower === "help") response.textContent = "Commands: help · about · projects · contact · whoami · date · dir · clear";
  else if (lower === "about" || lower === "whoami") response.textContent = `${PROFILE.name} — ${PROFILE.role}. This is a static portfolio demo.`;
  else if (lower === "projects" || lower === "dir") response.textContent = "FIELDNOTES.SVG  GOODDAY.SVG  COMMON-TABLE.SVG  ORBIT-KIT.SVG";
  else if (lower === "contact") response.textContent = `Contact: ${PROFILE.email}`;
  else if (lower === "date") response.textContent = new Date().toString();
  else if (lower.startsWith("open ")) {
    const request = lower.slice(5).trim();
    const id = Object.keys(APP_NAMES).find((appId) => appId === request || APP_NAMES[appId].toLowerCase() === request);
    if (id) { openApp(id); response.textContent = `Opening ${APP_NAMES[id]}…`; }
    else response.textContent = `Unknown program: ${request}`;
  } else response.textContent = `‘${command}’ is not a recognized command. Type help.`;
  if (lower !== "clear") output.append(response);
  output.append(document.createElement("br"));
  output.scrollTop = output.scrollHeight;
}

function updateImageViewer(win, nextIndex) {
  if (!win || !PROJECTS.length) return;
  const index = (nextIndex + PROJECTS.length) % PROJECTS.length;
  win.dataset.viewerIndex = String(index);
  const project = PROJECTS[index];
  const image = $("#viewer-image", win);
  const caption = $("#viewer-caption", win);
  if (image) { image.src = project.image; image.alt = project.alt; }
  if (caption) caption.textContent = `${project.title} · ${index + 1} of ${PROJECTS.length}`;
}

function clickHandler(event) {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  if (!target) return;
  if (Date.now() < ignoreClickUntil && target.closest("#desktop") && !target.closest("#context-menu, #start-menu, .taskbar, .xp-window")) return;

  if (target.closest("#start-button")) { showStartMenu(); return; }
  if (target.closest("#all-programs-button")) { showAllPrograms(); return; }
  const category = target.closest(".program-category");
  if (category) { showCategory(category.dataset.category); return; }
  const appMenuButton = target.closest("[data-app-menu]");
  if (appMenuButton) { toggleAppMenu(appMenuButton); return; }
  const taskButton = target.closest("[data-window-focus]");
  if (taskButton) {
    const id = taskButton.dataset.windowFocus;
    if (taskButton.classList.contains("is-active")) minimizeWindow(id);
    else restoreWindow(id);
    closeMenus();
    return;
  }
  const appButton = target.closest("[data-app]");
  if (appButton) { openFromButton(appButton, event); return; }
  const windowControl = target.closest("[data-window-action]");
  if (windowControl) {
    const win = windowForTarget(windowControl);
    if (!win) return;
    const id = win.dataset.appId;
    const action = windowControl.dataset.windowAction;
    if (action === "close") closeWindow(id);
    if (action === "minimize") minimizeWindow(id);
    if (action === "maximize") toggleMaximize(id);
    return;
  }
  const menuAction = target.closest("[data-action='app-menu-action']");
  if (menuAction) {
    const action = menuAction.dataset.menuItem;
    const win = windowForTarget(menuAction);
    $$(".app-menupopup").forEach((menu) => menu.remove());
    executeAppMenuAction(action, win || menuAction);
    return;
  }
  const actionButton = target.closest("[data-action]");
  if (actionButton) { runAction(actionButton.dataset.action, actionButton, event); return; }

  if (target.closest("#tray-button")) {
    const willOpen = trayFlyout.hidden;
    closeMenus();
    trayFlyout.hidden = !willOpen;
    $("#tray-button").setAttribute("aria-expanded", String(willOpen));
    return;
  }
  if (target.closest("#clock-button")) {
    const willOpen = clockFlyout.hidden;
    closeMenus();
    clockFlyout.hidden = !willOpen;
    $("#clock-button").setAttribute("aria-expanded", String(willOpen));
    updateClock();
    return;
  }
  if (target.closest("#show-desktop-button")) { toggleShowDesktop(); return; }
  if (target.closest(".tip-close")) { $("#welcome-tip").hidden = true; return; }

  const projectCard = target.closest("[data-project]");
  if (projectCard) {
    const win = windowForTarget(projectCard);
    if (win) {
      win.querySelector(".window-body").innerHTML = renderProjectDetail(projectCard.dataset.project);
      win.querySelector(".window-status span").textContent = "Project case study · Selected work";
    }
    return;
  }
  if (target.closest(".project-detail-back")) {
    const win = windowForTarget(target);
    if (win) {
      import("./apps.js").then(({ renderApp }) => {
        win.querySelector(".window-body").innerHTML = renderApp("projects");
        win.querySelector(".window-status span").textContent = APP_DEFS.projects.status;
      });
    }
    return;
  }
  if (target.closest("#welcome-tip")) return;
  if (!target.closest("#start-menu, #context-menu, #tray-flyout, #clock-flyout, #power-dialog, .xp-window, .taskbar")) closeMenus();
}

function runAction(action, button, event) {
  const win = windowForTarget(button);
  const appId = win?.dataset.appId;
  switch (action) {
    case "fullscreen": toggleFullscreen(); break;
    case "logoff": logOff(); break;
    case "shutdown": if (desktop.hidden) powerOff(); else openPowerDialog(); break;
    case "shutdown-now": powerOff(); break;
    case "cancel-power": powerDialog.hidden = true; break;
    case "restart": closeMenus(); [...getOpenWindowIds()].forEach(closeWindow); boot(); break;
    case "settings": closeMenus(); openApp("settings"); break;
    case "desktop-view": toggleDesktopView(); closeMenus(); break;
    case "arrange-icons": arrangeDesktopIcons(); closeMenus(); break;
    case "refresh":
      desktop.classList.add("desktop-refreshing");
      window.setTimeout(() => desktop.classList.remove("desktop-refreshing"), 360);
      showToast("Desktop refreshed.", "computer");
      closeMenus();
      break;
    case "new-folder": addDesktopFolder(); closeMenus(); break;
    case "print-resume": window.print(); break;
    case "notepad-save": saveNotepad(win); break;
    case "notepad-clear":
      if (win) { $("#notepad-text", win).value = ""; $("#notepad-status", win).textContent = "Cleared · Unsaved"; }
      break;
    case "paint-clear": clearPaint(win); break;
    case "paint-save": savePaint(win); break;
    case "media-play": {
      const stage = $("#media-stage", win);
      const buttonEl = $("#media-play-button", win);
      const playing = stage?.classList.toggle("is-playing");
      if (buttonEl) { buttonEl.textContent = playing ? "Ⅱ" : "▶"; buttonEl.setAttribute("aria-label", playing ? "Pause" : "Play"); }
      break;
    }
    case "browser-refresh":
      if (win) { win.querySelector(".window-body")?.classList.remove("refresh-flash"); void win.offsetWidth; win.querySelector(".window-body")?.classList.add("refresh-flash"); }
      showToast("This page is up to date.", "browser");
      break;
    case "app-back":
    case "app-up":
      if (win?.querySelector(".project-detail")) {
        import("./apps.js").then(({ renderApp }) => { win.querySelector(".window-body").innerHTML = renderApp("projects"); });
      } else showToast("You’re already at the top level of this program.", APP_DEFS[appId]?.icon || "help");
      break;
    case "app-forward": showToast("There is no next page in this window yet.", APP_DEFS[appId]?.icon || "help"); break;
    case "app-search": openApp("help"); break;
    case "app-home": openApp("browser"); break;
    case "project-back":
      if (win) import("./apps.js").then(({ renderApp }) => { win.querySelector(".window-body").innerHTML = renderApp("projects"); });
      break;
    case "app-menu-action": executeAppMenuAction(button.dataset.menuItem, button); break;
    case "wallpaper-day": desktop.classList.remove("wallpaper-dusk"); showToast("Bright meadow wallpaper selected.", "settings"); break;
    case "wallpaper-dusk": desktop.classList.add("wallpaper-dusk"); showToast("Blue hour wallpaper selected.", "settings"); break;
    case "restore-shortcuts": closeWindow("recycle"); arrangeDesktopIcons(); showToast("Shortcuts are back on your desktop.", "recycle"); break;
    case "help-search": {
      const query = $("#help-search", win)?.value.trim().toLowerCase() || "";
      const match = Object.entries(APP_NAMES).find(([id, label]) => id.includes(query) || label.toLowerCase().includes(query));
      if (match) openApp(match[0]); else showToast("No program matched that search. Try “projects” or “contact”.", "help");
      break;
    }
    case "pinball-launch": {
      pinballRounds += 1;
      const table = $("#pinball-table", win);
      table?.classList.add("is-moving");
      const copy = $(".pinball-copy", win);
      if (copy) copy.textContent = `Nice shot · practice round ${pinballRounds}`;
      window.setTimeout(() => table?.classList.remove("is-moving"), 800);
      playSystemSound("open");
      break;
    }
    case "pixel-a":
    case "pixel-b": {
      const device = $("#handheld-device", win);
      device?.animate([{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], { duration: 130 });
      playSystemSound("click");
      break;
    }
    case "image-next": updateImageViewer(win, Number(win?.dataset.viewerIndex || 0) + 1); break;
    case "image-previous": updateImageViewer(win, Number(win?.dataset.viewerIndex || 0) - 1); break;
    default: break;
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === "contact-form") sendContact(event, form);
  if (form.id === "messenger-form") sendMessengerMessage(event, form);
  if (form.id === "terminal-form") runTerminal(event, form);
}

function handleClickAction(event) {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  if (!target) return;
  if (target.closest("#skip-boot")) showLogin();
  if (target.closest("#login-user")) logIn();
  if (target.closest("#power-on-button")) boot();
  const calcKey = target.closest("[data-calc]");
  if (calcKey) {
    const win = windowForTarget(calcKey);
    calculate(calcKey.dataset.calc, win);
    return;
  }
}

function handleChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.id === "crt-checkbox" || target.id === "settings-crt-checkbox") setCRT(target.checked);
  if (target.id === "volume-range") {
    volume = Number(target.value);
    setMasterVolume(volume);
    const speaker = $("#tray-button");
    if (speaker) speaker.setAttribute("aria-label", volume === 0 ? "System tray controls, sound muted" : "System tray controls, sound on");
    if (volume > 0) playSystemSound("click");
  }
}

function handleWindowLayerContext(event) {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  if (!target || !desktop.contains(target) || target.closest(".xp-window, .taskbar, .start-menu, .tray-flyout, .clock-flyout")) return;
  event.preventDefault();
  showContextMenu(event.clientX, event.clientY);
}

function startDesktopDrag(event) {
  if (event.button !== 0 && event.pointerType === "mouse") return;
  const item = event.target.closest(".desktop-icon");
  if (item) {
    desktopDrag = { item, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: parseFloat(getComputedStyle(item).left) || 0, originY: parseFloat(getComputedStyle(item).top) || 0, moved: false, longPressed: false, longPressTimer: null };
    const drag = desktopDrag;
    if (event.pointerType === "touch") {
      drag.longPressTimer = window.setTimeout(() => {
        if (desktopDrag !== drag || drag.moved) return;
        drag.longPressed = true;
        ignoreClickUntil = Date.now() + 500;
        showContextMenu(event.clientX, event.clientY);
      }, 560);
    }
    item.setPointerCapture?.(event.pointerId);
    return;
  }
  if (event.pointerType === "touch" && !event.target.closest(".taskbar, .start-menu, .xp-window, button")) {
    backgroundLongPress = window.setTimeout(() => {
      ignoreClickUntil = Date.now() + 500;
      showContextMenu(event.clientX, event.clientY);
    }, 560);
  }
}

function moveDesktopDrag(event) {
  if (backgroundLongPress && Math.abs(event.movementX || 0) + Math.abs(event.movementY || 0) > 8) {
    clearTimeout(backgroundLongPress);
    backgroundLongPress = null;
  }
  if (!desktopDrag || event.pointerId !== desktopDrag.pointerId) return;
  const { item, startX, startY, originX, originY } = desktopDrag;
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  if (Math.abs(dx) + Math.abs(dy) > 7) {
    desktopDrag.moved = true;
    if (desktopDrag.longPressTimer) { clearTimeout(desktopDrag.longPressTimer); desktopDrag.longPressTimer = null; }
  }
  if (desktopDrag.moved) {
    const boundX = Math.max(0, desktopIcons.clientWidth - 76);
    const boundY = Math.max(0, desktopIcons.clientHeight - 82);
    item.style.setProperty("--icon-x", `${Math.min(boundX, Math.max(0, originX + dx))}px`);
    item.style.setProperty("--icon-y", `${Math.min(boundY, Math.max(0, originY + dy))}px`);
  }
}

function endDesktopDrag(event) {
  if (backgroundLongPress) { clearTimeout(backgroundLongPress); backgroundLongPress = null; }
  if (!desktopDrag || event.pointerId !== desktopDrag.pointerId) return;
  if (desktopDrag.longPressTimer) clearTimeout(desktopDrag.longPressTimer);
  if (desktopDrag.longPressed) { desktopDrag = null; return; }
  if (desktopDrag.moved) {
    ignoreClickUntil = Date.now() + 220;
    desktopDrag.item.classList.add("selected");
  }
  desktopDrag = null;
}

function initializeMenus() {
  const allProgramsButton = $("#all-programs-button");
  allProgramsButton?.setAttribute("aria-expanded", "false");
  const crtCheckbox = $("#crt-checkbox");
  if (crtCheckbox) crtCheckbox.checked = true;
  const settingsCheckbox = $("#settings-crt-checkbox");
  if (settingsCheckbox) settingsCheckbox.checked = true;
  const range = $("#volume-range");
  if (range) { range.value = String(volume); setMasterVolume(volume); }
}

function init() {
  hydrateIdentity();
  fillIcons();
  initializeMenus();
  setWindowToast(showToast);
  boot();
  window.setInterval(updateClock, 15000);

  document.addEventListener("click", handleClickAction, true);
  document.addEventListener("click", clickHandler);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("change", handleChange);
  document.addEventListener("contextmenu", handleWindowLayerContext);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
    if (event.key === "F11") { event.preventDefault(); toggleFullscreen(); }
    if (event.altKey && event.key === "F4") {
      const active = getActiveWindow();
      if (active) { event.preventDefault(); closeWindow(active.dataset.appId); }
    }
  });

  windowLayer.addEventListener("pointerdown", handleWindowLayerPointerDown);
  windowLayer.addEventListener("dblclick", (event) => {
    const title = event.target.closest(".title-bar");
    const win = title?.closest(".xp-window");
    if (win && !event.target.closest("button")) toggleMaximize(win.dataset.appId);
  });
  document.addEventListener("pointermove", handleWindowLayerPointerMove);
  document.addEventListener("pointerup", handleWindowLayerPointerUp);
  document.addEventListener("pointercancel", handleWindowLayerPointerUp);
  desktop.addEventListener("pointerdown", startDesktopDrag);
  document.addEventListener("pointermove", moveDesktopDrag);
  document.addEventListener("pointerup", endDesktopDrag);
  document.addEventListener("pointercancel", endDesktopDrag);

  $("#start-button").addEventListener("keydown", (event) => { if (event.key === "ArrowUp") { event.preventDefault(); showStartMenu(); } });
  desktop.addEventListener("click", (event) => {
    if (event.target === desktop || event.target.classList.contains("desktop-wallpaper") || event.target.classList.contains("desktop-sheen")) {
      $$(".desktop-icon").forEach((item) => item.classList.remove("selected"));
    }
  });
}

init();
