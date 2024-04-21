function editMessage(messageId, updatedContent) {
  channel.messages
    .fetch(messageId)
    .then((message) => {
      // Edit the message with the updated content
      message
        .edit(updatedContent)
        .then(
          (updatedMessage) =>
            console.log("Message edited successfully: ", updatedMessage.content) //,
        )
        .catch((error) => console.error("Error editing message:", error));
    })
    .catch((error) => console.error("Error fetching message:", error));
}

module.exports = { editMessage };
