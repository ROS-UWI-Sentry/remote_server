// This page provides functionality to the user to sanitize the room



var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;
var msg1;
var button1;
var progress;
var brwsr;
var progressListener;
var firstStart;
var today
var percentage = 0;
//var listPositionBool

// function moveAction(linear, angular) {
//     if (linear !== undefined && angular !== undefined) {
//         twist.linear.x = linear;
//         twist.angular.z = angular;
//     } else {
//         twist.linear.x = 0;
//         twist.angular.z = 0;
//     }
//     cmdVel.publish(twist);
// }





//this function initializes the publisher functionality
//the same as the tutorial

function initButtonPublisher() {
    // Initialize topic object
    brwsr = new ROSLIB.Topic({
        ros : ros,
        name: '/sentry_control_topic',// name: '/brwsrButtons',
        messageType: 'std_msgs/String'
    });
    // Initialize message.
    msg1 = new ROSLIB.Message({
        // It has to be same data type as written in the std_msgs docs
        data :"Sanitization Started" 
    });


    brwsr.advertise();
    
    
    //following code listens to the buttons on the page 
    //if they are pressed a function is called
    //placed in this function to run when the function is called at startup
    
    document.getElementById("btnStart").onclick = publishStartSani;
    document.getElementById("btnStop").onclick = publishStopSani;
    document.getElementById("btnPause").onclick = publishPauseSani;
    document.getElementById("btnOff").onclick = publishTurnOffSentry;

}

function initHeartbeatPublisher(){
    //Initialize topic object
    connection = new ROSLIB.Topic({
        ros : ros,
        name: '/heartbeat_rx',
        messageType: 'std_msgs/String'
    });
    //Initialize message.
    msgConnection = new ROSLIB.Message({
        // It has to be same data type as written in the std_msgs docs
        data : "initial data" 
    });

}

//this Publisher is for the storage of santization data
//it facilitates communication with a ROS node
//that node reads an writes to a text file
function initButtonDataPublisher() {
    // Initialize topic object
    brwsrReport = new ROSLIB.Topic({
        ros : ros,
        name: '/brwsrButtonsData',
        messageType: 'std_msgs/String'
    });
    // Initialize message.
    msg2 = new ROSLIB.Message({
        // It has to be data as written in the std_msgs docs
        data :"Initial Data" 
    });

    brwsrReport.advertise();

}



//this Publisher is for the controlling of lights
//it is not used in the final remote
//the state machine replaces this functionality 
function initLightControl() {
    // Init topic object
    lightControl = new ROSLIB.Topic({
        ros : ros,
        name: '/lightControl',
        messageType: 'std_msgs/Bool'
    });
    // Init message.
    msg3 = new ROSLIB.Message({
        data : false // It has to be data as written in the std_msgs docs
    });

    lightControl.advertise();

}



//This function tells the ROS node to initialize the counter
//it is not used in the final remote
//it was used for testing
function initPercent(){
    msg1.data="Initialize Counter";
    brwsr.publish(msg1);
}

//This function tells the ROS state machine to start the Sanitization
function publishStartSani() {
    //this sets the value of data inside the msg1 object
    msg1.data="start_sanitization";
    //the brwsr object publishes the message stored by msg1 
    //to its predefined topic
    brwsr.publish(msg1);

    //msg3 is published by lightControl object
    msg3.data=true;
    lightControl.publish(msg3);

    //the global variable firstStart is incremented 
    //this allows certain code to run only when the first time start is pressed
    firstStart = firstStart + 1;
    //this updates the status HTML element 
    document.getElementById("status").innerHTML="Sanitizing the Room" ;

    //if this is the first time start is pressed this if statement
    //publishes the year, month, date, hours and minutes to a ROS Node
    //using the brwsrReport object
    if (firstStart == 1){
        //create new object to store the current date and time
        today = new Date();
        //publish the year, month and date
        msg2.data=String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate());
        brwsrReport.publish(msg2);
        //publish the hours and minutes
        msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
        brwsrReport.publish(msg2);
    } else {
        //do nothing if this is not the first time start is pressed
    };
}

