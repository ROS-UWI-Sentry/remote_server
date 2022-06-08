# remote_server
This directory contains files that are hosted by the AGX's nginx server for the remote to access and communicate with the ROS system on the AGX.

It was developed using the example [here](https://medium.com/husarion-blog/bootstrap-4-ros-creating-a-web-ui-for-your-robot-9a77a8e373f9). This uses A ROS packed called ROSBridge and a javascript library called roslibjs to facilitate the communication.

Particular attention of how to setup the nginx server is at the end. This must be done to include the path to this folder in the nginx default file. Path needs the required AGX user name.

How to find the remote page in a browser:
1. Must be on the same network as the AGX.
2. type the ip address of the system
3. followed by /homepage.html

The ROSBridge package must be installed.

The sanitizationpage, developerpage and reports page in particular require this package.

# Important
There are popups that are used to disable the buttons on the page, if switched these popups disappear and may allow the user to access the buttons. Future upgrade.

## Known issue and resolution

Using ROSBridge and roslibjs as is may work at first but after some time it may loose connection if you navigate to other pages and return. 
See Google Drive Additional Resources: [Flashing the Jetson...](https://docs.google.com/document/d/1WZLdgXxbXff8g58E_jaLMqHgyO9Tv8HMU45z1B0EHVc/edit)
The solution is detailed there.

Quick solution: [Issue and quick solution:...](https://github.com/RobotWebTools/rosbridge_suite/issues/298#issuecomment-842357768)
Edit "unregister_timeout" parameter to 1000000 located in /opt/ros/melodic/share/rosbridge_server/launch
Or search for rosbridge_websocket.launch in AGX and change unregister_timeout to a large value. 
 

See main_control readme for more detais if necessary. 

To Setup the nginx server [this](https://ubuntu.com/tutorials/install-and-configure-nginx#1-overview) can also be used 

Important note for making edits. If the server is set up with NGINX when you make edits your browser may not detect the javascript changes because the website is cached. You would have to manually delete the cache on the browser or edit the src section on the html page like this "homepagewebui.js?3" each time you want to test the edit. I do not know the correct way around this issue.     
    

