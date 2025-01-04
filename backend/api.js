import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk'; // Sudah mendukung ESM, jadi tidak perlu `index.mjs`

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GROQ_API_KEY) {
    console.error('ERROR: GROQ_API_KEY tidak ditemukan di file .env');
    process.exit(1);
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

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

function getBulanNama(bulanNumber) {
    const bulanNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return bulanNames[bulanNumber - 1];
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
    console.log(`API Key tersedia: ${!!process.env.GROQ_API_KEY}`);
});
