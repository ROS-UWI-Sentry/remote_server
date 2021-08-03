//This script gives the checklist functionality 
//When all conditions are met only then will the user be able to proceed to sanitize


function allConditionsMetFunc(){
    allConditionsMet=document.getElementById('condition1').checked && document.getElementById('condition2') && document.getElementById('condition3').checked && document.getElementById('condition4') && document.getElementById('condition5').checked;
    return allConditionsMet;
}


window.onload = function() {
    document.getElementById("btnNext").onclick = function() {
        allConditionsMet=allConditionsMetFunc();
        if (allConditionsMet){
            document.location.href= "sanitizationpage.html";   
        } else {
            alert("Ensure that all the requirements are met.");
        }
    };
};



        