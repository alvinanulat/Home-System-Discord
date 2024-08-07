const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const fs = require("fs");
const { runGeminiPro, runGeminiProVision } = require("./gemini.js");
const path = require("path");
const https = require("https");
const CronJob = require("cron").CronJob;

let basket1json = "./json/basket1.json";
let basket2json = "./json/basket2.json";
let basket1read = fs.readFileSync("./json/basket1.json");
let basket2read = fs.readFileSync("./json/basket2.json");
let resultstringglobal;
let headerping;
const {
  getGMT8Time,
  format,
  subtractDates,
  calculateTotalDuration,
  convertTimeStringToSeconds,
  secondsToFormattedTimeString,
} = require("./home.js");

const { formattedTime, hours, seconds } = getGMT8Time();
const { editMessage } = require("./discordcustom.js");

let apiCallCount = 0; // keep track of how many times we've used the API
let currentKeyIndex = 0; // keep track of which key we're using
let messageId = process.env.messageId;
let channel2;
let channel;

let receivedData2;
let lowPingSent = false;
let mediumPingSent = false;
let veryHighPingSent = false;

let homedc = false;
let dataReceivedTime = null;

const { Client, GatewayIntentBits, ChannelType } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PORT = process.env.PORT || 3949;

client.login(process.env.BOT_TOKEN);

client.once("ready", (c) => {
  console.log(`${c.user.tag} Ready!`);
  channel = client.channels.cache.get(process.env.viiiinsystemschannel);
  console.log(channel);
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  dataReceivedTime = Date.now(); // Renamed for clarity
  console.log(dataReceivedTime);
});

client.on("ready", () => {
  // Replace 'CHANNEL ID' with your actual channel ID
  channel2 = client.channels.cache.get(process.env.viiiinsystemsthread);
  if (channel2) {
    //const { formattedTime } = getGMT8Time();
    channel2.send(`**SERVER STARTED! *${formattedTime}* **`);
  }
  // Function to handle message
});

let cctv_arr_emoji_glo;
let devices_arr_emoji_glo;
let cctvs_arr_time_glo;
let devices_arr_time_glo;
let devices_arr_name_glo;
let cctvs_arr_name_glo;
let totalDurationjson2;
function myFunction() {
  const { formattedTime, formattedDate } = getGMT8Time();
  const formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;
  const updatedPayload = {};
  function array12amlogger(arrName, emoji, arrTime) {
    for (let i = 0; i < arrTime.length; i++) {
      if (emoji[i] === ":green_circle:") {
        updatedPayload[arrName[i]] = {
          on: [subtractDates(arrTime[i], formattedDateTime)],
          off: [],
        };
      } else {
        updatedPayload[arrName[i]] = {
          on: [],
          off: [subtractDates(arrTime[i], formattedDateTime)],
        };
      }
    }
    const mergedPayload = { ...payloadtemplate, ...updatedPayload };
    return mergedPayload;
  }
  const payloadtemplate = {
    cctv0: {
      on: [],
      off: [],
    },
    cctv1: {
      on: [],
      off: [],
    },
    cctv2: {
      on: [],
      off: [],
    },
    cctv3: {
      on: [],
      off: [],
    },
    phone: {
      on: [],
      off: [],
    },
    pc: {
      on: [],
      off: [],
    },
    laptop: {
      on: [],
      off: [],
    },
  };

  array12amlogger(
    devices_arr_name_glo,
    devices_arr_emoji_glo,
    devices_arr_time_glo
  );

  array12amlogger(cctvs_arr_name_glo, cctv_arr_emoji_glo, cctvs_arr_time_glo);

  fs.writeFileSync(basket2json, JSON.stringify(updatedPayload, null, 2));
  console.log("12AM FUNCTION START");
  let basket1read = fs.readFileSync("./json/basket1.json");
  const jsonParsed = JSON.parse(basket1read);
  let newData = updatedPayload;
  console.log("newData\n", newData);
  const mergedData = {};
  for (const key in jsonParsed) {
    mergedData[key] = {
      on: [...jsonParsed[key].on, ...newData[key].on],
      off: [...jsonParsed[key].off, ...newData[key].off],
    };
  }
  console.log("mergedData\n", mergedData);
  fs.writeFileSync(basket1json, JSON.stringify(mergedData), null, 2);

  const jsonParsed2 = calculateTotalDuration(mergedData);
  const formattedData = Object.entries(jsonParsed2).map(
    ([device, durations]) => {
      const onDuration = durations.totalOnDuration;
      const offDuration = durations.totalOffDuration;
      return `${device.toUpperCase()} :green_circle: ${onDuration} :red_circle: ${offDuration}`;
    }
  );
  console.log("jsonParsed2\n", jsonParsed2);
  console.log("formattedData\n", formattedData);
  // Join the formatted data with line breaks
  const result = formattedData.join("\n> ");
  if (channel2) {
    const { formattedDate } = getGMT8Time();
    channel2.send(`**${formattedDate}** \n> ${result}`);
    fs.writeFileSync(basket1json, JSON.stringify(payloadtemplate, null, 2));
  }
}