//This function Tells the ROS state machine to pause the Sanitization
function publishPauseSani() {
    //this sets the value of data inside the msg1 object
    msg1.data="pause_sanitization";
    //the brwsr object publishes the message stored by msg1 
    //to its predefined topic    
    brwsr.publish(msg1);

    //msg3 is published by lightControl object
    msg3.data=false;
    lightControl.publish(msg3);

    //the text value on the start button is changed from start to restart
    document.getElementById("btnStart").innerHTML="Restart Room Stanitizing";
    //this updates the status HTML element
    document.getElementById("status").innerHTML="Paused Sanitizing the Room" ;
}

/* function publishStopSani() {
    msg1.data="Stopped Sanitizing the Room";
    if (confirm("Stop Sanitizing the Room?")){
        brwsr.publish(msg1);
        document.getElementById("status").innerHTML="Stopped Sanitizing the Room" ;
        if (firstStart == 1){
            today = new Date();
            if(percentage<100){
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"INCOMPLETE");
            } else if (percentage==100){
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"COMPLETE");
            };  
        } else if (firstStart==0){
            today = new Date();
            if(localStorage.length == 0){
                localStorage.setItem(String(0),String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate()));
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"NULL");
                localStorage.setItem(String(localStorage.length),"Did not run");
            } else {
                localStorage.setItem(String(localStorage.length),String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate()));
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"NULL");
                localStorage.setItem(String(localStorage.length),"Did not run");
                
            };

        };
        brwsr.unadvertise();
        ros.close();
        document.location.href= "homepage.html";
    } else {

    };
} */

//This function tells the ROS state machine to stop the Sanitization
function publishStopSani() {
    //this sets the value of data inside the msg1 object
    msg1.data="stop_sanitization";

    if (confirm("Stop Sanitizing the Room?")){
        //if the user confirms with the popup to stop,
        //the brwsr object publishes the message stored by msg1 
        //to its predefined topic        
        brwsr.publish(msg1);

        //msg3 is published by lightControl object    
        msg3.data=false;
        lightControl.publish(msg3);

        //this updates the status HTML element     
        document.getElementById("status").innerHTML="Stopped Sanitizing the Room" ;

        //create new object to store the current date and time        
        today = new Date();

        //if the start button was pressed once
        if (firstStart == 1){   
            //if the completion of the sanitization is less than 100%
            //publish that it was incomplete
            //along with the hours and minutes that the button was pressed
            if(percentage<100){
                msg2.data="Incomplete" + " "+String(percentage) + "%";
                brwsrReport.publish(msg2);
                msg2.data=String(today.getHours())+":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
                brwsrReport.publish(msg2);
            }; 
        //if the start button was not pressed 
        //publish that it didn't run 
        //along with the year, month, date, hours and minutes
        //this is because if the user never pressed start,
        //the time and date would never be published
        } else if (firstStart==0){
            msg2.data="Did Not Run,";
            brwsrReport.publish(msg2);
            msg2.data=String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate());
            brwsrReport.publish(msg2);
            msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
            brwsrReport.publish(msg2);
       
        //if the start button was pressed more than once
        // do the same as if it was presseed once
        } else if (firstStart>1){
            if(percentage<100){
                msg2.data="Incomplete" + " "+String(percentage) + "%";
                brwsrReport.publish(msg2);
                msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
                brwsrReport.publish(msg2);
            };
            
        };
        //cleanly close the ROS connections with ROSBridge
        brwsr.unadvertise();
        brwsrReport.unadvertise();
        ros.close();
        //go to the homepage
        document.location.href= "homepage.html";
    } else {
        //do nothing if the user cancels the popup
    };
}

