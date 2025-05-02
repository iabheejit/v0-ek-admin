/**
 * API client for making requests to the backend
 * This ensures all sensitive API calls are proxied through the backend
 * rather than exposing tokens in the frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

// Generic fetch wrapper with error handling
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // Add any auth headers needed for your backend
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// User-related API calls
export const userApi = {
  getUsers: async (page = 1, limit = 10, search = "") => {
    return fetchWithAuth(`/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
  },

  getUserById: async (userId: string) => {
    return fetchWithAuth(`/api/users/${userId}`)
  },

  getUserProgress: async (userId: string) => {
    return fetchWithAuth(`/api/users/${userId}/progress`)
  },

  getUserMessages: async (userId: string) => {
    return fetchWithAuth(`/api/users/${userId}/messages`)
  },

  sendMessage: async (userId: string, message: string) => {
    return fetchWithAuth(`/api/users/${userId}/message`, {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  },
}

// Course content API calls
export const contentApi = {
  getCourses: async () => {
    return fetchWithAuth("/api/courses")
  },

  getCourseById: async (courseId: string) => {
    return fetchWithAuth(`/api/courses/${courseId}`)
  },

  getCourseDays: async (courseId: string) => {
    return fetchWithAuth(`/api/courses/${courseId}/days`)
  },

  getDayModules: async (courseId: string, dayId: number) => {
    return fetchWithAuth(`/api/courses/${courseId}/days/${dayId}/modules`)
  },

  getModuleContent: async (courseId: string, dayId: number, moduleId: number) => {
    return fetchWithAuth(`/api/courses/${courseId}/days/${dayId}/modules/${moduleId}`)
  },

  updateModuleContent: async (courseId: string, dayId: number, moduleId: number, content: any) => {
    return fetchWithAuth(`/api/courses/${courseId}/days/${dayId}/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(content),
    })
  },

  uploadMedia: async (formData: FormData) => {
    return fetchWithAuth("/api/media/upload", {
      method: "POST",
      headers: {}, // Let the browser set the content type for form data
      body: formData,
    })
  },
}

// Analytics API calls
export const analyticsApi = {
  getDashboardMetrics: async () => {
    return fetchWithAuth("/api/metrics/dashboard")
  },

  getCompletionRates: async (timeframe = "30days") => {
    return fetchWithAuth(`/api/metrics/completion?timeframe=${timeframe}`)
  },

  getEngagementMetrics: async (timeframe = "7days") => {
    return fetchWithAuth(`/api/metrics/engagement?timeframe=${timeframe}`)
  },

  getResponseAnalytics: async () => {
    return fetchWithAuth("/api/metrics/responses")
  },
}

export default {
  user: userApi,
  content: contentApi,
  analytics: analyticsApi,
}
