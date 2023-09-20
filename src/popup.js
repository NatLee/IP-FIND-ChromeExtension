document.addEventListener("DOMContentLoaded", () => {
    fetchUserIP();
    setupEventListeners();
});

async function fetchUserIP() {
    try {
        const response = await fetch('https://json.geoiplookup.io/');
        const data = await response.json();
        document.getElementById('myIP').textContent = data.ip;
    } catch (error) {
        console.error("Error fetching IP:", error);
    }
}

function setupEventListeners() {
    document.getElementById('copyBtn').addEventListener('click', copyIP);
    document.getElementById('searchBtn').addEventListener('click', searchIP);
}

async function copyIP() {
    const ip = document.getElementById('myIP').textContent;
    try {
        await navigator.clipboard.writeText(ip);
        Swal.fire({
            type: 'success',
            title: 'Copied',
            showConfirmButton: false,
            timer: 500
        });
    } catch (error) {
        console.error("Error copying IP:", error);
    }
}

async function searchIP() {
    const ip = document.getElementById('searchIP').value.trim();
    if (validateIPaddress(ip)) {
        const reqUrl = `https://json.geoiplookup.io/?ip=${ip}`;
        try {
            const response = await fetch(reqUrl);
            const data = await response.json();
            document.getElementById('searchIpRegion').textContent = `Country: ${data.region}`;
            document.getElementById('searchIpCity').textContent = `City: ${data.district}`;
        } catch (error) {
            console.error("Error fetching IP details:", error);
        }
    }
}

function validateIPaddress(ipaddress) {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipRegex.test(ipaddress)) {
        return true;
    } else {
        Swal.fire({
            type: 'error',
            text: 'IP format wrong!',
        });
        return false;
    }
}
