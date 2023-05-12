let toggleBtn = document.getElementById("toggle-btn");
const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

// set theme based on local storage
function setTheme(isDark: boolean) {
  if (isDark) {
    localStorage.setItem("theme", "dark");
    document.body.classList.add("dark");
    toggleBtn!.innerHTML = "☀️";
    toggleBtn!.setAttribute("aria-label", "enable light theme");
  } else {
    localStorage.setItem("theme", "light");
    document.body.classList.remove("dark");
    toggleBtn!.innerHTML = "🌙";
    toggleBtn!.setAttribute("aria-label", "enable dark theme");
  }
}

// set theme for toggle button
function toggleTheme() {
  if (localStorage.getItem("theme") === "dark") {
    setTheme(false);
  } else {
    setTheme(true);
  }
}

// update theme based on OS theme for change event listener
function updateTheme() {
  const osTheme = colorSchemeQuery.matches ? "dark" : "light";
  if (localStorage.getItem("theme") !== osTheme) {
    setTheme(osTheme === "dark");
  }
}

// set theme based on OS theme for initial load
if (!localStorage.getItem("theme")) {
  const osTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  localStorage.setItem("theme", osTheme);
}

// add event listeners
toggleBtn!.addEventListener("click", (e) => {
  e.preventDefault();
  toggleTheme();
});

colorSchemeQuery.addEventListener("change", () => {
  updateTheme();
});

// set theme for initial load
setTheme(localStorage.getItem("theme") === "dark");

export {}