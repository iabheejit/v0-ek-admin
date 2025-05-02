const fetch = require("node-fetch")
require("dotenv").config()

const API_URL = process.env.URL
const API_KEY = process.env.API

// Send a text message to a user
async function sendText(msg, senderID) {
  try {
    const response = await fetch(`https://${API_URL}/api/v1/sendSessionMessage/${senderID}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageText: msg,
      }),
    })

    const data = await response.json()

    if (!data.result) {
      console.error("WATI error:", data)
    }

    return data
  } catch (error) {
    console.error("Error sending text message:", error)
    throw error
  }
}

// Send an interactive button message
async function sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, senderID) {
  try {
    const response = await fetch(`https://${API_URL}/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${senderID}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        header: {
          type: "Text",
          text: hTxt,
        },
        body: bTxt,
        buttons: [
          {
            text: btnTxt,
          },
        ],
      }),
    })

    const data = await response.json()
    console.log("Interactive button message response:", data)
    return data
  } catch (error) {
    console.error("Error sending interactive button message:", error)
    throw error
  }
}

// Send a list interactive message
async function sendListInteractive(listData, body, btnText, senderID) {
  try {
    const response = await fetch(`https://${API_URL}/api/v1/sendInteractiveListMessage?whatsappNumber=${senderID}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        header: "",
        body: body,
        footer: "",
        buttonText: btnText,
        sections: [
          {
            title: "Options",
            rows: listData,
          },
        ],
      }),
    })

    const data = await response.json()
    console.log("List interactive message response:", data)
    return data
  } catch (error) {
    console.error("Error sending list interactive message:", error)
    throw error
  }
}

// Send dynamic interactive message with multiple buttons
async function sendDynamicInteractiveMsg(data, body, senderID) {
  try {
    const response = await fetch(`https://${API_URL}/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${senderID}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: body,
        buttons: data,
      }),
    })

    const data = await response.json()
    console.log("Dynamic interactive message response:", data)
    return data
  } catch (error) {
    console.error("Error sending dynamic interactive message:", error)
    throw error
  }
}

// Get message history for a user
async function getMessages(senderID, at = 0) {
  try {
    const response = await fetch(`https://${API_URL}/api/v1/getMessages/${senderID}?pageSize=10&pageNumber=1`, {
      method: "GET",
      headers: {
        Authorization: API_KEY,
      },
    })

    const data = await response.json()

    if (data && data.messages && data.messages.items && data.messages.items[at]) {
      return data.messages.items[at]
    }

    return null
  } catch (error) {
    console.error("Error getting messages:", error)
    throw error
  }
}

// Send media file
async function sendMedia(file, filename, senderID) {
  try {
    const formData = new FormData()
    formData.append("file", file, { filename })

    const response = await fetch(`https://${API_URL}/api/v1/sendSessionFile/${senderID}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
      },
      body: formData,
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error sending media:", error)
    throw error
  }
}

// Send a template message
async function sendTemplateMessage(day, template_name, senderID) {
  try {
    const params = [{ name: "day", value: day }]

    const response = await fetch(`https://${API_URL}/api/v1/sendTemplateMessage/${senderID}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_name: template_name,
        broadcast_name: template_name,
        parameters: JSON.stringify(params),
      }),
    })

    const data = await response.json()

    if (!data.result) {
      console.error("WATI template message error:", data)
    }

    return data
  } catch (error) {
    console.error("Error sending template message:", error)
    throw error
  }
}

module.exports = {
  sendText,
  sendInteractiveButtonsMessage,
  sendMedia,
  sendListInteractive,
  sendDynamicInteractiveMsg,
  getMessages,
  sendTemplateMessage,
}
