// this page provides functionality to the homepage



//***** Funtion Declarations *****


//this function initializes the publisher functionality
function initButtonPublisher() {
    // Init topic object
    brwsr = new ROSLIB.Topic({
        ros : ros,
        name: '/sentry_control_topic',
        messageType: 'std_msgs/String'
    });
    // Init message.
    msg1 = new ROSLIB.Message({
        data :"test data" // It has to be data as written in the std_msgs docs
    });

    brwsr.advertise();


    //listen to button presses 
    document.getElementById("btnOff").onclick = pubMsg;

    
    }


function pubMsg(){
  msg1.data="turn_off_sentry";
  brwsr.publish(msg1);
}









window.onload = function () {
 
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
      confirmMessage = confirm("Error! Not connected to Sentry Robot! \r\nPress Ok to retry. \r\nIf you cannot recconect please restart the Sentry Robot physically. \n\ Press cancel to contue without conncecting. (You can always refresh to retry connecting.)");
      if (confirmMessage==true){
          //If user clicks OK
          document.location.href= "homepage.html";
      }     
    });


    //***** Initialize publisher *****
    initButtonPublisher();


  };


