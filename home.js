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

  return { formattedTime, formattedDate, hours, seconds };
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

function formatTime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let formattedTime = "";
  if (days > 0) {
    formattedTime += `${days}d `;
  }
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `;
  }
  formattedTime += `${seconds}s`;

  return formattedTime;
}

function calculateTotalDuration(data) {
  const result = {};

  // Helper function to parse duration strings (e.g., "2d 22h 11m 13s")
  function parseDuration(duration) {
    const parts = duration.split(" ");
    let totalSeconds = 0;

    for (const part of parts) {
      if (part.includes("d")) {
        totalSeconds += parseInt(part) * 24 * 60 * 60;
      } else if (part.includes("h")) {
        totalSeconds += parseInt(part) * 60 * 60;
      } else if (part.includes("m")) {
        totalSeconds += parseInt(part) * 60;
      } else if (part.includes("s")) {
        totalSeconds += parseInt(part);
      }
    }

    return totalSeconds;
  }

  // Iterate through each device (cctv0, cctv1, etc.)
  for (const device in data) {
    const onDurations = data[device].on || []; // Handle cases where 'on' is undefined
    const offDurations = data[device].off || []; // Handle cases where 'off' is undefined

    // Calculate total duration for "on" state
    const totalOnDuration = onDurations.reduce(
      (acc, duration) => acc + parseDuration(duration),
      0
    );

    // Calculate total duration for "off" state
    const totalOffDuration = offDurations.reduce(
      (acc, duration) => acc + parseDuration(duration),
      0
    );

    // Convert to days, hours, minutes, and seconds
    const onDurationFormatted = `${formatTime(totalOnDuration)}`;
    const offDurationFormatted = `${formatTime(totalOffDuration)}`;

    // Store the results
    result[device] = {
      totalOnDuration: onDurationFormatted,
      totalOffDuration: offDurationFormatted,
    };
  }

  return result;
}

/**
 * Converts a time string in the format "1d 5h 7m 53s" to seconds.
 * @param {string} timeString - The input time string.
 * @returns {number} The total time in seconds.
 */
function convertTimeStringToSeconds(timeString) {
  const timeParts = timeString.split(" ");

  let totalSeconds = 0;

  for (const part of timeParts) {
    const value = parseInt(part);
    if (part.endsWith("d")) {
      totalSeconds += value * 24 * 60 * 60; // Convert days to seconds
    } else if (part.endsWith("h")) {
      totalSeconds += value * 60 * 60; // Convert hours to seconds
    } else if (part.endsWith("m")) {
      totalSeconds += value * 60; // Convert minutes to seconds
    } else if (part.endsWith("s")) {
      totalSeconds += value; // Seconds
    }
  }

  return totalSeconds;
}

/**
 * Converts total seconds to a formatted time string (1d 5h 4m 53s).
 * @param {number} totalSeconds - The total seconds to convert.
 * @returns {string} The formatted time string.
 */ function secondsToFormattedTimeString(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400); // 86400 seconds in a day
  const remainingSeconds = totalSeconds % 86400;

  const hours = Math.floor(remainingSeconds / 3600); // 3600 seconds in an hour
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  let formattedString = "";
  if (days > 0) {
    formattedString += `${days}d `;
  }
  if (hours > 0) {
    formattedString += `${hours}h `;
  }
  if (minutes > 0) {
    formattedString += `${minutes}m `;
  }
  if (seconds > 0) {
    formattedString += `${seconds}s`;
  }

  return formattedString.trim();
}

module.exports = {
  getGMT8Time,
  subtractDates,
  format,
  formatTime,
  calculateTotalDuration,
  convertTimeStringToSeconds,
  secondsToFormattedTimeString,
};