/* function publishTurnOffSentry() {
    msg1.data="Turn Off Sentry";
    if (confirm("Turn off Sentry?")){
        brwsr.publish(msg1);
        document.getElementById("status").innerHTML="Sentry is off" ;
        if (firstStart == 1){
            today = new Date();
            if(percentage<100){
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"INCOMPLETE");
            } else if (percentage==100){
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"COMPLETE");
            };  
        } else if (firstStart==0){
            today = new Date();
            if(localStorage.length == 0){
                localStorage.setItem(String(0),String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate()));
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"NULL");
                localStorage.setItem(String(localStorage.length),"Did not run");
            } else {
                localStorage.setItem(String(localStorage.length),String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate()));
                localStorage.setItem(String(localStorage.length),String(today.getHours())+ ":" + String(today.getMinutes()));
                localStorage.setItem(String(localStorage.length),"NULL");
                localStorage.setItem(String(localStorage.length),"Did not run");
                
            };
        };
        brwsr.unadvertise();
        ros.close();
        document.location.href= "homepage.html";
    } else {

    };

} */


//This function tells the ROS state machine to stop the Sanitization
//At this point it is the same to the Stop Sanitization, the changes will be made later on 
//read the comments for stop sentry for the explination

function publishTurnOffSentry() {
    msg1.data="turn_off_sentry";

    if (confirm("Turn off Sentry?")){
        brwsr.publish(msg1);
        msg3.data=false;
        lightControl.publish(msg3);
        document.getElementById("status").innerHTML="Sentry is off" ;
        today = new Date();
        if (firstStart == 1){   
            if(percentage<100){
                msg2.data="Incomplete" + " "+String(percentage) + "%";
                brwsrReport.publish(msg2);
                msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
                brwsrReport.publish(msg2);
            };

        } else if (firstStart==0){
            msg2.data="Did Not Run,";
            brwsrReport.publish(msg2);
            msg2.data=String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate());
            brwsrReport.publish(msg2);
            msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
            brwsrReport.publish(msg2);
        } else if (firstStart>1){
            if(percentage<100){
                msg2.data="Incomplete" + " "+String(percentage) + "%";
                brwsrReport.publish(msg2);
                msg2.data=String(today.getHours())+":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
                brwsrReport.publish(msg2);
            };
        
        };
        brwsr.unadvertise();
        brwsrReport.unadvertise();
        ros.close();
        document.location.href= "homepage.html";
    } else {
    };
}



//this function initializes the subscriber functionality
//it listens to a progress value on the topic /progress
function initProgressSubscriber() {
    progressListener = new ROSLIB.Topic({
    ros : ros,
    name : '/progress',
    messageType : 'std_msgs/Int32'
});
}

function initHeartbeatSubscriber() {
    heartbeatListener = new ROSLIB.Topic({
    ros : ros,
    name : '/heartbeat_tx',
    messageType : 'std_msgs/String'    
});
}

//the progress functionality needs to be changed
//due to the fact that I don't know how long the robot takes to move and sanitize
//This function displays the percent value received from the ROS node
function displayPercentageSani(message) {
    progress=document.getElementById("progress").innerHTML = "Time elapsed: " + message.data + "seconds";
    percentage = message.data;
    console.log(percentage);
    //!!!!change this to when all goals reached
    if (percentage=="100"){
        msg2.data="Complete";
        brwsrReport.publish(msg2);
        msg2.data=String(today.getHours())+ ":" +String((today.getMinutes()<10?'0':'')+today.getMinutes());
        brwsrReport.publish(msg2);
    }
    //progress=whatsubscriber receives?
    //what about when it changes?
}




//This function is for status reporting of the robot
// it listens to the /status topic and displays it on the screen
// for the user to know whats going on
function initStatusSubscriber() {
    statusListener = new ROSLIB.Topic({
    ros : ros,
    name : '/status',
    messageType : 'std_msgs/String'

});
}

//this function is called when a new message is received on status
function displayStatus(message){
    document.getElementById("status").innerHTML=message.data;
    console.log(message.data);
}

