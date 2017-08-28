$(document).ready(function () {
    $.getJSON("https://jsonip.com/?callback=?", function (data) {
        console.log(data);
        $('body').append('<font size="3"><center>Your IP</center></font><br>');
        $('body').append('<font size="5"><center><b>' + data.ip + '</b></center></font>');
        $('body').append('<font size="4"><center> <button class="noSelect" onclick="copyIP(this)">複製IP</button></center></font>');

        //alert(data.ip);
    });

});



function copyIP(e) {
    try {

        var link = document.querySelector("b");
        var range = document.createRange();
        range.selectNode(link);

        window.getSelection().addRange(range);
        successful = document.execCommand("copy");
        window.getSelection().removeAllRanges();
        alert("已複製");
        

    } catch (err) {
        alert("抱歉！似乎是哪裡出錯了");
    }
   
}
