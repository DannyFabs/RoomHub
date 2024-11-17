import 'package:flutter/material.dart';
import 'package:flutter_frontend/widgets/header.dart';
import 'package:flutter_frontend/widgets/action_notification.dart';

import 'package:flutter_frontend/utils/our_theme.dart';
import 'package:flutter_frontend/widgets/noaction_notification.dart';
import 'package:http/http.dart' as http;

import 'package:flutter_frontend/config.dart';

import '../utils/custom_exceptions.dart';
import '../utils/response_handler.dart';

class Notifications extends StatefulWidget {
  final List<NotificationItem> notificationItems;
  final String email;
  const Notifications({
    super.key,
    required this.notificationItems, // Marking the list as required
    required this.email
  });

  @override
  State<Notifications> createState() => _NotificationsState();
}

class _NotificationsState extends State<Notifications> {
  final theme = OurTheme();

  void removeNotification(String id) {
    debugPrint("Notification fe removed");
    setState(() {
      widget.notificationItems.removeWhere((item) => item.notificationid == id);
    });

    // Make an API call to remove the notification from the backend
    removeNotificationFromBackend(id);
  }

  Future<void> removeNotificationFromBackend(id)async {
    debugPrint("rmv notif backend");

    String userEmail = widget.email;
    debugPrint(userEmail);
    try {
      var response = await http.delete(
        Uri.parse("$user/$userEmail/notification/"+id),
        headers: {"Content-Type": "application/json"},
      );
      await deleteResponse(response, responseType: "deleteNotification");
      theme.buildToastMessage("Notification deleted successfully");
    } on NotificationException catch(e) {
      theme.buildToastMessage(e.message);
    } on UserException catch(e) {
      theme.buildToastMessage(e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Stack(
          children: [
            SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 60), // Space for the back button
                    Text(
                      "New",
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 10),
                    widget.notificationItems.isEmpty
                        ? Center(
                            child: Text(
                              'No notifications',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge
                                  ?.copyWith(color: theme.darkblue),
                            ),
                          )
                        : NotificationList(items: widget.notificationItems, onRemoveNotification: removeNotification,),

    
                    // List of new notifications

                    
                  ],
                ),
              ),
            ),
            Positioned(
              top: 10,
              left: 10,
              child: BackButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Go back to the previous screen
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NotificationList extends StatelessWidget {
  final List<NotificationItem> items;
  final Function(String id) onRemoveNotification;

  const NotificationList({super.key, required this.items, required this.onRemoveNotification});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: ListView.builder(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        itemCount: items.length,
        itemBuilder: (context, index) {
          if(items[index].type == "announcement"){
            return NoActionNotification(message: items[index].msg, id: items[index].notificationid, onRemove: onRemoveNotification,);
          }
          else if(items[index].type == "join-request"){
            return ActionNotification(
              message: items[index].msg,
              id: items[index].notificationid,
              new_roommate: items[index].from,
              onRemove: onRemoveNotification,
            );
          }
          return null;
        },
      ),
    );
  }

  void printNotificationList(List<NotificationItem> notifications) {
    for (var notification in notifications) {
      print(notification); // This will call the toString method
    }
  }
}
