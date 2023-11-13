Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var secondsUntil
var countdown

function subSecond(){
    secondsUntil = secondsUntil -1
    var hoursUntil = Math.floor(secondsUntil / 3600)

    var minutesUntil = Math.floor((secondsUntil%3600) / 60)

    var goodSecondsUntil = secondsUntil % 60

    countdown.innerHTML = hoursUntil.toString()+":"+(minutesUntil<10?'0':'')+minutesUntil.toString() +":"+(goodSecondsUntil<10?'0':'')+goodSecondsUntil.toString()

}


window.onload = function() {
    countdown = document.getElementById("Countdown")
    var d = new Date();
    
    const weekdayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dateWeekdayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

    var weekday = d.getDay() //0 Sunday, 1 Monday

    const Http = new XMLHttpRequest();
    var rightNowMs = Date.now();

    var scheduleGrid = document.getElementById("gridSchedule")

    //we subtract this from right now to get a number, that way if it's 2:01PM and the stream happens at 2:00pm, it still shows up
    //current value: 5 hours
    var gracePeriod = 18000000
    const url='https://crud.eribyte.net/test/' + (rightNowMs-gracePeriod).toString();
    Http.open("GET", url);
    Http.send();

    Http.onloadend = (e) => {
        //from the response we get the next week of streams
        //as defined by any stream starting between now and 7 days worth of MS in the future. This is a bad solution
        var streams = []
        console.log("Got response")
        object = JSON.parse(Http.responseText)

        //loop through and create a list of better stream objects
        for(z in object){

            data=object[z]
            var t = data.scheduleEntityKey.date.split(/[- :]/);
            var dayHourSplit = t[2].split("T")

            // Apply each element to the Date function
            var streamDate = new Date(Date.UTC(t[0], t[1]-1, dayHourSplit[0], dayHourSplit[1], t[3],0));

            streams.push({"stream":data.streamName,"date":streamDate})

            
        }
        console.log(streams);

        //get time zone
        var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]

        //loop through the days, starting with today
        for(var i=0;i<7;i++){
            console.log(dateWeekdayNames[(weekday+i)%7])

            //o(n^2), does js have a filter method?
            var streamObject = null;
            for(z in streams){
                //if there is a stream today
                if(streams[z].date.getDay() == (weekday+i)%7){
                    streamObject = streams[z]
                    break;
                }
            }
            base = ["<div class = gridRow><div class = 'scheduleDay'>", "DAY_PLACEHOLDER","</div><div class='scheduleDate'>", "PLACEHOLDER DATE" ,"</div><div class = 'scheduleStream'>","STREAM_NAME", " at ", "STREAM TIME","</div></div>"]
            if(streamObject != null){
                base[1] = weekdayNames[(weekday+i)%7] 
                base[3] = (d.getMonth()+1).toString() +"/"+(d.getDate()).toString()
                base[5] = "<a href='https://twitch.tv/eribytevt'>" + streamObject.stream +"</a>"

                var AmOrPm = streamObject.date.getHours() >= 12 ? 'pm' : 'am';
                var hours = (streamObject.date.getHours() % 12) || 12;

                base[7] = hours + ":" + (streamObject.date.getMinutes()<10?'0':'') + streamObject.date.getMinutes() +AmOrPm + " " + zone

                console.log(base)
                scheduleGrid.innerHTML += base.join('')
            }
            else{
                base[1] = weekdayNames[(weekday+i)%7]
                base[3] = (d.getMonth()+1).toString() +"/"+(d.getDate()).toString()
                base[5] = "No Stream"
                base[6] = ""
                base[7] = ""

                scheduleGrid.innerHTML += base.join('')
            }

            d = d.addDays(1)
        }
        streams = streams.sort( (a,b) => {return a.date>b.date})

        var soonestStream = streams[0];
        var today = new Date();
       

        secondsUntil = Math.floor((soonestStream.date.getTime() - today.getTime())/1000)

        var hoursUntil = Math.floor(secondsUntil / 3600)

        var minutesUntil = Math.floor((secondsUntil%3600) / 60)

        var goodSecondsUntil = secondsUntil % 60

        countdown.innerHTML = hoursUntil.toString()+":"+(minutesUntil<10?'0':'')+minutesUntil.toString() +":"+(goodSecondsUntil<10?'0':'')+goodSecondsUntil.toString()

        setInterval(subSecond, 1000);


    }
}