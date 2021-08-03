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

// This page provides functionality to the user to sanitize the room



//this function initializes the publisher functionality

function initButtonPublisher() {
    // Init topic object
    brwsr = new ROSLIB.Topic({
        ros : ros,
        name: '/brwsrButtons',
        messageType: 'std_msgs/String'
    });
    // Init message.
    msg1 = new ROSLIB.Message({
        data :"Sanitization Started" // It has to be data as written in the std_msgs docs
    });

    brwsr.advertise();
    //initialize counter:
    
    //listen to button presses
    
    document.getElementById("btnStart").onclick = publishStartSani;
    document.getElementById("btnStop").onclick = publishStopSani;
    document.getElementById("btnPause").onclick = publishPauseSani;
    document.getElementById("btnOff").onclick = publishTurnOffSentry;

}

//this Publisher is for the storage of santization data
function initButtonDataPublisher() {
    // Init topic object
    brwsrReport = new ROSLIB.Topic({
        ros : ros,
        name: '/brwsrButtonsData',
        messageType: 'std_msgs/String'
    });
    // Init message.
    msg2 = new ROSLIB.Message({
        data :"Initial Data" // It has to be data as written in the std_msgs docs
    });

    brwsrReport.advertise();

}

//This function tells the ROS node to initialize the counter
function initPercent(){
    msg1.data="Initialize Counter";
    brwsr.publish(msg1);
}

//This function tells the ROS node to start the Sanitization
function publishStartSani() {
    msg1.data="Started Sanitizing the Room";
    brwsr.publish(msg1);
    firstStart = firstStart + 1;
    document.getElementById("status").innerHTML="Sanitizing the Room" ;
    if (firstStart == 1){
        today = new Date();
        //msg2.data="Started";
       // brwsrReport.publish(msg2);
        msg2.data=String(today.getFullYear())+'-'+String((today.getMonth()+1))+'-'+String(today.getDate());
        brwsrReport.publish(msg2);
        msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
        brwsrReport.publish(msg2);
    } else {
        //do nothing
    };
}

