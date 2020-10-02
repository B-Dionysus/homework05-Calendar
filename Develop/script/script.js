/* <div class="row">
<div class="col-1">
  <div class="hour-of-the-day">
      11:00am
  </div>
</div>
  <div class="col-10 event-column">
      <input class="event-for-the-day">
  </div>
  <div class="col-1 save-column">
    <button class="save-event">
      <i class="far fa-save"></i>
    </button>
  </div>
</div> */
function init(){
   $("#time-block-section").append(newTimeBlock(11));
}

function newTimeBlock(time){


    var newBlock=$("<div>").addClass("row");
    newBlock.append(($("<div>")).addClass("col-1"));
    newBlock.firstChild().addClass("TEST");
    return newBlock;
}