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


##Known issue and resolution

Using ROSBridge and roslibjs as is may work at first but after some time it may loose connection if you navigate to other pages and return. 
See Google Drive Additional Resources: [Flashing the Jetson...](https://docs.google.com/document/d/1WZLdgXxbXff8g58E_jaLMqHgyO9Tv8HMU45z1B0EHVc/edit)
The solution is detailed there.
Quick solution: Search for rosbridge_websocked.launch in AGX and change unregister_timeout to a large value.


See main_control readme for more detais if necessary. 
