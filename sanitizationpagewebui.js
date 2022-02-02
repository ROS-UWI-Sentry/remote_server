// This page provides functionality to the user to sanitize the room


//unused
var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
//a ros variable for an instance of a ROSLIB object
var ros;
//a ros variable for hodling messages
var msg1;
var button1;
var progress;
//a ros variable for holding a topic
var brwsr;
var progressListener;
var firstStart;
//to hold the value of the today time
var today
var percentage = 0;
//unused
var first_time_heartbeat_cb_run =false;
//object to hold the result of the confirm
var confirmMessage;
//to know if the user initiated the shutdown or if a crash on ROSBridge occured
var userInitiatedShutdown = 0;




//**********Initialize Publishers**********

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
    document.getElementById("btnOff").onclick = publishTurnOffSani;

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


//******Initialize Subscribers**********

//this function initializes the subscriber functionality
//it listens to a progress value on the topic /progress
function initProgressSubscriber() {
    //this creates a class object of type topic. 
    //it allows us to subscribe to a topic
    progressListener = new ROSLIB.Topic({
    ros : ros,
    name : '/progress',
    messageType : 'std_msgs/Int32'
});
}

function initHeartbeatSubscriber() {
    //this creates a class object of type topic. 
    //it allows us to subscribe to a topic
    heartbeatListener = new ROSLIB.Topic({
    ros : ros,
    name : '/heartbeat_tx',
    messageType : 'std_msgs/String'    
});
}

//This function is for status reporting of the robot
// it listens to the /status topic and displays it on the screen
// for the user to know whats going on
function initStatusSubscriber() {
    //this creates a class object of type topic. 
    //it allows us to subscribe to a topic
    statusListener = new ROSLIB.Topic({
    ros : ros,
    name : '/status',
    messageType : 'std_msgs/String'

});
}




//******Other Function Declarations**********

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


//this function is called when a new message is received on status
//it determines what the message is and performs actions based on it
function parseMessageReceived(message){
    if (message.data=="human_detected_true"){
        alert("A human was detected! \r\nThe UV lights are off \r\nPlease ensure that there is no one in the room. \r\nResume the sanitization when the room is confirmed empty.");
        document.getElementById("status").innerHTML="A human was found in the room, restart when the room is confirmed empty."
//only allow resumption of activities until human is cleared from the room
        document.getElementById("btnStart").disabled='disabled';
        document.getElementById("btnPause").disabled='disabled';
        document.getElementById("btnStop").disabled='';
/*
        //the text value on the start button is changed from start to continue
        //can't refresh the page because we are continueing the same sanitization event
        document.getElementById("btnStart").innerHTML="Continue Room Stanitizing";
        document.getElementById("btnStart").disabled='';
        document.getElementById("btnPause").disabled='';
        document.getElementById("btnStop").disabled='';    
*/
    }else if(message.data=="human_detected_false") {
        //the text value on the start button is changed from start to continue
        //can't refresh the page because we are continueing the same sanitization event
        document.getElementById("btnStart").innerHTML="Continue Room Stanitizing";
        document.getElementById("btnStart").disabled='';
        document.getElementById("btnPause").disabled='';
        document.getElementById("btnStop").disabled='';            
    }else if(message.data=="Sanitization Complete") {
        document.getElementById("status").innerHTML=message.data;
        console.log(message.data);
        document.getElementById("btnStart").disabled='';
        document.getElementById("btnPause").disabled='';
        document.getElementById("btnStop").disabled='';           
    } else {
        document.getElementById("status").innerHTML=message.data;
        console.log(message.data);
    };
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
    //the text value on the start button is changed from start to restart
    document.getElementById("btnStart").disabled='disabled';
    document.getElementById("btnPause").disabled='';
    document.getElementById("btnStop").disabled='';
        
    //this sets the value of data inside the msg1 object
    msg1.data="start_sanitization";
    //the brwsr object publishes the message stored by msg1 
    //to its predefined topic
    brwsr.publish(msg1);

    //msg3 is published by lightControl object
    msg3.data=true;
    lightControl.publish(msg3);

    //the global variable firstStart is incremented 
    //this allows certain code to run only when the start is pressed for the first time
    firstStart = firstStart + 1;
    localStorage.setItem('firstStart',firstStart);
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
    //to reactivate the button
    document.getElementById("btnStart").disabled='';
    document.getElementById("btnPause").disabled='disabled';
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
    //this updates the status HTML status element
    document.getElementById("status").innerHTML="Paused Sanitizing the Room" ;
}


