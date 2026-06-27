/**
 * Email — shared Brevo transactional sender used by auth flows
 * (verification, password reset, change-email confirmation) and the
 * daily reminder digest.
 *
 * Provider choice (see ADR notes in commit history):
 *   - Replaces the previous Resend setup. Resend's free tier only
 *     delivers to the account owner's own address until a custom
 *     domain is verified — a non-starter for an MVP without a
 *     domain. Brevo's free tier (300/day forever) ships from a
 *     sender the user verifies by clicking a code sent to that
 *     inbox — no domain DNS setup needed.
 *   - API shape is plain HTTPS POST → fits Convex actions (same as
 *     the old Resend path), no SDK dependency.
 *
 * Env (set in Convex dashboard + Vercel):
 *   - BREVO_API_KEY    — API key from https://app.brevo.com/settings/keys/api
 *   - BREVO_FROM_EMAIL — sender address registered in Brevo's
 *                        Senders tab and verified by 6-digit code
 *   - BREVO_FROM_NAME  — display name shown in the From field
 *                        (default: "Lael")
 *
 * If BREVO_API_KEY is missing, every send returns `{ ok: false,
 * skipped: "missing-env" }` and logs a warning. The reminders cron
 * already swallows that path gracefully; Better Auth's callbacks do
 * too (we `void` the promise so a missing email doesn't 500 the
 * password reset).
 *
 * Ponytail note: we deliberately don't await the Brevo HTTP call
 * inside Better Auth's callbacks (we `void sendEmail(...)`). The
 * docs recommend this for timing-attack resistance — the response
 * time shouldn't depend on whether the email actually went out.
 */

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export interface SendEmailArgs {
  to: string;
  /** Optional display name for the recipient. */
  toName?: string;
  subject: string;
  /** HTML body. Provide at least one of `html` / `text`. */
  html?: string;
  /** Plain-text body. Falls back to a stripped version of `html` if absent. */
  text?: string;
  /** Reply-To address (defaults to BREVO_FROM_EMAIL). */
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; skipped?: "missing-env" };

/**
 * Send a single transactional email via Brevo. Returns a tagged
 * result so callers can decide whether to surface failure (auth
 * callbacks: log + move on; reminders cron: skip the user).
 *
 * Does NOT throw on transport errors — the body of an action that
 * calls this should treat `ok: false` as a soft failure.
 */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME ?? "Lael";

  if (!apiKey || !fromEmail) {
    console.warn(
      "[email] BREVO_API_KEY / BREVO_FROM_EMAIL not set — skipping send.",
    );
    return { ok: false, error: "missing-env", skipped: "missing-env" };
  }

  const text = args.text ?? htmlToText(args.html ?? "");
  if (!args.html && !text) {
    return { ok: false, error: "no-body" };
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: args.to, name: args.toName }],
        subject: args.subject,
        ...(args.html ? { htmlContent: args.html } : {}),
        ...(text ? { textContent: text } : {}),
        ...(args.replyTo ? { replyTo: { email: args.replyTo } } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] Brevo rejected send: ${res.status} ${body}`);
      return { ok: false, error: `brevo-${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
    };
    return { ok: true, messageId: data.messageId ?? "unknown" };
  } catch (err) {
    console.error("[email] transport error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "network" };
  }
}

/* ─── HTML / text templates ─────────────────────────────────────────────── */

/**
 * Branded transactional layout used by every auth email. Inline
 * styles only (email clients ignore <style> in many cases). Colors
 * mirror the in-app palette so the email looks like the same product.
 */
function layout({
  preheader,
  body,
}: {
  preheader: string;
  body: string;
}): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#FBF8F3;font-family:Inter,system-ui,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
<div style="max-width:520px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:24px;color:#1C1917;margin:0 0 16px 0;">Lael</h1>
  ${body}
  <p style="color:#A8A29E;font-size:11px;margin:24px 0 0 0;">
    You're getting this because you have a Lael account. If this
    wasn't you, you can safely ignore it.
  </p>
</div>
</body></html>`;
}

function ctaButton(url: string, label: string): string {
  return `<p style="margin:24px 0 0 0;"><a href="${escapeAttr(url)}" style="background:#166534;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block;">${escapeHtml(label)}</a></p>`;
}

/** "Verify your new email" — sent to the *new* address during changeEmail. */
export function renderVerifyEmail({ url, name }: { url: string; name?: string | null }): {
  html: string;
  text: string;
  subject: string;
} {
  const first = (name ?? "there").split(" ")[0] || "there";
  const html = layout({
    preheader: "Confirm your new email address for Lael.",
    body: `<p style="color:#1C1917;font-size:15px;line-height:1.55;margin:0 0 8px 0;">Hi ${escapeHtml(first)},</p>
