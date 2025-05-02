// This service handles interactions with the WATI API
// It's similar to the original Python wati_service.py

export const watiService = {
  // Send a text message to a user
  sendText: async (number: string, message: string) => {
    const response = await fetch("/api/wati/send-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, message }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send text: ${response.statusText}`)
    }

    return await response.json()
  },

  // Send an interactive button message
  sendInteractiveButtonsMessage: async (number: string, headerText: string, bodyText: string, buttonText: string) => {
    const response = await fetch("/api/wati/send-interactive-buttons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, headerText, bodyText, buttonText }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send interactive buttons: ${response.statusText}`)
    }

    return await response.json()
  },

  // Send a list interactive message
  sendListInteractive: async (number: string, data: any[], body: string, btnText: string) => {
    const response = await fetch("/api/wati/send-list-interactive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, data, body, btnText }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send list interactive: ${response.statusText}`)
    }

    return await response.json()
  },

  // Send dynamic interactive message with multiple buttons
  sendDynamicInteractiveMsg: async (number: string, data: any[], body: string) => {
    const response = await fetch("/api/wati/send-dynamic-interactive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, data, body }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send dynamic interactive: ${response.statusText}`)
    }

    return await response.json()
  },

  // Get message history for a user
  getMessages: async (number: string, pageSize = 10, pageNumber = 1) => {
    const response = await fetch(
      `/api/wati/get-messages?number=${number}&pageSize=${pageSize}&pageNumber=${pageNumber}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`)
    }

    return await response.json()
  },

  // Send a template message
  sendTemplateMessage: async (number: string, templateName: string, parameters: any[]) => {
    const response = await fetch("/api/wati/send-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, templateName, parameters }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send template: ${response.statusText}`)
    }

    return await response.json()
  },
}
