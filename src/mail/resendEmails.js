import { Resend } from "resend";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplates.js";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, token) => {
  console.log(`Sending verification email to ${email} with token: ${token}`);
  try {
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", token),
      category: "Verification Email",
    });
    console.log("✅ Resend response:", res);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Abubakr Company!",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
      category: "Welcome email",
    });
    console.log("✅ Resend response:", res);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email request");
  }
};
export const sendResetSuccessEmail = async (email) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Successful",
      html: "<p>Your password has been reset successfully.</p>",
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Error sending reset success email:", error);
    throw new Error("Failed to send reset success email");
  }
};
