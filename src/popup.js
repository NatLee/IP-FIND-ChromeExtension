const API_BASE = "https://json.geoiplookup.io/";
const HISTORY_KEY = "ipfind_history";
const THEME_KEY = "ipfind_theme";
const HISTORY_LIMIT = 6;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupEventListeners();
    fetchUserIP();
    renderHistory();
});

/* ---------- Theme ---------- */

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
}

/* ---------- Event listeners ---------- */

function setupEventListeners() {
    $("#copyBtn").addEventListener("click", () => copyToClipboard($("#myIP").dataset.ip));
    $("#reloadBtn").addEventListener("click", () => {
        $("#reloadBtn").classList.add("spinning");
        fetchUserIP();
    });
    $("#searchBtn").addEventListener("click", searchIP);
    $("#searchIP").addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchIP();
        if ($("#searchIP").classList.contains("is-error")) {
            $("#searchIP").classList.remove("is-error");
        }
    });
    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#pasteBtn").addEventListener("click", pasteFromClipboard);
    $("#useMyIpBtn").addEventListener("click", () => {
        const ip = $("#myIP").dataset.ip;
        if (!ip) {
            showToast("Your IP is still loading", "error");
            return;
        }
        $("#searchIP").value = ip;
        searchIP();
    });
    $("#clearHistoryBtn").addEventListener("click", clearHistory);
}

/* ---------- API ---------- */

