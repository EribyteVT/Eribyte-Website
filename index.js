Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

let countdown
let streams = [];
let streamNowEle = document.getElementById("streamNow");
let streamCountdownEle = document.getElementById("streamCountdown");
let updateCountdownTimer;

function updateCountdownCheck() {
    // Buffer time is 2 hours.
    // Once the stream starts we keep the "Stream is NOW" for 2 hours before moving to next stream.
    let now = Date.now();
    let timerSet = false;
    // Loop through the streams to get the next timer.
    for (let i = 0; i < streams.length; i++) {
        // Get the stream from the array.
        let soonestStream = streams[i];
        // Get and parse the date.
        let streamDate = Date.parse(soonestStream["date"]);
        // Get the difference between the stream set date and now.
        let delta = (streamDate - now);
        // Add this for debugging to show the Stream Countdown banner.
        // delta = 0;
        // Check if the stream is in the future.
        if (delta > 0) {
            streamNowEle.hidden = true;
            streamCountdownEle.hidden = false;
            // Get to rendering the time countdown.
            renderStreamCountdown(delta);
            timerSet = true;
        } else if ((delta + (60 * 60 * 2)) > 0) {
            // If the start time is within 2 hours, show the streaming now banner.
            streamCountdownEle.hidden = true;
            streamNowEle.hidden = false;
            timerSet = true;
        }
        // Check if we set something.
        if (timerSet) {
            break;
        }
    }
    // If we did not set anything, hide the banners.
    if (timerSet === false) {
        streamCountdownEle.hidden = true;
        streamNowEle.hidden = true;
        console.log("Oopsie we made a fucky wucky.  No Streams.");
        // Remove the interval check, so we don't waste resources.
        clearInterval(updateCountdownTimer);
    }
}

function renderStreamCountdown(datetime) {
    const days = Math.floor(datetime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((datetime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((datetime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((datetime % (1000 * 60)) / 1000);
    let printString = "";
    if (days > 0) {
        printString += `${days}:`;
    }
    printString += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    countdown.innerHTML = printString;
}

window.onload = function () {
    streamNowEle = document.getElementById("streamNow");
    streamCountdownEle = document.getElementById("streamCountdown");
    countdown = document.getElementById("Countdown")
    let d = new Date();

    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dateWeekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    let weekday = d.getDay() //0 Sunday, 1 Monday

    const Http = new XMLHttpRequest();
    let rightNowMs = Date.now();

    let scheduleGrid = document.getElementById("gridSchedule")

    //we subtract this from right now to get a number, that way if it's 2:01PM and the stream happens at 2:00pm, it still shows up
    //current value: 5 hours
    let gracePeriod = 18000000
    const url = 'https://crud.eribyte.net/getStreams/3/' + (rightNowMs - gracePeriod).toString();
    Http.open("GET", url);
    Http.send();

    Http.onloadend = (e) => {
        //from the response we get the next week of streams
        //as defined by any stream starting between now and 7 days worth of MS in the future. This is a bad solution
        // console.log("Got response")
        let object = JSON.parse(Http.responseText)['data']
        // console.log(object)
        //loop through and create a list of better stream objects
        for (let z in object) {
            let data = object[z]
            let t = data.streamDate.split(/[- :]/);
            let dayHourSplit = t[2].split("T")
            // Apply each element to the Date function
            let streamDate = new Date(Date.UTC(t[0], t[1] - 1, dayHourSplit[0], dayHourSplit[1], t[3], 0));
            streams.push({"stream": data.streamName, "date": streamDate})
        }
        //get time zone
        let zone = new Date().toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2]
        //loop through the days, starting with today
        for (let i = 0; i < 7; i++) {
            // console.log(dateWeekdayNames[(weekday + i) % 7])
            //o(n^2), does js have a filter method?
            let streamObject = null;
            for (let z in streams) {
                //if there is a stream today
                if (streams[z].date.getDay() == (weekday + i) % 7) {
                    streamObject = streams[z]
                    break;
                }
            }
            let base = ["<div class = gridRow><div class = 'scheduleDay'>", "DAY_PLACEHOLDER", "</div><div class='scheduleDate'>", "PLACEHOLDER DATE", "</div><div class = 'scheduleStream'>", "STREAM_NAME", " at ", "STREAM TIME", "</div></div>"]
            if (streamObject != null) {
                base[1] = weekdayNames[(weekday + i) % 7]
                base[3] = (d.getMonth() + 1).toString() + "/" + (d.getDate()).toString()
                base[5] = "<a href='https://twitch.tv/eribytevt'>" + streamObject.stream + "</a>"

                let AmOrPm = streamObject.date.getHours() >= 12 ? 'pm' : 'am';
                let hours = (streamObject.date.getHours() % 12) || 12;

                base[7] = hours + ":" + (streamObject.date.getMinutes() < 10 ? '0' : '') + streamObject.date.getMinutes() + AmOrPm + " " + zone

                // console.log(base)
                scheduleGrid.innerHTML += base.join('')
            } else {
                base[1] = weekdayNames[(weekday + i) % 7]
                base[3] = (d.getMonth() + 1).toString() + "/" + (d.getDate()).toString()
                base[5] = "No Stream"
                base[6] = ""
                base[7] = ""
                scheduleGrid.innerHTML += base.join('')
            }

            d = d.addDays(1)
        }
        streams = streams.filter((value) => {
            return value.date > rightNowMs
        }).sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        });
        updateCountdownCheck();
        updateCountdownTimer = setInterval(updateCountdownCheck, 1000);
    }
}
