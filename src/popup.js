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
    const flag = data.country_code ? flagEmoji(data.country_code) + " " : "";
    const parts = [data.city || data.district, data.region, data.country_name].filter(Boolean);
    return parts.length ? `${flag}${parts.join(", ")}` : "Unknown location";
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
        result.innerHTML = '<div class="result-row"><span class="result-val">Lookup failed.</span></div>';
        showToast("Lookup failed", "error");
    }
}

function renderResult(data) {
    const flag = data.country_code ? flagEmoji(data.country_code) : "🌐";
    const city = data.city || data.district || "—";
    const region = data.region || "—";
    const country = data.country_name || "—";
    const isp = data.isp || data.org || "—";
    const asn = data.asn ? `${data.asn}${data.asn_org ? " · " + data.asn_org : ""}` : "—";
    const tz = data.timezone_name || "—";
    const coords = (data.latitude && data.longitude)
        ? `${(+data.latitude).toFixed(4)}, ${(+data.longitude).toFixed(4)}`
        : "";
    const mapUrl = coords
        ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
        : "";

    $("#searchResult").innerHTML = `
        <div class="result-header">
            <div class="result-ip" id="resultIp">${escapeHTML(data.ip || "")}</div>
            <span class="result-flag">${flag}</span>
            <button class="icon-btn" id="copyResultBtn" title="Copy IP">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        <div class="result-grid">
            ${row("Country", `${flag} ${escapeHTML(country)}`)}
            ${row("Region", escapeHTML(region))}
            ${row("City", escapeHTML(city))}
            ${row("ISP", escapeHTML(isp))}
            ${row("ASN", escapeHTML(asn))}
            ${row("Timezone", escapeHTML(tz))}
            ${coords ? coordsRow(mapUrl, coords) : ""}
            ${data.postal_code ? row("Postal", escapeHTML(data.postal_code)) : ""}
        </div>
    `;

    $("#copyResultBtn").addEventListener("click", () => copyToClipboard(data.ip));
}

function row(key, val) {
    return `<div class="result-row">
        <span class="result-key">${key}</span>
        <span class="result-val">${val}</span>
    </div>`;
}

function coordsRow(url, coords) {
    return `<div class="result-row">
        <span class="result-key">Coords</span>
        <a class="result-val link" href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHTML(coords)} ↗</a>
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
            const flag = h.country_code ? flagEmoji(h.country_code) : "🌐";
            const loc = [h.city, h.country_name].filter(Boolean).join(", ") || "Unknown";
            return `<div class="history-item" data-ip="${escapeAttr(h.ip)}">
                <span class="history-flag">${flag}</span>
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

function flagEmoji(code) {
    if (!code || code.length !== 2) return "🌐";
    const base = 0x1f1e6;
    const cc = code.toUpperCase();
    return String.fromCodePoint(base + cc.charCodeAt(0) - 65, base + cc.charCodeAt(1) - 65);
}

function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
}

function escapeAttr(s) {
    return escapeHTML(s);
}
