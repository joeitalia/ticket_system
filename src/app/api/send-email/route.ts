import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { generateQRBuffer } from "@/util/qrcode";

export const runtime = "nodejs"; // important for qrcode

export async function POST(req: Request) {
  try {
    const { to, subject, message, qrCodeText } = await req.json();
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) | 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const qrcode: any = await generateQRBuffer({ text: qrCodeText, width: 200 });

    await transporter.sendMail({
      from: `"Nagase Philippines" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div>
          ${message}
        </div>
        <div>
          <img src="cid:qrcode" alt="QR Code" />
        </div>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrcode,
          contentType: "image/png",
          cid: "qrcode"
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}