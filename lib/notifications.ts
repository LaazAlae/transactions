import webpush from 'web-push'
import { prisma } from './prisma'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    })

    const notifications = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-96x96.png',
            data: payload.data,
            requireInteraction: true,
            actions: payload.data?.actions || []
          })
        )
      } catch (error) {
        console.error(`Failed to send notification to ${subscription.endpoint}:`, error)
        
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint }
          })
        }
      }
    })

    await Promise.allSettled(notifications)
  } catch (error) {
    console.error('Error sending notifications:', error)
  }
}

export async function sendNotificationToAdmins(payload: NotificationPayload) {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true }
    })

    const notifications = adminUsers.map(admin => 
      sendNotificationToUser(admin.id, payload)
    )

    await Promise.allSettled(notifications)
  } catch (error) {
    console.error('Error sending notifications to admins:', error)
  }
}

export async function sendNotificationToAllUsers(payload: NotificationPayload) {
  try {
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true }
    })

    const notifications = allUsers.map(user => 
      sendNotificationToUser(user.id, payload)
    )

    await Promise.allSettled(notifications)
  } catch (error) {
    console.error('Error sending notifications to all users:', error)
  }
}