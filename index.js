
$(function(){ 
    $("#location-button").click(function(){
        trackbox.map.showCurrentPosition(); 
    });
    
    $("#goal-modal").modal();
	$("#goal-button").click(function(){
		$("#goal-modal-number").val("");
		$("#goal-modal").modal("open");
	});
    
    $("#goal-modal-add").click(function(){
        addGoal();
	});
	$("#goal-modal-form").submit(function(e){
		e.preventDefault();
        addGoal();
		return false;
	});
    function addGoal(){
        $("#goal-modal").modal("close");
        trackbox.goals.addGoal($("#goal-modal-number").val());
    }
		
    $("#graph-modal").modal({
        dismissible: false,
        opacity: 0
    });
    $("#footer-bar").click(function(){
		$("#graph-modal").modal("open");
        $(".modal-overlay").hide();
    });
});


