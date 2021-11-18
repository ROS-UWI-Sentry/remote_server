// this page provides functionality to request and generate the sanitization reports



//to hold an array
var tableData=[];
//to hold a table object
var tbl;
//to help detect if data sent is null
var loadCount =0;

//***** Funtion Declarations *****


//this function initializes the publisher functionality
function initButtonPublisher() {
    // Init topic object
    brwsr = new ROSLIB.Topic({
        ros : ros,
        name: '/brwsrButtonsData',
        messageType: 'std_msgs/String'
    });
    // Init message.
    msg1 = new ROSLIB.Message({
        data :"test data" // It has to be data as written in the std_msgs docs
    });

    brwsr.advertise();


    //listen to button presses 
    document.getElementById("loadTable").onclick = loadTable;
    document.getElementById("clearTable").onclick = clearTable;
    
    }

//this function tells the ROS node to send the table data
function loadTable() {
  msg1.data="Send Report";
  brwsr.publish(msg1);
  
}

//this function tells the ROS node to clear the table data
function clearTable() {
  msg1.data="Clear Report";
  brwsr.publish(msg1);
  tbl.innerHTML ="";
}


//this function initializes the subscriber functionality
function initProgressSubscriber() {
    progressListener = new ROSLIB.Topic({
    ros : ros,
    name : '/reportData',
    messageType : 'std_msgs/String'
});
}


//this funtion organises the data sent into a neat array
function tableCleaner(messageData){
  
  var str="";
  
  //this looks for certain values to determine individual units of data
  //so it can seperate them into an array
  for (var i=0;i<messageData.length;i++){
    if(messageData[i]!="[" && messageData[i]!="," && messageData[i]!="'" && messageData[i]!="]"){
      str=str + messageData[i];
      console.log(str);
    }
    else if (messageData[i]==","){
      tableData.push(str);
      
      str="";      
    }
  }
  //for the last value in the list to be added
  tableData.push(str);    
  str=""; 
  
}

//this function creates a table with the data sent
function generateTable(messageData){
  //call the function to clean up the data
  tableCleaner(messageData);

  tblRowCount = 0;
  //remove the current table, if any

  //below is standard code for generating the table, from Mozilla Developer Network

  //get the reference for the body
  var body = document.getElementsByTagName("body")[0];

  //creates a table element and tbody element
  tbl = document.createElement("table");
  var tblBody = document.createElement("tbody");

  //creating the headers
  var row = document.createElement("tr");

  var cell = document.createElement("th");
  var cellText = document.createTextNode("Sanitization #");
  cell.appendChild(cellText);
  row.appendChild(cell);

  var cell = document.createElement("th");
  var cellText = document.createTextNode("Date");
  cell.appendChild(cellText);
  row.appendChild(cell);

  var cell = document.createElement("th");
  var cellText = document.createTextNode("Time Started");
  cell.appendChild(cellText);
  row.appendChild(cell);

  var cell = document.createElement("th");
  var cellText = document.createTextNode("Status");
  cell.appendChild(cellText);
  row.appendChild(cell);

  var cell = document.createElement("th");
  var cellText = document.createTextNode("Time Finished");
  cell.appendChild(cellText);
  row.appendChild(cell);


  tblBody.appendChild(row);

  // end creating the headers

  //creating the cells
  for (var i = 0; i<tableData.length/4; i++) {
    //creates a table row
    var row = document.createElement("tr");

    for (var j=0; j<4; j++){
      //creating the td elements (cells) and adding it to the row
      var cell = document.createElement("td");
      if (j==0){
        var cellText = document.createTextNode(tblRowCount/4 +1);
        cell.appendChild(cellText);
        row.appendChild(cell);
        var cell = document.createElement("td");
        var cellText = document.createTextNode(tableData[tblRowCount]);
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else {
        var cellText = document.createTextNode(tableData[tblRowCount]);
        cell.appendChild(cellText);
        row.appendChild(cell);
      }
      tblRowCount++; 
    }
    //add the row to the table body
    tblBody.appendChild(row);
    
  }
  //end creating the cells

  //put the tbody in the table on the actual HTML page

  tbl.appendChild(tblBody);
  body.appendChild(tbl);
  tbl.setAttribute("border","2");
   
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
    });


    //***** Initialize publisher and subscriber *****
    initButtonPublisher();

    initProgressSubscriber();


    //This is called by rosbridge when a message is sent to this node asynchronously
    progressListener.subscribe(function(message) {

      console.log(message.data);
      loadCount++
      if(loadCount==1){
        if(message.data=="[]"){
          alert("There is no saved sanitization data.")
        } else{
          //Call this function and send it the received data
          generateTable(message.data);
        }
        
      } else{
        alert("You need to resfresh the page to reload the data.")
      }
      
  
    });



  };


