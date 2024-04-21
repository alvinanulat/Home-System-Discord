const express = require("express");
const app = express();
const http = require("http");
app.use(express.json());
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const { runGeminiPro, runGeminiProVision } = require("./gemini.js");
// Define the URL
const path = require("path");
const https = require("https");

let apiCallCount = 0; // keep track of how many times we've used the API
let currentKeyIndex = 0; // keep track of which key we're using

const homeFunctions = require("./home.js");
let receivedData2;
let channel;
let channel2;
let messageId = "1213771896848392212";

let lowPingSent = false;
let mediumPingSent = false;
let veryHighPingSent = false;
let pcTimeBefore;
let pcStatusBefore;
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
  const channelId = "1213770817452904499"; // Replace with your channel ID
  channel = client.channels.cache.get(channelId);
});

function editMessage(messageId, updatedContent) {
  channel.messages
    .fetch(messageId)
    .then((message) => {
      // Edit the message with the updated content
      message
        .edit(updatedContent)
        .then((updatedMessage) =>
          console.log("Message edited successfully:", updatedMessage.content)
        )
        .catch((error) => console.error("Error editing message:", error));
    })
    .catch((error) => console.error("Error fetching message:", error));
}

client.on("ready", () => {
  // Replace 'CHANNEL ID' with your actual channel ID
  const channelId = "1213844134461186099";
  channel2 = client.channels.cache.get(channelId);
  if (channel2) {
    const { formattedTime } = homeFunctions.getGMT8Time();
    channel2.send(`**SERVER STARTED! *${formattedTime}* **`);
  }
  // Function to handle message
});

// const prefix = "!ask";

// client.on("messageCreate", (message) => {
//   dataReceivedTime = Date.now(); // Renamed for clarity
//   console.log(dataReceivedTime);

//   if (message.content.startsWith(prefix)) {
//     // Assuming 'en' is defined elsewhere
//     const question = message.content.slice(prefix.length).trim();

//     var url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINIKEY}`;
//     var requestData = {
//       contents: [{ parts: [{ text: question }] }],
//     };

//     axios
//       .post(url, requestData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((response) => {
//         console.log("Response:", response.data);
//         message.reply(`${response.data.candidates[0].content.parts[0].text}`);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   }
// });
authorizedChannels = "1230727499785441300";
authorizedUsers = "339388340153352204";
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
                  message.reply(
                    "there was an error trying to execute that command!"
                  );
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
          message.reply("there was an error trying to execute that command!");
        }
      }
    }
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
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

app.post("/api/data", (req, res) => {
  receivedData2 = req.body; // Data sent from MikroTik
  console.log("------------------------------------");
  console.log("Received data:", receivedData2);
  res.status(200).send("Data received successfully");
  const pingValue = receivedData2.ping;
  const pcStatusValue = receivedData2.pcstatus;
  const pcTimeValue = receivedData2.pctime;
  var pingstate = receivedData2.pingstate;
  const hotspotcount = receivedData2.hotspotcount;

  if (pcStatusValue == 1) {
    var pcStatusValueEmoji = ":red_circle:";
    pcstatusbefore = "PC :green_circle:";
  } else {
    var pcStatusValueEmoji = ":green_circle:";
    pcstatusbefore = "PC :red_circle:";
  }

  var devices_arr = [
    receivedData2.phone,
    receivedData2.cctv1,
    receivedData2.cctv2,
    receivedData2.cctv3,
    receivedData2.cctv4,
  ];

  var devices_arr_emoji = [];
  //BOOLEAN TO EMOJI CONVERSION
  for (let i = 0; i < 5; i++) {
    if (devices_arr[i] == 0) {
      devices_arr_emoji[i] = ":red_circle:";
    } else {
      devices_arr_emoji[i] = ":green_circle:";
    }
  }

  if (pingstate == 1) {
    pingstate = ":green_circle:";
  } else if (pingstate == 2) {
    pingstate = ":yellow_circle:";
  } else {
    pingstate = ":red_circle:";
  }

  console.log(devices_arr);
  var { formattedTime, formattedDate } = homeFunctions.getGMT8Time();
  var formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;

  var uptime = process.uptime();
  console.log(homeFunctions.format(uptime));

  const result = homeFunctions.subtractDates(pcTimeValue, formattedDateTime);
  if (pcTimeBefore === undefined) {
    pcTimeBefore = pcTimeValue;
    console.log("NEW PC TIMEVALUE");
  }
  if (pcStatusBefore === undefined) {
    pcStatusBefore = pcStatusValue;
  }

  if (pcTimeBefore != pcTimeValue) {
    //mag sesend notif sa discord is either na dc or onlnie tas papaltan ng new balue si before
    console.log(pcTimeBefore);
    if (channel2) {
      channel2.send(
        `${pcstatusbefore} ${subtractDates(pcTimeBefore, formattedDateTime)} *${formattedTime}*`
      );
    }
    pcTimeBefore = pcTimeValue;
  }
  // :movie_camera::mobile_phone:
  const resultString2 =
    `:globe_with_meridians:    **${pingValue}ms**  ${pingstate}\n` +
    `:desktop:    ${pcStatusValueEmoji} ${result}   \n` +
    `:vibration_mode:    ${devices_arr_emoji[0]}\n` +
    `:wireless:      ${hotspotcount} users\n\n` +
    `1  📹︎    ${devices_arr_emoji[1]}\n` +
    `2 📹︎    ${devices_arr_emoji[2]}\n` +
    `3 📹︎    ${devices_arr_emoji[3]}\n` +
    `4 📹︎    ${devices_arr_emoji[4]}\n\n` +
    `*${formattedDateTime}*\n` +
    `*server uptime: ${homeFunctions.format(uptime)}* `;

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
  const currentTime = Date.now();
  console.log(currentTime);
  if (currentTime - dataReceivedTime >= 19000) {
    var { formattedTime, formattedDate } = homeFunctions.getGMT8Time();
    var uptime = process.uptime();
    var formattedDateTime = `as of ${formattedTime} on ${formattedDate}`;
    const resultString3 =
      `:robot: :warning: **HOME DISCONNECTED**\n\n` +
      `*${formattedDateTime}*\n` +
      `*server uptime: ${homeFunctions.format(uptime)}* `;
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