//This function tells the ROS state machine to stop the Sanitization
function publishStopSani() {
    //this sets the value of data inside the msg1 object
    msg1.data="stop_sanitization";
    document.getElementById("btnPause").disabled='disabled';
    document.getElementById("btnStop").disabled='disabled';

    if (confirm("Stop Sanitizing the Room and Reset Everything?")){
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
        // do the same as if it was pressed once
        } else if (firstStart>1){
            if(percentage<100){
                msg2.data="Incomplete" + " "+String(percentage) + "%";
                brwsrReport.publish(msg2);
                msg2.data=String(today.getHours())+ ":"+String((today.getMinutes()<10?'0':'')+today.getMinutes());
                brwsrReport.publish(msg2);
            };
            
        };

        //so that the ROSBridge connection test knows the user did this
        userInitiatedShutdown=1;

        //clear the stored values of firstStart because the user is finished
        localStorage.clear();

        //cleanly close the ROS connections with ROSBridge
        brwsr.unadvertise();
        brwsrReport.unadvertise();
        ros.close();
        
        //refresh the page
        document.location.href= "sanitizationpage.html";
    } else {
        //do nothing if the user cancels the popup
    };
}


//This function tells the ROS state machine to stop the Sanitization
//At this point it is the same to the Stop Sanitization, the changes will be made later on 
//read the comments for stop sentry for the explination

function publishTurnOffSani() {
    msg1.data="turn_off_sanitization";

    if (confirm("Turn off Sanitization mode?")){
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
        //so that the ROSBridge connection test knows the user did this
        userInitiatedShutdown=1;
        //clear the stored values of firstStart because the user is finished
        localStorage.clear();
        //cleanly close the ROS connections with ROSBridge
        brwsr.unadvertise();
        brwsrReport.unadvertise();
        ros.close();
        document.location.href= "homepage.html";
    } else {
    };
}


window.onload = function () {
    //before connection:
    document.getElementById("btnStart").disabled='disabled';
    document.getElementById("btnPause").disabled='disabled';
    document.getElementById("btnStop").disabled='disabled';



    //warn the user:
    alert("You are about to start the Disinfection Process! \r\nPlease ensure that you have left the room and closed the door before continuing.");

        

    //firstStart variable is used so that we can 
    //know when start is pressed for the first time
    //this is usefull for recording of the time and date when pressed
    //and not be written over when start is pressed after pressing pause
    
    //check if the user already started a sanitization
    //and if the page refreshed due to try reconnecting,
    //we use local storage so that the data persists
    //this initializes the variable firstStart based on whats stored
    storedItem=localStorage.getItem('firstStart');
    if (storedItem==null){
        //if the user exits, stops or the sanitization is complete, this will be null
        firstStart=0;
    } else{
        firstStart=parseInt(storedItem);
    }


    
    //To determine the robot address automatically
    robot_IP = location.hostname;
    // set robot address statically
    //robot_IP = "10.5.10.117";

    // // Initialize handle for rosbridge_websocket 
    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });

    //***********Initialize publishers and subscribers *************
    initButtonPublisher();
    initButtonDataPublisher();
    initHeartbeatPublisher();
    //initPercent();
    initProgressSubscriber();
    initStatusSubscriber();
    initHeartbeatSubscriber();
    initLightControl()


    //console prints out the connection status to ROS  
    //ros.on connection and close constantly checks the connections
    ros.on('connection', function() {
      console.log('Connected to websocket server.');
      document.getElementById("status").innerHTML="Connected to Sentry Robot.";
      document.getElementById("btnStart").disabled='';
      msgConnection.data = "on_sanitization_page";
      connection.publish(msgConnection);
    });
    
    
    ros.on('close', function() {
      console.log('Connection to websocket server closed.');
      //only do this if the user didn't initiate the shutdown
      if(userInitiatedShutdown==0){
        //When ROSBridge closes, pop up asking if to refresh the page or return home
        confirmMessage = confirm("Error! Not connected to Sentry Robot! \r\nPress Ok to retry. \r\nPress Cancel to exit and return home. \r\nIf you Cancel Please wait 1 minute before entering the room with the Sentry robot, then restart it physically.");
        if (confirmMessage==true){
            //If user clicks OK
                document.location.href= "sanitizationpage.html";         
        }  else {
            //If used clicks Cancel
            
            document.location.href= "homepage.html";  
        }   
    }
    });



    // ros.on('error', function(error) {
    //     console.log('Error connecting to websocket server: ', error);
    //     //When error occurs, pop up asking if to refresh the page or return home
    //     confirmMessage = confirm("Error! Connection lost to Sentry Robot!");
    //     if (confirmMessage==true){
    //       //If user clicks OK
    //       document.location.href= "sanitizationpage.html";
    //     }  else {
    //       //If used clicks Cancel
    //       document.location.href= "homepage.html";  
    //     }
  
    //   });






    //*********** functions for listening to messages (subscribers)******** 
   
    //these topics were initialised and here is where we define
    //what happens when a message is received on the topics

    //This is called by rosbridge when a message is received by this subscriber node asynchronously  
    progressListener.subscribe(function(message) {
    displayPercentageSani(message);
    });


    //This is called by rosbridge when a message is received by this subscriber node asynchronously  
    heartbeatListener.subscribe(function(message) {
        //check the message received
        if (message.data =="connection_test"){
            //publish to the Robot that you received the message:
            msgConnection.data = "connected";
            connection.publish(msgConnection);
        };
    });    



    //This is called by rosbridge when a message is received by this subscriber node asynchronously
    statusListener.subscribe(function(message){
        parseMessageReceived(message);
    });
 


};
