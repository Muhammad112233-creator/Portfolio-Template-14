import { PROFILE, PROJECTS, APP_DEFS } from "./config.js";
import { icon } from "./icons.js";
import { startMineGame } from "./games.js";

const $ = (root, selector) => root.querySelector(selector);
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const emailLink = `mailto:${PROFILE.email}`;

export function appMeta(id) {
  return APP_DEFS[id] || APP_DEFS.about;
}

export function renderProjectDetail(projectId) {
  const project = PROJECTS.find((item) => item.id === projectId);
  if (!project) return `<div class="app-scroll"><h1 class="app-heading">Project not found</h1><button class="xp-button" data-action="project-back">Back to projects</button></div>`;
  return `
    <div class="project-detail">
      <button class="project-detail-back" type="button" data-action="project-back"><span aria-hidden="true">‹</span> All projects</button>
      <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt)}">
      <h2>${escapeHTML(project.title)}</h2>
      <p class="project-category">${escapeHTML(project.category)}</p>
      <p>${escapeHTML(project.description)}</p>
      <div class="project-detail-note">Role: art direction, visual design, and prototype · ${escapeHTML(project.year)}</div>
    </div>`;
}

export function renderApp(id) {
  switch (id) {
    case "about": return renderAbout();
    case "projects": return renderProjects();
    case "resume": return renderResume();
    case "contact": return renderContact();
    case "browser": return renderBrowser();
    case "computer": return renderComputer();
    case "notes": return renderNotepad();
    case "paint": return renderPaint();
    case "calculator": return renderCalculator();
    case "console": return renderConsole();
    case "settings": return renderSettings();
    case "help": return renderHelp();
    case "media": return renderMedia();
    case "messenger": return renderMessenger();
    case "image-viewer": return renderImageViewer();
    case "handheld": return renderHandheld();
    case "minesweeper": return renderMinesweeper();
    case "pinball": return renderPinball();
    case "recycle": return renderRecycle();
    default: return renderAbout();
  }
}

function renderAbout() {
  const paragraphs = PROFILE.about.map((text) => `<p>${escapeHTML(text)}</p>`).join("");
  const specialties = PROFILE.specialties.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  const skills = PROFILE.skills.map((item) => `<span>${escapeHTML(item)}</span>`).join("");
  const socials = PROFILE.socials.map((item) => `<a class="social-button" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">${icon(item.icon, "", 16)}${escapeHTML(item.label)}</a>`).join("");
  return `
    <div class="app-scroll">
      <div class="app-hero">
        <div class="app-hero-copy">
          <p class="app-kicker">A little introduction</p>
          <h1 class="app-heading">Hello, I’m ${escapeHTML(PROFILE.name.split(" ")[0])}.</h1>
          <p class="app-lede">${escapeHTML(PROFILE.role)}<br>${escapeHTML(PROFILE.location)}</p>
          <span class="availability-pill">${escapeHTML(PROFILE.availability)}</span>
        </div>
        <div class="profile-card">
          <span class="profile-portrait"><img class="profile-avatar" src="src/assets/avatar.svg" alt=""></span>
          <strong>${escapeHTML(PROFILE.name)}</strong>
          <small>Designer · Maker · Curious person</small>
        </div>
      </div>
      <div class="about-lower">
        <div class="about-paragraphs">
          <h2 class="about-section-title">The short version</h2>
          ${paragraphs}
          <div class="about-actions"><button class="xp-button" type="button" data-app="projects">See selected work</button><button class="xp-button" type="button" data-app="contact">Say hello</button></div>
        </div>
        <div>
          <h2 class="about-section-title">Things I care about</h2>
          <ul class="specialty-list">${specialties}</ul>
          <h2 class="about-section-title" style="margin-top:15px">In the toolbox</h2>
          <div class="skill-chips">${skills}</div>
          <div class="social-row">${socials}</div>
        </div>
      </div>
    </div>`;
}

function renderProjects() {
  const cards = PROJECTS.map((project) => `
    <button class="project-card" type="button" data-project="${escapeHTML(project.id)}" aria-label="Open ${escapeHTML(project.title)} case study">
      <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt)}">
      <span class="project-card-copy"><strong>${escapeHTML(project.title)}</strong><small>${escapeHTML(project.category)}</small><span>${escapeHTML(project.description.slice(0, 100))}…</span></span>
    </button>`).join("");
  return `
    <div class="projects-app">
      <div class="projects-intro"><div><p class="app-kicker">Selected work · 2023—2025</p><h1 class="app-heading">A few things I’ve made.</h1></div><p>Independent projects and collaborations, made with curious people and a useful amount of coffee.</p></div>
      <div class="projects-toolbar"><span>▣ &nbsp;Project folder</span><span>${PROJECTS.length} items</span></div>
      <div class="project-grid">${cards}</div>
    </div>`;
}

