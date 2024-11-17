
import 'package:flutter/material.dart';
import 'package:flutter_frontend/screens/taskManagement/create_task_form.dart';
import 'package:flutter_frontend/screens/room_page.dart';
import 'package:flutter_frontend/utils/our_theme.dart';
import 'task_grid.dart';

class AllTasks extends StatefulWidget {
  final String email;
  final String roomId;
  const AllTasks({super.key, required this.email, required this.roomId});

  @override
  State<AllTasks> createState() => _AllTasksState();
}

class _AllTasksState extends State<AllTasks> {
  final theme = OurTheme();
  bool completedTaskReload = false;
  bool newTaskReload = false;

  // This function is called when the button is pressed
  Future<void> onPlusButtonPressed(BuildContext context) async {
    // Now you can use the roommates list
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => TaskForm(email: widget.email, roomId: widget.roomId,),
      ),
    );
  }

  void onCompletedButtonPressed(){
    setState(() {
      debugPrint("ButtonPressed");
      completedTaskReload = !completedTaskReload;
    });
  }

  // This function is called when a task is completed in TaskGrid
  void onTaskUpdated() {
    onCompletedButtonPressed(); // Call the function to update the state
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Main content container for instructions and email input
          Padding(
            padding: const EdgeInsets.only(top: 0.0),
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(40),
                  topRight: Radius.circular(40),
                ),
                color: Colors.white, // Background color for the input area
              ),
              height: double.infinity,
              width: double.infinity,
              child: Padding(
                  padding: const EdgeInsets.only(top:40.0),
                  child: Column(
                      children: [
                        Expanded(child: Column(
                          children: [
                            Stack(
                              children: [
                                Align(alignment: Alignment.topLeft, child: IconButton(iconSize:35, onPressed: () { Navigator.of(context).pushReplacement(
                                  MaterialPageRoute(
                                    builder: (context) => UserRoom(email: widget.email, roomID: widget.roomId,),
                                  ),
                                );}, icon: Icon(Icons.arrow_back, color: theme.darkblue,size: 30,))),
                                Center(
                                  child: Text("New Tasks",
                                  style: TextStyle(
                                    color: theme.darkblue,
                                    fontSize: 30.0,
                                    fontWeight: FontWeight.bold,)
                                  ),
                                ),
                                Align(alignment: Alignment.topRight,
                                    child: IconButton(iconSize:35,
                                        onPressed: () { onPlusButtonPressed(context);}, icon: Icon(Icons.add_circle_outlined, color: theme.darkblue,size: 30)))
                              ],
                            ),
                            Expanded(child: TaskGrid(isPending: true, userId: widget.email, onCompletePressed: onTaskUpdated, reload: newTaskReload, roomId:widget.roomId)),],
                        )
                      ),
                      Expanded(child: Column(
                          children: [
                            Text("Completed Tasks",
                                style: TextStyle(
                                  color: theme.darkblue,
                                  fontSize: 30.0,
                                  fontWeight: FontWeight.bold,)
                            ),
                            Expanded(child: TaskGrid(isPending: false, userId: widget.email, onCompletePressed: onTaskUpdated, reload: completedTaskReload, roomId: widget.roomId)),
                            ],
                          )
                        ),
                        const SizedBox(height: 10.0),
                      ]
                  )
              )
            ),
          ),
        ],
      ),
    );
  }
}


