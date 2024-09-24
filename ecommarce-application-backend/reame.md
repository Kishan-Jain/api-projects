# Ecommarce application -Backend

## Objective :
Ecommarce application backend for shoping application management
## Functionality

 - #### Manage User and seller register, login, update, delete and many more
 - #### Full Authorization and authentication management
 - #### Manage All orders, payments and others in database
 - #### set and get product details 
 - #### send Email when user register, logout, update or delete
 - #### use Socket io for send notification and other info for "**server to client**" and "**client to client**" in application
 - #### use secure payment method 
 - #### manage
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
![alt text](public/temp/schema.png)

## Api URL : 

    Base Url : /api/v1
    
- ### User Functionalities
 
 1. Register user

> **POST** : {{BaseUrl}}/user/register
> Data : userName, fullName, email, password

 2. Login user with userName
> **POST** : {{BaseUrl}}/user/loginByUserName
> Data : userName, password

 3. Login user with email
> **POST** : {{BaseUrl}}/user/loginByEmail
> Data : Email. fullname, password

 4. Logout user
> **POST** : {{BaseUrl}}/user/logout/:userId

 5. Update user details
> **PACTH** : {{BaseUrl}}/user/updateUser/:userId
> Data : fullName, email 
 6. Delete user
> **DELETE** : {{BaseUrl}}/user/deleteUser/:userId

 7. Change user password
> **PATCH** : {{BaseUrl}}/user/changeUserPassword/:userId
> Data : oldPassword, newPassword

 8. Set User Avatar
> **PATCH** : {{BaseUrl}}/user/setUserAvatar/:userId
> Data : Avatar file

 9. Remove User Avatar
> **PATCH** : {{BaseUrl}}/user/removeUserAvatar/:userId

 
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
