import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_frontend/utils/custom_exceptions.dart';
import 'dart:convert';

// This function handles the response for different types of POST requests 
// and throws custom exceptions based on the response status and content.
Future<void> handlePost(http.Response response,
    {required String responseType}) async {
  switch (responseType) {
    case 'signup':
      switch (response.statusCode) {
        case 200:
          // Handle case where the username already exists
          if (response.body == "This user name already exist") {
            throw UserException("This username already exists");
          }
          break;
        case 400:
          // Handle invalid email scenario
          throw UserException("Error Creating User - Email is invalid");
        case 500:
          // Generic error for server issues
          throw UserException("Something went wrong. Try again later");
        default:
          // Fallback error for any other status codes
          throw UserException("Something went wrong. Try again later");
      }
      break;

    case 'createRoom':
      switch (response.statusCode) {
        case 400:
          // Check for specific error messages in the response body
          if (response.body.contains("Invalid Room Name")) {
            throw RoomException("Invalid Room Name");
          } else if (response.body.contains("Invalid User")) {
            throw RoomException("Invalid User");
          }
          break;
        case 500:
          // Server error during room creation
          throw RoomException("Something went wrong. Try again later");
      }
      break;

    case 'addRoommate':
      switch (response.statusCode) {
        case 404:
          // Check for specific user or room not found messages
          if (response.body.contains("Room not found")) {
            throw UserException("Room not found");
          } else if (response.body.contains("User not found")) {
            throw UserException("User not found");
          } else if (response.body.contains("New roommate not found")) {
            throw UserException("New roommate not found");
          } else if (response.body.contains("Old roommate not found")) {
            throw UserException("Old roommate not found");
          }
          break;
        case 500:
          // Log server error, better to throw exception for consistency
          print("Something went wrong. Try again later");
          break;
      }
      break;

    case 'joinRoom':
      switch (response.statusCode) {
        case 404:
          // Handle case where the user is not found
          if (response.body.contains("User not found")) {
            throw NotificationException('User not found');
          }
          break;
        case 400:
          // Handle case where the notification message is empty
          if (response.body.contains("Message is empty")) {
            throw NotificationException(
                'Error Creating Notification - Message is empty');
          }
          break;
        case 500:
          // Server error for join room request
          throw NotificationException('Something went wrong. Try again later');
      }
      break;

    case 'createTask':
      switch (response.statusCode) {
        case 200:
          // valid case
          break;
        case 403:
        // Handle case where the notification message is empty
          throw UserException(
                'Something Went Wrong. Please Try again later');
        case 500:
        // Server error for join room request
          throw UserException('Something went wrong. Try again later.');
        default:
        // Fallback error for any other status codes
          print(response.statusCode);
          print(response.body);
          throw UserException("Something went wrong. Try again later");
      }
      break;

    case 'editTask':
      switch (response.statusCode) {
        case 200:
        // valid case
          break;
        case 403:
          if(response.body.contains("Invalid users involved")){
            throw UserException("User task is assigned to doesn't exist");
          }else if(response.body.contains("Users are not roommates")){
            throw RoomException("User task is assigned to is no longer a roommate");
          }
        // Handle case where the notification message is empty
          throw TaskException(
              'Task could not be created at this moment. Please try again later');
        case 404:
          throw TaskException("This task no longer exists. Deleted by another roommate");
        case 500:
        // Server error for join room request
          throw TaskException('Something went wrong. Try again later.');
        default:
        // Fallback error for any other status codes
          print(response.statusCode);
          print(response.body);
          throw UserException("Something went wrong. Try again later");
      }
      break;
    case 'sendAnnouncement':
      switch (response.statusCode) {
        case 404:
        // Handle case where the user is not found
          if (response.body.contains("User not found")) {
            throw NotificationException('User not found');
          }
          break;
        case 400:
        // Handle case where the notification message is empty
          if (response.body.contains("Message is empty")) {
            throw NotificationException(
                'Error Creating Notification - Message is empty');
          }
          break;
        case 500:
        // Server error for join room request
          throw NotificationException('Something went wrong. Try again later');
      }
      break;

    case 'createExpense':
      switch (response.statusCode) {
        case 200:
          // valid case
          break;
        case 404:
          if(response.body.contains("User does not exist")){
            throw ExpenseException("This user no longer exists");
          }else{
            throw ExpenseException("One or more contributors no longer belong to the room");
          }
        case 422:
        // Check for specific error messages in the response body
            throw UserException("Something went wrong. Request Error");
        case 500:
        // Server error during room creation
          throw UserException("Something went wrong. Try again later");
      }
      break;

    case 'createSettleUpTransaction':
      switch (response.statusCode) {
        case 200:
        // valid case
          break;
        case 404:
          if(response.body.contains("User does not exist")){
            throw ExpenseException("This user no longer exists");
          }else{
            throw ExpenseException("The users are not roommates");
          }
        case 409:
          if(response.body.contains("No outstanding balance to be settled")){
            throw ExpenseException("No outstanding balance to be settled");
          }
          throw ExpenseException("Amount must be less than or equal to outstanding balance.");
        case 422:
        // Check for specific error messages in the response body
          throw UserException("Something went wrong. Request Error");
        case 500:
        // Server error during room creation
          throw UserException("Something went wrong. Try again later");
      }
      break;
  }
}

