const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const fs = require("fs");
const { runGeminiPro, runGeminiProVision } = require("./gemini.js");
const path = require("path");
const https = require("https");

const { getGMT8Time, format, subtractDates } = require("./home.js");
const { formattedTime } = getGMT8Time();
const { editMessage } = require("./discordcustom.js");

let apiCallCount = 0; // keep track of how many times we've used the API
let currentKeyIndex = 0; // keep track of which key we're using
let messageId = process.env.messageId;
let channel2;

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

client.once("ready", (c) => {
  console.log(`${c.user.tag} Ready!`);
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

client.on("ready", () => {
  channel = client.channels.cache.get(process.env.viiiinsystemschannel);
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

authorizedChannels = process.env.authorizedChannels;
authorizedUsers = process.env.authorizedUsers;

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

app.post("/api/data", (req, res) => {
  const { formattedTime, formattedDate } = getGMT8Time();
  const formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;
  const uptime = process.uptime();
  receivedData2 = req.body; // Data sent from MikroTik
  console.log("------------------------------------");
  //console.log("Received data:", receivedData2);
  res.status(200).send("Data received successfully");
  const pingValue = receivedData2.internet.ping;
  const pcStatusValue = receivedData2.devices.state.pc;
  const pcTimeValue = receivedData2.devices.time.pc;
  const phoneStatusValue = receivedData2.devices.state.phone;
  const phoneTimeValue = receivedData2.devices.time.phone;
  var pingstate = receivedData2.internet.pingstate;
  const hotspotcount = receivedData2.hotspot.hotspotcount;

  const cctvs_arr_value = [...Object.values(receivedData2.cctvs.state)];
  const cctvs_arr_name = [...Object.keys(receivedData2.cctvs.state)];
  const cctvs_arr_time = [...Object.values(receivedData2.cctvs.time)];

  const devices_arr_value = [...Object.values(receivedData2.devices.state)];
  const devices_arr_name = [...Object.keys(receivedData2.devices.state)];
  const devices_arr_time = [...Object.values(receivedData2.devices.time)];

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
    for (let i = 0; i < arrTime.length; i++) {
      if (arrTimeBefore[i] != arrTime[i]) {
        if (channel2) {
          channel2.send(
            `${arrName[i].toUpperCase()} ${arrVarBefore[i]} ${subtractDates(arrTimeBefore[i], formattedDateTime)} *${formattedTime}*`
          );
        }
        arrTimeBefore[i] = arrTime[i];
      }
    }
  }

  const cctv_arr_emoji = arrayToEmoji(cctvs_arr_value);
  const devices_arr_emoji = arrayToEmoji(devices_arr_value);
  const cctv_arr_emoji_syslog = arrayToEmojiForSyslogs(cctvs_arr_value);
  const devices_arr_emoji_syslog = arrayToEmojiForSyslogs(devices_arr_value);
  console.log("cctv emoji ", cctv_arr_emoji_syslog);
  console.log("DEV emoji ", devices_arr_emoji_syslog);

  console.log("DEV TIME BEFORE ", arrDevicesTimeBefore);
  console.log("DEV VALUE BEFORE ", arrDevicesValueBefore);
  console.log("CCTV TIME BEFORE ", arrCctvsTimeBefore);
  console.log("CCTV VALUE BEFORE ", arrCctvsValueBefore);

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
    `:vibration_mode:    ${devices_arr_emoji[0]} ${subtractDates(devices_arr_time[0], formattedDateTime)}\n` +
    `:wireless:      ${hotspotcount} users\n\n` +
    `1  📹︎    ${cctv_arr_emoji[0]} ${subtractDates(cctvs_arr_time[0], formattedDateTime)}\n` +
    `2 📹︎    ${cctv_arr_emoji[1]} ${subtractDates(cctvs_arr_time[1], formattedDateTime)}\n` +
    `3 📹︎    ${cctv_arr_emoji[2]} ${subtractDates(cctvs_arr_time[2], formattedDateTime)}\n` +
    `4 📹︎    ${cctv_arr_emoji[3]} ${subtractDates(cctvs_arr_time[3], formattedDateTime)}\n\n` +
    `*${formattedDateTime}*\n` +
    `*server uptime: ${format(uptime)}* `;

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
    editMessage(messageId, resultString2);
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
setInterval(() => {
  const { formattedTime, formattedDate } = getGMT8Time();
  const formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;
  const uptime = process.uptime();
  const currentTime = Date.now();
  console.log(currentTime);
  if (currentTime - dataReceivedTime >= 19000) {
    const resultString3 =
      `:robot: :warning: **HOME DISCONNECTED**\n\n` +
      `*${formattedDateTime}*\n` +
      `*server uptime: ${format(uptime)}* `;
    console.log("No new data received within 20 seconds.");
    if (messageId) {
      editMessage(messageId, resultString3);
    }
    if (channel2 && !homedc) {
      channel2.send(`**HOME DISCONNECTED** *${formattedTime}*`);
      homedc = true;
      // Reset ping flags for potential reconnection
    }
  }
}, 10000);

client.login(process.env.BOT_TOKEN);
