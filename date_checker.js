
window.onload = function() {
    var sssytv = '<iframe width="560" height="315" src="https://www.youtube.com/embed/uMH3yozVZuE?si=ZLcpCnJQX_Aebo7S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
    var ngguu = '<audio controls autoplay><source src="ngguu.mp3" type="audio/mpeg" loop> </audio> '
    const d = new Date();
    var month = d.getMonth() +1;
    var day = d.getDate();
    console.log(month)
    console.log(day)

    if(month == 4 && day == 1){
        
        document.getElementById("bodytag").style.fontFamily = "Wingdings";
        console.log("it's april fools day");
    }

    if(month == 10 && day ==31){
        document.getElementById("SpecialVideo").innerHTML=sssytv
        console.log("its halloween");
    }
    else{
        document.getElementById("SpecialVideo").innerHTML=ngguu
        console.log("its not halloween");
    }

};