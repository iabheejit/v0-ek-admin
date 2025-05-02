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
  },

  // Send an interactive button message
  sendInteractiveButtonsMessage: async (number: string, headerText: string, bodyText: string, buttonText: string) => {
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
  },

  // Send a list interactive message
  sendListInteractive: async (number: string, data: any[], body: string, btnText: string) => {
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
  },

  // Send dynamic interactive message with multiple buttons
  sendDynamicInteractiveMsg: async (number: string, data: any[], body: string) => {
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
  },

  // Get message history for a user
  getMessages: async (number: string, pageSize = 10, pageNumber = 1) => {
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
  },

  // Send a template message
  sendTemplateMessage: async (number: string, templateName: string, parameters: any[]) => {
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
  },
}

export default watiService