async function lookup(ip) {
    const url = ip ? `${API_BASE}?ip=${encodeURIComponent(ip)}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/* ---------- My IP ---------- */

async function fetchUserIP() {
    const ipEl = $("#myIP");
    ipEl.innerHTML = '<div class="skeleton skeleton-ip"></div>';
    ipEl.dataset.ip = "";
    setMyInfo({ location: "—", isp: "—", timezone: "—" });

    try {
        const data = await lookup();
        renderMyIP(data);
    } catch (err) {
        console.error("Error fetching IP:", err);
        ipEl.textContent = "Unavailable";
        showToast("Couldn't fetch your IP", "error");
    } finally {
        setTimeout(() => $("#reloadBtn").classList.remove("spinning"), 600);
    }
}

function renderMyIP(data) {
    const ipEl = $("#myIP");
    ipEl.textContent = data.ip || "Unknown";
    ipEl.dataset.ip = data.ip || "";
    ipEl.classList.toggle("is-ipv6", isIPv6(data.ip));

    setMyInfo({
        location: formatLocation(data),
        isp: data.isp || data.org || data.asn_org || "Unknown ISP",
        timezone: data.timezone_name
            ? `${data.timezone_name}${data.current_time ? " · " + formatTime(data.current_time) : ""}`
            : "Unknown timezone",
    });
}

function setMyInfo({ location, isp, timezone }) {
    const grid = $("#myInfo");
    grid.querySelector('[data-field="location"]').textContent = location;
    grid.querySelector('[data-field="isp"]').textContent = isp;
    grid.querySelector('[data-field="timezone"]').textContent = timezone;
}

function formatLocation(data) {
    const parts = [data.city || data.district, data.region, data.country_name].filter(Boolean);
    return parts.length ? parts.join(", ") : "Unknown location";
}

function formatTime(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

/* ---------- Search ---------- */

async function searchIP() {
    const input = $("#searchIP");
    const ip = input.value.trim();

    if (!ip) {
        input.classList.add("is-error");
        showToast("Enter an IP first", "error");
        return;
    }

    if (!validateIP(ip)) {
        input.classList.add("is-error");
        showToast("Invalid IP format", "error");
        return;
    }

    input.classList.remove("is-error");
    const result = $("#searchResult");
    result.classList.remove("hidden");
    result.innerHTML = '<div class="skeleton skeleton-ip"></div>';

    try {
        const data = await lookup(ip);
        renderResult(data);
        addToHistory(data);
    } catch (err) {
        console.error("Error fetching IP details:", err);
        result.innerHTML = '<div class="result-line"><span class="result-line-icon">⚠️</span><span class="result-line-text muted">Lookup failed. Please try again.</span></div>';
        showToast("Lookup failed", "error");
    }
}

function renderResult(data) {
    const ip = data.ip || "";
    const code = (data.country_code || "").toUpperCase();
    const ipClass = isIPv6(ip) ? "result-ip is-ipv6" : "result-ip";

    const locParts = [data.city || data.district, data.region, data.country_name].filter(Boolean);
    const locText = locParts.join(", ");

    const ispName = data.isp || data.org || data.asn_org || "";
    const asnRaw = data.asn ? String(data.asn).trim() : "";
    const asnText = asnRaw ? (/^AS/i.test(asnRaw) ? asnRaw : `AS${asnRaw}`) : "";
    let networkText = "";
    if (ispName && asnText) networkText = `${ispName} · ${asnText}`;
    else networkText = ispName || asnText;

    let tzText = data.timezone_name || "";
    if (tzText && data.current_time) {
        const t = formatTime(data.current_time);
        if (t) tzText += ` · ${t}`;
    }

    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
    const coords = hasCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "";
    const mapUrl = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : "";

    const lines = [];
    if (locText) lines.push(line("🌍", locText));
    if (networkText) lines.push(line("🏢", networkText));
    if (tzText) lines.push(line("🕒", tzText));
    if (hasCoords) {
        lines.push(`<div class="result-line">
            <span class="result-line-icon">📍</span>
            <a class="result-line-text link" href="${escapeAttr(mapUrl)}" target="_blank" rel="noopener">${escapeHTML(coords)} ↗</a>
        </div>`);
    }
    if (data.postal_code) lines.push(line("📮", `Postal · ${data.postal_code}`));

    if (lines.length === 0) {
        lines.push(`<div class="result-line">
            <span class="result-line-icon">ℹ️</span>
            <span class="result-line-text muted">No additional information available for this IP.</span>
        </div>`);
    }

    const badge = code ? `<span class="result-badge">${escapeHTML(code)}</span>` : "";

    $("#searchResult").innerHTML = `
        <div class="result-header">
            <span class="${ipClass}">${escapeHTML(ip)}</span>
            ${badge}
            <button class="icon-btn" id="copyResultBtn" title="Copy IP">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        <div class="result-rows">${lines.join("")}</div>
    `;

    $("#copyResultBtn").addEventListener("click", () => copyToClipboard(ip));
}

function line(icon, text) {
    return `<div class="result-line">
        <span class="result-line-icon">${icon}</span>
        <span class="result-line-text">${escapeHTML(text)}</span>
    </div>`;
}

/* ---------- History ---------- */

function addToHistory(data) {
    if (!data.ip) return;
    const list = getHistory().filter((h) => h.ip !== data.ip);
    list.unshift({
        ip: data.ip,
        country_code: data.country_code || "",
        country_name: data.country_name || "",
        city: data.city || data.district || "",
    });
    const trimmed = list.slice(0, HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    renderHistory();
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function renderHistory() {
    const items = getHistory();
    const wrap = $("#historyWrap");
    const list = $("#history");

    if (items.length === 0) {
        wrap.classList.add("hidden");
        return;
    }

    wrap.classList.remove("hidden");
    list.innerHTML = items
        .map((h) => {
            const code = (h.country_code || "").toUpperCase();
            const badge = code ? escapeHTML(code) : "??";
            const loc = [h.city, h.country_name].filter(Boolean).join(", ") || "Unknown";
            return `<div class="history-item" data-ip="${escapeAttr(h.ip)}">
                <span class="history-flag">${badge}</span>
                <span class="history-ip">${escapeHTML(h.ip)}</span>
                <span class="history-loc">${escapeHTML(loc)}</span>
            </div>`;
        })
        .join("");

    list.querySelectorAll(".history-item").forEach((el) => {
        el.addEventListener("click", () => {
            $("#searchIP").value = el.dataset.ip;
            searchIP();
        });
    });
}

function clearHistory() {
    if (getHistory().length === 0) {
        showToast("No history to clear");
        return;
    }
    localStorage.removeItem(HISTORY_KEY);
    $("#searchResult").classList.add("hidden");
    renderHistory();
    showToast("History cleared");
}

/* ---------- Clipboard ---------- */

async function copyToClipboard(text) {
    if (!text) {
        showToast("Nothing to copy", "error");
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard", "success");
    } catch (err) {
        console.error("Copy failed:", err);
        showToast("Copy failed", "error");
    }
}

async function pasteFromClipboard() {
    try {
        const text = (await navigator.clipboard.readText()).trim();
        if (!text) {
            showToast("Clipboard is empty", "error");
            return;
        }
        $("#searchIP").value = text;
        $("#searchIP").classList.remove("is-error");
        $("#searchIP").focus();
    } catch (err) {
        console.error("Paste failed:", err);
        showToast("Paste blocked by browser", "error");
    }
}

/* ---------- Toast ---------- */

let toastTimer = null;
function showToast(msg, kind = "") {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show" + (kind ? " is-" + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
}

/* ---------- Validation ---------- */

function validateIP(ip) {
    return isIPv4(ip) || isIPv6(ip);
}

function isIPv4(ip) {
    if (!ip) return false;
    const re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
    return re.test(ip);
}

function isIPv6(ip) {
    if (!ip) return false;
    // Permissive IPv6 check (full + compressed + IPv4-mapped)
    const re = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return re.test(ip);
}

/* ---------- Helpers ---------- */

function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
}

function escapeAttr(s) {
    return escapeHTML(s);
}
