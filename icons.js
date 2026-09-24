const ICONS = {
    chevronRight: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    `,

    chevronDown: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    `,

    plus: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"/>
        </svg>
    `,

    edit: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"/>
            <path d="M13 6l4 4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"/>
        </svg>
    `,

    delete: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    `,

    checkbox: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"/>
        </svg>
    `,

    checkboxChecked: `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="3"
                  fill="currentColor"/>
            <path d="M8 12l3 3 5-6"
                  fill="none"
                  stroke="var(--bg)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    `,
};

function createIcon(name) {
    const wrapper = document.createElement("span");

    wrapper.innerHTML = ICONS[name];

    return wrapper.firstElementChild;
}
