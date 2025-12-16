const HOUSES = [
    { name: "Stackoverflow", color: "#F48024", trait: "Resourcefulness", description: "You find answers where others see only errors. Copy-paste is your spellbook." },
    { name: "Segfault", color: "#D32F2F", trait: "Bravery", description: "You code close to the metal and fear no memory leak. You live life on the edge (case)." },
    { name: "Div-Center", color: "#9C27B0", trait: "Artistry", description: "You bring order and beauty to the chaotic DOM. You align the unalignable." },
    { name: "Recursion", color: "#2E7D32", trait: "Wisdom", description: "To understand the house, you must first understand the house. You see the infinite loop in all things." }
];

const PATRONUSES = ["Rubber Duck", "Octocat", "Docker Whale", "Linux Penguin", "Firefox", "Python", "Rust Crab", "Go Gopher"];

const WANDS = [
    "13-inch MacBook Pro, M1 Core",
    "Mechanical Keyboard, Cherry MX Blue",
    "ThinkPad X1 Carbon, Arch Linux",
    "Custom PC, RGB Lighting, Water Cooled",
    "Raspberry Pi 4, Overclocked",
    "Vim Configuration, Heavily Customized"
];

function getHash(str) {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

function sortHacker(user) {
    // 1. Determine House (Deterministic based on ID)
    // Fallback to "guest" if ID is missing (shouldn't happen for logged in)
    const idHash = getHash(user.id || "guest");
    const houseIndex = idHash % HOUSES.length;
    const house = HOUSES[houseIndex];

    // 2. Determine Wand (Based on School or Random if missing)
    let schoolName = "Self-Taught";
    if (user.education && user.education.length > 0) {
        // Handle case where school_name might be null/undefined even if education array exists
        schoolName = user.education[0].school_name || "Self-Taught";
    }

    // Simple logic: Hash of school name determines wand
    const schoolHash = getHash(schoolName);
    const wandIndex = schoolHash % WANDS.length;
    const wand = WANDS[wandIndex];

    // 3. Determine Patronus (Based on Account Creation Time or Name)
    // Fallback to name hash if created_at is missing
    let seed = user.created_at;
    if (!seed) {
        seed = getHash((user.first_name || "") + (user.last_name || ""));
    }
    const patronusIndex = seed % PATRONUSES.length;
    const patronus = PATRONUSES[patronusIndex];

    return {
        house,
        wand,
        patronus
    };
}
