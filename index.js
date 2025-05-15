
let audio = document.querySelector(".quranplayer");
let surahsContainer = document.querySelector(".surahs");
let ayah = document.querySelector(".ayah");
let next = document.querySelector(".next");
let prev = document.querySelector(".prev");
let play = document.querySelector(".play");

let sajdaNotice = document.querySelector(".sajdaNotice");

let verses = [];
let currentVerse = 0;
let currentSurah = 0;
let currentAyah = 0;
getSurahs();

function getSurahs() {
    fetch("https://api.alquran.cloud/v1/surah")
        .then(response => response.json())
        .then(data => {
            data.data.forEach((surah) => {
                let surahDiv = document.createElement("div");
                surahDiv.classList.add("surah");
                surahDiv.setAttribute("data-id", surah.number);
                surahDiv.innerHTML = `
                    <h2>${surah.number}. ${surah.name}</h2>
                    <p>${surah.englishName}</p>
                `;
                surahsContainer.appendChild(surahDiv);
            });
            addSurahListeners();
        });
}

function addSurahListeners() {
    let allSurahs = document.querySelectorAll(".surah");
    allSurahs.forEach((surah) => {
        surah.addEventListener("click", () => {
            let surahId = surah.getAttribute("data-id");
            allSurahs.forEach(s => s.classList.remove("active"));
            surah.classList.add("active");

            fetchAyahs(surahId);
        });
    });
}

function updateActiveSurah(surahNumber) {
    document.querySelectorAll(".surah").forEach(s => {
        if (s.getAttribute("data-id") == surahNumber) {
            s.classList.add("active");
        } else {
            s.classList.remove("active");
        }
    });
}

function fetchAyahs(surahNumber) {
    Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ur.jalandhry`)
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([arabicData, urduData]) => {
        verses = arabicData.data.ayahs.map((ayah, index) => ({
            arabic: ayah.text,
            number: ayah.number,
            ayahNumber: ayah.numberInSurah,
            ruku: ayah.ruku,
            sajda: ayah.sajda,
            urdu: urduData.data.ayahs[index].text
        }));

        currentVerse = 0;
        updateActiveSurah(surahNumber);
        checkSajda(arabicData.data.ayahs);
        playVerse();
    });
}

function checkSajda(ayahs) {
    let hasSajda = ayahs.some(ayah => ayah.sajda);
    sajdaNotice.innerHTML = hasSajda ? " This surah contains a Sajda ayah." : "";
}

function playVerse() {
    if (!verses[currentVerse]) return;

    let ayahData = verses[currentVerse];
    ayah.innerHTML = `
        <p style="font-size: 22px; color: #fff; margin-bottom: 5px;">${ayahData.arabic} <span style="color: yellow;">(${ayahData.ayahNumber})</span></p>
        <p style="font-size: 18px; color: #fff;">${ayahData.urdu}</p>
        <p style="font-size: 14px; color: #ccc;">Ruku: ${ayahData.ruku} ${ayahData.sajda ? " Sajda Ayah" : ""}</p>
    `;

    audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahData.number}.mp3`;

    audio.play().catch((err) => {
        console.warn("Audio playback error:", err);
    });
}

audio.addEventListener("loadeddata", () => {
    if (audio.src && audio.src !== "") {
        audio.play();
    }
});
audio.addEventListener("ended", () => {
    if (currentVerse < verses.length - 1) {
        currentVerse++;
        playVerse();
    }
});

next.addEventListener("click", () => {
    if (currentVerse < verses.length - 1) {
        currentVerse++;
        playVerse();
    }
});

prev.addEventListener("click", () => {
    if (currentVerse > 0) {
        currentVerse--;
        playVerse();
    }
});

let playBtn = document.querySelector(".play");
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    } else {
        audio.pause();
        playBtn.innerHTML = `<i class="fas fa-play"></i>`;
    }
});