job = new CronJob(`0 0 16 * * *`, () => {
  myFunction();
  console.log("12AM FUNCTION END");
});

job.start();
authorizedChannels = process.env.authorizedChannels;
authorizedUsers = process.env.authorizedUsers;

//AI BOT
client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (
      message.channel.type === ChannelType.DM &&
      authorizedUsers.includes(message.channel.id)
    ) {
      message.reply("Yow, ano mahehelp ko?");
    }
    if (
      message.channel.type === ChannelType.GuildText &&
      authorizedChannels.includes(message.channel.id)
    ) {
      //const userId = message.author.id;
      //message.reply(`Yow, <@${userId}> ano mahehelp ko?`);
      const prompt = message.content;
      let localPath = null;
      let mimeType = null;

      //vision model
      if (message.attachments.size > 0) {
        let attachment = message.attachments.first(); // get the first attachment
        let url = attachment.url; // get the attachment URL
        mimeType = attachment.contentType; // get the MIME type
        let filename = attachment.name; // get the filename

        // Define the path where the file will be saved
        localPath = path.join(__dirname, "image", filename);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(localPath), { recursive: true });

        // Download the file
        let file = fs.createWriteStream(localPath);
        https.get(url, function (response) {
          response.pipe(file);
          file.on("finish", async function () {
            file.close(async () => {
              // close() is async, call runGeminiVision() here
              // Get file stats
              const stats = fs.statSync(localPath);
              // Get file size in bytes
              const fileSizeInBytes = stats.size;
              // Check if file size exceeds limit
              if (fileSizeInBytes > 3145728) {
                // File size exceeds limit, handle accordingly
                message.reply(
                  "The provided image is too large. Please provide an image smaller than 4M"
                );
              } else {
                // File size is within limit, proceed with runGeminiVision
                try {
                  const result = await runGeminiProVision(
                    prompt,
                    localPath,
                    mimeType,
                    currentKeyIndex
                  );
                  apiCallCount++;
                  // If the API call count reaches 60, switch to the next key
                  if (apiCallCount >= 60) {
                    currentKeyIndex++;
                    apiCallCount = 0;
                    // If the current key index exceeds the length of the keys array, reset it to 0
                    if (currentKeyIndex >= geminiApiKeys.length) {
                      currentKeyIndex = 0;
                    }
                  }
                  const responseChunks = splitResponse(result);
                  for (const chunk of responseChunks) {
                    await message.reply(chunk);
                  }
                } catch (error) {
                  console.error(error);
                  message.reply("Error pare paulit hehe");
                }
              }
            });
          });
        });
      } else {
        try {
          const result = await runGeminiPro(prompt, currentKeyIndex);
          apiCallCount++;
          // If the API call count reaches 60, switch to the next key
          if (apiCallCount >= 60) {
            currentKeyIndex++;
            apiCallCount = 0;
            // If the current key index exceeds the length of the keys array, reset it to 0
            if (currentKeyIndex >= geminiApiKeys.length) {
              currentKeyIndex = 0;
            }
          }
          const responseChunks = splitResponse(result);
          for (const chunk of responseChunks) {
            await message.reply(chunk);
          }
        } catch (error) {
          console.error(error);
          message.reply("Error pare paulit hehe");
        }
      }
    }
  } catch (error) {
    console.error(error);
    message.reply("Error pare paulit hehe");
  }
});

function splitResponse(response) {
  const maxChunkLength = 2000;
  let chunks = [];

  for (let i = 0; i < response.length; i += maxChunkLength) {
    chunks.push(response.substring(i, i + maxChunkLength));
  }
  return chunks;
}

var arrDevicesTimeBefore = [];
var arrDevicesValueBefore = [];
var arrCctvsTimeBefore = [];
var arrCctvsValueBefore = [];

let pingValue;
let payload;