//This function Tells the ROS node to pause the Sanitization
function publishPauseSani() {
    msg1.data="Paused Sanitizing the Room";
    brwsr.publish(msg1);
    document.getElementById("btnStart").innerHTML="Restart Room Stanitizing";
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

//This function tells the ROS node to stop the Sanitization
function publishStopSani() {
    msg1.data="Stopped Sanitizing the Room";
    if (confirm("Stop Sanitizing the Room?")){
        brwsr.publish(msg1);
        document.getElementById("status").innerHTML="Stopped Sanitizing the Room" ;
        today = new Date();
        if (firstStart == 1){   
            if(percentage<100){
                msg2.data="Incomplete" + " "+String(percentage) + "%";
                brwsrReport.publish(msg2);
                msg2.data=String(today.getHours())+":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
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
                msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
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


//This function tells the ROS node to stop the Sanitization
//At this point it is the same to the Stop Sanitization, the changes will be made later on

function publishTurnOffSentry() {
    msg1.data="Turn Off Sentry";
    if (confirm("Turn off Sentry?")){
        brwsr.publish(msg1);
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
function initProgressSubscriber() {
    progressListener = new ROSLIB.Topic({
    ros : ros,
    name : '/progress',
    messageType : 'std_msgs/Int32'
});
}

//This function displays the percent value received from the ROS node
function displayPercentageSani(message) {
    progress=document.getElementById("progress").innerHTML = "Percentage Complete: " + message.data;
    percentage = message.data;
    console.log(percentage);
    if (percentage=="100"){
        msg2.data="Complete";
        brwsrReport.publish(msg2);
        msg2.data=String(today.getHours())+ ":" +String((today.getMinutes()<10?'0':'')+today.getMinutes());
        brwsrReport.publish(msg2);
    }
    //progress=whatsubscriber receives?
    //what about when it changes?
}

// function initVelocityPublisher() {
//     // Init message with zero values.
//     twist = new ROSLIB.Message({
//         linear: {
//             x: 0,
//             y: 0,
//             z: 0
//         },
//         angular: {
//             x: 0,
//             y: 0,
//             z: 0
//         }
//     });
//     // Init topic object
//     cmdVel = new ROSLIB.Topic({
//         ros: ros,
//         name: '/turtle1/cmd_vel',
//         messageType: 'geometry_msgs/Twist'
//     });
//     // Register publisher within ROS system
//     cmdVel.advertise();
// }

// function initTeleopKeyboard() {
//     // Use w, s, a, d keys to drive your robot

//     // Check if keyboard controller was aready created
//     if (teleop == null) {
//         // Initialize the teleop.
//         teleop = new KEYBOARDTELEOP.Teleop({
//             ros: ros,
//             topic: '/turtle1/cmd_vel'
//         });
//     }

//     // Add event listener for slider moves
//     robotSpeedRange = document.getElementById("robot-speed");
//     robotSpeedRange.oninput = function () {
//         teleop.scale = robotSpeedRange.value / 100
//     }
// }

// function createJoystick() {
//     // Check if joystick was aready created
//     if (manager == null) {
//         joystickContainer = document.getElementById('joystick');
//         // joystck configuration, if you want to adjust joystick, refer to:
//         // https://yoannmoinet.github.io/nipplejs/
//         var options = {
//             zone: joystickContainer,
//             position: { left: 50 + '%', top: 105 + 'px' },
//             mode: 'static',
//             size: 200,
//             color: '#0066ff',
//             restJoystick: true
//         };
//         manager = nipplejs.create(options);
//         // event listener for joystick move
//         manager.on('move', function (evt, nipple) {
//             // nipplejs returns direction is screen coordiantes
//             // we need to rotate it, that dragging towards screen top will move robot forward
//             var direction = nipple.angle.degree - 90;
//             if (direction > 180) {
//                 direction = -(450 - nipple.angle.degree);
//             }
//             // convert angles to radians and scale linear and angular speed
//             // adjust if youwant robot to drvie faster or slower
//             var lin = Math.cos(direction / 57.29) * nipple.distance * 0.005;
//             var ang = Math.sin(direction / 57.29) * nipple.distance * 0.05;
//             // nipplejs is triggering events when joystic moves each pixel
//             // we need delay between consecutive messege publications to 
//             // prevent system from being flooded by messages
//             // events triggered earlier than 50ms after last publication will be dropped 
//             if (publishImmidiately) {
//                 publishImmidiately = false;
//                 moveAction(lin, ang);
//                 setTimeout(function () {
//                     publishImmidiately = true;
//                 }, 50);
//             }
//         });
//         // event litener for joystick release, always send stop message
//         manager.on('end', function () {
//             moveAction(0, 0);
//         });
//     }
// }



// function pageChanger(){
//     doucument.getElementById("btn3").onlcick = function () {
//         location.href = "www.google.com";
//     }
// }


window.onload = function () {
    //so that we can know when start is pressed for the first time
    
    firstStart = 0; 
    console.log(firstStart);
    // determine robot address automatically
     robot_IP = location.hostname;
    // set robot address statically
    //robot_IP = "10.5.10.117";

    // // Init handle for rosbridge_websocket
    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });


    //console prints out the connection to ROS  
    ros.on('connection', function() {
      console.log('Connected to websocket server.');
    });
    
    ros.on('error', function(error) {
      console.log('Error connecting to websocket server: ', error);
    });
    
    ros.on('close', function() {
      console.log('Connection to websocket server closed.');
    });

 //   initVelocityPublisher();
    // get handle for video placeholder

    initButtonPublisher();
    initButtonDataPublisher();
    initPercent();
    initProgressSubscriber();

  // createJoystick();
  //  initTeleopKeyboard();
   
//This is called by rosbridge when a message is sent to this node asynchronously  
    progressListener.subscribe(function(message) {
    displayPercentageSani(message);
 //   progressListener.unsubscribe();

    });

    alert("You are about to start the Disinfection Process! \r\nPlease ensure that you have left the room and closed the door before continuing.");

        


};