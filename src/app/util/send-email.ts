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