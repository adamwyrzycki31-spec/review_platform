import { NextRequest, NextResponse } from 'next/server'
import { parseWebhookPayload, markMessageAsRead, sendTextMessage } from '@/lib/whatsapp'
import prisma from '@/lib/db'

// Verify webhook token (for Facebook webhook verification)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verify token should match your configuration
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'myprotector-secret'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Parse the webhook payload
    const messageData = parseWebhookPayload(payload)
    
    if (!messageData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { from, type, text } = messageData

    // Mark message as read
    if (messageData.type === 'text') {
      // Note: We need the message ID from the webhook, which we can extract
      const messageId = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id
      if (messageId) {
        await markMessageAsRead(messageId)
      }
    }

    // Handle different message types
    if (type === 'text' && text) {
      await handleTextMessage(from, text)
    }

    // Acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleTextMessage(from: string, text: string) {
  const lowerText = text.toLowerCase().trim()

  // Command-based responses
  if (lowerText === 'help' || lowerText === 'menu') {
    await sendMenuMessage(from)
  } else if (lowerText === 'reviews' || lowerText === 'my reviews') {
    await sendReviewsLink(from)
  } else if (lowerText.startsWith('ticket ') || lowerText.startsWith('#')) {
    // Handle ticket lookup
    const ticketId = lowerText.replace('#', '').replace('ticket ', '').trim()
    await sendTicketStatus(from, ticketId)
  } else if (lowerText === 'status' || lowerText === 'my status') {
    await sendBusinessStatus(from)
  } else {
    // Default: forward to support or auto-response
    await sendAutoResponse(from, text)
  }
}

async function sendMenuMessage(to: string) {
  const menuText = `🏠 *MyProtector Support Menu*

Welcome! How can I help you today?

*Quick Commands:*
• Type *reviews* - View your business reviews
• Type *status* - Check your trust signal status
• Type *#TICKET_ID* - Check support ticket status
• Type *help* - Show this menu

Or describe your issue and I'll connect you with support.`

  await sendTextMessage(to, menuText)
}

async function sendReviewsLink(to: string) {
  const message = `📝 *Your Reviews*

Visit your dashboard to view all your reviews, respond to customers, and track your rating.

🔗 https://myprotector.org/dashboard/business/reviews

Need help managing your reputation? We're here!`

  await sendTextMessage(to, message)
}

async function sendTicketStatus(to: string, ticketId: string) {
  // Look up ticket in database
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { user: { select: { phone: true } } },
  })

  if (!ticket) {
    await sendTextMessage(to, `❌ Ticket #${ticketId} not found.\n\nPlease check the ticket ID and try again, or type *help* for assistance.`)
    return
  }

  const statusEmoji = ticket.status === 'RESOLVED' ? '✅' : 
                     ticket.status === 'IN_PROGRESS' ? '🔄' : '⏳'
  
  const message = `🎫 *Ticket #${ticket.id}*

${statusEmoji} Status: *${ticket.status.replace('_', ' ')}*
📋 Subject: ${ticket.subject}

${ticket.status !== 'RESOLVED' ? 'Our team is working on your request. We\'ll notify you of any updates.' : 'This ticket has been resolved. Feel free to open a new ticket if you need more help.'}

Type *help* to return to the menu.`

  await sendTextMessage(to, message)
}

async function sendBusinessStatus(to: string) {
  // Find user by phone number
  const user = await prisma.user.findFirst({
    where: { phone: to },
    include: { 
      business: { 
        include: { trafficSignal: true } 
      } 
    },
  })

  if (!user?.business) {
    await sendTextMessage(to, `❓ I couldn't find a business linked to this number.\n\nIf you're a business owner, please log in to your dashboard to check your status.\n\nType *help* for more options.`)
    return
  }

  const business = user.business
  const status = business.trafficLightStatus
  const statusEmoji = status === 'GREEN' ? '🟢' : status === 'AMBER' ? '🟡' : '🔴'

  let message = `🚦 *${business.name} Status*\n\n`
  message += `${statusEmoji} Traffic Light: *${status}*\n`
  message += `⭐ Trust Score: ${Number(business.trustScore).toFixed(1)}\n`
  message += `📊 Reviews: ${business.reviewCount}\n\n`

  if (status !== 'GREEN') {
    message += `To improve your status:\n`
    if (!business.insuranceUrl) message += `• Add insurance policy URL\n`
    if (!business.termsUrl) message += `• Add terms & conditions URL\n`
    if (!business.promisePageUrl) message += `• Add refund promise page URL\n`
    if (!business.claimPageUrl) message += `• Add claim page URL\n`
    message += `\n`
  }

  message += `🔗 Manage your business: https://myprotector.org/dashboard/business`

  await sendTextMessage(to, message)
}

async function sendAutoResponse(to: string, originalMessage: string) {
  // Create support ticket automatically
  const user = await prisma.user.findFirst({
    where: { phone: to },
  })

  await prisma.supportTicket.create({
    data: {
      userId: user?.id || 'system', // Use system user if not found
      subject: `WhatsApp: ${originalMessage.substring(0, 50)}...`,
      content: `From WhatsApp (${to}):\n\n${originalMessage}`,
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  })

  const response = `👋 Thanks for your message! I've created a support ticket for your inquiry.\n\n`
    + `Our team will respond within 24 hours. You'll be notified via WhatsApp when there's an update.\n\n`
    + `In the meantime, type *help* for quick options or visit your dashboard.\n\n`
    + `🔗 https://myprotector.org/dashboard/support`

  await sendTextMessage(to, response)
}