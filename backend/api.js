// api.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Groq
if (!process.env.GROQ_API_KEY) {
    console.error('ERROR: GROQ_API_KEY tidak ditemukan di file .env');
    process.exit(1);
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Inisialisasi Gemini
if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY tidak ditemukan di file .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint untuk fakta menarik (tetap menggunakan Groq)
app.post('/api/fakta', async (req, res) => {
    try {
        const { tahun, bulan, tanggal } = req.body;

        if (!tahun && !bulan && !tanggal) {
            return res.status(400).json({ error: 'Minimal satu parameter harus diisi' });
        }

        let prompt = 'Berikan informasi menarik tentang';

        if (tanggal && bulan && tahun) {
            prompt += ` tanggal ${tanggal} ${getBulanNama(bulan)} tahun ${tahun}`;
        } else {
            if (tanggal) prompt += ` tanggal ${tanggal}`;
            if (bulan) prompt += ` bulan ${getBulanNama(bulan)}`;
            if (tahun) prompt += ` tahun ${tahun}`;
        }

        prompt += `. Berikan informasi seputar sejarah, peristiwa penting, budaya pop, atau hal menarik lainnya.`;

        console.log('Mengirim prompt:', prompt);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 200,
        });

        res.json({
            fakta: completion.choices[0]?.message?.content || "Maaf, tidak dapat menemukan fakta🗿"
        });
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan saat memproses permintaan.',
            detail: error.message
        });
    }
});

// Endpoint untuk roasting (menggunakan Gemini)
app.post('/api/roast', async (req, res) => {
    try {
        const { nama } = req.body;

        if (!nama) {
            return res.status(400).json({ error: 'Nama harus diisi untuk di-roast.' });
        }

        const prompt = `roastinglah ${nama} dalam bahasa gaul dan singkat. tanpa memberikan penjelasan,disclaimer.`;

        console.log('Mengirim prompt untuk roasting:', prompt);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-exp-0827' });
        const result = await model.generateContent(prompt);
        const roastingText = result.response.text();

        res.json({
            roast: roastingText || "Maaf, tidak dapat memberikan roasting saat ini. 🥲"
        });
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan saat memproses permintaan.',
            detail: error.message
        });
    }
});

function getBulanNama(bulanNumber) {
    const bulanNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return bulanNames[bulanNumber - 1];
}

// Untuk development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
        console.log(`API Key Groq tersedia: ${!!process.env.GROQ_API_KEY}`);
        console.log(`API Key Gemini tersedia: ${!!process.env.GEMINI_API_KEY}`);
    });
}

// Untuk Vercel
export default app;