function renderResume() {
  const experience = PROFILE.experience.map((job) => `
    <article class="resume-entry"><strong>${escapeHTML(job.role)}</strong><div class="resume-meta">${escapeHTML(job.place)} &nbsp;·&nbsp; ${escapeHTML(job.date)}</div><p>${escapeHTML(job.text)}</p></article>`).join("");
  const skillLevels = [92, 84, 79, 71, 87, 70].map((value, index) => `<div class="resume-skill"><span>${escapeHTML(PROFILE.skills[index] || "Creative practice")}</span><span class="resume-meter"><span style="width:${value}%"></span></span></div>`).join("");
  return `
    <div class="resume-app">
      <header class="resume-top"><div><p class="app-kicker" style="color:#c6daf1">Curriculum vitae</p><h1 class="app-heading">${escapeHTML(PROFILE.name)}</h1><p>${escapeHTML(PROFILE.role)}</p></div><button class="xp-button" type="button" data-action="print-resume">Print / Save PDF</button></header>
      <div class="resume-body">
        <div class="resume-contact-row"><span>✉ &nbsp;${escapeHTML(PROFILE.email)}</span><span>⌖ &nbsp;${escapeHTML(PROFILE.location)}</span><span>◉ &nbsp;${escapeHTML(PROFILE.website.replace(/^https?:\/\//, ""))}</span></div>
        <div class="resume-grid">
          <div><section class="resume-section"><h2>Experience</h2>${experience}</section><section class="resume-section"><h2>Education</h2><article class="resume-entry"><strong>${escapeHTML(PROFILE.education.split(" · ")[0])}</strong><div class="resume-meta">${escapeHTML(PROFILE.education.split(" · ")[1] || "Design studies")}</div><p>Built a thoughtful foundation in visual communication, typography, and making ideas clear.</p></article></section></div>
          <aside><section class="resume-section"><h2>Selected capabilities</h2><div class="resume-skills">${skillLevels}</div></section><section class="resume-section"><h2>Working style</h2><p class="app-note">Collaborative, curious, detail-aware, and comfortable moving from the big picture to the one-pixel nudge.</p></section><section class="resume-section"><h2>Availability</h2><p class="app-note">${escapeHTML(PROFILE.availability)}. For a short introduction, use the Contact Me program.</p><button class="xp-button" type="button" data-app="contact">Get in touch</button></section></aside>
        </div>
      </div>
    </div>`;
}

function renderContact() {
  return `
    <div class="contact-app">
      <div class="contact-intro"><div><p class="app-kicker">Have a good one in mind?</p><h1 class="app-heading">Let’s make something useful.</h1></div><p>Tell me a little about what you’re working on. I’ll get back to you as soon as I can.</p></div>
      <form id="contact-form">
        <div class="contact-fields">
          <label>Your name<input name="name" autocomplete="name" required placeholder="Jane Smith"></label>
          <label>Your email<input type="email" name="email" autocomplete="email" required placeholder="jane@example.com"></label>
          <label>Subject<input name="subject" required placeholder="A small idea, a big question…"></label>
          <label>Message<textarea name="message" required placeholder="A few details are plenty."></textarea></label>
        </div>
        <div class="contact-actions"><p>Opens your email app with the message filled in.</p><button class="xp-button" type="submit">Send message</button></div>
        <div class="contact-feedback" aria-live="polite"></div>
      </form>
      <p class="app-note" style="margin-top:14px">Prefer email? <a class="app-link" href="${emailLink}">${escapeHTML(PROFILE.email)}</a></p>
    </div>`;
}

