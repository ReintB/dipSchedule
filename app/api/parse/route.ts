import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Kamu adalah asisten ekstraksi data cerdas. Ekstrak data tabel jadwal ujian dari dokumen PDF berikut ke dalam bentuk JSON Array of Objects murni. 
      PENTING: Jangan gunakan markdown format seperti \`\`\`json. Langsung berikan array JSON-nya.
      
      Setiap baris mata kuliah menjadi satu object. Properti yang WAJIB ada:
      - "kode" (string, contoh: "VTE2624208")
      - "mataKuliah" (string, contoh: "Praktikum Instrumentasi")
      - "sks" (string, contoh: "2")
      - "ruang" (string, contoh: "E 2.3 SV TBL")
      - "tanggalWaktu" (string, contoh: "31 Maret 2026 13:15:00-14:45:00")
      - "timestamp" (number, konversi waktu mulai ujian ke epoch timestamp milliseconds)
    `;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan di .env.local" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "application/pdf", data: base64String } },
          ],
        }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Terjadi kesalahan dari server Gemini");
    }

    let textOutput = data.candidates[0].content.parts[0].text;
    textOutput = textOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    return NextResponse.json(JSON.parse(textOutput));
  } catch (error) {
    console.error("Native Fetch Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal memproses dengan Native API";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}