// Replace the sample profile, links, and project details here first.
// The shell, desktop icons, Start menu, About, Resume, and Contact windows read from this file.
export const PROFILE = {
  name: "Alex Morgan",
  initials: "AM",
  role: "Digital Designer & Creative Developer",
  location: "Independent · Available worldwide",
  email: "hello@example.com",
  website: "https://example.com",
  availability: "Available for select projects",
  about: [
    "I’m an independent designer who likes turning a good question into a clear, useful experience. My work moves between brand identity, digital products, and the small details that make an interface feel considered.",
    "I enjoy working close to the people building the thing. Sketching, prototyping, writing, and a little front-end code all belong in the same process when they help an idea become real.",
    "Outside the pixels, I’m usually collecting old magazines, walking a long way home, or making a playlist for a project that does not need one."
  ],
  specialties: ["Visual identity", "Web & UI", "Art direction", "Motion systems", "Creative coding"],
  skills: ["Figma", "Adobe Illustrator", "Photoshop", "After Effects", "HTML & CSS", "JavaScript", "Prototyping", "Design systems"],
  socials: [
    { label: "Instagram", url: "https://instagram.com/", icon: "instagram" },
    { label: "LinkedIn", url: "https://linkedin.com/", icon: "linkedin" },
    { label: "GitHub", url: "https://github.com/", icon: "github" }
  ],
  experience: [
    { role: "Independent Designer", place: "Self-employed", date: "2022 — now", text: "Partnering with small teams to shape identities, websites, and digital experiences from first sketch to launch." },
    { role: "Digital Designer", place: "Northline Studio", date: "2020 — 2022", text: "Worked across brand, product, and campaign work; helped build a practical component library for the studio." },
    { role: "Junior Designer", place: "Paper & Pixel", date: "2018 — 2020", text: "Learned the craft on a mix of editorial, packaging, and early-stage digital projects." }
  ],
  education: "BA (Hons) Graphic Communication · 2018"
};

export const PROJECTS = [
  {
    id: "fieldnotes",
    title: "Field Notes",
    category: "Brand identity · 2025",
    year: "2025",
    image: "src/assets/projects/fieldnotes.svg",
    alt: "Moss green Field Notes brand study with a simple leaf symbol",
    tone: "moss",
    description: "A quiet, tactile identity for a neighborhood garden shop. The system pairs a hand-drawn mark with practical labels, a flexible type scale, and a small website designed to feel like a useful notebook."
  },
  {
    id: "goodday",
    title: "Good Day Radio",
    category: "Campaign · 2024",
    year: "2024",
    image: "src/assets/projects/goodday.svg",
    alt: "Bright orange, pink and cobalt poster artwork for Good Day Radio",
    tone: "coral",
    description: "A visual language for a community radio station’s summer season: loud type, warm colour, and modular graphics that move between posters, social clips, and the station site."
  },
  {
    id: "common-table",
    title: "Common Table",
    category: "Digital product · 2024",
    year: "2024",
    image: "src/assets/projects/common-table.svg",
    alt: "Deep purple interface concept with a set of bright circular forms",
    tone: "violet",
    description: "A friendly booking experience for independent restaurants. The prototype takes the stress out of finding a table with clear availability, good local recommendations, and an intentionally small number of steps."
  },
  {
    id: "orbit-kit",
    title: "Orbit Motion Kit",
    category: "Motion system · 2023",
    year: "2023",
    image: "src/assets/projects/orbit-kit.svg",
    alt: "Abstract mint and yellow motion-system shapes on a dark blue field",
    tone: "blue",
    description: "A compact motion toolkit for product teams. A few repeatable rules for easing, spacing, and responsive movement help small interface moments feel related without getting in the way."
  }
];

export const APP_GROUPS = {
  portfolio: ["about", "projects", "resume", "contact"],
  accessories: ["computer", "notes", "paint", "calculator", "console", "settings", "help"],
  media: ["browser", "media", "messenger", "image-viewer", "handheld"],
  games: ["minesweeper", "pinball"]
};

export const APP_DEFS = {
  about: { title: "About Me", icon: "about", group: "portfolio", size: [680, 510], status: "A little about the person behind the work" },
  projects: { title: "My Projects", icon: "projects", group: "portfolio", size: [760, 560], status: "Selected work · 4 items" },
  resume: { title: "My Resume", icon: "resume", group: "portfolio", size: [690, 560], status: "Print this window to save a PDF copy" },
  contact: { title: "Contact Me", icon: "contact", group: "portfolio", size: [610, 500], status: "Your next good idea starts with a note" },
  browser: { title: "Internet Explorer", icon: "browser", group: "media", size: [760, 540], status: "Done" },
  computer: { title: "My Computer", icon: "computer", group: "accessories", size: [650, 470], status: "6 objects" },
  notes: { title: "Notepad", icon: "notes", group: "accessories", size: [600, 450], status: "Plain text · Auto-save is off" },
  paint: { title: "Paint", icon: "paint", group: "accessories", size: [740, 540], status: "For small ideas and very serious doodles" },
  calculator: { title: "Calculator", icon: "calculator", group: "accessories", size: [300, 390], status: "Standard" },
  console: { title: "Command Prompt", icon: "console", group: "accessories", size: [660, 410], status: "Type help for available commands" },
  settings: { title: "Display Properties", icon: "settings", group: "accessories", size: [540, 450], status: "Make yourself at home" },
  help: { title: "Help and Support", icon: "help", group: "accessories", size: [630, 470], status: "How can we help?" },
  media: { title: "Windows Media Player", icon: "media", group: "media", size: [600, 470], status: "Ready" },
  messenger: { title: "Live Messenger", icon: "messenger", group: "media", size: [540, 470], status: "Online · 1 contact" },
  "image-viewer": { title: "Image Viewer", icon: "image", group: "media", size: [680, 500], status: "Project artwork" },
  handheld: { title: "Pocket Console", icon: "handheld", group: "media", size: [490, 580], status: "A tiny pixel playground" },
  minesweeper: { title: "Minesweeper", icon: "minesweeper", group: "games", size: [370, 480], status: "Good luck. You'll need it." },
  pinball: { title: "Pinball", icon: "pinball", group: "games", size: [500, 560], status: "Space Cadet-inspired · Original mini table" },
  recycle: { title: "Recycle Bin", icon: "recycle", group: "accessories", size: [540, 390], status: "0 objects" }
};