function renderBrowser() {
  const first = PROFILE.name.split(" ")[0];
  return `
    <div class="browser-app">
      <div class="browser-location"><span>Address</span><span class="browser-address">https://${escapeHTML(PROFILE.website.replace(/^https?:\/\//, ""))}/</span><button type="button" class="xp-control-button" data-action="browser-refresh">Go</button></div>
      <div class="browser-hero"><div class="browser-hero-copy"><p class="app-kicker">The portfolio of ${escapeHTML(PROFILE.name)}</p><h1 class="app-heading">Good ideas, made tangible.</h1><p>Independent design for brands, products, and the in-between. Browse a few selected projects or open the Start menu to explore.</p><button type="button" class="xp-button" data-app="projects">Browse projects</button></div><div class="browser-hero-mark">${icon("globe", "", 80)}</div></div>
      <div class="browser-shortcuts">
        <button class="browser-shortcut" type="button" data-app="about">${icon("about")}<span>About ${escapeHTML(first)}<small>Meet the designer</small></span></button>
        <button class="browser-shortcut" type="button" data-app="projects">${icon("projects")}<span>Selected work<small>Four recent projects</small></span></button>
        <button class="browser-shortcut" type="button" data-app="resume">${icon("resume")}<span>Resume<small>Experience and skills</small></span></button>
        <button class="browser-shortcut" type="button" data-app="contact">${icon("contact")}<span>Contact<small>Start a conversation</small></span></button>
        <button class="browser-shortcut" type="button" data-app="media">${icon("media")}<span>Listening room<small>Take a tiny break</small></span></button>
        <button class="browser-shortcut" type="button" data-app="image-viewer">${icon("image")}<span>Artwork viewer<small>Look a little closer</small></span></button>
      </div>
    </div>`;
}

function renderComputer() {
  const shortcuts = [
    ["projects", "My Projects"], ["resume", "My Resume"], ["about", "About Me"], ["contact", "Contact Me"], ["browser", "Internet Explorer"], ["media", "Windows Media Player"], ["notes", "Notepad"], ["paint", "Paint"], ["minesweeper", "Minesweeper"]
  ];
  return `
    <div class="computer-app">
      <header class="computer-header"><strong>My Computer</strong><small>One small desktop, a few useful places to look.</small></header>
      <h2 class="computer-group-title">Files stored on this computer</h2>
      <div class="computer-items">${shortcuts.slice(0, 4).map(([id, label]) => `<button class="computer-item" type="button" data-app="${id}">${icon(id === "contact" ? "contact" : id === "resume" ? "resume" : id === "about" ? "about" : "projects", "", 27)}${label}</button>`).join("")}</div>
      <h2 class="computer-group-title">Other places</h2>
      <div class="computer-items">${shortcuts.slice(4).map(([id, label]) => `<button class="computer-item" type="button" data-app="${id}">${icon(id === "browser" ? "browser" : id === "media" ? "media" : id === "notes" ? "notes" : id, "", 27)}${label}</button>`).join("")}</div>
    </div>`;
}

function renderNotepad() {
  return `
    <div class="notepad-app"><textarea id="notepad-text" spellcheck="false" aria-label="Notepad text">A note to self:

Make good things with good people.

This scratchpad saves locally only when you press Save.

— ${escapeHTML(PROFILE.name.split(" ")[0])}</textarea><div class="notepad-footer"><span id="notepad-status">Ln 1, Col 1</span><div><button class="xp-button" type="button" data-action="notepad-save">Save</button><button class="xp-button" type="button" data-action="notepad-clear">Clear</button></div></div></div>`;
}

function renderPaint() {
  return `
    <div class="paint-app">
      <div class="paint-toolbar"><label>Colour <input id="paint-color" type="color" value="#245edb" aria-label="Brush color"></label><label>Brush <input id="paint-size" type="range" min="1" max="28" value="6" aria-label="Brush size"></label><button class="xp-button" type="button" data-action="paint-clear">Clear canvas</button><button class="xp-button" type="button" data-action="paint-save">Save PNG</button></div>
      <div class="paint-canvas-wrap"><canvas id="paint-canvas" width="640" height="480" aria-label="Drawing canvas"></canvas></div>
    </div>`;
}

function renderCalculator() {
  const keys = ["MC", "MR", "C", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "±", "0", ".", "="];
  return `<div class="calculator-app"><output class="calculator-display" id="calc-display" aria-live="polite">0</output><div class="calculator-memory" id="calc-memory">Standard</div><div class="calculator-keys">${keys.map((key) => `<button class="calculator-key ${key === "=" ? "is-equal" : ""}" type="button" data-calc="${escapeHTML(key)}">${escapeHTML(key)}</button>`).join("")}</div></div>`;
}

function renderConsole() {
  return `<div class="terminal-app"><div class="terminal-output" id="terminal-output" aria-live="polite">Portfolio Desktop [Version 1.0]\n(c) Alex Morgan. A tiny pretend prompt for curious people.\n\nType <strong>help</strong> to see what this shell understands.\n\n</div><form class="terminal-line" id="terminal-form"><label for="terminal-input">C:\\PORTFOLIO&gt;</label><input id="terminal-input" name="command" autocomplete="off" spellcheck="false" aria-label="Command"></form></div>`;
}

