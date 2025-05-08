# Email Notifications

DNC Learning platform supports email notifications for various system events.

## Configuration

To enable email notifications, add the following environment variables to your `.env` file:

```
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=DNC Learning <noreply@dnclearning.com>
```

### Notes for Gmail Users:

If you're using Gmail as your email service:

1. You need to enable "Less secure app access" or
2. Create an "App Password" for more security:
   - Go to your Google Account > Security
   - Enable 2-Step Verification if not already enabled
   - Go to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "DNC Learning" and click "Generate"
   - Use the generated 16-character password as your EMAIL_PASSWORD

## Email Templates

Notification emails include:

- A colored header based on notification type
- The notification title and content
- A footer with the current year and a note that it's an automated email

## Notification Types and Colors

- Course notifications: Green
- Assignment notifications: Blue
- Quiz notifications: Orange
- System notifications: Purple
- Message notifications: Pink
- Schedule notifications: Gray

## Disabling Email Notifications

You can disable email notifications for specific notification types by updating the NotificationsController.

## Troubleshooting

If emails are not being sent:

1. Check that all email environment variables are correctly set
2. Verify your SMTP server is accessible from your hosting environment
3. Check application logs for any email sending errors
4. Ensure the email account has sufficient permissions to send emails
