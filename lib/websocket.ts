// WebSocket event types for real-time updates
export interface WebSocketEvents {
  newFeedback: {
    qrId: number
    rating: number
    comment: string | null
    createdAt: string
  }
  statsUpdate: {
    qrId: number
    totalFeedbacks: number
    avgRating: number
  }
}

// Client-side WebSocket hook will be implemented in the dashboard
export const WS_EVENTS = {
  NEW_FEEDBACK: "newFeedback",
  STATS_UPDATE: "statsUpdate",
  JOIN_DASHBOARD: "joinDashboard",
  LEAVE_DASHBOARD: "leaveDashboard",
} as const
