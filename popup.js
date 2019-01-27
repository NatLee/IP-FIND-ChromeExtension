$(document).ready(function () {
    $.getJSON("https://jsonip.com/?callback=?", function (data) {
        console.log(data);
        $('body').append('<font size="3"><center>Your IP</center></font><br>');
        $('body').append('<font size="5"><center><b id="myIP">' + data.ip + '</b></center></font>');
        $('body').append('<font size="4"><center> <button class="noSelect" onclick="copyIP(this)">複製IP</button></center></font>');

        //alert(data.ip);
    });

});

function copyIP() {
    try{
        var copyText = document.getElementById("myIP");
        copyText.select();
        document.execCommand("copy");
        alert("IP Copied: " + copyText.value);
    } catch(err){
        alert("Oh! Something wrong!");
    }
}