app.get("/", (req, res) => {
  // Send a simple HTML response or any content you want for the root path
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="refresh" content="5">
      <title>${headerping}</title>
    </head>
    <body>
      <div id="result">${resultstringglobal}</div>
    </body>
    </html>
  `);
  // Or set a status code explicitly (optional)
  // res.status(200).send('...');
});

app.post("/api/data/", (req, res) => {
  const { formattedTime, formattedDate } = getGMT8Time();
  const formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;
  const uptime = process.uptime();
  receivedData2 = req.body; // Data sent from MikroTik
  console.log("------------------------------------");
  //console.log("Received data:", receivedData2);
  res.status(200).send("Data received successfully");
  console.log("RAW RECEIVED DATA\n", receivedData2);

  try {
    const pingValuetest = receivedData2.internet.ping;
  } catch (e) {
    const keys = Object.keys(receivedData2);
    receivedData2 = JSON.parse(keys[0]);
    //console.log(receivedData2);
    // Code to handle the error (optional)
  }

  const pingValue = receivedData2.internet.ping;
  var pingstate = receivedData2.internet.pingstate;
  const hotspotcount = receivedData2.hotspot.hotspotcount;

  const cctvs_arr_value = [...Object.values(receivedData2.cctvs.state)];
  const cctvs_arr_name = [...Object.keys(receivedData2.cctvs.state)];
  const cctvs_arr_time = [...Object.values(receivedData2.cctvs.time)];
  cctvs_arr_name_glo = cctvs_arr_name;

  const devices_arr_value = [...Object.values(receivedData2.devices.state)];
  const devices_arr_name = [...Object.keys(receivedData2.devices.state)];
  const devices_arr_time = [...Object.values(receivedData2.devices.time)];
  devices_arr_name_glo = devices_arr_name;
  const arrayToEmoji = (array) => {
    return array.map((value) =>
      value === "1" ? ":red_circle:" : ":green_circle:"
    );
  };
  const arrayToEmojiForSyslogs = (array) => {
    return array.map((value) =>
      value === "1" ? ":green_circle:" : ":red_circle:"
    );
  };
  function arrayCheckUndefined(arrVarBefore, arrtime) {
    for (let i = 0; i < arrtime.length; i++) {
      if (arrVarBefore[i] === undefined) {
        arrVarBefore.push(arrtime[i]);
      }
    }
  }

  function arrayDiscordSyslog(arrTime, arrName, arrVarBefore, arrTimeBefore) {
    let basket1read = fs.readFileSync("./json/basket1.json");
    let basket2read = fs.readFileSync("./json/basket2.json");
    let jsonParsed2 = {};
    let jsonParsed1 = {};
    jsonParsed1 = JSON.parse(basket1read);
    jsonParsed2 = JSON.parse(basket2read);

    let cctvName;
    let propertyToCheck;
    let hasValue;
    let hasValue1;
    let hasValue2;
    for (let i = 0; i < arrTime.length; i++) {
      cctvName = arrName[i];
      if (arrTimeBefore[i] != arrTime[i]) {
        if (arrVarBefore[i] === ":green_circle:") {
          propertyToCheck = "on";
          console.log(propertyToCheck);
          hasValue1 = jsonParsed1[cctvName]["on"].length > 0;
          hasValue2 = jsonParsed1[cctvName]["off"].length > 0;
          hasValue = hasValue1 || hasValue2;
          console.log(hasValue);
          if (hasValue) {
            jsonParsed1[arrName[i]]["on"].push(
              subtractDates(arrTimeBefore[i], formattedDateTime)
            );
            console.log(subtractDates(arrTimeBefore[i], formattedDateTime));
          } else {
            const convertTimeBasket = subtractDates(
              arrTimeBefore[i],
              formattedDateTime
            );

            const convertTimeBasket2 =
              jsonParsed2[arrName[i]][propertyToCheck][0];
            const totalSeconds =
              convertTimeStringToSeconds(convertTimeBasket) -
              convertTimeStringToSeconds(convertTimeBasket2);
            const formattedTime = secondsToFormattedTimeString(totalSeconds);
            jsonParsed1[arrName[i]]["on"].push(formattedTime);
            console.log(
              `${convertTimeBasket}, ${convertTimeBasket2}, ${totalSeconds} ,  ${formattedTime}`
            );
          }
        } else {
          propertyToCheck = "off";
          console.log(propertyToCheck);
          hasValue1 = jsonParsed1[cctvName]["on"].length > 0;
          hasValue2 = jsonParsed1[cctvName]["off"].length > 0;
          hasValue = hasValue1 || hasValue2;
          console.log(hasValue);
          if (hasValue) {
            jsonParsed1[arrName[i]]["off"].push(
              subtractDates(arrTimeBefore[i], formattedDateTime)
            );
            console.log(subtractDates(arrTimeBefore[i], formattedDateTime));
          } else {
            const convertTimeBasket = subtractDates(
              arrTimeBefore[i],
              formattedDateTime
            );
            const convertTimeBasket2 =
              jsonParsed2[arrName[i]][propertyToCheck][0];
            const totalSeconds =
              convertTimeStringToSeconds(convertTimeBasket) -
              convertTimeStringToSeconds(convertTimeBasket2);
            const formattedTime = secondsToFormattedTimeString(totalSeconds);
            jsonParsed1[arrName[i]]["off"].push(formattedTime);
            console.log(
              `${convertTimeBasket}, ${convertTimeBasket2}, ${totalSeconds} ,  ${formattedTime}`
            );
          }
        }
        fs.writeFileSync(basket1json, JSON.stringify(jsonParsed1), null, 2);
        if (channel2) {
          channel2.send(
            `${arrName[i].toUpperCase()} ${arrVarBefore[i]} ${subtractDates(arrTimeBefore[i], formattedDateTime)} *${formattedTime}*`
          );
        }
        arrTimeBefore[i] = arrTime[i];
      }
    }
  }

  let basket1read = fs.readFileSync("./json/basket1.json");
  let basket2read = fs.readFileSync("./json/basket2.json");
  console.log("BASKET 1\n", JSON.parse(basket1read));
  console.log("BASKET 2\n", JSON.parse(basket2read));

  const cctv_arr_emoji = arrayToEmoji(cctvs_arr_value);
  const devices_arr_emoji = arrayToEmoji(devices_arr_value);
  const cctv_arr_emoji_syslog = arrayToEmojiForSyslogs(cctvs_arr_value);
  const devices_arr_emoji_syslog = arrayToEmojiForSyslogs(devices_arr_value);

  arrayCheckUndefined(arrCctvsTimeBefore, cctvs_arr_time);
  arrayCheckUndefined(arrDevicesTimeBefore, devices_arr_time);
  arrayCheckUndefined(arrDevicesValueBefore, devices_arr_value);
  arrayCheckUndefined(arrCctvsValueBefore, cctvs_arr_value);

  arrayDiscordSyslog(
    cctvs_arr_time,
    cctvs_arr_name,
    cctv_arr_emoji_syslog,
    arrCctvsTimeBefore
  );
  arrayDiscordSyslog(
    devices_arr_time,
    devices_arr_name,
    devices_arr_emoji_syslog,
    arrDevicesTimeBefore
  );

  pingstate =
    pingstate === "1"
      ? ":green_circle:"
      : pingstate === "2"
        ? ":yellow_circle:"
        : ":red_circle:";

  console.log(devices_arr_emoji);
  console.log(format(uptime));

  // :movie_camera::mobile_phone:
  const resultString2 =
    `:globe_with_meridians:    **${pingValue}ms**  ${pingstate}\n` +
    `:desktop:    ${devices_arr_emoji[1]} ${subtractDates(devices_arr_time[1], formattedDateTime)}   \n` +
    `:computer:    ${devices_arr_emoji[2]} ${subtractDates(devices_arr_time[2], formattedDateTime)}   \n` +
    `:vibration_mode:    ${devices_arr_emoji[0]} ${subtractDates(devices_arr_time[0], formattedDateTime)}\n` +
    `:wireless:      ${hotspotcount} users\n\n` +
    `1  📹︎    ${cctv_arr_emoji[0]} ${subtractDates(cctvs_arr_time[0], formattedDateTime)}\n` +
    `2 📹︎    ${cctv_arr_emoji[1]} ${subtractDates(cctvs_arr_time[1], formattedDateTime)}\n` +
    `3 📹︎    ${cctv_arr_emoji[2]} ${subtractDates(cctvs_arr_time[2], formattedDateTime)}\n` +
    `4 📹︎    ${cctv_arr_emoji[3]} ${subtractDates(cctvs_arr_time[3], formattedDateTime)}\n\n` +
    `*${formattedDateTime}*\n` +
    `*server uptime: ${format(uptime)}* `;

  const inputString =
    `🌐    ${pingValue}ms</b>  ${pingstate}<br>` +
    `💻    ${devices_arr_emoji[1]} ${subtractDates(devices_arr_time[1], formattedDateTime)}   <br>` +
    `👨‍💻    ${devices_arr_emoji[2]} ${subtractDates(devices_arr_time[2], formattedDateTime)}   <br>` +
    `📱    ${devices_arr_emoji[0]} ${subtractDates(devices_arr_time[0], formattedDateTime)}<br>` +
    `🛜      ${hotspotcount} users<br><br>` +
    `1  📹︎    ${cctv_arr_emoji[0]} ${subtractDates(cctvs_arr_time[0], formattedDateTime)}<br>` +
    `2 📹︎    ${cctv_arr_emoji[1]} ${subtractDates(cctvs_arr_time[1], formattedDateTime)}<br>` +
    `3 📹︎    ${cctv_arr_emoji[2]} ${subtractDates(cctvs_arr_time[2], formattedDateTime)}<br>` +
    `4 📹︎    ${cctv_arr_emoji[3]} ${subtractDates(cctvs_arr_time[3], formattedDateTime)}<br><br>` +
    `<i>${formattedDateTime}</i><br>` +
    `<i>server uptime: ${format(uptime)}</i> `;
  const emojiMap = {
    ":green_circle:": "🟢",
    ":red_circle:": "🔴",
    ":yellow_circle:": "🟡", // Add the red circle emoji mapping
    // Add more mappings as needed
  };

  resultstringglobal = inputString.replace(
    /(:green_circle:|:red_circle:|:yellow_circle:)/g,
    (match) => emojiMap[match]
  );

  headerping = `${pingstate} ${pingValue}ms | ${hotspotcount} users`;
  headerping = headerping.replace(
    /(:green_circle:|:red_circle:|:yellow_circle:)/g,
    (match) => emojiMap[match]
  );
  cctv_arr_emoji_glo = arrayToEmoji(cctvs_arr_value);
  devices_arr_emoji_glo = arrayToEmoji(devices_arr_value);
  cctvs_arr_time_glo = cctvs_arr_time;
  devices_arr_time_glo = devices_arr_time;

  // Condition 1: Ping < 25
  if (pingValue < 25 && !lowPingSent) {
    if (channel2) {
      channel2.send(`LOW PING! ${pingValue}ms *${formattedTime}*`);
      lowPingSent = true;
      mediumPingSent = false;
      veryHighPingSent = false;
    } else {
      console.error("Channel not found.");
    }
  }

  // Condition 2: Ping < 50
  else if (pingValue >= 25 && pingValue < 100 && !mediumPingSent) {
    if (channel2) {
      channel2.send(`MEDIUM PING! ${pingValue}ms *${formattedTime}*`);
      mediumPingSent = true;
      veryHighPingSent = false;
      lowPingSent = false;
    } else {
      console.error("Channel not found.");
    }
  }

  // Condition 3: Ping > 100
  else if (pingValue > 100 && !veryHighPingSent) {
    if (channel2) {
      channel2.send(`HIGH PING! ${pingValue}ms *${formattedTime}*`);
      veryHighPingSent = true;
      mediumPingSent = false;
      lowPingSent = false;
    } else {
      console.error("Channel not found.");
    }
  }

  if (messageId) {
    try {
      editMessage2(resultString2);
    } catch (error) {
      console.log("Error fetching or editing message:", error);
    }
  } else {
    console.log("Message ID is not available. Cannot edit message.");
  }

  dataReceivedTime = Date.now(); // Renamed for clarity
  console.log(dataReceivedTime);

  if (channel2 && homedc) {
    channel2.send(`**HOME RECONNECTED** *${formattedTime}*`);
    // Reset ping flags for potential reconnection
    homedc = false;
  }
});

async function editMessage2(updatedMessage) {
  const message = await client.channels.cache
    .get(process.env.viiiinsystemschannel)
    .messages.fetch(messageId);
  await message.edit(updatedMessage);
  //console.log("Message edited Successfully", updatedMessage);
}

async function checkHomeConnection() {
  if (channel) {
    const { formattedTime, formattedDate } = getGMT8Time();
    const formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;
    const uptime = process.uptime();
    const currentTime = Date.now();
    console.log(currentTime);

    if (currentTime - dataReceivedTime >= 19000) {
      console.log("-20000 MEN");
      const resultString3 =
        `:robot: :warning: **HOME DISCONNECTED**\n\n` +
        `*${formattedDateTime}*\n` +
        `*server uptime: ${format(uptime)}* `;

      if (messageId) {
        console.log(messageId);
        try {
          const message = await client.channels.cache
            .get(process.env.viiiinsystemschannel)
            .messages.fetch(messageId);
          await message.edit(resultString3);
          console.log("Message edited Successfully", resultString3);
        } catch (error) {
          console.log("Error fetching or editing message:", error);
        }
      }
      if (channel2 && !homedc) {
        channel2.send(`**HOME DISCONNECTED** *${formattedTime}*`);
        homedc = true;
        // Reset ping flags for potential reconnection
      }
    }
  }
}
setInterval(() => {
  checkHomeConnection();
}, 10000);
