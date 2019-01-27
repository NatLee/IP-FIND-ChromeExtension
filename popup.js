
$.ajaxSettings.async = false;

$(document).ready(function () {
    // Find IP
    $.getJSON('https://json.geoiplookup.io/', function (data) {
        $('#myIP').text(data.ip);
    })
    
});

document.getElementById('copyBtn').onclick = function () {
    var ip = document.getElementById('myIP');

    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = ip.innerText;
    document.body.appendChild(copyFrom);
    copyFrom.focus();
    document.execCommand('SelectAll');
    document.execCommand('Copy');
    clearSelection()
    document.body.removeChild(copyFrom);
    Swal.fire({
        type: 'success',
        title: 'Copied',
        showConfirmButton: false,
        timer: 500
    })
}


document.getElementById('searchBtn').onclick = function () {
    var ip = document.getElementById('searchIP').value.trim();
    
    if (ValidateIPaddress(ip)) {
        reqUrl = 'https://json.geoiplookup.io/?ip=' + ip;
        $.getJSON(reqUrl, function (data) {
            $('#searchIpRegion').text('Country: ' + data.region)
            $('#searchIpCity').text('City: ' + data.district)
        });

    }

}


// ref: https://stackoverflow.com/questions/6562727/is-there-a-function-to-deselect-all-text-using-javascript
function clearSelection() {
    var sel;
    if ((sel = document.selection) && sel.empty) {
        sel.empty();
    } else {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        var activeEl = document.activeElement;
        if (activeEl) {
            var tagName = activeEl.nodeName.toLowerCase();
            if (tagName == "textarea" ||
                (tagName == "input" && activeEl.type == "text")) {
                // Collapse the selection to the end
                activeEl.selectionStart = activeEl.selectionEnd;
            }
        }
    }
}

// ref: https://www.w3resource.com/javascript/form/ip-address-validation.php
function ValidateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
        return (true);
    }
    Swal.fire({
        type: 'error',
        text: 'IP format wrong!',
    })
    return (false);
}

