/**
 * WhatsApp Business API Integration
 * 
 * This module handles WhatsApp integration for customer support
 * using the WhatsApp Business API.
 */

// WhatsApp API Configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0'
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || ''

interface WhatsAppMessage {
  to: string
  type: 'text' | 'template' | 'image' | 'document'
  template?: {
    name: string
    language: { code: string }
    components: Array<{
      type: string
      parameters: Array<{ type: string; text: string }>
    }>
  }
  text?: { body: string }
  image?: { id: string; caption?: string }
  document?: { id: string; caption?: string; filename: string }
}

interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{ wa_id: string; input: string }>
  messages: Array<{ id: string }>
}

// Send a WhatsApp message
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<WhatsAppResponse | null> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp API not configured')
    return null
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to.replace(/[^0-9]/g, ''), // Remove non-digits
        ...message,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('WhatsApp API error:', error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('WhatsApp message failed:', error)
    return null
  }
}

// Send a text message
export async function sendTextMessage(to: string, message: string): Promise<boolean> {
  const result = await sendWhatsAppMessage({
    to,
    type: 'text',
    text: { body: message },
  })
  return result !== null
}

// Send a review invitation template
export async function sendReviewInvitation(
  phone: string,
  customerName: string,
  businessName: string,
  reviewLink: string
): Promise<boolean> {
  const result = await sendWhatsAppMessage({
    to: phone,
    type: 'template',
    template: {
      name: 'review_invitation', // Must be pre-approved in WhatsApp Business
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: businessName },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: reviewLink },
          ],
        },
      ],
    },
  })
  return result !== null
}

// Send support notification
export async function sendSupportNotification(
  phone: string,
  ticketId: string,
  status: string
): Promise<boolean> {
  const statusMessage = status === 'RESOLVED' 
    ? 'Your support ticket has been resolved!' 
    : `Your support ticket #${ticketId} has been updated.`

  return await sendTextMessage(phone, statusMessage)
}

// Send review response notification
export async function sendReviewResponseNotification(
  phone: string,
  businessName: string
): Promise<boolean> {
  return await sendTextMessage(
    phone,
    `${businessName} has responded to your review. Check your dashboard for details!`
  )
}

// Send traffic light status update
export async function sendTrafficLightUpdate(
  phone: string,
  businessName: string,
  newStatus: 'GREEN' | 'AMBER' | 'RED',
  changesNeeded?: string[]
): Promise<boolean> {
  let message = `🚦 ${businessName} Trust Update\n\n`
  message += `Your traffic light status is now: ${newStatus}\n\n`

  if (newStatus === 'GREEN') {
    message += '🎉 Congratulations! Your business is fully verified.'
  } else if (changesNeeded && changesNeeded.length > 0) {
    message += 'To improve your status, please:\n'
    changesNeeded.forEach((change, i) => {
      message += `${i + 1}. ${change}\n`
    })
  }

  message += '\nVisit your dashboard for more details.'

  return await sendTextMessage(phone, message)
}

// Send commission payment notification
export async function sendCommissionNotification(
  phone: string,
  amount: string,
  businessName: string
): Promise<boolean> {
  return await sendTextMessage(
    phone,
    `💰 You've earned a commission!\n\nNew payment of ${amount} from ${businessName}. Visit your dashboard to request payout.`
  )
}

// Send subscription renewal reminder
export async function sendSubscriptionReminder(
  phone: string,
  daysLeft: number
): Promise<boolean> {
  return await sendTextMessage(
    phone,
    `📅 Reminder: Your subscription renews in ${daysLeft} days. Ensure your payment method is up to date to maintain your GREEN status.`
  )
}

// Parse incoming WhatsApp webhook
export function parseWebhookPayload(payload: any): {
  from: string
  type: string
  text?: string
} | null {
  try {
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (!value?.messages?.[0]) return null

    const message = value.messages[0]
    return {
      from: message.from,
      type: message.type,
      text: message.text?.body,
    }
  } catch (error) {
    console.error('Failed to parse WhatsApp webhook:', error)
    return null
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return false
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to mark message as read:', error)
    return false
  }
}

// Send typing indicator (simulated via webhook)
export async function sendTypingIndicator(to: string): Promise<boolean> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return false
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient: {
          wa_id: to.replace(/[^0-9]/g, ''),
        },
        action: 'typing_on',
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send typing indicator:', error)
    return false
  }
}