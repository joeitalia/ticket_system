export const sendEmail = async (data: any) => {

  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.emailTo,
        subject: data.subject,
        message: data.message,
        qrCodeText: data.qrcodeText
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendResetEmail = async (email: string, resetLink: string) => {
  try {
    await fetch("/api/send-email/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Password Reset Request",
        message: `Click the link to reset your password: ${resetLink}`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
  }
};