// This function handles the response for different types of POST requests
// and throws custom exceptions based on the response status and content.
Future<void> patchResponse(http.Response response,
    {required String responseType}) async {
  switch (responseType) {
    case 'markComplete':
      switch (response.statusCode) {
        case 200:
          // good case no expected return
          break;
        case 400:
        // Handle invalid email scenario
          throw UserException("Error- Invalid User");
        case 403:
        // Handle invalid email scenario
          if(response.body.contains("Invalid User")){
            throw UserException("Invalid user");
          }
          throw TaskException("Error- Task not found, Either deleted or doesn't exist");
        case 500:
        // Generic error for server issues
          throw TaskException("Something went wrong. Try again later");
        default:
        // Fallback error for any other status codes
          debugPrint(response.statusCode as String?);
          throw TaskException("Something went wrong. Try again later");
      }
      break;
  }
}

// This function handles GET requests and returns the desired value from the response body.
// It also handles and throws custom exceptions based on status codes and response content.
Future<String> getResponse(http.Response response,
    {required String responseType}) async {
  // Uncomment these for debugging purposes
  // print(response.body);
  // print(response.statusCode);

  switch (responseType) {
    case 'getUserRoom':
      switch (response.statusCode) {
        case 200:
          // Decode JSON response and return the room name if it exists
          var jsonResponse = jsonDecode(response.body);
          if (jsonResponse.containsKey('room_name')) {
            return jsonResponse['room_name'];
          } else {
            throw UserException('Room name not found in the response');
          }
        case 400:
          // Handle invalid username scenario
          if (response.body.contains("Invalid username")) {
            throw UserException('This username is invalid');
          }
          throw UserException('Invalid request');
        case 404:
          // Handle user not found scenario
          throw UserException('User not found');
        case 500:
          // Server error
          throw UserException('Something went wrong. Try again later');
        default:
          // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }

    case 'getUserNotification':
      switch (response.statusCode) {
        case 400:
          // Handle invalid username error
          if (response.body.contains("Invalid username")) {
            throw UserException('Invalid username');
          }
          throw UserException('Invalid request');
        case 500:
          // Server error
          throw UserException('Something went wrong. Try again later');
        default:
          // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }

    case 'getTransactions':
      switch (response.statusCode) {
        case 404:
          throw UserException("This user does not exist.");
        case 422:
        // Handle invalid username error
          throw UserException("Something went wrong. Request error");
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }

    case 'getSummary':
      switch (response.statusCode) {
        case 404:
          throw UserException("This user does not exist.");
        case 422:
        // Handle invalid username error
          throw UserException("Something went wrong. Request error");
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }

    case 'getRoommateList':
      switch (response.statusCode) {
        case 400:
        // Handle invalid username error
          if (response.body.contains("Invalid username")) {
            throw UserException('Invalid username');
          }
          throw UserException('User not found');
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }
      case 'getTasks':
        switch (response.statusCode) {
          case 404:
          // Handle invalid username error
            if (response.body.contains("Invalid User")) {
              throw UserException('Invalid User');
            }
            else if(response.body.contains("Room not found")) {
              throw RoomException("Room not found");
            }else{
              print("Properly reaching 404");
              return "";
            }
          case 500:
            // Server error
            throw UserException('Something went wrong. Try again later is it thissss??????${response.body}');
          default:
          // Handle unexpected status codes
            throw UserException('Unexpected status code: ${response.statusCode}');
      }

    case 'getLeaveRoomWarning':
      switch(response.statusCode){
        case 200:
        // Decode JSON response and return the room name if it exists
          var jsonResponse = jsonDecode(response.body);
          if (jsonResponse.containsKey('message')) {
            return jsonResponse['message'];
          } else {
            throw UserException('Message not found in the response');
          }
        case 400:
        // Handle invalid username scenario
          if (response.body.contains("Invalid username")) {
            throw UserException('This username is invalid');
          }
          throw UserException('Invalid request');
        case 404:
        // Handle user not found scenario
          throw UserException('User not found');
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }
    // should be in a handle put or patch
    case 'leaveRoom':
      switch(response.statusCode) {
        case 200:
        // Decode JSON response and return the room name if it exists
          var jsonResponse = jsonDecode(response.body);
          if (jsonResponse.containsKey('message')) {
            return jsonResponse['message'];
          } else {
            throw UserException('Message not found in the response');
          }
        case 400:
        // Handle invalid username scenario
          if (response.body.contains("Invalid username")) {
            throw UserException('This username is invalid');
          }
          throw UserException('Invalid request');
        case 404:
        // Handle user not found scenario
          throw UserException('User not found');
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }
  // should be in a handle put or patch
    case 'hasRoommate':
      switch(response.statusCode) {
        case 200:
        // Decode JSON response and return the room name if it exists
          var jsonResponse = jsonDecode(response.body);
          if (jsonResponse.containsKey('message')) {
            String msg = jsonResponse['message'];
            String result;
            if(msg == "You have no roommate"){
              result = "false";
            }else{
              result = "true";
            }
            return result;
          } else {
            throw UserException('Message not found in the response');
          }
        case 400:
        // Handle invalid username scenario
          if (response.body.contains("Invalid username")) {
            throw UserException('This username is invalid');
          }
          throw UserException('Invalid request');
        case 404:
        // Handle user not found scenario
          throw UserException('User not found');
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }
    default:
      // Fallback for unknown responseType
      throw Exception('Something went wrong. Try again later');
  }
}

// This function handles Delete requests and returns the desired value from the response body.
// It also handles and throws custom exceptions based on status codes and response content.
Future<String> deleteResponse(http.Response response,
    {required String responseType}) async {
  // Uncomment these for debugging purposes
  // print(response.body);
  // print(response.statusCode);
  switch (responseType) {
    case 'deleteNotification':
      switch (response.statusCode) {
        case 200:
          return "SUCCESS";
        // 200 in this case is a successful decision.
        case 400:
        // Handle invalid username scenario
          if (response.body.contains("This username is invalid")) {
            throw UserException('This username is invalid');
          }
          else if(response.body.contains("The notification id is invalid")){
            throw NotificationException('Notification is invalid');
          }
          throw NotificationException('Invalid request');
        case 404:
        // Handle user not found scenario or notification not found
          if (response.body.contains("User not found")) {
            throw UserException('User Not found');
          }
          else if(response.body.contains("Notification not found")){
            throw NotificationException('Notification not found');
          }
          throw UserException('User not found');
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }

    case 'deleteTask':
      switch (response.statusCode) {
        case 200:
          return "SUCCESS";
      // 200 in this case is a successful decision.
        case 403:
        // Handle invalid username scenario
          throw UserException('This username is invalid');
        case 404:
          throw TaskException('Task not found. Either not created or deleted by another roommate');
        case 500:
        // Server error
          throw UserException('Something went wrong. Try again later');
        default:
        // Handle unexpected status codes
          throw UserException('Unexpected status code: ${response.statusCode}');
      }
    default:
    // Fallback for unknown responseType
      throw Exception('Something went wrong. Try again later');
  }
}
