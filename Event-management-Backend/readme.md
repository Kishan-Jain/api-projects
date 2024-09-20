# Event Management application -Backend

## Objective :
Event managent application server Api for store users, events details and manage authorization and other functionalities.
## Functionality

 - #### Manage Users like register, login, update, delete and many more
 - #### Full Authorization and authentication management
 - #### Manage Events and store in database
 - #### set and get event details by every uses
 - #### send Email when user register, logout, update or delete
 - #### use Socket io for send notification and other info for "**server to client**" and "**client to client**" in application

## Services

 - #### Use nodejs and express framework for developer This application
 - #### use mongoDb and mongoose for create schema and store User and Event data in database
 - #### use Bcrypt package for hashing password
 - #### use JWT for authenticate User
 - #### use nodemailer for send Emails
 - #### use multer and clodinary for upload and save user profile

## KeySills

 - #### Express js, node js
 - #### mongoose, 
 - #### socket.io, jwt, cloudinary

## Model Schema
![alt text](schema.png)

## Api URL : 

    Base Url : /api/v1
    
- ### User Functionalities
 
 1. Register user

> **POST** : {{BaseUrl}}/user/register
> Data : userName, fullName, email, password

 2. Login user
> **POST** : {{BaseUrl}}/user/login
> Data : userName, password

 3. Logout user
> **POST** : {{BaseUrl}}/user/logout/:userId

 4. Update user details
> **PACTH** : {{BaseUrl}}/user/updateUserDetails/:userId
> Data : fullName 
 5. Delete user
> **DELETE** : {{BaseUrl}}/user/deleteUser/:userId

 6. Change user password
> **PATCH** : {{BaseUrl}}/user/changeUserPassword/:userId
> Data : oldPassword, newPassword

 7. Set User Avatar
> **PATCH** : {{BaseUrl}}/user/setUserAvatar/:userId
> Data : Avatar file

 8. Remove User Avatar
> **PATCH** : {{BaseUrl}}/user/removeUserAvatar/:userId

 9. Get all Event
> **GET** : {{BaseUrl}}/user/getAllEventList/:userId

 - ### Event Functionalities

 1. Create new Event

> **POST** : {{BaseUrl}}/event/:userId/createNewEvent
> Data : title, description, location, startDate, endDate

 2. Get Event Details
> **GET** : {{BaseUrl}}/event/:userId/getEventDetails/:eventId

 3. Get All users Events List
> **GET** : {{BaseUrl}}/event/:userId/getAllUsersEventList

 4. Update Event Details
> **PACTH** : {{BaseUrl}}/event/:userId/updateEventDetails/:eventId
> Data : title, description, location, startDate, endDate
 5. Remove Event
> **DELETE** : {{BaseUrl}}/event/:userId/removeEvent/:eventId
