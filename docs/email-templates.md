# Tango — Auth email templates

Pre-rendered Tango-branded HTML for the six Supabase auth email templates. Each section below is a complete, ready-to-paste template — no placeholders to substitute, no shared shell to merge. Apply in **Supabase Dashboard → Authentication → Email Templates**.

Primary brand color: `#2644D9` (HSL 230 70% 50%, from `src/index.css`).
Visual mark: `単語` (Japanese: "vocabulary/word" — the meaning behind the name *Tango*).

Templates 1–5 share the same shell with a `{{ .ConfirmationURL }}` action button. Template 6 (Reauthentication) is a token-based variant that shows `{{ .Token }}` instead.

---

## 1 — Confirm signup

**Subject:** `Confirm your Tango account`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your email — Tango</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1d2b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="font-size:44px; line-height:1; font-family: 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif; color:#2644D9; letter-spacing:-0.02em;" lang="ja">単語</div>
              <div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:10px; font-weight:600;">Tango</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#1a1d2b; text-align:center;">Confirm your email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0; font-size:15px; line-height:1.55; color:#4b5163; text-align:center;">ようこそ — welcome to Tango. Tap the button below to confirm your email and start learning Japanese.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block; padding:14px 36px; background-color:#2644D9; color:#ffffff; text-decoration:none; font-weight:600; font-size:15px; border-radius:12px; min-width:200px; text-align:center;">Confirm email</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#6b7280; text-align:center;">
                Button not working? Copy this link into your browser:<br />
                <a href="{{ .ConfirmationURL }}" style="color:#2644D9; word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eef0f4; padding-top:20px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#9ba1ad; text-align:center;">Didn't sign up? You can safely ignore this email — no account will be created.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2 — Magic Link

**Subject:** `Your Tango sign-in link`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to Tango</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1d2b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="font-size:44px; line-height:1; font-family: 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif; color:#2644D9; letter-spacing:-0.02em;" lang="ja">単語</div>
              <div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:10px; font-weight:600;">Tango</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#1a1d2b; text-align:center;">Sign in to Tango</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0; font-size:15px; line-height:1.55; color:#4b5163; text-align:center;">Tap the button below to sign in. This link expires in 1 hour.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block; padding:14px 36px; background-color:#2644D9; color:#ffffff; text-decoration:none; font-weight:600; font-size:15px; border-radius:12px; min-width:200px; text-align:center;">Sign in</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#6b7280; text-align:center;">
                Button not working? Copy this link into your browser:<br />
                <a href="{{ .ConfirmationURL }}" style="color:#2644D9; word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eef0f4; padding-top:20px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#9ba1ad; text-align:center;">Didn't request this? You can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3 — Invite user

**Subject:** `You're invited to Tango`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited — Tango</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1d2b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="font-size:44px; line-height:1; font-family: 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif; color:#2644D9; letter-spacing:-0.02em;" lang="ja">単語</div>
              <div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:10px; font-weight:600;">Tango</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#1a1d2b; text-align:center;">You're invited</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0; font-size:15px; line-height:1.55; color:#4b5163; text-align:center;">Someone invited you to join Tango. Tap below to accept and set up your account.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block; padding:14px 36px; background-color:#2644D9; color:#ffffff; text-decoration:none; font-weight:600; font-size:15px; border-radius:12px; min-width:200px; text-align:center;">Accept invitation</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#6b7280; text-align:center;">
                Button not working? Copy this link into your browser:<br />
                <a href="{{ .ConfirmationURL }}" style="color:#2644D9; word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eef0f4; padding-top:20px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#9ba1ad; text-align:center;">Not expecting this? You can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4 — Reset Password

**Subject:** `Reset your Tango password`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password — Tango</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1d2b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="font-size:44px; line-height:1; font-family: 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif; color:#2644D9; letter-spacing:-0.02em;" lang="ja">単語</div>
              <div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:10px; font-weight:600;">Tango</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#1a1d2b; text-align:center;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0; font-size:15px; line-height:1.55; color:#4b5163; text-align:center;">We got a request to reset your password. Tap the button below to choose a new one. This link expires in 1 hour.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block; padding:14px 36px; background-color:#2644D9; color:#ffffff; text-decoration:none; font-weight:600; font-size:15px; border-radius:12px; min-width:200px; text-align:center;">Reset password</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#6b7280; text-align:center;">
                Button not working? Copy this link into your browser:<br />
                <a href="{{ .ConfirmationURL }}" style="color:#2644D9; word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eef0f4; padding-top:20px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#9ba1ad; text-align:center;">Didn't ask for a reset? You can safely ignore this email — your password won't change.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5 — Change Email Address

**Subject:** `Confirm your new email for Tango`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your new email — Tango</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1d2b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="font-size:44px; line-height:1; font-family: 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif; color:#2644D9; letter-spacing:-0.02em;" lang="ja">単語</div>
              <div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:10px; font-weight:600;">Tango</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#1a1d2b; text-align:center;">Confirm your new email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0; font-size:15px; line-height:1.55; color:#4b5163; text-align:center;">You asked to change the email on your Tango account. Tap below to confirm this new address.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block; padding:14px 36px; background-color:#2644D9; color:#ffffff; text-decoration:none; font-weight:600; font-size:15px; border-radius:12px; min-width:200px; text-align:center;">Confirm new email</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#6b7280; text-align:center;">
                Button not working? Copy this link into your browser:<br />
                <a href="{{ .ConfirmationURL }}" style="color:#2644D9; word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eef0f4; padding-top:20px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#9ba1ad; text-align:center;">Didn't make this change? Sign in and review your account security.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 6 — Reauthentication (token code)

**Subject:** `Your Tango verification code`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification code — Tango</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1a1d2b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="font-size:44px; line-height:1; font-family: 'Hiragino Sans','Yu Gothic','Meiryo',sans-serif; color:#2644D9; letter-spacing:-0.02em;" lang="ja">単語</div>
              <div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280; margin-top:10px; font-weight:600;">Tango</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#1a1d2b; text-align:center;">Verify it's you</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0; font-size:15px; line-height:1.55; color:#4b5163; text-align:center;">
                Enter this 6-digit code in Tango to confirm a sensitive action. It expires in 10 minutes.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block; padding:18px 28px; background-color:#f5f6f8; border:1px solid #e5e7ec; border-radius:12px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size:28px; font-weight:700; letter-spacing:0.4em; color:#2644D9;">
                {{ .Token }}
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #eef0f4; padding-top:20px;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#9ba1ad; text-align:center;">
                Didn't ask for this? Someone may be trying to access your account. Change your password right away.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Future polish

- Replace the `<div lang="ja">単語</div>` text mark with a real logo image once available (host in a Supabase Storage public bucket; reference via `<img>` tag).
- Consider adding a custom SMTP provider (Resend / Postmark / SendGrid) before production launch — Supabase's built-in mail is rate-limited and uses a generic `*.supabase.co` sender domain.
