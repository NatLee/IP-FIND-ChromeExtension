document.addEventListener("DOMContentLoaded", () => {
    fetchUserIP();
    setupEventListeners();
});

async function fetchUserIP() {
    // Show the spinner and hide IP
    document.getElementById('reloadSpinner').style.display = 'block';
    document.getElementById('myIP').style.display = 'none';
    try {
        const response = await fetch('https://json.geoiplookup.io/');
        const data = await response.json();
        const ipElement = document.getElementById('myIP');
        ipElement.textContent = data.ip;

        // Check if it's an IPv6 and adjust styles if needed
        if (data.ip.includes(':')) {
            ipElement.classList.add('ipv6');
        } else {
            ipElement.classList.remove('ipv6');
        }
    } catch (error) {
        console.error("Error fetching IP:", error);
    } finally {
        // Hide the spinner and show IP
        document.getElementById('reloadSpinner').style.display = 'none';
        document.getElementById('myIP').style.display = 'block';
    }
}

function setupEventListeners() {
    document.getElementById('copyBtn').addEventListener('click', copyIP);
    document.getElementById('searchBtn').addEventListener('click', searchIP);
    document.getElementById('reloadBtn').addEventListener('click', fetchUserIP);
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
    
    // Show the spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    if (validateIPaddress(ip)) {
        const reqUrl = `https://json.geoiplookup.io/?ip=${ip}`;
        // Set the information to null
        document.getElementById('searchIpRegion').textContent = ``;
        document.getElementById('searchIpCity').textContent = ``;
        try {
            const response = await fetch(reqUrl);
            const data = await response.json();
            document.getElementById('searchIpRegion').textContent = `Country: ${data.region}`;
            document.getElementById('searchIpCity').textContent = `City: ${data.district}`;
        } catch (error) {
            console.error("Error fetching IP details:", error);
        } finally {
            // Hide the spinner
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    } else {
        // Hide the spinner if IP validation fails
        document.getElementById('loadingSpinner').style.display = 'none';
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


