<<<<<<< HEAD
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
=======
export const watiService = {
  // Send a text message to a user
  sendText: async (number: string, message: string) => {
    try {
      const response = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/v1/sendSessionMessage/${number}`,
          method: "POST",
          body: {
            messageText: message,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error sending text message:", error)
      throw error
    }
>>>>>>> 1970ee7 (Initial commit)
  },

  // Send an interactive button message
  sendInteractiveButtonsMessage: async (number: string, headerText: string, bodyText: string, buttonText: string) => {
<<<<<<< HEAD
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
=======
    try {
      const response = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${number}`,
          method: "POST",
          body: {
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
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error sending interactive buttons message:", error)
      throw error
    }
>>>>>>> 1970ee7 (Initial commit)
  },

  // Send a list interactive message
  sendListInteractive: async (number: string, data: any[], body: string, btnText: string) => {
<<<<<<< HEAD
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
=======
    try {
      const response = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/v1/sendInteractiveListMessage?whatsappNumber=${number}`,
          method: "POST",
          body: {
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
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error sending list interactive message:", error)
      throw error
    }
>>>>>>> 1970ee7 (Initial commit)
  },

  // Send dynamic interactive message with multiple buttons
  sendDynamicInteractiveMsg: async (number: string, data: any[], body: string) => {
<<<<<<< HEAD
    return callWatiApi(`/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${number}`, "POST", {
      body: body,
      buttons: data,
    })
=======
    try {
      const response = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${number}`,
          method: "POST",
          body: {
            body: body,
            buttons: data,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error sending dynamic interactive message:", error)
      throw error
    }
>>>>>>> 1970ee7 (Initial commit)
  },

  // Get message history for a user
  getMessages: async (number: string, pageSize = 10, pageNumber = 1) => {
<<<<<<< HEAD
    return callWatiApi(`/api/v1/getMessages/${number}?pageSize=${pageSize}&pageNumber=${pageNumber}`)
=======
    try {
      const response = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/v1/getMessages/${number}?pageSize=${pageSize}&pageNumber=${pageNumber}`,
          method: "GET",
        }),
      })

      if (!response.ok) {
        throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error getting messages:", error)
      throw error
    }
>>>>>>> 1970ee7 (Initial commit)
  },

  // Send a template message
  sendTemplateMessage: async (number: string, templateName: string, parameters: any[]) => {
<<<<<<< HEAD
    return callWatiApi(`/api/v1/sendTemplateMessage/${number}`, "POST", {
      template_name: templateName,
      broadcast_name: templateName,
      parameters: JSON.stringify(parameters),
    })
=======
    try {
      const response = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: `/api/v1/sendTemplateMessage/${number}`,
          method: "POST",
          body: {
            template_name: templateName,
            broadcast_name: templateName,
            parameters: JSON.stringify(parameters),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error sending template message:", error)
      throw error
    }
>>>>>>> 1970ee7 (Initial commit)
  },
}

export default watiService