<p style="color:#1C1917;font-size:14px;line-height:1.55;margin:0 0 4px 0;">Click the button below to confirm this is your new email address.</p>
<p style="color:#78716C;font-size:13px;line-height:1.55;margin:0;">Your current email stays active until you click the link.</p>
${ctaButton(url, "Confirm new email")}`,
  });
  const text = [
    `Hi ${first},`,
    "",
    "Click the link below to confirm this is your new email address for Lael:",
    url,
    "",
    "Your current email stays active until you click the link.",
    "",
    "If this wasn't you, you can safely ignore this email.",
  ].join("\n");
  return { html, text, subject: "Confirm your new email — Lael" };
}

/** "Approve email change" — sent to the *current* address during changeEmail. */
export function renderApproveEmailChange({
  url,
  newEmail,
  name,
}: {
  url: string;
  newEmail: string;
  name?: string | null;
}): { html: string; text: string; subject: string } {
  const first = (name ?? "there").split(" ")[0] || "there";
  const html = layout({
    preheader: `Approve the change of your Lael email to ${newEmail}.`,
    body: `<p style="color:#1C1917;font-size:15px;line-height:1.55;margin:0 0 8px 0;">Hi ${escapeHtml(first)},</p>
<p style="color:#1C1917;font-size:14px;line-height:1.55;margin:0 0 4px 0;">Someone (hopefully you) asked to change your Lael email to <strong>${escapeHtml(newEmail)}</strong>.</p>
<p style="color:#78716C;font-size:13px;line-height:1.55;margin:0 0 8px 0;">If this was you, click below to approve. If not, change your password immediately and ignore this email — nothing happens until you approve.</p>
${ctaButton(url, "Approve email change")}`,
  });
  const text = [
    `Hi ${first},`,
    "",
    `Someone (hopefully you) asked to change your Lael email to ${newEmail}.`,
    "",
    "Approve by clicking:",
    url,
    "",
    "If this wasn't you, change your password immediately. Nothing happens until you approve.",
  ].join("\n");
  return {
    html,
    text,
    subject: `Approve change to ${newEmail} — Lael`,
  };
}

/** Password reset link. */
export function renderPasswordReset({
  url,
  name,
}: {
  url: string;
  name?: string | null;
}): { html: string; text: string; subject: string } {
  const first = (name ?? "there").split(" ")[0] || "there";
  const html = layout({
    preheader: "Reset your Lael password.",
    body: `<p style="color:#1C1917;font-size:15px;line-height:1.55;margin:0 0 8px 0;">Hi ${escapeHtml(first)},</p>
<p style="color:#1C1917;font-size:14px;line-height:1.55;margin:0 0 4px 0;">Click below to reset your Lael password. This link expires in one hour.</p>
${ctaButton(url, "Reset password")}`,
  });
  const text = [
    `Hi ${first},`,
    "",
    "Reset your Lael password by clicking:",
    url,
    "",
    "This link expires in one hour.",
  ].join("\n");
  return { html, text, subject: "Reset your password — Lael" };
}

/**
 * "Your password was changed" alert. Sent to the user's email after
 * a successful password change so they notice if an attacker did it.
 * Same email goes out for a password-reset-via-link completion.
 */
export function renderPasswordChangedAlert({
  name,
}: {
  name?: string | null;
}): { html: string; text: string; subject: string } {
  const first = (name ?? "there").split(" ")[0] || "there";
  const html = layout({
    preheader: "Your Lael password was just changed.",
    body: `<p style="color:#1C1917;font-size:15px;line-height:1.55;margin:0 0 8px 0;">Hi ${escapeHtml(first)},</p>
<p style="color:#1C1917;font-size:14px;line-height:1.55;margin:0 0 4px 0;">Your Lael password was just changed. Every other device was signed out.</p>
<p style="color:#78716C;font-size:13px;line-height:1.55;margin:0 0 4px 0;">If this was you, no action needed.</p>
<p style="color:#78716C;font-size:13px;line-height:1.55;margin:0;">If this wasn't you, <a href="${escapeAttr(process.env.SITE_URL ?? "http://localhost:5173")}/sign-in" style="color:#166534;text-decoration:underline;">sign in and change your password immediately</a> — your account may be compromised.</p>`,
  });
  const text = [
    `Hi ${first},`,
    "",
    "Your Lael password was just changed. Every other device was signed out.",
    "",
    "If this was you, no action needed.",
    "",
    `If this wasn't you, sign in and change your password immediately: ${process.env.SITE_URL ?? "http://localhost:5173"}/sign-in`,
  ].join("\n");
  return { html, text, subject: "Your Lael password was changed" };
}

/* ─── Tiny string helpers (shared with reminders.ts) ──────────────────── */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

/** Crude HTML→text fallback (strip tags, collapse whitespace). */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
