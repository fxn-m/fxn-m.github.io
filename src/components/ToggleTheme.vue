<template>
    <!-- Your HTML/Template code here if needed -->
    <button id="toggle-btn">Toggle Theme</button>
</template>
  
<script lang="ts">
export default {
    mounted() {
        let toggleBtn = document.getElementById("toggle-btn");
        const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

        // set theme based on local storage
        function setTheme(isDark: boolean) {
            if (isDark) {
                localStorage.setItem("theme", "dark");
                document.body.classList.add("dark");
                toggleBtn!.innerHTML = "<img src='/dark-mode.svg' alt='dark mode' id='dark-mode-icon'>";
                toggleBtn!.setAttribute("aria-label", "enable light theme");
            } else {
                localStorage.setItem("theme", "light");
                document.body.classList.remove("dark");
                toggleBtn!.innerHTML = "<img src='/light-mode.svg' alt='light mode' id='light-mode-icon'>";
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


        // clear local storage on page load
        function clearStorage() {

            let session = sessionStorage.getItem('register');

            if (session == null) {
                localStorage.removeItem('theme');
                console.log(localStorage);
                window.location.reload();
            }
            sessionStorage.setItem('register', 'true');
        }
        window.addEventListener('load', clearStorage);


        // favicon toggle
        const favicon = <HTMLLinkElement>document.querySelector("link[rel='icon']");
        const toggleFavicon = () => {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDarkMode) {
                favicon.setAttribute('href', '/favicon-dark.png');
            } else {
                favicon.setAttribute('href', '/favicon.png');
            }
        };
        toggleFavicon(); // initial call to set favicon based on current color scheme
        // update favicon when color scheme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', toggleFavicon);


        // set theme for initial load
        setTheme(localStorage.getItem("theme") === "dark");
    }
};
</script>  