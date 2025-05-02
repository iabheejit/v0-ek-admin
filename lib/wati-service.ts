/**
 * Service for interacting with the WATI API through our secure proxy
 */

// Base function to call our proxy endpoint
async function callWatiApi(endpoint: string, method = "GET", body?: any) {
  try {
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        method,
        body,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `WATI API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("WATI API request failed:", error)
    throw error
  }
}

// WATI API service with methods that match your backend functionality
export const watiService = {
  // Send a text message to a user
  sendText: async (number: string, message: string) => {
    return callWatiApi(`/api/v1/sendSessionMessage/${number}`, "POST", {
      messageText: message,
    })
  },

  // Send an interactive button message
  sendInteractiveButtonsMessage: async (number: string, headerText: string, bodyText: string, buttonText: string) => {
    return callWatiApi(`/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${number}`, "POST", {
      header: {
        type: "Text",
        text: headerText,
      },
      body: bodyText,
      buttons: [
        {
          text: buttonText,
        },
      ],
    })
  },

  // Send a list interactive message
  sendListInteractive: async (number: string, data: any[], body: string, btnText: string) => {
    return callWatiApi(`/api/v1/sendInteractiveListMessage?whatsappNumber=${number}`, "POST", {
      header: "",
      body: body,
      footer: "",
      buttonText: btnText,
      sections: [
        {
          title: "Options",
          rows: data,
        },
      ],
    })
  },

  // Send dynamic interactive message with multiple buttons
  sendDynamicInteractiveMsg: async (number: string, data: any[], body: string) => {
    return callWatiApi(`/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${number}`, "POST", {
      body: body,
      buttons: data,
    })
  },

  // Get message history for a user
  getMessages: async (number: string, pageSize = 10, pageNumber = 1) => {
    return callWatiApi(`/api/v1/getMessages/${number}?pageSize=${pageSize}&pageNumber=${pageNumber}`)
  },

  // Send a template message
  sendTemplateMessage: async (number: string, templateName: string, parameters: any[]) => {
    return callWatiApi(`/api/v1/sendTemplateMessage/${number}`, "POST", {
      template_name: templateName,
      broadcast_name: templateName,
      parameters: JSON.stringify(parameters),
    })
  },
}

export default watiService
