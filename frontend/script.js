document.addEventListener("DOMContentLoaded", () => {
    const tombol = document.querySelector(".tombol");
    const resultUmur = document.getElementById("hasil");

    // Checkbox elements
    const tahunCheck = document.getElementById("tahunCheck");
    const bulanCheck = document.getElementById("bulanCheck");
    const tanggalCheck = document.getElementById("tanggalCheck");

    // Input group elements
    const tahunGroup = document.getElementById("tahunGroup");
    const bulanGroup = document.getElementById("bulanGroup");
    const tanggalGroup = document.getElementById("tanggalGroup");

    // Handle checkbox changes
    tahunCheck.addEventListener("change", () => {
        tahunGroup.classList.toggle("hidden", !tahunCheck.checked);
    });

    bulanCheck.addEventListener("change", () => {
        bulanGroup.classList.toggle("hidden", !bulanCheck.checked);
    });

    tanggalCheck.addEventListener("change", () => {
        tanggalGroup.classList.toggle("hidden", !tanggalCheck.checked);
    });

    tombol.addEventListener("click", async () => {
        try {
            const tahunSekarang = new Date().getFullYear();
            const data = {};

            // Validate and collect data based on checked options
            if (tahunCheck.checked) {
                const tahunLahir = parseInt(document.getElementById("tahunLahir").value);
                if (isNaN(tahunLahir) || tahunLahir > tahunSekarang || tahunLahir < 1900) {
                    resultUmur.innerHTML = '<p class="error">Tahun yang anda masukkan tidak valid.</p>';
                    return;
                }
                data.tahun = tahunLahir;
            }

            if (bulanCheck.checked) {
                const bulanLahir = document.getElementById("bulanLahir").value;
                if (!bulanLahir) {
                    resultUmur.innerHTML = '<p class="error">Silakan pilih bulan lahir.</p>';
                    return;
                }
                data.bulan = parseInt(bulanLahir);
            }

            if (tanggalCheck.checked) {
                const tanggalLahir = parseInt(document.getElementById("tanggalLahir").value);
                if (isNaN(tanggalLahir) || tanggalLahir < 1 || tanggalLahir > 31) {
                    resultUmur.innerHTML = '<p class="error">Tanggal yang anda masukkan tidak valid.</p>';
                    return;
                }
                data.tanggal = tanggalLahir;
            }

            resultUmur.innerHTML = '<p class="loading">Sedang mencari fakta menarik...</p>';

            const response = await fetch('/api/fakta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            // Calculate age if year is provided
            let ageText = '';
            if (data.tahun) {
                const umur = tahunSekarang - data.tahun;
                ageText = `<p>Umur kamu adalah ${umur} tahun.</p>`;
            }

            // Format date for display
            let dateText = '';
            if (data.tanggal && data.bulan && data.tahun) {
                const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                dateText = `<p>Tanggal lahir: ${data.tanggal} ${bulanNames[data.bulan - 1]} ${data.tahun}</p>`;
            }

            resultUmur.innerHTML = `
                ${ageText}
                ${dateText}
                <p class="fakta-title">Fakta menarik:</p>
                <p class="fakta-content">${responseData.fakta}</p>
            `;

        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            resultUmur.innerHTML = '<p class="error">Maaf, terjadi kesalahan saat memproses permintaan Anda.</p>';
        }
    });
});