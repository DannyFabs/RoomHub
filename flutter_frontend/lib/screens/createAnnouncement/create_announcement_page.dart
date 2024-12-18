import 'dart:convert';

import "package:flutter/material.dart";
import "package:flutter_frontend/screens/createAnnouncement/ChipSelection.dart";
import 'package:flutter_frontend/utils/our_theme.dart';
import "package:flutter_frontend/widgets/gradient_button.dart";
import 'package:http/http.dart' as http;
import 'package:flutter_frontend/utils/response_handler.dart';
import 'package:flutter_frontend/config.dart';

import '../../utils/custom_exceptions.dart';


class CreateAnnouncement extends StatefulWidget {
  final String email;
  const CreateAnnouncement({super.key, required this.email});

  @override
  State<CreateAnnouncement> createState() => _CreateAnnouncementState();
}

class _CreateAnnouncementState extends State<CreateAnnouncement> {
  final theme = OurTheme();
  final List<String> announcements = [
    "I forgot my keys—can someone let me in?",
    "Having friends over tonight, just a heads up",
    "Going to be late, don't stay up",
    "The Wi-Fi’s down—anyone else having issues?",
    "I have a package arriving today, could someone grab it?",
    "Keep it down. Music is too Loud"
  ];
  late List<bool> isSelected = List.filled(announcements.length, false);
  late int activeAnnouncement = -1;
  bool disableChips = false;
  TextEditingController _textController = TextEditingController();


  @override
  void initState() {
    super.initState();
    // Add listener to the TextField controller
    _textController.addListener(() {
      setState(() {
        disableChips = _textController.text.isNotEmpty;
      });
    });
  }

  // handle chip selection
  void handleChipSelected(int index){
    // update the index of the active announcement.
    activeAnnouncement = index;
    setState(() {
      for(int i =0; i< isSelected.length; i++){
        isSelected[i] = (i == index);
      }
    });
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background gradient container
          Container(
            height: double.infinity,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                theme.mintgreen, // Gradient starting color
                theme.darkblue,  // Gradient ending color
              ]),
            ),
          ),
          // Positioned header with back button and title
          Positioned(
            top: 40.0,
            left: 20.0,
            right: 20.0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Back button to return to the previous screen
                IconButton(
                  icon: const Icon(
                    Icons.arrow_back,
                    color: Colors.white,
                    size: 30,
                  ),
                  onPressed: () {
                    Navigator.of(context).pop(); // Pop the current screen
                  },
                ),
                // Title text indicating the purpose of the screen
                const Text(
                  '\nSend \nAnnouncement',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                      fontSize: 30,
                      color: Colors.white,
                      fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
          // Main content container for instructions and email input
          Padding(
            padding: const EdgeInsets.only(top: 200.0),
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(25),
                  topRight: Radius.circular(25),
                ),
                color: Colors.white, // Background color for the input area
              ),
              height: double.infinity,
              width: double.infinity,
              child: Padding(
                padding: const EdgeInsets.only(left: 18.0, right: 18),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 40),
                        child: Text("Select a preset announcement",
                            style: TextStyle(
                              color: theme.darkblue,
                              fontSize: 20.0,
                              fontWeight: FontWeight.bold,)
                        ),
                      ),
                      const SizedBox(
                        height: 5.0,
                      ),
                      Padding(
                          padding: const EdgeInsets.only(bottom: 10.0),
                          child: ChipSelection(disableChips: disableChips, onChipSelected: this.handleChipSelected, isSelected: this.isSelected, announcements: this.announcements)
                      ),
                      const SizedBox(height: 20.0),
                      Container(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Make your own announcement",
                                  style: TextStyle(
                                    color: theme.darkblue,
                                    fontSize: 20.0,
                                    fontWeight: FontWeight.bold,)
                              ),
                            ]
                        ),
                      ),
                      const SizedBox(
                        height: 10.0,
                      ),
                      Padding(
                        padding: const EdgeInsets.all(5.0),
                        child: TextField(
                            controller: _textController,
                            cursorColor: Theme.of(context).primaryColorDark,
                            decoration: InputDecoration(
                                label: Text(
                                  "Your Announcement",
                                  style: TextStyle(color: theme.darkgrey),
                                )
                            )
                        ),
                      ),
                      const SizedBox(
                        height: 40.0,
                      ),
                      GradientButton(text: 'Send',
                          onTap: () async{
                          bool announcementSent = await sendAnnouncement();
                          if(announcementSent){
                            Navigator.of(context).pop();
                          }
                      }),
                      const SizedBox(height: 50), // Spacer below button
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  //Send announcement function- validation and api request
  Future<bool> sendAnnouncement() async{
    bool announcementSent = false;
    try{
      String announcement_msg;
      if(disableChips){
        //   then text should have been entered
        announcement_msg = _textController.text;
      }else{
        announcement_msg = announcements[activeAnnouncement];
      }

      if(isValidAnnouncement(announcement_msg)){
        //   send announcement
        debugPrint("Sending announcement.......");
        announcementSent = await sendAnnouncementRequest(announcement_msg);
      }
      else{
        //   Toast -- that they should select
        throw Exception("Invalid announcement");
      }
    }catch(e){
      theme.buildToastMessage("Select a preset message or make a custom announcement!!");
    }
    return announcementSent;
  }

  bool isValidAnnouncement(String msg) {
    return msg.isNotEmpty; // Returns true if msg is not empty, false otherwise
  }

  //Send announcement function- api request to send announcement
  Future<bool> sendAnnouncementRequest(String msg) async{
    bool isSent = false;
    try {
      String announcementMsg = generateAnnouncement(msg, widget.email);
      var reqBody = {
        "from": widget.email, // User's email (sender)
        "message": announcementMsg, // Roommate's email (recipient)
        "type": 'announcement', // Request type
      };
      var response = await http.post(
        Uri.parse(sendAnnouncementPth),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(reqBody), // Encode the request body as JSON
      );
      await handlePost(response, responseType: 'sendAnnouncement');
      isSent = true;
      theme.buildToastMessage("Announcement sent successfully");
      resetChips();
    } on NotificationException catch(e) {
      theme.buildToastMessage(e.message);
    }
    return isSent;
  }

  void resetChips(){
    _textController.clear();
    isSelected = List.filled(announcements.length, false);
    activeAnnouncement = -1;
  }
}

 String generateAnnouncement(String msg, String from) {
    return "$msg\n -$from";
}


// I forgot my keys—can someone let me in?"
// "I'm having friends over tonight, just a heads-up."
// "I’ll be late coming home, don’t wait up!"
// "The Wi-Fi’s down—anyone else having issues?"
// "Left the stove on—could someone check?"
// "Package is arriving today, could someone grab it?"
// "Cleaning day tomorrow—let's remember to tidy up!"