"use server";

import QRCode from "qrcode";

export async function generateQRBuffer(data: { text: string; width?: number }) {
  try {
    if (!data?.text || typeof data.text !== "string") {
      throw new Error(`${data.text} QR text must be a valid string `);
    }

    const buffer = await QRCode.toBuffer(data.text, {
      type: "png",
      width: data.width || 300,
      errorCorrectionLevel: "M",
      margin: 1
    });
    return buffer;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return error;
  }
}