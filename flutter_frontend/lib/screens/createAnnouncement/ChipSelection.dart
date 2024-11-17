
import 'package:flutter/material.dart';
class ChipSelection extends StatelessWidget {

  final bool disableChips;
  final Function(int) onChipSelected;
  final List<bool> isSelected;
  final List<String> announcements;

  ChipSelection({super.key, required this.disableChips, required this.onChipSelected, required this.isSelected, required this.announcements });

  @override
  Widget build(BuildContext context) {
    return Wrap(
        spacing: 10.0,
        runSpacing: 8.0,
        children: List<Widget>.generate(announcements.length, (int index){
          return ChoiceChip(label: Text(announcements[index]),
              onSelected: disableChips ? null:
                  (bool selected) {
                    onChipSelected(index);
              },
              selected: isSelected[index],
              selectedColor: Colors.grey,
              backgroundColor: Colors.white);
        })
    );
  }
}