/* function initVelocityPublisher() {
    // Init message with zero values.
    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // Init topic object
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/turtle1/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
    // Register publisher within ROS system
    cmdVel.advertise();
}

function initTeleopKeyboard() {
    // Use w, s, a, d keys to drive your robot

    // Check if keyboard controller was aready created
    if (teleop == null) {
        // Initialize the teleop.
        teleop = new KEYBOARDTELEOP.Teleop({
            ros: ros,
            topic: '/turtle1/cmd_vel'
        });
    }

    // Add event listener for slider moves
    robotSpeedRange = document.getElementById("robot-speed");
    robotSpeedRange.oninput = function () {
        teleop.scale = robotSpeedRange.value / 100
    }
}

function createJoystick() {
    // Check if joystick was aready created
    if (manager == null) {
        joystickContainer = document.getElementById('joystick');
        // joystck configuration, if you want to adjust joystick, refer to:
        // https://yoannmoinet.github.io/nipplejs/
        var options = {
            zone: joystickContainer,
            position: { left: 50 + '%', top: 105 + 'px' },
            mode: 'static',
            size: 200,
            color: '#0066ff',
            restJoystick: true
        };
        manager = nipplejs.create(options);
        // event listener for joystick move
        manager.on('move', function (evt, nipple) {
            // nipplejs returns direction is screen coordiantes
            // we need to rotate it, that dragging towards screen top will move robot forward
            var direction = nipple.angle.degree - 90;
            if (direction > 180) {
                direction = -(450 - nipple.angle.degree);
            }
            // convert angles to radians and scale linear and angular speed
            // adjust if youwant robot to drvie faster or slower
            var lin = Math.cos(direction / 57.29) * nipple.distance * 0.005;
            var ang = Math.sin(direction / 57.29) * nipple.distance * 0.05;
            // nipplejs is triggering events when joystic moves each pixel
            // we need delay between consecutive messege publications to 
            // prevent system from being flooded by messages
            // events triggered earlier than 50ms after last publication will be dropped 
            if (publishImmidiately) {
                publishImmidiately = false;
                moveAction(lin, ang);
                setTimeout(function () {
                    publishImmidiately = true;
                }, 50);
            }
        });
        // event litener for joystick release, always send stop message
        manager.on('end', function () {
            moveAction(0, 0);
        });
    }
} */



// function pageChanger(){
//     doucument.getElementById("btn3").onlcick = function () {
//         location.href = "www.google.com";
//     }
// }


window.onload = function () {

    alert("You are about to start the Disinfection Process! \r\nPlease ensure that you have left the room and closed the door before continuing.");

        

    //firstStart variable is used so that we can 
    //know when start is pressed for the first time
    //this is usefull for recording of the time and date when pressed
    //and not be written over when start is pressed after pressing pause
    
    firstStart = 0; 

    
    //To determine the robot address automatically
     robot_IP = location.hostname;
    // set robot address statically
    //robot_IP = "10.5.10.117";

    // // Initialize handle for rosbridge_websocket 
    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });


    //console prints out the connection status to ROS  
    ros.on('connection', function() {
      console.log('Connected to websocket server.');
      document.getElementById("status").innerHTML="Connected to Sentry Robot.";

    });
    
    ros.on('error', function(error) {
      console.log('Error connecting to websocket server: ', error);
      document.getElementById("status").innerHTML="Error! Not connected to Sentry Robot, Turn off and retry.";
    });
    
    ros.on('close', function() {
      console.log('Connection to websocket server closed.');
    });

 //   initVelocityPublisher();
    // get handle for video placeholder

    initButtonPublisher();
    initButtonDataPublisher();
    initHeartbeatPublisher();
    //initPercent();
    initProgressSubscriber();
    initStatusSubscriber();
    initHeartbeatSubscriber();
    initLightControl()

  // createJoystick();
  //  initTeleopKeyboard();
   
    //This is called by rosbridge when a message is received by this subscriber node asynchronously  
    progressListener.subscribe(function(message) {
    displayPercentageSani(message);
 //   progressListener.unsubscribe();

    });


    //This is called by rosbridge when a message is received by this subscriber node asynchronously  
    heartbeatListener.subscribe(function(message) {
        if (message.data =="connection_test"){
            msgConnection.data = "connected";
            connection.publish(msgConnection);
        }
    });    



    //This is called by rosbridge when a message is received by this subscriber node asynchronously
    statusListener.subscribe(function(message){
        displayStatus(message);
    });

    //alert("You are about to start the Disinfection Process! \r\nPlease ensure that you have left the room and closed the door before continuing.");

        


};