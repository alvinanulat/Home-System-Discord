function getGMT8Time() {
  const gmt8Offset = 8 * 60 * 60 * 1000; // GMT+8 offset in milliseconds
  const gmt8Time = new Date(Date.now() + gmt8Offset);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayOfWeek = daysOfWeek[gmt8Time.getUTCDay()];
  const monthOfYear = monthsOfYear[gmt8Time.getUTCMonth()];
  const date = gmt8Time.getUTCDate();
  const year = gmt8Time.getUTCFullYear();
  const hours = gmt8Time.getUTCHours();
  const minutes = gmt8Time.getUTCMinutes().toString().padStart(2, "0");
  const seconds = gmt8Time.getUTCSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;
  const formattedTime = `${formattedHours}:${minutes}:${seconds}${ampm}`;
  const formattedDate = `${dayOfWeek}, ${monthOfYear} ${date}, ${year}`;

  return { formattedTime, formattedDate };
}

function format(seconds) {
  function pad(s) {
    return (s < 10 ? "0" : "") + s;
  }
  var hours = Math.floor(seconds / (60 * 60));
  var minutes = Math.floor((seconds % (60 * 60)) / 60);
  var seconds = Math.floor(seconds % 60);
  return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

// Example usage
function subtractDates(inputDate, currentDate) {
  // Convert input date string to a Date object
  const inputDateTime = new Date(
    inputDate.replace(
      /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
      "$3-$1-$2T$4:$5:$6"
    )
  );

  // Extract current date and time
  const currentDateTimeMatch = currentDate.match(
    /as of (\d{1,2}):(\d{2}):(\d{2})(am|pm) on (.*), (.*), (.*)/
  );
  const currentHour = parseInt(currentDateTimeMatch[1]);
  const currentMinute = parseInt(currentDateTimeMatch[2]);
  const currentSecond = parseInt(currentDateTimeMatch[3]);
  const currentTimePeriod = currentDateTimeMatch[4];
  const currentWeekday = currentDateTimeMatch[5];
  const currentMonth = currentDateTimeMatch[6];
  const currentDay = parseInt(currentDateTimeMatch[7]);

  // Adjust current hour if it's in PM, handle 12am specifically
  let currentHourAdjusted;
  if (currentTimePeriod === "pm" && currentHour !== 12) {
    currentHourAdjusted = currentHour + 12;
  } else if (currentTimePeriod === "am" && currentHour === 12) {
    currentHourAdjusted = 0; // 12am should be 0 hours
  } else {
    currentHourAdjusted = currentHour;
  }

  // Convert current date and time to a Date object
  const currentDateTime = new Date(
    Date.parse(
      `${currentMonth} ${currentDay}, ${new Date().getFullYear()} ${currentHourAdjusted}:${currentMinute}:${currentSecond}`
    )
  );

  // Calculate the difference in milliseconds
  const differenceMs = currentDateTime - inputDateTime;

  // Convert the difference to days, hours, minutes, and seconds
  const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
  const differenceHours = Math.floor(
    (differenceMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const differenceMinutes = Math.floor(
    (differenceMs % (1000 * 60 * 60)) / (1000 * 60)
  );
  const differenceSeconds = Math.floor((differenceMs % (1000 * 60)) / 1000);

  // Format the return value based on the differences
  if (
    differenceDays === 0 &&
    differenceHours === 0 &&
    differenceMinutes === 0
  ) {
    return `${differenceSeconds}s`;
  } else if (differenceDays === 0 && differenceHours === 0) {
    return `${differenceMinutes}m ${differenceSeconds}s`;
  } else if (differenceDays === 0) {
    return `${differenceHours}h ${differenceMinutes}m ${differenceSeconds}s`;
  } else {
    return `${differenceDays}d ${differenceHours}h ${differenceMinutes}m ${differenceSeconds}s`;
  }
}

// const arrayToEmojiConversion = (array) => {
//   return array.map((value) =>
//     value === "1" ? ":red_circle:" : ":green_circle:"
//   );
// };

// const cctvs_arr_value = [...Object.values(receivedData2.cctvs.state)];
// const cctvs_arr_name = [...Object.keys(receivedData2.cctvs.state)];
// const cctvs_arr_time = [...Object.values(receivedData2.cctvs.time)];

// const devices_arr_value = [...Object.names(receivedData2.devices.state)];
// const devices_arr_name = [...Object.keys(receivedData2.devices.state)];
// const devices_arr_time = [...Object.values(receivedData2.cctvs.time)];

// var arrDevicesTimeBefore =[];
// var arrDevicesStatusBefore =[];
// var arrCctvsTimeBefore =[];
// var arrCctvsStatusBefore =[];

// const arrayToEmoji = (array) => {
//   return array.map((value) =>
//     value === "1" ? ":red_circle:" : ":green_circle:"
//   );
// };
// const arrayToEmojiForSyslogs = (array) => {
//   return array.map((value) =>
//     value === "1" ? ":green_circle:" : "PC :red_circle:"
//   );
// };

// //CHECK STATUS AND TIME BEFORE
// function arrayCheckUndefined (arrVarBefore,arrtime){
// for(let i = 0;i< arr.length;i++){
//   if (arrVarBefore[i] === undefined) {
//     arrVarBefore[i] = arrtime[i];
//   }
// }
// }
// arrayCheckUndefined(arrCctvsTimeBefore,cctvs_arr_time)
// arrayCheckUndefined(arrDevicesTimeBefore,devices_arr_time)
// arrayCheckUndefined(arrDevicesStatusBefore,devices_arr_value)
// arrayCheckUndefined(arrCctvsStatusBefore,cctvs_arr_value)

// for(let i = 0;i< arr.length;i++){
//   if (arrVarBefore[i] != arrValue[i]) {
//     if (channel2) {
//       channel2.send(
//         `${arrName[i]} ${subtractDates(pcTimeBefore, formattedDateTime)} *${formattedTime}*`
//       );
//     }
//     pcTimeBefore = pcTimeValue;
//   }
// }
// cctvs_arr_name[]

// if (pcStatusValue == 1) {
//   var pcStatusValueEmoji = ":red_circle:";
//   pcStatusBefore = "PC :green_circle:";
// } else {
//   var pcStatusValueEmoji = ":green_circle:";
//   pcStatusBefore = "PC :red_circle:";
// }

// if (pcTimeBefore === undefined) {
//   pcTimeBefore = pcTimeValue;
//   console.log("NEW PC TIMEVALUE");
// }
// if (pcStatusBefore === undefined) {
//   pcStatusBefore = pcStatusValue;
// }

// if (pcTimeBefore != pcTimeValue) {
//   //mag sesend notif sa discord is either na dc or onlnie tas papaltan ng new balue si before
//   console.log(pcTimeBefore);
//   if (channel2) {
//     channel2.send(
//       `${pcStatusBefore} ${subtractDates(pcTimeBefore, formattedDateTime)} *${formattedTime}*`
//     );
//   }
//   pcTimeBefore = pcTimeValue;
// }

module.exports = { getGMT8Time, subtractDates, format };