function renderSettings() {
  return `<div class="settings-app"><div class="settings-tabs"><span class="is-current">Desktop</span><span>Appearance</span><span>Screen saver</span></div><div class="settings-content"><h2>Choose your desktop view</h2><p>The wallpaper is an original illustration created for this template. Use the shortcut below to switch between a bright desktop and a quieter dusk view.</p><div class="wallpaper-options"><button class="wallpaper-choice" type="button" data-action="wallpaper-day"><img src="src/assets/wallpaper.jpg" alt="Green hillside wallpaper"><span>Bright meadow</span></button><button class="wallpaper-choice" type="button" data-action="wallpaper-dusk"><span class="dusk-preview"></span><span>Blue hour</span></button></div><label class="tray-setting"><span>Enable screen glow effect</span><input id="settings-crt-checkbox" type="checkbox" checked></label><p class="app-note">The Start menu's tray flyout also includes the screen effect and full-screen controls.</p><button class="xp-button" type="button" data-action="fullscreen">Enter full screen</button></div></div>`;
}

function renderHelp() {
  return `<div class="help-app"><p class="app-kicker">Help and Support</p><h1 class="app-heading">A quick guide to this desktop</h1><div class="help-search"><input id="help-search" type="search" placeholder="Search for a program or tip" aria-label="Search help"><button class="xp-button" type="button" data-action="help-search">Search</button></div><div class="help-card"><strong>Open something</strong><p>Double-click a desktop icon, click a pinned Start item, or choose All Programs for the full list.</p></div><div class="help-card"><strong>Move and resize windows</strong><p>Drag a title bar to move a window. Use the corner grip to resize it, or double-click the title bar to maximize and restore.</p></div><div class="help-card"><strong>Make the site yours</strong><p>Edit <code>src/scripts/config.js</code> to change the sample identity, social links, skills, and project descriptions. Replace the images in <code>src/assets</code> with your own.</p></div><div class="help-card"><strong>Publish</strong><p>This is a static HTML/CSS/JavaScript project. Upload the root folder to GitHub and turn on GitHub Pages from the repository settings.</p></div></div>`;
}

function renderMedia() {
  return `<div class="media-app"><div class="media-stage" id="media-stage"><div class="media-stage-content"><div class="media-disc" aria-hidden="true"></div><div><div class="media-track-name" id="media-track-name">Small Hours</div><div class="media-track-artist" id="media-track-artist">A quiet instrumental demo</div></div></div></div><div class="media-queue"><button type="button" data-track="0" class="is-current"><span>Small Hours</span><span>02:41</span></button><button type="button" data-track="1"><span>Paper Planes</span><span>03:12</span></button><button type="button" data-track="2"><span>Blue Window</span><span>02:58</span></button></div><div class="media-controls"><button type="button" data-action="media-prev" aria-label="Previous track">◀|</button><button id="media-play-button" type="button" data-action="media-play" aria-label="Play">▶</button><button type="button" data-action="media-next" aria-label="Next track">|▶</button><div class="media-progress"><span id="media-progress-fill"></span></div><div class="media-now-playing"><small>Now playing</small><strong id="media-now-playing">Small Hours</strong></div></div></div>`;
}

function renderMessenger() {
  return `<div class="messenger-app"><header class="messenger-profile"><span class="messenger-avatar">AM</span><span><strong>${escapeHTML(PROFILE.name)}</strong><small>Available · probably making something</small></span></header><div class="messenger-conversation" id="messenger-conversation"><span class="chat-time">Today</span><div class="chat-bubble">Hey there! This little messenger window is part of the portfolio. What would you like to know?</div><div class="chat-bubble">Try asking about projects, process, or availability.</div></div><form class="messenger-composer" id="messenger-form"><input name="message" placeholder="Type a message" autocomplete="off" aria-label="Message"><button class="xp-button" type="submit">Send</button></form></div>`;
}

function renderImageViewer() {
  return `<div class="image-viewer-app"><div class="image-viewer-image"><img id="viewer-image" src="${escapeHTML(PROJECTS[0].image)}" alt="${escapeHTML(PROJECTS[0].alt)}"></div><div class="image-viewer-controls"><button class="xp-button" type="button" data-action="image-previous">‹ Previous</button><span id="viewer-caption">${escapeHTML(PROJECTS[0].title)} · 1 of ${PROJECTS.length}</span><button class="xp-button" type="button" data-action="image-next">Next ›</button></div></div>`;
}

function renderHandheld() {
  return `<div class="handheld-app"><div><div class="handheld-device" id="handheld-device"><div class="handheld-brand">POCKET CONSOLE · COLOR</div><div class="handheld-screen"><div class="pixel-scene"><span class="pixel-sun"></span><span class="pixel-mountain"></span><span class="pixel-character"></span></div></div><div class="handheld-controls"><div class="dpad" aria-hidden="true"></div><div class="handheld-buttons"><button type="button" class="handheld-button" data-action="pixel-a">A</button><button type="button" class="handheld-button" data-action="pixel-b">B</button></div></div></div><label class="handheld-toggle"><input id="handheld-big" type="checkbox"> Big view</label></div></div>`;
}

