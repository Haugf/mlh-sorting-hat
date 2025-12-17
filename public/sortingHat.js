const HOUSES = [
    { name: "Hanson", color: "#2196F3", trait: "Hardware", description: "Like Hanson the Hippo, you build with strength. Hardware is your playground.", image: "images/hippo.jpg" },
    { name: "Gene", color: "#FFC107", trait: "Debugging", description: "Like Gene the Giraffe, you spot bugs from a mile away. You reach new heights in code.", image: "images/giraffe.jpg" },
    { name: "Jewels", color: "#F44336", trait: "Connection", description: "Like Jewels the Jumpercable Jellyfish, you bring energy and connect systems together.", image: "images/jellyfish.jpg" },
    { name: "Crypto", color: "#4CAF50", trait: "Security", description: "Like Crypto the Chameleon, you adapt to any environment and keep secrets safe.", image: "images/chameleon.jpg" }
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
