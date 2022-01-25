var manager;
var publishImmidiately=true;
var twist;
var cmdVel;
var ros;
var lin=0;
var ang=0;
var stickPublisher=true;




//this page is to provide functionality for the developer to control the robot



function moveStop(){
        speed.data="+0.0000,+0.0000";
	cmdSpeed.publish(speed);
}

function moveForward(){
        speed.data="+0.1000,+0.1000";
	cmdSpeed.publish(speed);
}

function moveLeft(){
        speed.data="-0.1000,+0.1000";
	cmdSpeed.publish(speed);
}

function moveRight(){
        speed.data="+0.1000,-0.1000";
	cmdSpeed.publish(speed);
}

function moveReverse(){
        speed.data="-0.1000,-0.1000";
	cmdSpeed.publish(speed);
}

//This function creates the velocity publisher
function initSpeedPublisher() {
    // Init message with zero values.
    speed = new ROSLIB.Message({
        data: {}

    });
    // Init topic object
    cmdSpeed = new ROSLIB.Topic({
        ros: ros,
        //the topic to publish to
        name: 'ard_com_in',
        messageType: 'std_msgs/String'
    });
    // Register publisher within ROS system
    cmdSpeed.advertise();

    //following code listens to the buttons on the page 
    //if they are pressed a function is called
    //placed in this function to run when the function is called at startup
    
    document.getElementById("btnStop").onclick = moveStop;
    document.getElementById("btnForward").onclick = moveForward;
    document.getElementById("btnReverse").onclick = moveReverse;
    document.getElementById("btnLeft").onclick = moveLeft;
    document.getElementById("btnRight").onclick = moveRight;
}



window.onload = function (){

// determine robot address automatically
robot_IP = location.hostname;
// set robot address statically
//robot_IP = "10.5.10.117";

// // Init handle for rosbridge_websocket
ros = new ROSLIB.Ros({
    url: "ws://" + robot_IP + ":9090"
});



initSpeedPublisher();    


};