function renderMinesweeper() {
  return `<div class="minesweeper-app"><div class="mine-scorebar"><span class="mine-counter" id="mine-count">010</span><button class="mine-face" type="button" data-action="mine-new" aria-label="New game">🙂</button><span class="mine-counter" id="mine-clock">000</span></div><div class="mine-grid" id="mine-grid" role="grid" aria-label="Minesweeper board"></div><p class="mine-help">Click to reveal. Right-click (or long-press) to flag a suspected mine. Numbers show nearby mines.</p></div>`;
}

function renderPinball() {
  return `<div class="pinball-app"><div class="pinball-table" id="pinball-table" aria-label="Mini pinball table"><div class="pinball-lane"></div><span class="pinball-bumper one"></span><span class="pinball-bumper two"></span><span class="pinball-bumper three"></span><span class="pinball-ball"></span><span class="pinball-flipper left"></span><span class="pinball-flipper right"></span></div><div class="pinball-copy">Use the button to launch a tiny practice round.</div><button class="xp-button" type="button" data-action="pinball-launch">Launch ball</button></div>`;
}

function renderRecycle() {
  return `<div class="recycle-empty">${icon("recycle", "", 64)}<strong>Nothing in here yet.</strong><span class="app-note">A very organised desktop, apparently.</span><button class="xp-button" type="button" data-action="restore-shortcuts">Restore desktop shortcuts</button></div>`;
}

export function mountApp(id, win, helpers = {}) {
  if (id === "paint") mountPaint(win);
  if (id === "minesweeper") startMineGame($(win, "#mine-grid"), helpers.toast);
  if (id === "notes") {
    const textarea = $(win, "#notepad-text");
    try { textarea.value = localStorage.getItem("portfolio-notepad") ?? textarea.value; } catch {}
    textarea.addEventListener("input", () => {
      const status = $(win, "#notepad-status");
      if (status) {
        const lines = textarea.value.slice(0, textarea.selectionStart).split("\n");
        status.textContent = `Ln ${lines.length}, Col ${lines.at(-1).length + 1} · Unsaved`;
      }
    });
  }
  if (id === "media") mountMedia(win);
  if (id === "handheld") {
    $(win, "#handheld-big")?.addEventListener("change", (event) => $(win, "#handheld-device")?.classList.toggle("is-big", event.target.checked));
  }
}

function mountPaint(win) {
  const canvas = $(win, "#paint-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.lineCap = "round";
  context.lineJoin = "round";
  let drawing = false;
  const coords = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const point = coords(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineWidth = Number($(win, "#paint-size")?.value || 6);
    context.strokeStyle = $(win, "#paint-color")?.value || "#245edb";
    context.lineTo(point.x + .01, point.y + .01);
    context.stroke();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const point = coords(event);
    context.lineWidth = Number($(win, "#paint-size")?.value || 6);
    context.strokeStyle = $(win, "#paint-color")?.value || "#245edb";
    context.lineTo(point.x, point.y);
    context.stroke();
  });
  const stop = () => { drawing = false; context.closePath(); };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
}

function mountMedia(win) {
  const trackButtons = [...win.querySelectorAll("[data-track]")];
  const tracks = [
    { title: "Small Hours", artist: "A quiet instrumental demo" },
    { title: "Paper Planes", artist: "A soft beat for thinking" },
    { title: "Blue Window", artist: "A little room to breathe" }
  ];
  let current = 0;
  const setTrack = (index) => {
    current = (index + tracks.length) % tracks.length;
    const track = tracks[current];
    const title = $(win, "#media-track-name");
    const now = $(win, "#media-now-playing");
    const artist = $(win, "#media-track-artist");
    if (title) title.textContent = track.title;
    if (now) now.textContent = track.title;
    if (artist) artist.textContent = track.artist;
    trackButtons.forEach((button, i) => button.classList.toggle("is-current", i === current));
    const fill = $(win, "#media-progress-fill");
    if (fill) fill.style.width = `${18 + current * 21}%`;
  };
  trackButtons.forEach((button) => button.addEventListener("click", () => setTrack(Number(button.dataset.track))));
  $(win, '[data-action="media-next"]')?.addEventListener("click", () => setTrack(current + 1));
  $(win, '[data-action="media-prev"]')?.addEventListener("click", () => setTrack(current - 1));
}
