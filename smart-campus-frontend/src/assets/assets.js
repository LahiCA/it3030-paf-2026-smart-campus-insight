import main_banner from './main_banner.jpg';
import main_bannersm from './main_bannersm.png';
import white_arrow_icon from './white_arrow_icon.svg';
import main_banner1 from './main_banner1.png';

import lecture_hall_image from './lecture_hall_image.png';
import laboratory_image from './laboratory_image.png';
import meeting_room_image from './meeting_room_image.png';
import equipment_image from './equipment_image.png';
import other_image from './other_image.png';


export const assets = {
    main_banner,
    main_banner1,
    main_bannersm,
    white_arrow_icon,
    lecture_hall_image,
    laboratory_image,
    meeting_room_image,
    equipment_image,
    other_image
}

export const categories = [
  {
    text: "Lecture Hall",
    path: "LectureHall",
    image: lecture_hall_image,
    bgColor: "#FEF6DA",
  },
  {
    text: "Laboratory",
    path: "Laboratory",
    image: laboratory_image,
    bgColor: "#FEE0E0",
  },
  {
    text: "Meeting Room",
    path: "MeetingRoom",
    image: meeting_room_image,
    bgColor: "#F0F5DE",
  },
  {
    text: "Equipment",
    path: "Equipment",
    image: equipment_image,
    bgColor: "#E1F5EC",
  },
  {
    text: "Other",
    path: "Other",
    image: other_image,
    bgColor: "#FEE6CD",
  }
 
];
