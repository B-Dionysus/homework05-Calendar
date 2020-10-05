// We want to be able to schedule events in the future and look at past events,
// so currentUIDate tracks which date we're looking at on the screen
var currentUIDate=moment();
var hourlyForecast=[];
var startTime=9;
var endTime=17; // Only display hours between 9 and 5pm.
var lat;
var long;
var DISABLE_API=true;
const MAX_API_CALLS=5000;   // I have to ay $.001 every time we make an API call, so I just don't want it to get out of hand, you know?

$("body").ready(init);
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      init()                                           -_
// _-=      Called when <body> has loaded, and also every time_
// _-=      we change the date in the UI.                    -_
// _-=      We set the main date display, the datepicker (if -_
// _-=      needed), build our calendar UI, and launch the   -_
// _-=      getCurrentLocation(), which then also get the    -_
// _-=      weather data from Dark Skies.                    -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function init(){
    // If we haven't set the datepicker yet, add it now    
     if($("#datepicker").hasClass("hasDatepicker")===false){
        $( "#datepicker" ).datepicker().on("change.dp",goToNewDate);
        $("#datepicker").datepicker("option","dateFormat","yy-mm-dd");
     }   
    if(localStorage.getItem("APICalls")>=MAX_API_CALLS) DISABLE_API=true;
    $("#current-date").text(currentUIDate.format("dddd, [the] Do of MMMM, YYYY"));
    // We might want to schedule things earlier (maybe?) or later (definitely!) on the weekends!
    if(currentUIDate.format("dddd")=="Saturday" || currentUIDate.format("dddd")=="Sunday"){ startTime=8; endTime=19;}
    else { startTime=9; endTime=17};
    setUpBlocks(startTime,endTime,currentUIDate);
    getCurrentLocation();
}

// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      setUpBlocks()                                    -_
// _-=      Take a stat time, and and end time (in 24-hour   -_
// _-=      format) and makes a timeblock for every hours in -_
// _-=      between.                                         -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function setUpBlocks(start, end, thisDate){
    // console.log(thisDate.format("M"));
    for(var i=start;i<=end;i++){ 
        var timeOfDay=i;  
        var displayTime=timeOfDay;
        var suff="<span class='time-suffix'>a.m.</span>";
        if(displayTime>12){
            displayTime-=12;
            suff="<span class='time-suffix'>p.m.</span>";
        }
        if(displayTime===12) suff="<span class='time-suffix'>p.m.</span>";

        // The id will be set to the time of day, 24-hour time

        // But the time will be displayed in 12-hour time
        displayTime=displayTime.toString()+":00 "+suff;
        // $("#displayTime-block-section").append(newTimeBlock(displayTime, timeOfDay, thisDate).attr("id", timeOfDay));
        $("#time-block-section").append(newTimeBlock(displayTime, timeOfDay, thisDate));
        populateEventText(timeOfDay, thisDate);
    }
}

// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      populateEventText()                              -_
// _-=      Check to see if there's an event stored for this -_
// _-=      time-block, and add it if there is . Note: we    -_
// _-=      can only call this *after* the block has been    -_
// _-=      appended to the <body> somewhere. As I found out -_
// _-=      after spending quite a lot of time being confused-_
// _-=                                                       -_
// _-=      This is also a good place to set the background  -_
// _-=      color based on the current time of day.          -=
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function populateEventText(timeOfDay, thisDate){
    
    var eventID=timeOfDay+"-"+thisDate.format("YYYYMMDD");  
    // If retrieveEvent does not return false, assign its value to storedEvent and the do the following
    if(storedEvent=retrieveEvent(eventID)){        
        $("#"+eventID).val(storedEvent);
    }
    var currentHour=moment().format("HH");

    if(moment(currentUIDate.format("YYYY-MM-DD")).isBefore(moment(moment().format("YYYY-MM-DD"))))
        $("#"+eventID).addClass("past");
    else if(moment(currentUIDate.format("YYYY-MM-DD")).isAfter(moment(moment().format("YYYY-MM-DD"))))
        $("#"+eventID).addClass("future");
    else{
        if(timeOfDay>currentHour) $("#"+eventID).addClass("future");
        else if(timeOfDay==currentHour) $("#"+eventID).addClass("present");
        else $("#"+eventID).addClass("past");
    }
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      newTimeBlock()                                   -_
// _-=      Creates a timeblock that displays the displaytime-_
// _-=      and adds a button that passes the timeOfDay and  -_
// _-=      thisDate to addCalendarEvent()                   -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function newTimeBlock(displayTime,timeOfDay, thisDate){
    // console.log(displayTime);
    var eventID=timeOfDay+"-"+thisDate.format("YYYYMMDD"); 
    var newBlock=$("<div>").addClass("row time-block-row");
    newBlock.append(($("<div>")).addClass("col-2 time-of-day"));
    newBlock.find('.time-of-day').append($("<div>").addClass("hour-of-the-day").html(displayTime));
    newBlock.find('.time-of-day').attr("id",timeOfDay+"-column");    
    newBlock.append(($("<div>")).addClass("col-9 event-column"));
    newBlock.find('.event-column').append($("<input>").addClass('event-for-the-day'));
    newBlock.find(".event-for-the-day").attr("id",eventID);
    newBlock.append(($("<div>")).addClass("col-1 save-column"));
    newBlock.find('.save-column').append($("<button>").addClass('save-event').html('<i class="far fa-save"></i>'));
    newBlock.find('.save-event').on("click",function(){addCalendarEvent(eventID)});
    return newBlock;
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=     changeCurrentDate()                               -_
// _-=      Advance or subtract the currentUIDate, remove the-_
// _-=      time-blocks, and call init() again               -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function changeCurrentDate(delta){
    if(delta==="reset") currentUIDate=moment();
    else {
        currentUIDate=currentUIDate.add(delta,'day');
    }
    $("#time-block-section").html("");
    init();
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=     goToNewDate()                                     -_
// _-=      Update currentUIDate to match the datepicker     -_
// _-=      remove the time-blocks, and call init() again    -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function goToNewDate(dateInput){
    console.log($("#datepicker").val());
    currentUIDate=moment($("#datepicker").val());
    
    $("#time-block-section").html("");
    init();
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      addCalendarEvent()                               -_
// _-=      Writes the context of the corresponding input    -_
// _-=      to local storage, with an appropriate key        -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function addCalendarEvent(eventID){
    newEvent=$("#"+eventID).val();
    localStorage.setItem(eventID, newEvent);
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      retrieveEvent()                                  -_
// _-=      Returns the value stored in localstorage for     -_
// _-=      the eventID key, or false if nothing is stored   -_
// _-=      there.                                           -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function retrieveEvent(eventID){
    
    var storedEvent=localStorage.getItem(eventID);
    if(storedEvent===null) return false;
    else return storedEvent;
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='
// _-=                                                         _-='`
// _-=  getCurrentLocation()                                    -='`
// _-=  Retrieves the geolocation data previously stored in the -='`
// _-=  user's computer. If it isn't there, we call             -='`
// _-=  processLocation to add init. If it is there, we can skip-='`
// _-=  that step and go straight to getWeatherData()           -='`
// _-=  **Note that this is a terrible idea for mobile apps!**  -='`
// _-=  But for a desktop-centric userbase, we can assume that  -='`
// _-=  they'll be logging in from the same location every time.-='`    
// _-=                                                         _-='`
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='

function getCurrentLocation(){
    lat=localStorage.getItem("lat");
    long=localStorage.getItem("long");
    if(!lat || !long)
        window.navigator.geolocation.getCurrentPosition(processLocation);
    else getWeatherData();
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=     processLocation()                                 -_
// _-=     Takes the data from getCurrentPosition and stores -_
// _-=     it iin localStorage                               -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function processLocation(pos){

    lat=pos.coords.latitude;
    long=pos.coords.longitude;
    localStorage.setItem("lat",lat);
    localStorage.setItem("long",long);

    getWeatherData();

}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=      getWeatherData()                                 -_
// _-=      Make API call to Dark Skies and calls            -_
// _-=      displayWeatherData() when successful             -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function getWeatherData(){
    if(DISABLE_API) {
                var fakeResponse={"latitude":42.0248717,"longitude":-87.6679668,"timezone":"America/Chicago","currently":{"time":1602392400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0005,"precipProbability":0.02,"precipType":"rain","temperature":59.83,"apparentTemperature":59.83,"dewPoint":54.8,"humidity":0.83,"pressure":1016.2,"windSpeed":13.46,"windGust":15.09,"windBearing":30,"cloudCover":0.48,"uvIndex":0,"visibility":10,"ozone":275.7},"hourly":{"summary":"Partly cloudy throughout the day.","icon":"partly-cloudy-day","data":[{"time":1602392400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0005,"precipProbability":0.02,"precipType":"rain","temperature":59.83,"apparentTemperature":59.83,"dewPoint":54.8,"humidity":0.83,"pressure":1016.2,"windSpeed":13.46,"windGust":15.09,"windBearing":30,"cloudCover":0.48,"uvIndex":0,"visibility":10,"ozone":275.7},{"time":1602396000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0007,"precipProbability":0.02,"precipType":"rain","temperature":59.17,"apparentTemperature":59.17,"dewPoint":54.12,"humidity":0.83,"pressure":1016.5,"windSpeed":12.89,"windGust":14.17,"windBearing":5,"cloudCover":0.51,"uvIndex":0,"visibility":10,"ozone":276.1},{"time":1602399600,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0006,"precipProbability":0.03,"precipType":"rain","temperature":57.68,"apparentTemperature":57.68,"dewPoint":52.82,"humidity":0.84,"pressure":1016.9,"windSpeed":13.14,"windGust":16.1,"windBearing":9,"cloudCover":0.53,"uvIndex":0,"visibility":10,"ozone":276.1},{"time":1602403200,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0003,"precipProbability":0.02,"precipType":"rain","temperature":56.23,"apparentTemperature":56.23,"dewPoint":51.73,"humidity":0.85,"pressure":1017.5,"windSpeed":13.77,"windGust":20.31,"windBearing":25,"cloudCover":0.53,"uvIndex":0,"visibility":10,"ozone":275.9},{"time":1602406800,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0002,"precipProbability":0.02,"precipType":"rain","temperature":55.18,"apparentTemperature":55.18,"dewPoint":50.85,"humidity":0.85,"pressure":1018,"windSpeed":14.12,"windGust":23.68,"windBearing":39,"cloudCover":0.51,"uvIndex":0,"visibility":10,"ozone":275.2},{"time":1602410400,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0002,"precipProbability":0.02,"precipType":"rain","temperature":54.21,"apparentTemperature":54.21,"dewPoint":49.96,"humidity":0.86,"pressure":1018.6,"windSpeed":13.81,"windGust":24.37,"windBearing":44,"cloudCover":0.44,"uvIndex":0,"visibility":10,"ozone":273.9},{"time":1602414000,"summary":"Partly Cloudy","icon":"partly-cloudy-night","precipIntensity":0.0003,"precipProbability":0.02,"precipType":"rain","temperature":53.61,"apparentTemperature":53.61,"dewPoint":49.29,"humidity":0.85,"pressure":1019.2,"windSpeed":13.19,"windGust":23.77,"windBearing":46,"cloudCover":0.36,"uvIndex":0,"visibility":10,"ozone":272.3},{"time":1602417600,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0004,"precipProbability":0.01,"precipType":"rain","temperature":53.49,"apparentTemperature":53.49,"dewPoint":49.13,"humidity":0.85,"pressure":1019.8,"windSpeed":12.73,"windGust":22.98,"windBearing":47,"cloudCover":0.32,"uvIndex":0,"visibility":10,"ozone":271},{"time":1602421200,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0003,"precipProbability":0.01,"precipType":"rain","temperature":54.17,"apparentTemperature":54.17,"dewPoint":49.45,"humidity":0.84,"pressure":1020.4,"windSpeed":12.6,"windGust":22.29,"windBearing":50,"cloudCover":0.37,"uvIndex":0,"visibility":10,"ozone":270.2},{"time":1602424800,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0003,"precipProbability":0.01,"precipType":"rain","temperature":54.94,"apparentTemperature":54.94,"dewPoint":49.6,"humidity":0.82,"pressure":1021.2,"windSpeed":12.59,"windGust":21.41,"windBearing":52,"cloudCover":0.48,"uvIndex":1,"visibility":10,"ozone":269.8},{"time":1602428400,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0002,"precipProbability":0.01,"precipType":"rain","temperature":56.3,"apparentTemperature":56.3,"dewPoint":49.7,"humidity":0.79,"pressure":1021.7,"windSpeed":12.42,"windGust":20.43,"windBearing":55,"cloudCover":0.57,"uvIndex":2,"visibility":10,"ozone":269.6},{"time":1602432000,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0002,"precipProbability":0.01,"precipType":"rain","temperature":57.04,"apparentTemperature":57.04,"dewPoint":49.58,"humidity":0.76,"pressure":1021.8,"windSpeed":11.91,"windGust":19.21,"windBearing":55,"cloudCover":0.67,"uvIndex":3,"visibility":10,"ozone":269.3},{"time":1602435600,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0.0002,"precipProbability":0.01,"precipType":"rain","temperature":57.91,"apparentTemperature":57.91,"dewPoint":49.42,"humidity":0.73,"pressure":1021.6,"windSpeed":11.25,"windGust":17.92,"windBearing":55,"cloudCover":0.76,"uvIndex":4,"visibility":10,"ozone":269.4},{"time":1602439200,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":58.58,"apparentTemperature":58.58,"dewPoint":49.32,"humidity":0.71,"pressure":1021.6,"windSpeed":10.7,"windGust":17.15,"windBearing":54,"cloudCover":0.77,"uvIndex":4,"visibility":10,"ozone":269.5},{"time":1602442800,"summary":"Mostly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":58.98,"apparentTemperature":58.98,"dewPoint":48.95,"humidity":0.69,"pressure":1021.6,"windSpeed":10.38,"windGust":17.21,"windBearing":53,"cloudCover":0.63,"uvIndex":3,"visibility":10,"ozone":269.9},{"time":1602446400,"summary":"Partly Cloudy","icon":"partly-cloudy-day","precipIntensity":0,"precipProbability":0,"temperature":58.85,"apparentTemperature":58.85,"dewPoint":48.59,"humidity":0.69,"pressure":1021.6,"windSpeed":10.18,"windGust":17.81,"windBearing":50,"cloudCover":0.4,"uvIndex":2,"visibility":10,"ozone":270.5},{"time":1602450000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":58.42,"apparentTemperature":58.42,"dewPoint":48.45,"humidity":0.69,"pressure":1021.5,"windSpeed":10.01,"windGust":18.7,"windBearing":51,"cloudCover":0.22,"uvIndex":1,"visibility":10,"ozone":271.1},{"time":1602453600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":57.72,"apparentTemperature":57.72,"dewPoint":48.64,"humidity":0.72,"pressure":1021.5,"windSpeed":9.78,"windGust":19.93,"windBearing":51,"cloudCover":0.15,"uvIndex":0,"visibility":10,"ozone":271.5},{"time":1602457200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":57.14,"apparentTemperature":57.14,"dewPoint":48.82,"humidity":0.74,"pressure":1021.6,"windSpeed":9.55,"windGust":21.43,"windBearing":55,"cloudCover":0.13,"uvIndex":0,"visibility":10,"ozone":271.9},{"time":1602460800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":56.48,"apparentTemperature":56.48,"dewPoint":49.09,"humidity":0.76,"pressure":1021.6,"windSpeed":9.4,"windGust":22.83,"windBearing":61,"cloudCover":0.11,"uvIndex":0,"visibility":10,"ozone":272.1},{"time":1602464400,"summary":"Clear","icon":"clear-night","precipIntensity":0.0002,"precipProbability":0.01,"precipType":"rain","temperature":56.23,"apparentTemperature":56.23,"dewPoint":49.94,"humidity":0.79,"pressure":1021.8,"windSpeed":9.35,"windGust":24.08,"windBearing":72,"cloudCover":0.07,"uvIndex":0,"visibility":10,"ozone":272.1},{"time":1602468000,"summary":"Clear","icon":"clear-night","precipIntensity":0.0003,"precipProbability":0.01,"precipType":"rain","temperature":55.97,"apparentTemperature":55.97,"dewPoint":50.79,"humidity":0.83,"pressure":1022.2,"windSpeed":9.36,"windGust":25.18,"windBearing":85,"cloudCover":0.03,"uvIndex":0,"visibility":10,"ozone":272},{"time":1602471600,"summary":"Clear","icon":"clear-night","precipIntensity":0.0003,"precipProbability":0.01,"precipType":"rain","temperature":55.51,"apparentTemperature":55.51,"dewPoint":50.94,"humidity":0.85,"pressure":1022.5,"windSpeed":9.49,"windGust":25.69,"windBearing":98,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":271.7},{"time":1602475200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":55.03,"apparentTemperature":55.03,"dewPoint":50.56,"humidity":0.85,"pressure":1022.5,"windSpeed":9.86,"windGust":25.27,"windBearing":109,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":271.4}]},"daily":{"data":[{"time":1602392400,"summary":"Partly cloudy throughout the day.","icon":"partly-cloudy-day","sunriseTime":1602417660,"sunsetTime":1602458160,"moonPhase":0.82,"precipIntensity":0.0002,"precipIntensityMax":0.0007,"precipIntensityMaxError":0.0704,"precipIntensityMaxTime":1602396360,"precipProbability":0.08,"precipType":"rain","temperatureHigh":59.49,"temperatureHighError":8.22,"temperatureHighTime":1602443520,"temperatureLow":47.92,"temperatureLowError":8.22,"temperatureLowTime":1602503760,"apparentTemperatureHigh":58.99,"apparentTemperatureHighTime":1602443520,"apparentTemperatureLow":43.69,"apparentTemperatureLowTime":1602503040,"dewPoint":50.08,"humidity":0.79,"pressure":1020.4,"windSpeed":11.49,"windGust":25.69,"windGustTime":1602471720,"windBearing":49,"cloudCover":0.38,"uvIndex":4,"uvIndexTime":1602437700,"visibility":10,"ozone":271.9,"temperatureMin":52.97,"temperatureMinError":8.17,"temperatureMinTime":1602416580,"temperatureMax":60.33,"temperatureMaxError":8.23,"temperatureMaxTime":1602392400,"apparentTemperatureMin":53.46,"apparentTemperatureMinTime":1602416580,"apparentTemperatureMax":59.83,"apparentTemperatureMaxTime":1602392400}]},"flags":{"sources":["cmc","gfs","hrrr","icon","isd","madis","nam","sref"],"nearest-station":5.948,"units":"us"},"offset":-5};
        displayWeatherData(fakeResponse);
    }
    else{
        var thisDate=currentUIDate.format("YYYY-MM-DD");
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://dark-sky.p.rapidapi.com/"+lat+","+long+","+thisDate+"T00:00:00",
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "dark-sky.p.rapidapi.com",
                "x-rapidapi-key": darkSkyAPIKey
            }
        }    
        $.ajax(settings).done(function (response) {
            displayWeatherData(response);
        });
    }
}
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
// _-=                                                       -_
// _-=        displayWeatherData()                           -_
// _-=        Adds the appropriate Font Awesome icon to every-_
// _-=        time-block based on the weather results.       -_
// _-=                                                       -_
// _-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-__-='``'=-_
function displayWeatherData(response){
    var calls=localStorage.getItem("APICalls");
    calls++;
    localStorage.setItem("APICalls", calls);
    if(calls>=MAX_API_CALLS) DISABLE_API=true;
    _rep=response;
    console.log(_rep);
    hourlyForecast=_rep.hourly.data;


    for(var i=startTime-1;i<endTime;i++){
        switch(hourlyForecast[i].icon){
            case "clear-day":{
                fontAwesomeTxt="fas fa-sun";
                break;
            }
            case "partly-cloudy-day":{
                fontAwesomeTxt="fas fa-cloud-sun";
                break;
            }
            case "cloudy":{
                fontAwesomeTxt="fas fa-cloud";
                break;
            }
            case "rain":{
                fontAwesomeTxt="fas fa-umbrella";
                break;
            }
            case "sleet":{
                fontAwesomeTxt="fas fa-cloud-hail";
                break;
            }
            case "snow":{
                fontAwesomeTxt="fas fa-snowflake";
                break;
            }
            case "wind":{
                fontAwesomeTxt="fas fa-wind";
                break;
            }
            case "fog":{
                fontAwesomeTxt="fas fa-fog";
                break;
            }
            default:{
                fontAwesomeTxt="fas fa-question-circle";
                break;
            }
        }           
        var icon=$("<div>").html('<i class="'+fontAwesomeTxt+'"></i>');
        icon.addClass("weather-icon "+hourlyForecast[i].icon);
        $("#"+(i+1)+"-column").append(icon);
        
    }
}