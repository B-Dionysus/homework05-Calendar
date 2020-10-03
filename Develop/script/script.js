
function init(){
    for(i=9;i<=17;i++){
        time=i;
        if(time>12)time-=12;
        thisId=time;
        time=time.toString()+":00";
        $("#time-block-section").append(newTimeBlock(time, thisId, thisDate).attr("id", thisId));
    }
}

function newTimeBlock(time,thisId, thisDate){
    var newBlock=$("<div>").addClass("row");
    newBlock.append(($("<div>")).addClass("col-2 time-of-day"));
    newBlock.find('.time-of-day').append($("<div>").addClass("hour-of-the-day").text(time));

    
    newBlock.append(($("<div>")).addClass("col-9 event-column"));
    newBlock.find('.event-column').append($("<input>").addClass('event-for-the-day'));

    
    newBlock.append(($("<div>")).addClass("col-1 save-column"));
    newBlock.find('.save-column').append($("<button>").addClass('save-event').html('<i class="far fa-save"></i>'));
    newBlock.find('.save-event').on("click",function(){addCalendarEvent(thisId, thisDate)});
    return newBlock;
}