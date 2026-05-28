import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'MyProtector <noreply@myprotector.org>' }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

export function generateVerificationEmailHtml(verifyUrl: string, name?: string): string {
  const firstName = name || 'there'
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">MyProtector</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Trusted Reviews & Business Verification</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">Verify your email address</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Hi ${firstName},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
              Thanks for signing up! Please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 0 0 30px;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
              If you didn't create an account with MyProtector, you can safely delete this email.
            </p>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
              This link expires in 24 hours.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              &copy; ${new Date().getFullYear()} MyProtector. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateWelcomeEmailHtml(name?: string): string {
  const firstName = name || 'there'
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">MyProtector</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Trusted Reviews & Business Verification</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">Welcome to MyProtector!</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Hi ${firstName},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
              Your account has been verified and you're ready to start. Here's what you can do:
            </p>
            
            <ul style="color: #64748b; font-size: 16px; line-height: 2; margin: 0 0 30px; padding-left: 20px;">
              <li>Leave reviews for businesses you've interacted with</li>
              <li>Track your review history and responses</li>
              <li>Help others make informed decisions</li>
              <li>Build trust in the marketplace</li>
            </ul>
            
            <div style="text-align: center; margin: 0 0 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              &copy; ${new Date().getFullYear()} MyProtector. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateReviewInvitationHtml(businessName: string, reviewUrl: string, customerName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">MyProtector</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Trusted Reviews & Business Verification</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">Share Your Experience</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              ${customerName ? `Dear ${customerName},` : 'Hello,'}
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
              ${businessName} has invited you to share your experience. Your review helps other customers make informed decisions and holds businesses accountable.
            </p>
            
            <div style="text-align: center; margin: 0 0 30px;">
              <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Write a Review
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
              It only takes a few minutes to share your feedback.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              &copy; ${new Date().getFullYear()} MyProtector. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generatePasswordResetHtml(resetUrl: string, name?: string): string {
  const firstName = name || 'there'
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">MyProtector</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Trusted Reviews & Business Verification</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">Reset Your Password</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Hi ${firstName},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
              You requested to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 0 0 30px;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
              This link expires in 1 hour.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              &copy; ${new Date().getFullYear()} MyProtector. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateNewReviewNotificationHtml(
  businessName: string,
  rating: number,
  reviewTitle: string,
  reviewUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">MyProtector</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Trusted Reviews & Business Verification</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px;">New Review Received</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              A new review has been submitted for <strong>${businessName}</strong>.
            </p>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 20px;">
              <div style="display: flex; align-items: center; margin: 0 0 16px;">
                <span style="font-size: 24px; margin-right: 12px;">
                  ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                </span>
                <span style="color: #64748b; font-size: 14px;">${rating}/5 stars</span>
              </div>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 8px;">"${reviewTitle}"</p>
            </div>
            
            <div style="text-align: center; margin: 0 0 30px;">
              <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Review
              </a>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              &copy; ${new Date().getFullYear()} MyProtector. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
