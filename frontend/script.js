// Konfigurasi API URL berdasarkan environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://agefact-ai.vercel.app/'; // Ganti dengan URL Vercel Anda

document.addEventListener("DOMContentLoaded", () => {
    const tombol = document.querySelector(".tombol");
    const resultDiv = document.getElementById("hasil");
    const birthSection = document.querySelector(".birth-section");
    const nameSection = document.querySelector(".name-section");
    const modeTabs = document.querySelectorAll(".tab-button");

    let selectedMode = "all"; // default mode

    // Checkbox handlers
    const tahunCheck = document.getElementById("tahunCheck");
    const bulanCheck = document.getElementById("bulanCheck");
    const tanggalCheck = document.getElementById("tanggalCheck");

    const tahunGroup = document.getElementById("tahunGroup");
    const bulanGroup = document.getElementById("bulanGroup");
    const tanggalGroup = document.getElementById("tanggalGroup");

    // Handle mode selection
    modeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            modeTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            selectedMode = tab.dataset.mode;

            // Update UI based on selected mode
            if (selectedMode === "roast") {
                birthSection.classList.add("hidden");
                nameSection.classList.remove("hidden");
            } else if (selectedMode === "facts") {
                birthSection.classList.remove("hidden");
                nameSection.classList.add("hidden");
            } else { // "all" mode
                birthSection.classList.remove("hidden");
                nameSection.classList.remove("hidden");
            }

            // Clear previous results
            resultDiv.innerHTML = "";
        });
    });

    // Handle checkbox visibility
    tahunCheck.addEventListener("change", () => {
        tahunGroup.classList.toggle("hidden", !tahunCheck.checked);
    });

    bulanCheck.addEventListener("change", () => {
        bulanGroup.classList.toggle("hidden", !bulanCheck.checked);
    });

    tanggalCheck.addEventListener("change", () => {
        tanggalGroup.classList.toggle("hidden", !tanggalCheck.checked);
    });

    // Function to make API calls with better error handling
    async function makeApiCall(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error: ${errorData.error}`); // Log error API
                throw new Error(errorData.error || 'Terjadi kesalahan saat memproses permintaan.');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error calling API:', error);
            throw new Error(`Gagal menghubungi server: ${error.message}`);
        }
    }


    // Generate button click handler
    tombol.addEventListener("click", async () => {
        try {
            const mode = document.querySelector(".tab-button.active").dataset.mode;
            const nama = document.getElementById("namaInput").value;
            let isValid = true;
            let errorMessage = "";

            // Validation
            if (mode !== "facts" && !nama.trim()) {
                errorMessage = "Nama harus diisi untuk di-roast.";
                isValid = false;
            }

            if (mode !== "roast") {
                const tahunSekarang = new Date().getFullYear();
                if (tahunCheck.checked) {
                    const tahunLahir = parseInt(document.getElementById("tahunLahir").value);
                    if (isNaN(tahunLahir) || tahunLahir > tahunSekarang || tahunLahir < 1900) {
                        errorMessage = "Tahun yang anda masukkan tidak valid.";
                        isValid = false;
                    }
                }

                if (bulanCheck.checked) {
                    const bulanLahir = document.getElementById("bulanLahir").value;
                    if (!bulanLahir) {
                        errorMessage = "Silakan pilih bulan lahir.";
                        isValid = false;
                    }
                }

                if (tanggalCheck.checked) {
                    const tanggalLahir = parseInt(document.getElementById("tanggalLahir").value);
                    if (isNaN(tanggalLahir) || tanggalLahir < 1 || tanggalLahir > 31) {
                        errorMessage = "Tanggal yang anda masukkan tidak valid.";
                        isValid = false;
                    }
                }
            }

            if (!isValid) {
                resultDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
                return;
            }

            // Show loading state
            resultDiv.innerHTML = '<p class="loading">Sedang memproses...</p>';

            let facts = null;
            let roast = null;

            // Get facts if needed
            if (mode !== "roast") {
                const factsData = {};
                if (tahunCheck.checked) {
                    factsData.tahun = parseInt(document.getElementById("tahunLahir").value);
                }
                if (bulanCheck.checked) {
                    factsData.bulan = parseInt(document.getElementById("bulanLahir").value);
                }
                if (tanggalCheck.checked) {
                    factsData.tanggal = parseInt(document.getElementById("tanggalLahir").value);
                }

                facts = await makeApiCall('/api/fakta', factsData);
            }

            // Get roast if needed
            if (mode !== "facts" && nama) {
                roast = await makeApiCall('/api/roast', { nama });
            }

            // Calculate age if year is provided
            let ageText = '';
            if (mode !== "roast" && tahunCheck.checked) {
                const tahunLahir = parseInt(document.getElementById("tahunLahir").value);
                const umur = new Date().getFullYear() - tahunLahir;
                ageText = `<p>Umur kamu adalah ${umur} tahun.</p>`;
            }

            // Format birth date for display
            let dateText = '';
            if (mode !== "roast" && tahunCheck.checked && bulanCheck.checked && tanggalCheck.checked) {
                const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const tanggal = document.getElementById("tanggalLahir").value;
                const bulan = parseInt(document.getElementById("bulanLahir").value);
                const tahun = document.getElementById("tahunLahir").value;
                dateText = `<p>Tanggal lahir: ${tanggal} ${bulanNames[bulan - 1]} ${tahun}</p>`;
            }

            // Combine and display results
            let resultHTML = '';

            if (facts) {
                resultHTML += `
                    ${ageText}
                    ${dateText}
                    <p class="fakta-title">Fakta menarik:</p>
                    <p class="fakta-content">${facts.fakta}</p>
                `;
            }

            if (roast) {
                resultHTML += `
                    <p class="roast-title">Roasting untuk ${nama}:</p>
                    <p class="roast-content">${roast.roast}</p>
                `;
            }

            resultDiv.innerHTML = resultHTML;

        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            resultDiv.innerHTML = `<p class="error">Maaf, terjadi kesalahan: ${error.message}</p>`;
        }
    });
});