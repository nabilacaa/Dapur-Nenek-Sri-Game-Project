"use strict";
document.addEventListener("DOMContentLoaded", () => DapurNenek());

function DapurNenek() {
    // =====================================================================
    // KONSTANTA
    // =====================================================================
    const W = 8, N = W * W;
    const EMPTY = -1;
    // Item spesial (gratis, dari match besar)
    const KNIFE = 90;   // match 4  : tebas 1 baris + 1 kolom
    const WOK = 95;     // match 5  : ledakan 3x3
    const POT = 96;     // match 6  : ledakan 4x4
    const GOLD = 97;    // match 7+ : bersihkan seluruh papan
    // Penghalang & objektif
    const ROTTEN = 91;  // bahan busuk (bos level 9)
    const BOX = 92;     // kardus (mode hard), 2 kali pukul
    const BOX_CRACK = 93; // ikon kardus retak
    const SECRET = 94;  // kertas resep rahasia (isi kardus)

    const SPECIALS = [KNIFE, WOK, POT, GOLD];
    const isSpecial = v => SPECIALS.includes(v);
    const isBlocker = v => v === ROTTEN || v === BOX;

    const SWAP_MS = 190, POP_MS = 260;
    const ENDLESS_TIME = 60;
    const WRONG_MOVE_PENALTY = 3; // detik, mode endless
    const MAX_STOCK = 9;
    const START_COINS = 100;
    const START_INV = { hammer: 1, shuffle: 1, extra: 1, salt: 0 };

    // Koin berdasarkan skor akhir (diurutkan dari skor tertinggi)
    const COIN_TIERS = [
        { min: 5000, coins: 100 },
        { min: 4000, coins: 80 },
        { min: 3000, coins: 60 },
        { min: 2000, coins: 40 },
        { min: 1000, coins: 25 },
        { min: 0, coins: 10 },
    ];
    const coinsFor = sc => COIN_TIERS.find(t => sc >= t.min).coins;

    // Power-up terbatas (dibeli di toko)
    const BOOSTERS = [
        { id: "hammer", name: "Ulekan", desc: "Hancurkan 1 bahan, kardus, atau item pilihanmu.", price: 50 },
        { id: "shuffle", name: "Kocok Ulang", desc: "Acak ulang semua bahan di papan.", price: 30 },
        { id: "extra", name: "Tambah Waktu", desc: "+5 langkah, dan +15 detik di level berwaktu.", price: 80 },
        { id: "salt", name: "Garam Ajaib", desc: "Hapus semua bahan dari satu jenis.", price: 150 },
    ];

    // ---------- Ikon SVG ----------
    const glow = (id, c1, c2) => `<radialGradient id='${id}' cx='.5' cy='.5' r='.5'><stop offset='0' stop-color='${c1}' stop-opacity='.95'/><stop offset='1' stop-color='${c2}' stop-opacity='0'/></radialGradient>`;
    const ICONS = {
        0: `<defs><linearGradient id='b' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#6cb6ff'/><stop offset='1' stop-color='#1d5fd6'/></linearGradient><radialGradient id='r' cx='.4' cy='.35' r='.75'><stop offset='0' stop-color='#fff'/><stop offset='1' stop-color='#d9e2ee'/></radialGradient></defs>
            <path d='M17 52 C17 26 34 18 50 18 C66 18 83 26 83 52 Z' fill='url(#r)'/>
            <g fill='#fff' stroke='#c5d0de' stroke-width='1.5'><ellipse cx='36' cy='31' rx='4' ry='2.4' transform='rotate(-30 36 31)'/><ellipse cx='52' cy='25' rx='4' ry='2.4' transform='rotate(15 52 25)'/><ellipse cx='64' cy='34' rx='4' ry='2.4' transform='rotate(40 64 34)'/><ellipse cx='45' cy='41' rx='4' ry='2.4' transform='rotate(-10 45 41)'/><ellipse cx='28' cy='45' rx='4' ry='2.4'/><ellipse cx='70' cy='46' rx='4' ry='2.4' transform='rotate(20 70 46)'/></g>
            <path d='M10 50 H90 C88 74 72 86 50 86 C28 86 12 74 10 50 Z' fill='url(#b)'/>
            <rect x='8' y='46' width='84' height='8' rx='4' fill='#a6d6ff'/>
            <path d='M22 62 C26 72 34 78 44 80' stroke='#fff' stroke-opacity='.5' stroke-width='5' fill='none' stroke-linecap='round'/>`,
        1: `<defs><radialGradient id='w' cx='.45' cy='.4' r='.7'><stop offset='0' stop-color='#fff'/><stop offset='1' stop-color='#f1e7d6'/></radialGradient><radialGradient id='y' cx='.38' cy='.35' r='.7'><stop offset='0' stop-color='#fff27a'/><stop offset='.6' stop-color='#ffc21a'/><stop offset='1' stop-color='#f08c00'/></radialGradient></defs>
            <path d='M52 10 C74 10 90 24 88 44 C94 62 82 86 58 86 C38 92 12 82 12 60 C6 38 26 10 52 10 Z' fill='url(#w)' stroke='#e6d6bb' stroke-width='2'/>
            <circle cx='50' cy='50' r='25' fill='url(#y)'/>
            <ellipse cx='42' cy='41' rx='7' ry='4.5' fill='#fff' opacity='.85' transform='rotate(-25 42 41)'/>`,
        2: `<defs><linearGradient id='c' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#ff6b6b'/><stop offset='1' stop-color='#c1121f'/></linearGradient></defs>
            <path d='M30 30 C22 56 34 78 70 90 C80 93 84 86 77 82 C54 70 46 52 50 32 C44 26 36 25 30 30 Z' fill='url(#c)'/>
            <path d='M36 40 C34 56 42 70 60 80' stroke='#fff' stroke-opacity='.55' stroke-width='5' fill='none' stroke-linecap='round'/>
            <path d='M26 31 C30 20 46 20 54 31 C46 37 33 37 26 31 Z' fill='#2fb34f'/>
            <path d='M40 26 C40 16 46 10 56 10' stroke='#238b3c' stroke-width='6' fill='none' stroke-linecap='round'/>`,
        3: `<defs><radialGradient id='o' cx='.38' cy='.4' r='.75'><stop offset='0' stop-color='#e2a8ff'/><stop offset='.55' stop-color='#a542e6'/><stop offset='1' stop-color='#6a1fb0'/></radialGradient></defs>
            <path d='M44 86 L40 94 M50 87 V95 M56 86 L60 94' stroke='#e9d3b0' stroke-width='3' stroke-linecap='round'/>
            <path d='M50 14 C54 30 84 38 82 62 C80 80 66 88 50 88 C34 88 20 80 18 62 C16 38 46 30 50 14 Z' fill='url(#o)'/>
            <path d='M50 20 C38 40 34 62 42 86 M50 20 C62 40 66 62 58 86' stroke='#fff' stroke-opacity='.3' stroke-width='3' fill='none'/>
            <path d='M50 16 L45 5 M50 16 L56 6' stroke='#8bd06a' stroke-width='4' stroke-linecap='round'/>
            <ellipse cx='36' cy='54' rx='6' ry='10' fill='#fff' opacity='.35' transform='rotate(20 36 54)'/>`,
        4: `<defs><radialGradient id='a' cx='.45' cy='.35' r='.75'><stop offset='0' stop-color='#ffc46b'/><stop offset='.6' stop-color='#f08a24'/><stop offset='1' stop-color='#b8520f'/></radialGradient></defs>
            <path d='M44 58 L24 78' stroke='#fff3df' stroke-width='10' stroke-linecap='round'/>
            <circle cx='18' cy='76' r='7.5' fill='#fff3df' stroke='#e2cba7' stroke-width='2'/><circle cx='26' cy='84' r='7.5' fill='#fff3df' stroke='#e2cba7' stroke-width='2'/>
            <path d='M62 12 C86 12 94 40 82 58 C72 72 54 70 44 62 C34 54 32 38 40 26 C46 16 54 12 62 12 Z' fill='url(#a)'/>
            <g fill='#c45a14' opacity='.55'><circle cx='58' cy='30' r='2.5'/><circle cx='72' cy='40' r='2.5'/><circle cx='54' cy='48' r='2.5'/><circle cx='68' cy='56' r='2'/><circle cx='78' cy='26' r='2'/></g>
            <ellipse cx='54' cy='24' rx='8' ry='5' fill='#fff' opacity='.5' transform='rotate(-30 54 24)'/>`,
        5: `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#8ef06b'/><stop offset='1' stop-color='#1f9e3e'/></linearGradient></defs>
            <path d='M50 10 C80 16 90 46 78 70 C70 84 58 90 50 90 C42 90 30 84 22 70 C10 46 20 16 50 10 Z' fill='url(#g)'/>
            <path d='M50 22 V90' stroke='#efffe2' stroke-width='6' stroke-linecap='round'/>
            <path d='M50 40 L34 30 M50 40 L66 30 M50 56 L30 46 M50 56 L70 46 M50 72 L34 64 M50 72 L66 64' stroke='#d4f7bf' stroke-width='3' stroke-linecap='round'/>
            <ellipse cx='34' cy='40' rx='5' ry='10' fill='#fff' opacity='.3' transform='rotate(20 34 40)'/>`,
        // Pisau (match 4)
        [KNIFE]: `<defs>${glow("gl", "#fff3a0", "#ffb800")}<linearGradient id='bl' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff'/><stop offset='.5' stop-color='#c9d3df'/><stop offset='1' stop-color='#8796a8'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <g transform='rotate(-40 50 50)'><rect x='8' y='43' width='34' height='14' rx='6' fill='#8a4b1f'/><circle cx='18' cy='50' r='2.2' fill='#f5d7a1'/><circle cx='30' cy='50' r='2.2' fill='#f5d7a1'/>
            <rect x='40' y='41' width='6' height='18' rx='2' fill='#5b6675'/>
            <path d='M46 40 H82 C94 40 96 48 92 52 L84 60 H46 Z' fill='url(#bl)' stroke='#6c7a8c' stroke-width='1.5'/>
            <path d='M50 45 H82' stroke='#fff' stroke-width='2.5' stroke-linecap='round' opacity='.8'/></g>`,
        // Wajan panas (match 5)
        [WOK]: `<defs>${glow("gl", "#ffcf8a", "#ff6a00")}<linearGradient id='p' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#6b6b72'/><stop offset='1' stop-color='#1c1c20'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <path d='M30 46 C24 32 36 26 34 12 C46 20 52 28 48 40 C56 34 58 26 56 18 C68 30 66 42 58 48 Z' fill='#ff7a1a'/>
            <path d='M38 46 C36 38 42 34 42 26 C48 32 50 38 48 46 Z' fill='#ffd84a'/>
            <rect x='74' y='54' width='24' height='8' rx='4' fill='#7a4519' transform='rotate(-12 74 54)'/>
            <ellipse cx='46' cy='62' rx='36' ry='16' fill='url(#p)'/>
            <ellipse cx='46' cy='57' rx='31' ry='9' fill='#3d3d44'/>
            <path d='M22 60 C30 66 44 68 58 66' stroke='#fff' stroke-opacity='.35' stroke-width='3' fill='none' stroke-linecap='round'/>`,
        // Panci api (match 6)
        [POT]: `<defs>${glow("gl", "#ffb3c2", "#ff2d55")}<linearGradient id='pt' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ff7b7b'/><stop offset='1' stop-color='#b3162a'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <path d='M24 96 C22 86 30 84 30 76 C36 82 38 88 36 96 Z M42 96 C40 84 50 82 48 72 C56 80 58 88 56 96 Z M62 96 C60 86 68 84 68 76 C74 82 76 88 74 96 Z' fill='#ff8a1a'/>
            <rect x='20' y='38' width='60' height='40' rx='9' fill='url(#pt)'/>
            <rect x='8' y='44' width='14' height='7' rx='3.5' fill='#7d0f1f'/><rect x='78' y='44' width='14' height='7' rx='3.5' fill='#7d0f1f'/>
            <path d='M16 36 C26 24 74 24 84 36 Z' fill='#e5e7eb'/><circle cx='50' cy='22' r='5' fill='#9ca3af'/>
            <path d='M28 48 V68' stroke='#fff' stroke-opacity='.4' stroke-width='5' stroke-linecap='round'/>`,
        // Sutil emas nenek (match 7+)
        [GOLD]: `<defs>${glow("gl", "#fffbe0", "#ffcc00")}<linearGradient id='gd' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fff2a8'/><stop offset='.5' stop-color='#ffc928'/><stop offset='1' stop-color='#c98a00'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <g transform='rotate(35 50 50)'><rect x='45' y='52' width='10' height='42' rx='5' fill='#8a4b1f'/><rect x='46' y='46' width='8' height='10' fill='#c98a00'/>
            <path d='M30 8 H70 V40 Q50 54 30 40 Z' fill='url(#gd)' stroke='#a87000' stroke-width='2'/>
            <path d='M40 16 V36 M50 16 V40 M60 16 V36' stroke='#a87000' stroke-width='3' stroke-linecap='round'/></g>
            <path d='M82 10 L85 18 L93 21 L85 24 L82 32 L79 24 L71 21 L79 18 Z M16 66 L18 72 L24 74 L18 76 L16 82 L14 76 L8 74 L14 72 Z' fill='#fff'/>`,

        // ---------- Power-up berbayar ----------
        // Ulekan: cobek batu + ulekan + sambal
        "b-hammer": `<defs>${glow("gl", "#ffe1c2", "#ff9a3c")}<linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#9b928b'/><stop offset='1' stop-color='#4a4440'/></linearGradient><linearGradient id='u' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#b3aaa2'/><stop offset='1' stop-color='#5c5550'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <ellipse cx='50' cy='60' rx='40' ry='11' fill='#2f2a27'/>
            <ellipse cx='50' cy='61' rx='31' ry='7' fill='#d62839'/>
            <g fill='#ff8a8a'><circle cx='38' cy='60' r='2'/><circle cx='56' cy='63' r='2'/><circle cx='64' cy='59' r='1.6'/><circle cx='46' cy='64' r='1.6'/></g>
            <g fill='#3fb950'><circle cx='42' cy='58' r='1.8'/><circle cx='60' cy='61' r='1.6'/></g>
            <g transform='rotate(38 60 36)'><rect x='51' y='4' width='20' height='54' rx='10' fill='url(#u)'/><ellipse cx='58' cy='14' rx='3' ry='8' fill='#fff' opacity='.35'/></g>
            <path d='M10 60 Q10 92 50 92 Q90 92 90 60 Q90 71 50 71 Q10 71 10 60 Z' fill='url(#s)'/>
            <path d='M18 72 Q26 84 42 86' stroke='#fff' stroke-opacity='.3' stroke-width='4' fill='none' stroke-linecap='round'/>`,
        // Kocok Ulang: pengocok kawat + panah putar
        "b-shuffle": `<defs>${glow("gl", "#c9fff5", "#21b8a6")}</defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <path d='M16 48 A34 34 0 0 1 72 22' stroke='#14a090' stroke-width='7' fill='none' stroke-linecap='round'/>
            <path d='M64 11 L82 22 L67 34 Z' fill='#14a090'/>
            <path d='M84 52 A34 34 0 0 1 28 78' stroke='#14a090' stroke-width='7' fill='none' stroke-linecap='round'/>
            <path d='M36 89 L18 78 L33 66 Z' fill='#14a090'/>
            <g transform='rotate(-35 50 50)'>
              <rect x='45' y='58' width='10' height='30' rx='5' fill='#ff8a3d' stroke='#c9561a' stroke-width='2'/>
              <path d='M50 60 C26 42 36 10 50 10 C64 10 74 42 50 60 Z' fill='none' stroke='#8fa3b5' stroke-width='3.5'/>
              <path d='M50 60 C36 42 42 10 50 10 C58 10 64 42 50 60 Z' fill='none' stroke='#c9d6e2' stroke-width='3'/>
              <path d='M50 10 V60' stroke='#e9f0f6' stroke-width='3'/>
            </g>`,
        // Tambah Waktu: jam pasir kayu + tanda plus
        "b-extra": `<defs>${glow("gl", "#fff0b8", "#ffb800")}<linearGradient id='w' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#d08a48'/><stop offset='1' stop-color='#7a4519'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <rect x='26' y='18' width='5' height='64' fill='#8a5320'/><rect x='65' y='18' width='5' height='64' fill='#8a5320'/>
            <path d='M33 20 H63 C63 38 52 44 50 50 C52 56 63 62 63 80 H33 C33 62 44 56 46 50 C44 44 33 38 33 20 Z' fill='#e4f5ff' fill-opacity='.9' stroke='#8fbfe0' stroke-width='2'/>
            <path d='M37 27 H59 C57 37 50 41 48 46 C46 41 39 37 37 27 Z' fill='#ffc21a'/>
            <rect x='47' y='46' width='2.5' height='18' fill='#ffc21a'/>
            <path d='M35 78 C38 67 45 64 48 62 C51 64 58 67 61 78 Z' fill='#ffc21a'/>
            <path d='M38 24 V40' stroke='#fff' stroke-width='3' stroke-linecap='round' opacity='.7'/>
            <rect x='20' y='10' width='56' height='10' rx='4' fill='url(#w)'/><rect x='20' y='80' width='56' height='10' rx='4' fill='url(#w)'/>
            <circle cx='76' cy='74' r='17' fill='#2fb34f' stroke='#fff' stroke-width='3.5'/>
            <path d='M76 65 V83 M67 74 H85' stroke='#fff' stroke-width='5.5' stroke-linecap='round'/>`,
        // Garam Ajaib: botol garam kaca + kilau sihir
        "b-salt": `<defs>${glow("gl", "#ecd2ff", "#a542e6")}<linearGradient id='cap' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#ffffff'/><stop offset='.5' stop-color='#c3ccd6'/><stop offset='1' stop-color='#7d8a99'/></linearGradient></defs>
            <circle cx='50' cy='50' r='48' fill='url(#gl)'/>
            <path d='M30 42 H66 L70 88 Q70 92 66 92 H30 Q26 92 26 88 Z' fill='#eaf5ff' fill-opacity='.95' stroke='#9fbad3' stroke-width='2.5'/>
            <path d='M28.6 62 H67.6 L69.8 88 Q70 90 66 90 H30 Q26.4 90 26.4 88 Z' fill='#fff'/>
            <g fill='#c7d3df'><circle cx='36' cy='70' r='1.6'/><circle cx='48' cy='76' r='1.6'/><circle cx='58' cy='68' r='1.6'/><circle cx='42' cy='84' r='1.6'/><circle cx='60' cy='82' r='1.6'/></g>
            <path d='M33 48 V84' stroke='#fff' stroke-width='4' stroke-linecap='round' opacity='.9'/>
            <path d='M28 42 C28 22 68 22 68 42 Z' fill='url(#cap)' stroke='#6b7785' stroke-width='2'/>
            <g fill='#4b5563'><circle cx='40' cy='34' r='2'/><circle cx='48' cy='30' r='2'/><circle cx='56' cy='34' r='2'/><circle cx='48' cy='37' r='2'/></g>
            <path d='M80 10 L83 19 L92 22 L83 25 L80 34 L77 25 L68 22 L77 19 Z' fill='#b259f0'/>
            <path d='M86 44 L88 49 L93 51 L88 53 L86 58 L84 53 L79 51 L84 49 Z' fill='#ffc93c'/>
            <path d='M14 16 L16 21 L21 23 L16 25 L14 30 L12 25 L7 23 L12 21 Z' fill='#ffc93c'/>`,
        // Bahan busuk
        [ROTTEN]: `<defs><radialGradient id='m' cx='.4' cy='.35' r='.75'><stop offset='0' stop-color='#9c8f7a'/><stop offset='1' stop-color='#4a4034'/></radialGradient></defs>
            <path d='M36 22 C32 17 40 14 36 8 M50 20 C46 15 54 12 50 6 M64 22 C60 17 68 14 64 8' stroke='#8fcf4f' stroke-width='3' fill='none' stroke-linecap='round'/>
            <path d='M50 28 C68 26 84 38 84 58 C86 78 70 90 50 90 C28 92 14 78 16 58 C16 38 32 30 50 28 Z' fill='url(#m)'/>
            <g fill='#7fbf3f' opacity='.85'><circle cx='34' cy='44' r='6'/><circle cx='66' cy='74' r='7'/><circle cx='44' cy='80' r='4'/><circle cx='70' cy='42' r='3.5'/></g>
            <path d='M38 54 L46 62 M46 54 L38 62 M56 54 L64 62 M64 54 L56 62' stroke='#2a241d' stroke-width='3.5' stroke-linecap='round'/>`,
        // Kardus utuh
        [BOX]: `<defs><linearGradient id='k' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#e2ab6c'/><stop offset='1' stop-color='#a8692f'/></linearGradient></defs>
            <rect x='8' y='14' width='84' height='76' rx='7' fill='url(#k)' stroke='#7a4519' stroke-width='3'/>
            <path d='M8 32 H92' stroke='#8a5320' stroke-width='3'/>
            <rect x='42' y='14' width='16' height='76' fill='#f1dca2' opacity='.95'/>
            <circle cx='50' cy='62' r='13' fill='#fff4d6' stroke='#7a4519' stroke-width='2.5'/>
            <text x='50' y='70' font-family='Arial, sans-serif' font-size='22' font-weight='bold' text-anchor='middle' fill='#b3162a'>?</text>`,
        // Kardus retak (sisa 1 pukulan)
        [BOX_CRACK]: `<defs><linearGradient id='k' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#cf9658'/><stop offset='1' stop-color='#8c5524'/></linearGradient></defs>
            <rect x='8' y='14' width='84' height='76' rx='7' fill='url(#k)' stroke='#6a3a12' stroke-width='3'/>
            <path d='M8 32 H92' stroke='#6a3a12' stroke-width='3'/>
            <path d='M42 14 H58 V40 L50 48 L42 40 Z' fill='#e7cf93' opacity='.9'/>
            <path d='M22 20 L34 44 L26 58 L38 80 M74 22 L64 46 L76 62 L66 86 M50 48 L54 62 L46 74' stroke='#4a2a0e' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
            <path d='M40 54 Q50 46 60 54 L58 70 Q50 76 42 70 Z' fill='#fff4d6' stroke='#b08a52' stroke-width='2'/>
            <circle cx='54' cy='64' r='4' fill='#d62839'/>`,
        // Kertas resep rahasia
        [SECRET]: `<defs><linearGradient id='pa' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fff6dc'/><stop offset='1' stop-color='#e6c98b'/></linearGradient></defs>
            <path d='M22 14 H76 Q86 14 86 24 V84 H32 Q22 84 22 74 Z' fill='url(#pa)' stroke='#b08a52' stroke-width='2.5'/>
            <path d='M22 74 Q22 64 32 64 Q40 64 40 74 Q40 84 32 84' fill='#e2c283' stroke='#b08a52' stroke-width='2.5'/>
            <path d='M34 28 H74 M34 38 H74 M34 48 H66' stroke='#9c7440' stroke-width='3.5' stroke-linecap='round'/>
            <circle cx='66' cy='68' r='12' fill='#d62839' stroke='#9e1426' stroke-width='2'/>
            <path d='M66 61 L68 66 L73 66 L69 69 L71 74 L66 71 L61 74 L63 69 L59 66 L64 66 Z' fill='#ffd1d6'/>`,
    };

    const ING = [
        { name: "Nasi", color: "#5aa9ff" },
        { name: "Telur", color: "#ffc21a" },
        { name: "Cabai", color: "#ff3b4a" },
        { name: "Bawang Merah", color: "#b259f0" },
        { name: "Ayam", color: "#f08a24" },
        { name: "Sayur", color: "#4cd35a" },
    ];
    const NASI = 0, TELUR = 1, CABAI = 2, BAWANG = 3, AYAM = 4, SAYUR = 5;
    const FX_COLOR = { [KNIFE]: "#ffd54a", [WOK]: "#ff8a1a", [POT]: "#ff3b5c", [GOLD]: "#ffe066", [ROTTEN]: "#7a6b58", [BOX]: "#c98a4b", [SECRET]: "#f3dca0" };
    const SPECIAL_INFO = {
        [KNIFE]: { name: "Pisau", made: "Match 4", what: "Tebas 1 baris + 1 kolom", fire: "Tebasan pisau! 🔪" },
        [WOK]: { name: "Wajan Panas", made: "Match 5 / bentuk L-T", what: "Ledakan 3×3", fire: "Wajan meledak! 🍳" },
        [POT]: { name: "Panci Api", made: "Match 6", what: "Ledakan 4×4", fire: "Panci api! 🔥" },
        [GOLD]: { name: "Sutil Emas Nenek", made: "Match 7+", what: "Bersihkan seluruh papan", fire: "Sutil Emas Nenek! ✨" },
    };
    const nameOf = k => (k == SECRET ? "Resep Rahasia" : ING[k].name);

    (function injectIconCss() {
        const css = Object.entries(ICONS).map(([k, body]) => {
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${body.replace(/\s+/g, " ")}</svg>`;
            return `.t-${k}{background-image:url("data:image/svg+xml,${encodeURIComponent(svg)}")}`;
        }).join("\n");
        const st = document.createElement("style");
        st.textContent = css;
        document.head.appendChild(st);
    })();
    const ico = v => `<i class="ico t-${v}"></i>`;

    // =====================================================================
    // CERITA & 10 RESEP
    // tier: normal | medium (langkah + waktu) | hard (medium + kardus)
    // =====================================================================
    const PROLOGUE = "Cucuku, warung ini sepi sejak Resto Megah buka di seberang jalan. " +
        "Nenek titipkan buku resep ini padamu. Bumbu rahasia nenek tersimpan di kardus-kardus tua di dapur. Setiap pelanggan yang puas akan membuka resep berikutnya. Masak dengan hati, ya.";
    const ENDING = "Warung Nenek Sri menjuarai Festival Kuliner Kota, dan Resto Megah kini justru memesan bumbu dari warungmu. Tamat! 🎉";

    const RECIPES = [
        {
            name: "Telur Dadar Bawang", dish: "🍳", customer: "Pak Darto, tetangga sebelah", avatar: "👴", tier: "normal",
            intro: "Lho, kamu cucunya Bu Sri ya? Sudah lama warung ini tutup. Saya kangen telur dadar bawang buatan nenekmu. Tolong buatkan satu, ya.",
            win: "Rasanya persis seperti dulu! Besok saya ajak teman-teman ke sini.",
            lose: "Belum jadi ya? Tidak apa-apa, saya tunggu.",
            goals: { [TELUR]: 12, [BAWANG]: 10 }, moves: 20,
        },
        {
            name: "Nasi Goreng Kampung", dish: "🍛", customer: "Mbak Rina, anak kos", avatar: "👩‍🎓", tier: "normal",
            intro: "Katanya warung ini buka lagi? Aku pesan nasi goreng yang pedas, tapi jangan lama-lama, ada kuliah pagi!",
            win: "Enak banget dan murah! Langsung aku posting di grup angkatan.",
            lose: "Aduh, aku telat kuliah… lain kali ya.",
            goals: { [NASI]: 15, [TELUR]: 8, [CABAI]: 10 }, moves: 24,
        },
        {
            name: "Sayur Asem Segar", dish: "🥗", customer: "Bu Lurah", avatar: "👩", tier: "medium", time: 80,
            intro: "Arisan dimulai sebentar lagi! Saya pesan sayur asem yang segar, dan waktunya mepet ya. Kalau enak, warungmu saya rekomendasikan ke ibu-ibu sekampung.",
            win: "Segar sekali, dan tepat waktu! Ibu-ibu arisan pasti jadi langganan.",
            lose: "Aduh, arisannya sudah mulai… coba lagi ya.",
            goals: { [SAYUR]: 20, [CABAI]: 8, [BAWANG]: 10 }, moves: 20,
        },
        {
            name: "Ayam Geprek Sambal", dish: "🍗", customer: "Rombongan ojol", avatar: "🛵", tier: "normal",
            intro: "Bos, Resto Megah di seberang kemahalan. Kami pesan ayam geprek, sambalnya yang nendang ya!",
            win: "Mantap, pedasnya juara! Warung ini resmi jadi markas kami.",
            lose: "Kelamaan, Bos, orderan kami numpuk…",
            goals: { [AYAM]: 18, [CABAI]: 16, [BAWANG]: 8 }, moves: 26,
        },
        {
            name: "Nasi Campur Spesial", dish: "🍱", customer: "Pak Darmo, kritikus kuliner", avatar: "🧐", tier: "hard", time: 90, boxes: 4,
            intro: "Saya dengar warung kecil ini membuat Resto Megah gelisah. Nasi campur Anda hanya akan istimewa dengan bumbu rahasia nenek Anda. " +
                "Kertas resepnya ada di dalam kardus-kardus tua itu. Pecahkan kardusnya dengan match di sebelahnya atau dengan power-up.",
            win: "Luar biasa. Bumbu rahasia ini… Warung Nenek Sri pantas mendapat bintang dari saya.",
            lose: "Belum layak. Silakan coba lagi kalau Anda siap.",
            goals: { [NASI]: 14, [AYAM]: 12, [SAYUR]: 12, [SECRET]: 3 }, moves: 20,
        },
        {
            name: "Soto Ayam Lamongan", dish: "🍲", customer: "Pak Haji Somad, rombongan pengajian", avatar: "👳", tier: "normal",
            intro: "Ulasan Pak Darmo sudah viral! Kami serombongan dari pengajian mau coba soto ayamnya. Kuahnya yang gurih ya, Nak.",
            win: "Masya Allah, gurihnya pas. Minggu depan kami pesan untuk acara lagi.",
            lose: "Tidak apa-apa, Nak. Kami sabar menunggu.",
            goals: { [AYAM]: 18, [SAYUR]: 12, [BAWANG]: 12 }, moves: 26,
        },
        {
            name: "Gado-Gado Betawi", dish: "🥙", customer: "Mister John, turis dari Australia", avatar: "🧔", tier: "normal",
            intro: "Hello! My guidebook says this warung is… mantap? Saya mau coba gado-gado, yang banyak sayurnya, please!",
            win: "Wow, terima kasih! Best salad in my life. I'll tell all my friends!",
            lose: "No worries, mate. Let's try again!",
            goals: { [SAYUR]: 22, [TELUR]: 14 }, moves: 24,
        },
        {
            name: "Nasi Uduk Komplit", dish: "🍚", customer: "Bu Ratna, katering kantor", avatar: "👩‍💼", tier: "medium", time: 95,
            intro: "Kantor saya ada rapat besar jam sembilan. Saya pesan nasi uduk komplit, dan harus siap sebelum rapat dimulai!",
            win: "Pas sebelum rapat! Bos saya langsung tanya ini katering dari mana.",
            lose: "Rapatnya sudah mulai… besok coba lagi ya.",
            goals: { [NASI]: 18, [TELUR]: 12, [AYAM]: 12 }, moves: 22,
        },
        {
            name: "Sambal Bajak Pedas", dish: "🌶️", customer: "Chef Bram, kepala koki Resto Megah", avatar: "👨‍🍳", tier: "medium", time: 85, boss: true,
            intro: "Jadi ini warung yang mencuri pelangganku? Ayo adu sambal! Tapi jangan kaget kalau dapurmu kutaburi bahan busuk setiap 4 langkah. " +
                "Bahan busuk tidak bisa digeser; hancurkan dengan match di sebelahnya.",
            win: "…Sambalmu lebih nendang dari punyaku. Aku akui kekalahan.",
            lose: "Hah! Dapurmu belum siap menghadapi Resto Megah.",
            goals: { [CABAI]: 22, [BAWANG]: 16 }, moves: 22,
        },
        {
            name: "Nasi Tumpeng Syukuran", dish: "🍙", customer: "Panitia Festival Kuliner Kota", avatar: "🎪", tier: "hard", time: 60, boxes: 5,
            intro: "Selamat, warung Anda masuk final Festival Kuliner Kota! Masakan final: nasi tumpeng lengkap dengan semua bumbu rahasia nenek. " +
                "Kumpulkan kertas resep dari kardus, dan selesaikan sebelum waktu juri habis.",
            win: "Juri sepakat: juara pertama Festival Kuliner Kota adalah Warung Nenek Sri!",
            lose: "Waktu juri habis. Masih ada kesempatan, coba lagi!",
            goals: { [NASI]: 18, [AYAM]: 14, [SAYUR]: 12, [TELUR]: 10, [SECRET]: 4 }, moves: 24,
        },
    ];
    const TIER_LABEL = { normal: "🌱 EASY", medium: "⚡ MEDIUM", hard: "🔥 HARD" };
    // Bintang berdasarkan EFISIENSI (bukan skor):
    //   sisa langkah % = (batas langkah asli − langkah terpakai) / batas langkah asli
    //   sisa waktu %   = (batas waktu asli − waktu bermain nyata) / batas waktu asli
    //   E = sisa langkah %            (level tanpa waktu)
    //   E = rata-rata keduanya        (level berwaktu)
    // Tambahan dari power-up Tambah Waktu & isi ulang waktu tidak ikut dihitung.
    const STAR_EFFICIENCY = { normal: [0.35, 0.55], medium: [0.20, 0.35], hard: [0.10, 0.25] }; // [★★, ★★★]
    const BONUS_PER_MOVE = 60, BONUS_PER_SEC = 5;
    function efficiencyOf(rc) {
        const movesPct = Math.max(0, rc.moves - movesUsed) / rc.moves;
        if (!rc.time) return movesPct;
        const timePct = Math.max(0, rc.time - playElapsed) / rc.time;
        return (movesPct + timePct) / 2;
    }
    const PRAISE = ["", "", "Mantap! 👍", "Lezat! 😋", "Juara Rasa! 🔥", "Masakan Dewa! 👑"];

    // =====================================================================
    // PENYIMPANAN (dengan fallback memori & validasi data)
    // =====================================================================
    const PREFIX = "dapurNenek.";
    const PROGRESS_KEYS = ["stars", "high", "coins", "inv", "prologue", "tutorial", "seen"];
    const KEY_LABEL = { stars: "bintang & resep", high: "rekor Endless", coins: "koin", inv: "power-up", prologue: "status cerita", tutorial: "status tutorial", seen: "kartu mekanik" };
    const store = {
        mem: {},
        persistent: (() => {
            try { localStorage.setItem(PREFIX + "__t", "1"); localStorage.removeItem(PREFIX + "__t"); return true; }
            catch (e) { return false; }
        })(),
        corrupt: [],
        get(k, d) {
            let raw = null;
            if (this.persistent) { try { raw = localStorage.getItem(PREFIX + k); } catch (e) { raw = null; } }
            if (raw === null) return k in this.mem ? this.mem[k] : d;
            try { return JSON.parse(raw); }
            catch (e) { if (!this.corrupt.includes(k)) this.corrupt.push(k); return d; }
        },
        set(k, v) {
            this.mem[k] = v;
            if (!this.persistent) return false;
            try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); return true; }
            catch (e) { return false; }
        },
        remove(k) {
            delete this.mem[k];
            if (!this.persistent) return true;
            try { localStorage.removeItem(PREFIX + k); return localStorage.getItem(PREFIX + k) === null; }
            catch (e) { return false; }
        },
    };
    let saveWarned = false;
    function save(k, v) {
        const ok = store.set(k, v);
        if (!ok && store.persistent && !saveWarned) {
            saveWarned = true;
            notify("⚠️ Progres gagal disimpan (penyimpanan browser penuh/diblokir). Progres hanya bertahan selama tab ini terbuka.", "err", 4500);
        }
        return ok;
    }

    // Getter yang membersihkan data rusak/aneh
    const clampInt = (x, lo, hi, d) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
    const getStars = () => {
        const s = store.get("stars", []);
        const arr = Array.isArray(s) ? s : [];
        return RECIPES.map((_, i) => clampInt(arr[i], 0, 3, 0));
    };
    const getCoins = () => clampInt(store.get("coins", START_COINS), 0, 999999, START_COINS);
    const getHigh = () => clampInt(store.get("high", 0), 0, 1e9, 0);
    const getInv = () => {
        const raw = store.get("inv", START_INV);
        const obj = raw && typeof raw === "object" ? raw : START_INV;
        const inv = {};
        BOOSTERS.forEach(b => { inv[b.id] = clampInt(obj[b.id], 0, MAX_STOCK, START_INV[b.id]); });
        return inv;
    };

    // ---------- Pengaturan (tidak ikut terhapus saat reset progres) ----------
    const DEFAULT_SETTINGS = { music: 0.7, sfx: 0.8, fast: false, hints: true, shake: true };
    function loadSettings() {
        const raw = store.get("settings", null);
        const o = raw && typeof raw === "object" ? raw : {};
        const st = { ...DEFAULT_SETTINGS };
        ["music", "sfx"].forEach(k => { const n = Number(o[k]); if (Number.isFinite(n)) st[k] = Math.min(1, Math.max(0, n)); });
        ["fast", "hints", "shake"].forEach(k => { if (typeof o[k] === "boolean") st[k] = o[k]; });
        if (raw === null && store.get("muted", false) === true) { st.music = 0; st.sfx = 0; } // migrasi tombol Suara lama
        return st;
    }
    let settings = loadSettings();
    // Durasi animasi mengikuti pengaturan kecepatan
    const A = ms => Math.round(ms * (settings.fast ? 0.6 : 1));

    // =====================================================================
    // STATE PERMAINAN
    // =====================================================================
    let board = new Array(N).fill(null); // { v, el, ic, hp }
    let mode = null;                      // "story" | "endless"
    let recipeIdx = 0, recipe = null;
    let goalsLeft = {};
    let movesLeft = 0, movesUsed = 0;
    let score = 0, high = 0, newRecord = false;
    let busy = false, ended = true, paused = false;
    let selected = null, targeting = null;
    let tut = null; // status tutorial interaktif (null = tidak aktif)
    let playElapsed = 0; // detik bermain nyata (tidak jalan saat dijeda)
    let timed = false, timeLeft = 0, timeMax = 0, timeSpeedup = false;
    // Endless: kecepatan waktu naik 10% setiap 2.000 poin, maksimal ×1,5
    const RUSH_STEP = 2000, RUSH_INC = 0.1, RUSH_MAX_LEVEL = 5;
    let rushLevel = 0;
    const rushMult = () => 1 + RUSH_INC * rushLevel;
    const fmtMult = m => "×" + m.toFixed(1).replace(".", ",");
    let tickTimer = null, hintTimer = null, toastTimer = null, noticeTimer = null;
    let session = 0;
    let inv = getInv();
    let prevScreen = "home";

    // =====================================================================
    // DOM & UTILITAS
    // =====================================================================
    const $ = id => document.getElementById(id);
    const boardEl = $("board"), layer = $("layer"), fx = $("fx"), cursor = $("cursor");

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const rnd = n => Math.floor(Math.random() * n);
    const isIng = v => v >= 0 && v < ING.length;
    const rowOf = i => Math.floor(i / W), colOf = i => i % W;
    const alive = s => s === session;
    const val = i => board[i] ? board[i].v : EMPTY;
    const colorOf = v => isIng(v) ? ING[v].color : (FX_COLOR[v] || "#fff");

    function neighbors(i) {
        const r = rowOf(i), c = colOf(i), out = [];
        if (c > 0) out.push(i - 1);
        if (c < W - 1) out.push(i + 1);
        if (r > 0) out.push(i - W);
        if (r < W - 1) out.push(i + W);
        return out;
    }
    const adjacent = (a, b) => neighbors(a).includes(b);

    // =====================================================================
    // AUDIO (Web Audio, tanpa file)
    // =====================================================================
    let actx = null;
    function tone(freq, dur = 0.09, type = "sine", vol = 0.12, delay = 0, slideTo = null) {
        if (settings.sfx <= 0) return;
        vol *= settings.sfx * 1.25;
        try {
            if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
            const t = actx.currentTime + delay;
            const o = actx.createOscillator(), g = actx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, t);
            if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            o.connect(g); g.connect(actx.destination);
            o.start(t); o.stop(t + dur);
        } catch (e) { /* audio tidak tersedia */ }
    }
    const sfx = {
        tick: () => tone(660, 0.04, "sine", 0.06),
        swoosh: () => tone(300, 0.12, "sine", 0.05, 0, 520),
        bad: () => tone(150, 0.16, "square", 0.06),
        match: c => { const f = 392 * Math.pow(1.122, c - 1); tone(f, 0.1, "triangle"); tone(f * 1.5, 0.12, "triangle", 0.08, 0.06); },
        knife: () => tone(1200, 0.3, "sawtooth", 0.07, 0, 180),
        boom: () => { tone(160, 0.4, "sawtooth", 0.1, 0, 40); tone(90, 0.5, "square", 0.06, 0.02, 30); },
        gold: () => [784, 988, 1175, 1568, 1976].forEach((f, k) => tone(f, 0.2, "triangle", 0.09, k * 0.06)),
        box: () => tone(240, 0.12, "square", 0.07, 0, 120),
        paper: () => [880, 1320].forEach((f, k) => tone(f, 0.12, "sine", 0.08, k * 0.08)),
        coin: () => [988, 1319].forEach((f, k) => tone(f, 0.1, "square", 0.05, k * 0.07)),
        rotten: () => tone(220, 0.35, "square", 0.05, 0, 90),
        special: () => [523, 784, 1047].forEach((f, k) => tone(f, 0.12, "triangle", 0.08, k * 0.05)),
        win: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.18, "triangle", 0.12, k * 0.12)),
        // Bahan berjatuhan saat level dimulai: desir + "tok" per baris yang mendarat
        intro: () => {
            tone(500, 0.35, "sine", 0.05, 0, 180);
            for (let k = 0; k < W; k++) {
                const t = A(520 + k * 45 + 100) / 1000;
                tone(260 + k * 40, 0.07, "triangle", 0.09, t, 140 + k * 20);
                tone(900 + k * 80, 0.03, "sine", 0.03, t);
            }
        },
        lose: () => [392, 330, 262].forEach((f, k) => tone(f, 0.22, "sine", 0.1, k * 0.18)),
    };

    // =====================================================================
    // BIDAK & ANIMASI
    // =====================================================================
    const posOf = (r, c) => `translate(${c * 100}%, ${r * 100}%)`;

    function makePiece(v, hp = 0) {
        const el = document.createElement("div");
        el.className = "piece";
        const ic = document.createElement("div");
        el.appendChild(ic);
        const p = { v, el, ic, hp };
        setValue(p, v);
        layer.appendChild(el);
        return p;
    }
    function setValue(p, v) {
        p.v = v;
        const iconId = v === BOX && p.hp <= 1 ? BOX_CRACK : v;
        p.ic.className = "ic t-" + iconId;
    }
    function place(p, r, c) {
        p.el.style.transition = "none";
        p.el.style.transform = posOf(r, c);
    }
    function moveTo(p, r, c, ms, ease = "cubic-bezier(.3,.8,.4,1)", delay = 0) {
        p.el.style.transition = `transform ${ms}ms ${ease} ${delay}ms`;
        p.el.style.transform = posOf(r, c);
    }
    const reflow = () => void layer.offsetWidth;

    function land(p) {
        p.ic.animate([
            { transform: "scale(1.14, .82)" }, { transform: "scale(.94, 1.07)" }, { transform: "scale(1, 1)" },
        ], { duration: 260, easing: "ease-out" });
    }
    function shakePiece(p) {
        p.ic.animate([
            { transform: "translateX(0)" }, { transform: "translateX(-14%)" },
            { transform: "translateX(12%)" }, { transform: "translateX(-6%)" }, { transform: "translateX(0)" },
        ], { duration: 300, easing: "ease-out" });
    }
    function morph(p) {
        p.ic.animate([
            { transform: "scale(0) rotate(-180deg)" },
            { transform: "scale(1.25) rotate(10deg)", offset: .7 },
            { transform: "scale(1) rotate(0)" },
        ], { duration: 420, easing: "ease-out" });
    }
    function thump(p) {
        p.ic.animate([
            { transform: "scale(1)" }, { transform: "scale(.82) rotate(-6deg)" }, { transform: "scale(1.08) rotate(4deg)" }, { transform: "scale(1)" },
        ], { duration: 320, easing: "ease-out" });
    }
    function shakeBoard(power = 6) {
        if (!settings.shake) return;
        boardEl.animate([
            { transform: "translate(0,0)" }, { transform: `translate(${-power}px, ${power / 2}px)` },
            { transform: `translate(${power}px, ${-power / 2}px)` }, { transform: `translate(${-power / 2}px, 0)` },
            { transform: "translate(0,0)" },
        ], { duration: 320, easing: "ease-out" });
    }
    function fxEl(cls, style) {
        const d = document.createElement("div");
        d.className = cls;
        Object.assign(d.style, style);
        fx.appendChild(d);
        return d;
    }
    function burst(i, color, count = 6) {
        const r = rowOf(i), c = colOf(i);
        for (let k = 0; k < count; k++) {
            const d = fxEl("particle", { left: (c + .5) * 12.5 + "%", top: (r + .5) * 12.5 + "%", background: color });
            const ang = Math.random() * Math.PI * 2, dist = 25 + Math.random() * 35;
            d.animate([
                { transform: "translate(0,0) scale(1)", opacity: 1 },
                { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) scale(0)`, opacity: .2 },
            ], { duration: 450 + Math.random() * 200, easing: "cubic-bezier(.2,.8,.4,1)" }).onfinish = () => d.remove();
        }
    }
    function scorePop(cellsList, pts) {
        if (!cellsList.length || pts <= 0) return;
        let sr = 0, sc = 0;
        cellsList.forEach(i => { sr += rowOf(i); sc += colOf(i); });
        const d = fxEl("score-pop", { left: (sc / cellsList.length + .5) * 12.5 + "%", top: (sr / cellsList.length + .5) * 12.5 + "%" });
        d.textContent = "+" + pts;
        d.animate([
            { transform: "translate(-50%,-50%) scale(.5)", opacity: 0 },
            { transform: "translate(-50%,-90%) scale(1.15)", opacity: 1, offset: .25 },
            { transform: "translate(-50%,-200%) scale(1)", opacity: 0 },
        ], { duration: 900, easing: "ease-out" }).onfinish = () => d.remove();
    }
    function slash(r, c) {
        [true, false].forEach(horizontal => {
            const d = fxEl("slash", horizontal
                ? { left: "0", width: "100%", top: (r + .5) * 12.5 + "%", height: "8px", marginTop: "-4px" }
                : { top: "0", height: "100%", left: (c + .5) * 12.5 + "%", width: "8px", marginLeft: "-4px" });
            d.animate([
                { transform: horizontal ? "scaleX(0)" : "scaleY(0)", opacity: 1 },
                { transform: "scale(1)", opacity: 1, offset: .5 },
                { transform: "scale(1)", opacity: 0 },
            ], { duration: 380, easing: "ease-out" }).onfinish = () => d.remove();
        });
    }
    function ring(cx, cy, cells) {
        const d = fxEl("ring", { left: cx * 12.5 + "%", top: cy * 12.5 + "%", width: cells * 12.5 + "%", height: cells * 12.5 + "%" });
        d.animate([
            { transform: "translate(-50%,-50%) scale(.2)", opacity: 1 },
            { transform: "translate(-50%,-50%) scale(1.1)", opacity: .9, offset: .6 },
            { transform: "translate(-50%,-50%) scale(1.3)", opacity: 0 },
        ], { duration: 450, easing: "ease-out" }).onfinish = () => d.remove();
    }
    function flash() {
        const d = fxEl("flash", {});
        d.animate([{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: 0 }], { duration: 700, easing: "ease-out" }).onfinish = () => d.remove();
    }
    // Kertas resep terbang dari papan ke kotak target di HUD
    function flyToGoal(i, key) {
        const cellRect = layer.getBoundingClientRect(), cs = cellRect.width / W;
        const sx = cellRect.left + colOf(i) * cs, sy = cellRect.top + rowOf(i) * cs;
        const target = document.querySelector(`.goal[data-k="${key}"] .ico`);
        const tr = target ? target.getBoundingClientRect() : { left: sx, top: sy - 200, width: cs, height: cs };
        const d = document.createElement("div");
        d.className = "flyer t-" + key;
        Object.assign(d.style, { left: sx + "px", top: sy + "px", width: cs + "px", height: cs + "px" });
        document.body.appendChild(d);
        const dx = tr.left + tr.width / 2 - (sx + cs / 2), dy = tr.top + tr.height / 2 - (sy + cs / 2);
        d.animate([
            { transform: "translate(0,0) scale(.3) rotate(-20deg)", opacity: 0 },
            { transform: "translate(0,-20%) scale(1.4) rotate(8deg)", opacity: 1, offset: .25 },
            { transform: `translate(${dx}px, ${dy}px) scale(.5) rotate(0)`, opacity: 1 },
        ], { duration: 850, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = () => {
            d.remove();
            const g = document.querySelector(`.goal[data-k="${key}"]`);
            if (g) bumpEl(g);
        };
    }

    function toast(msg, ms = 1100) {
        const t = $("toast");
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("show"), ms);
    }
    function notify(msg, type = "", ms = 2600) {
        const n = $("notice");
        n.textContent = msg;
        n.className = "notice show " + type;
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => n.classList.remove("show"), ms);
    }
    function bumpEl(el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

    // Modal umum: { icon, title, text, actions: [{label, cls, onClick}] }
    function showModal({ icon = "", title, text = "", html = "", actions }) {
        $("mIcon").textContent = icon;
        $("mTitle").textContent = title;
        if (html) $("mText").innerHTML = html; else $("mText").textContent = text;
        const box = $("mActions");
        box.innerHTML = "";
        actions.forEach(a => {
            const b = document.createElement("button");
            b.className = "btn " + (a.cls || "primary");
            b.textContent = a.label;
            b.onclick = () => { closeModal(); if (a.onClick) a.onClick(); };
            box.appendChild(b);
        });
        $("modal").classList.add("show");
    }
    const closeModal = () => $("modal").classList.remove("show");

    // =====================================================================
    // HUD
    // =====================================================================
    let lastScoreShown = -1;
    function updateHud() {
        if (score !== lastScoreShown) { $("score").textContent = score; bumpEl($("score")); lastScoreShown = score; }
        if (mode === "story") {
            $("moves").textContent = movesLeft;
            $("statMoves").classList.toggle("warn", movesLeft <= 5);
            $("goals").innerHTML = Object.entries(goalsLeft).map(([k, v]) => {
                const total = recipe.goals[k], pct = Math.min(100, (total - Math.max(v, 0)) / total * 100);
                return `<div class="goal${v <= 0 ? " done" : ""}" data-k="${k}" title="${nameOf(k)}">${ico(k)}<b>${v <= 0 ? "✓" : v}</b><span class="prog" style="width:${pct}%"></span></div>`;
            }).join("");
        } else {
            $("high").textContent = high;
        }
    }
    function updateTimeBar() {
        const bar = $("timeBar");
        bar.style.width = Math.max(0, timeLeft / timeMax * 100) + "%";
        bar.classList.toggle("low", timeLeft < timeMax * .25);
        // Endless tidak menampilkan detik (laju waktunya berubah); yang tampil kecepatannya
        $("timeText").textContent = mode === "endless" ? `Kecepatan ${fmtMult(rushMult())}` : Math.max(0, Math.ceil(timeLeft)) + " detik";
    }
    function renderBoosters() {
        $("boosters").innerHTML = BOOSTERS.map(b =>
            `<button class="booster${inv[b.id] ? "" : " empty"}${targeting === b.id ? " active" : ""}" data-id="${b.id}" title="${b.name}: ${b.desc}">` +
            `<i class="ico t-b-${b.id}"></i><small>${b.name}</small><span class="cnt">${inv[b.id]}</span></button>`
        ).join("");
        boardEl.classList.toggle("targeting", !!targeting);
    }

    // =====================================================================
    // LOGIKA PAPAN
    // =====================================================================
    function findRuns() {
        const runs = [];
        for (let r = 0; r < W; r++) {
            let c = 0;
            while (c < W) {
                const v = val(r * W + c);
                let e = c;
                if (isIng(v)) while (e + 1 < W && val(r * W + e + 1) === v) e++;
                if (isIng(v) && e - c + 1 >= 3) {
                    const run = [];
                    for (let k = c; k <= e; k++) run.push(r * W + k);
                    runs.push(run);
                }
                c = e + 1;
            }
        }
        for (let c = 0; c < W; c++) {
            let r = 0;
            while (r < W) {
                const v = val(r * W + c);
                let e = r;
                if (isIng(v)) while (e + 1 < W && val((e + 1) * W + c) === v) e++;
                if (isIng(v) && e - r + 1 >= 3) {
                    const run = [];
                    for (let k = r; k <= e; k++) run.push(k * W + c);
                    runs.push(run);
                }
                r = e + 1;
            }
        }
        return runs;
    }

    // Gabungkan run yang bersilangan (bentuk L/T) menjadi satu grup
    function groupRuns(runs) {
        const parent = new Map();
        const find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
        runs.forEach(run => run.forEach(i => { if (!parent.has(i)) parent.set(i, i); }));
        runs.forEach(run => run.forEach(i => { const a = find(run[0]), b = find(i); if (a !== b) parent.set(a, b); }));
        const groups = new Map();
        runs.forEach(run => {
            const root = find(run[0]);
            if (!groups.has(root)) groups.set(root, { cells: new Set(), runs: [] });
            const g = groups.get(root);
            run.forEach(i => g.cells.add(i));
            g.runs.push(run);
        });
        return [...groups.values()];
    }
    const specialForSize = n => n >= 7 ? GOLD : n === 6 ? POT : n === 5 ? WOK : n === 4 ? KNIFE : null;

    function findHint() {
        for (let i = 0; i < N; i++) {
            for (const j of [i + 1, i + W]) {
                if (j >= N || (j === i + 1 && colOf(i) === W - 1)) continue;
                const a = val(i), b = val(j);
                if (isBlocker(a) || isBlocker(b) || a === EMPTY || b === EMPTY) continue;
                if (isSpecial(a) || isSpecial(b)) return [i, j];
                [board[i], board[j]] = [board[j], board[i]];
                const ok = findRuns().length > 0;
                [board[i], board[j]] = [board[j], board[i]];
                if (ok) return [i, j];
            }
        }
        return null;
    }

    function makesRun(i, v) {
        const r = rowOf(i), c = colOf(i);
        if (c >= 2 && val(i - 1) === v && val(i - 2) === v) return true;
        if (r >= 2 && val(i - W) === v && val(i - 2 * W) === v) return true;
        return false;
    }

    // Papan awal: tanpa match, ada langkah, plus kardus untuk level hard
    function freshBoard(boxes = 0) {
        layer.querySelectorAll(".piece").forEach(e => e.remove());
        let guard = 0;
        do {
            for (let i = 0; i < N; i++) {
                let v, g = 0;
                board[i] = null;
                do { v = rnd(ING.length); g++; } while (g < 30 && makesRun(i, v));
                board[i] = { v };
            }
            // kardus di baris 2-7, tidak bersebelahan langsung agar tidak menumpuk
            const spots = [];
            for (let i = 2 * W; i < N; i++) spots.push(i);
            let placed = 0;
            while (placed < boxes && spots.length) {
                const i = spots.splice(rnd(spots.length), 1)[0];
                if (neighbors(i).some(nb => val(nb) === BOX)) continue;
                board[i] = { v: BOX, hp: 2 };
                placed++;
            }
            guard++;
        } while ((findRuns().length || !findHint()) && guard < 500);

        for (let i = 0; i < N; i++) {
            const p = makePiece(board[i].v, board[i].hp || 0);
            board[i] = p;
            place(p, rowOf(i) - W - 1, colOf(i));
        }
        reflow();
        let maxT = 0;
        for (let i = 0; i < N; i++) {
            const r = rowOf(i), c = colOf(i), p = board[i];
            const delay = A(c * 30 + (W - 1 - r) * 45);
            moveTo(p, r, c, A(520), "cubic-bezier(.5,0,.75,1)", delay);
            setTimeout(() => { if (p.el.isConnected) land(p); }, A(520) + delay);
            maxT = Math.max(maxT, A(520) + delay);
        }
        sfx.intro();
        return maxT;
    }

    // Acak ulang: hanya bahan biasa yang berpindah, kardus/busuk/item tetap
    async function shuffleBoard(s, msg = "Bahan diatur ulang! 🔄") {
        toast(msg);
        const idx = [];
        for (let i = 0; i < N; i++) if (isIng(val(i))) idx.push(i);
        const original = idx.map(i => board[i]);
        let ok = false;
        for (let t = 0; t < 200 && !ok; t++) {
            const ps = original.slice();
            for (let k = ps.length - 1; k > 0; k--) {
                const j = rnd(k + 1);
                [ps[k], ps[j]] = [ps[j], ps[k]];
            }
            idx.forEach((i, k) => { board[i] = ps[k]; });
            ok = findRuns().length === 0 && !!findHint();
        }
        if (!ok) {
            let g = 0;
            do { idx.forEach(i => setValue(board[i], rnd(ING.length))); g++; } while ((findRuns().length || !findHint()) && g < 500);
        }
        await sleep(250);
        idx.forEach(i => moveTo(board[i], rowOf(i), colOf(i), 550, "cubic-bezier(.6,-0.3,.3,1.3)", rnd(120)));
        sfx.swoosh();
        await sleep(720);
        return alive(s);
    }

    // Pecahkan sel. spawns: Map(index -> jenis item spesial yang tercipta)
    async function clearCells(set, spawns, combo, s, destroyBoxes = false) {
        let n = 0;
        const popped = [];
        let boxHit = false;
        set.forEach(i => {
            const p = board[i];
            if (!p) return;
            const v = p.v;

            if (v === BOX) {
                p.hp = destroyBoxes ? 0 : p.hp - 1;
                boxHit = true;
                burst(i, FX_COLOR[BOX], 5);
                if (p.hp > 0) { setValue(p, BOX); thump(p); return; }
                // kardus pecah: keluar kertas resep rahasia
                n += 3;
                if (mode === "story" && goalsLeft[SECRET] > 0) goalsLeft[SECRET]--;
                setValue(p, SECRET);
                sfx.paper();
                flyToGoal(i, SECRET);
            } else if (isIng(v)) {
                n++;
                if (mode === "story" && goalsLeft[v] > 0) goalsLeft[v]--;
            } else if (v === ROTTEN) n += 2;
            else if (isSpecial(v)) n += 2;

            if (spawns.has(i)) {
                setValue(p, spawns.get(i));
                morph(p);
                return;
            }
            popped.push(i);
            if (v !== BOX) burst(i, colorOf(v), set.size > 12 ? 3 : 6);
            board[i] = null;
            p.el.style.zIndex = 3;
            p.ic.animate([
                { transform: "scale(1)", opacity: 1 },
                { transform: "scale(1.3)", opacity: 1, offset: .35 },
                { transform: "scale(0)", opacity: 0 },
            ], { duration: A(POP_MS), easing: "ease-in", fill: "forwards" }).onfinish = () => p.el.remove();
        });
        if (boxHit) sfx.box();
        const pts = n * 10 * combo;
        addScore(pts);
        scorePop(popped.length ? popped : [...set], pts);
        if (timed) { timeLeft = Math.min(timeMax, timeLeft + n * (mode === "endless" ? 0.35 : 0.2)); updateTimeBar(); }
        sfx.match(combo);
        updateHud();
        await sleep(A(POP_MS) - 30);
        return alive(s);
    }

    // Gravitasi: bahan meluncur turun, bahan baru jatuh dari atas
    async function gravity(s) {
        let maxT = 0;
        const fallMs = d => A(Math.min(560, 170 + 60 * d));
        const fallEase = "cubic-bezier(.45,0,.85,.5)";
        const pending = [];
        for (let c = 0; c < W; c++) {
            let write = W - 1;
            const colDelay = rnd(40);
            for (let r = W - 1; r >= 0; r--) {
                const i = r * W + c, p = board[i];
                if (!p) continue;
                if (r !== write) {
                    board[write * W + c] = p;
                    board[i] = null;
                    pending.push({ p, r: write, c, t: fallMs(write - r), delay: colDelay });
                }
                write--;
            }
            const m = write + 1;
            for (let r = write; r >= 0; r--) {
                const p = makePiece(rnd(ING.length));
                place(p, r - m, c);
                board[r * W + c] = p;
                pending.push({ p, r, c, t: fallMs(m), delay: colDelay + 40 });
            }
        }
        reflow();
        pending.forEach(({ p, r, c, t, delay }) => {
            moveTo(p, r, c, t, fallEase, delay);
            setTimeout(() => { if (p.el.isConnected) land(p); }, t + delay);
            maxT = Math.max(maxT, t + delay);
        });
        await sleep(maxT + 60);
        return alive(s);
    }

    // Selesaikan semua match beruntun; buat item spesial dari grup besar
    async function resolve(swapCells, s) {
        let combo = 0;
        while (true) {
            const runs = findRuns();
            if (!runs.length) break;
            combo++;
            const set = new Set();
            runs.forEach(run => run.forEach(i => set.add(i)));

            const spawns = new Map();
            groupRuns(runs).forEach(g => {
                const type = specialForSize(g.cells.size);
                if (!type) return;
                const cells = [...g.cells];
                let pos = cells.find(i => swapCells.includes(i));
                if (pos === undefined) pos = cells.find(i => g.runs.filter(r => r.includes(i)).length > 1);
                if (pos === undefined) { const longest = g.runs.reduce((a, b) => b.length > a.length ? b : a); pos = longest[Math.floor(longest.length / 2)]; }
                spawns.set(pos, type);
            });

            // penghalang di sebelah match ikut kena (busuk hancur, kardus retak)
            const extra = [];
            set.forEach(i => neighbors(i).forEach(nb => { if (isBlocker(val(nb))) extra.push(nb); }));
            extra.forEach(i => set.add(i));

            if (combo >= 3) shakeBoard(4);
            if (!await clearCells(set, spawns, combo, s)) return false;
            if (spawns.size) {
                const best = Math.max(...spawns.values());
                sfx.special();
                toast(`Dapat ${SPECIAL_INFO[best].name}!`, 1000);
            }
            swapCells = [];
            if (!await gravity(s)) return false;
        }
        if (combo >= 2) toast(PRAISE[Math.min(combo, PRAISE.length - 1)]);
        return true;
    }

    // Area efek setiap item spesial
    function areaOf(type, i) {
        const r = rowOf(i), c = colOf(i), out = [];
        const box = (r0, r1, c0, c1) => {
            for (let rr = Math.max(0, r0); rr <= Math.min(W - 1, r1); rr++)
                for (let cc = Math.max(0, c0); cc <= Math.min(W - 1, c1); cc++) out.push(rr * W + cc);
        };
        if (type === KNIFE) { for (let x = 0; x < W; x++) out.push(r * W + x, x * W + c); }
        else if (type === WOK) box(r - 1, r + 1, c - 1, c + 1);
        else if (type === POT) box(r - 1, r + 2, c - 1, c + 2);
        else if (type === GOLD) box(0, W - 1, 0, W - 1);
        return out;
    }
    function playEffect(type, i) {
        const r = rowOf(i), c = colOf(i);
        if (type === KNIFE) { slash(r, c); sfx.knife(); }
        else if (type === WOK) { ring(c + .5, r + .5, 3); sfx.boom(); }
        else if (type === POT) { ring(c + 1, r + 1, 4); sfx.boom(); }
        else if (type === GOLD) { flash(); sfx.gold(); }
    }

    // Aktifkan item spesial; item lain yang terkena ikut meledak berantai
    async function triggerSpecials(starts, s) {
        const set = new Set(), fired = new Set(), queue = [...starts];
        let destroyBoxes = false, strongest = KNIFE;
        while (queue.length) {
            const q = queue.shift();
            if (fired.has(q)) continue;
            const t = val(q);
            if (!isSpecial(t)) continue;
            fired.add(q);
            if (t === GOLD) destroyBoxes = true;
            strongest = Math.max(strongest, t);
            playEffect(t, q);
            set.add(q);
            areaOf(t, q).forEach(i => {
                set.add(i);
                if (isSpecial(val(i)) && !fired.has(i)) queue.push(i);
            });
        }
        toast(fired.size > 1 ? `Reaksi berantai ×${fired.size}! 💥` : SPECIAL_INFO[strongest].fire);
        shakeBoard(strongest === GOLD ? 12 : strongest === KNIFE ? 6 : 9);
        await sleep(A(170));
        if (!alive(s)) return false;
        if (!await clearCells(set, new Map(), 2, s, destroyBoxes)) return false;
        return gravity(s);
    }

    async function spawnRotten(count, s) {
        const pool = [];
        for (let i = 0; i < N; i++) if (isIng(val(i))) pool.push(i);
        for (let k = 0; k < count && pool.length; k++) {
            const i = pool.splice(rnd(pool.length), 1)[0];
            setValue(board[i], ROTTEN);
            morph(board[i]);
            burst(i, FX_COLOR[ROTTEN], 5);
        }
        sfx.rotten();
        toast("Chef Bram menaburkan bahan busuk! 🦠", 1400);
        await sleep(500);
        return alive(s);
    }

    // =====================================================================
    // INPUT
    // =====================================================================
    function select(i) {
        if (selected !== null && board[selected]) board[selected].ic.classList.remove("sel");
        selected = i;
        if (i === null) { cursor.classList.remove("on"); return; }
        board[i].ic.classList.add("sel");
        cursor.style.transform = posOf(rowOf(i), colOf(i));
        cursor.classList.add("on");
    }

    async function swapAnim(a, b) {
        const pa = board[a], pb = board[b];
        board[a] = pb; board[b] = pa;
        pa.el.style.zIndex = 2;
        moveTo(pa, rowOf(b), colOf(b), A(SWAP_MS));
        moveTo(pb, rowOf(a), colOf(a), A(SWAP_MS));
        await sleep(A(SWAP_MS) + 10);
        pa.el.style.zIndex = "";
    }

    async function trySwap(a, b) {
        if (busy || ended || paused || !adjacent(a, b)) return;
        if (tut && !tutAllowsSwap(a, b)) { tutNudge(); return; }
        const s = session;
        const pa = board[a], pb = board[b];
        if (!pa || !pb) return;
        clearHint();
        select(null);
        if (isBlocker(pa.v) || isBlocker(pb.v)) {
            shakePiece(pa); shakePiece(pb); sfx.bad(); armHint();
            if (pa.v === BOX || pb.v === BOX) toast("Kardus tidak bisa digeser 📦", 900);
            return;
        }
        busy = true;
        sfx.swoosh();
        await swapAnim(a, b);
        if (!alive(s)) return;

        if (isSpecial(pa.v) || isSpecial(pb.v)) {
            useMove();
            const starts = [];
            if (isSpecial(pa.v)) starts.push(b); // posisi baru pa
            if (isSpecial(pb.v)) starts.push(a);
            if (!await triggerSpecials(starts, s)) return;
            if (!await resolve([], s)) return;
        } else if (findRuns().length) {
            useMove();
            if (!await resolve([a, b], s)) return;
        } else {
            sfx.bad();
            if (mode === "endless") penalizeTime(WRONG_MOVE_PENALTY);
            await swapAnim(a, b);
            if (!alive(s)) return;
            shakePiece(pa); shakePiece(pb);
            busy = false; armHint();
            return;
        }
        await afterMove(s, true);
    }

    // Aktifkan power-up gratis langsung di tempat (ketuk dua kali), tanpa menggeser
    async function activateSpecial(i) {
        if (busy || ended || paused || !isSpecial(val(i))) return;
        if (tut && tut.knife !== i) { tutNudge(); return; }
        const s = session;
        busy = true;
        clearHint();
        useMove();
        if (!await triggerSpecials([i], s)) return;
        if (!await resolve([], s)) return;
        await afterMove(s, true);
    }

    // Penalti waktu Endless untuk tukar yang tidak menghasilkan match
    function penalizeTime(sec) {
        timeLeft = Math.max(0, timeLeft - sec);
        updateTimeBar();
        toast("Salah langkah! Waktu berkurang", 900);
        $("timeWrap").animate([
            { transform: "translateX(0)", boxShadow: "0 0 0 0 rgba(230,57,70,0)" },
            { transform: "translateX(-6px)", boxShadow: "0 0 0 4px rgba(230,57,70,.6)" },
            { transform: "translateX(6px)" }, { transform: "translateX(0)", boxShadow: "0 0 0 0 rgba(230,57,70,0)" },
        ], { duration: 400, easing: "ease-out" });
    }

    function useMove() {
        movesUsed++;
        if (mode === "story") movesLeft--;
        updateHud();
    }

    async function afterMove(s, usedMove) {
        if (mode === "story") {
            if (Object.values(goalsLeft).every(v => v <= 0)) { busy = false; return winRecipe(); }
            if (movesLeft <= 0) { busy = false; return loseRecipe("moves"); }
            if (timed && timeLeft <= 0) { busy = false; return loseRecipe("time"); }
            if (usedMove && recipe.boss && movesUsed % 4 === 0) {
                if (!await spawnRotten(2, s)) return;
            }
        }
        if (mode === "endless" && timeLeft <= 0) { busy = false; return endEndless(); }
        if (!findHint()) { if (!await shuffleBoard(s)) return; }
        busy = false;
        armHint();
        if (tut) tutAfterMove();
    }

    function handleTap(i) {
        if (busy || ended || paused) return;
        if (tut && !tutAllowsTap(i)) { tutNudge(); return; }
        if (targeting) { applyTargetBooster(i); return; }
        clearHint(); armHint();
        if (selected === null) { select(i); sfx.tick(); }
        else if (selected === i) {
            select(null);
            if (isSpecial(val(i))) activateSpecial(i);
        }
        else if (adjacent(selected, i)) { const sel = selected; select(null); trySwap(sel, i); }
        else { select(i); sfx.tick(); }
    }

    function cellAt(e) {
        const rect = layer.getBoundingClientRect();
        const c = Math.floor((e.clientX - rect.left) / rect.width * W);
        const r = Math.floor((e.clientY - rect.top) / rect.height * W);
        if (r < 0 || r >= W || c < 0 || c >= W) return null;
        return r * W + c;
    }

    let drag = null;
    boardEl.addEventListener("pointerdown", e => {
        const i = cellAt(e);
        if (i === null) return;
        e.preventDefault();
        drag = { i, x: e.clientX, y: e.clientY, moved: false };
    });
    window.addEventListener("pointermove", e => {
        if (!drag || drag.moved || targeting) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        const thr = layer.getBoundingClientRect().width / W * 0.3;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < thr) return;
        drag.moved = true;
        const i = drag.i, r = rowOf(i), c = colOf(i);
        let t = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && c < W - 1) t = i + 1; else if (dx < 0 && c > 0) t = i - 1;
        } else {
            if (dy > 0 && r < W - 1) t = i + W; else if (dy < 0 && r > 0) t = i - W;
        }
        if (t !== null) { select(null); trySwap(i, t); }
    });
    window.addEventListener("pointerup", () => { if (drag && !drag.moved) handleTap(drag.i); drag = null; });
    window.addEventListener("pointercancel", () => { drag = null; });

    function armHint() {
        clearTimeout(hintTimer);
        if (!settings.hints || tut) return;
        hintTimer = setTimeout(() => {
            if (busy || ended || paused || targeting) return;
            const h = findHint();
            if (h) h.forEach(i => board[i].ic.classList.add("hint"));
        }, 5000);
    }
    function clearHint() {
        clearTimeout(hintTimer);
        layer.querySelectorAll(".hint").forEach(e => e.classList.remove("hint"));
    }

    function addScore(n) {
        score += n;
        if (mode === "endless" && score > high) {
            if (!newRecord && high > 0) toast("Rekor baru! 🏆", 1300);
            high = score; newRecord = true;
            save("high", high);
        }
    }

    // =====================================================================
    // POWER-UP TERBATAS (BOOSTER)
    // =====================================================================
    function consume(id) {
        inv[id] = Math.max(0, inv[id] - 1);
        save("inv", inv);
        renderBoosters();
    }

    async function useBooster(id) {
        if (ended) return;
        if (busy || paused) { toast("Tunggu sebentar…", 700); return; }
        if (tut) { toast("Selesaikan tutorial dulu, ya", 1000); return; }
        const b = BOOSTERS.find(x => x.id === id);
        if (!b) return;
        if (inv[id] <= 0) { notify(`${b.name} habis. Beli di Toko Bumbu dari Buku Resep.`, "err"); sfx.bad(); return; }

        if (id === "hammer" || id === "salt") {
            targeting = targeting === id ? null : id;
            select(null); clearHint();
            renderBoosters();
            if (targeting) toast(id === "hammer" ? "Ketuk yang ingin diulek" : "Ketuk satu jenis bahan", 1500);
            else armHint();
            return;
        }
        const s = session;
        if (id === "shuffle") {
            consume(id);
            busy = true; clearHint(); select(null);
            if (!await shuffleBoard(s, "Kocok ulang!")) return;
            busy = false; armHint();
        } else if (id === "extra") {
            consume(id);
            const parts = [];
            if (mode === "story") { movesLeft += 5; parts.push("+5 langkah"); }
            if (timed) { timeLeft += 15; timeMax = Math.max(timeMax, timeLeft); updateTimeBar(); parts.push("+15 detik"); }
            updateHud();
            sfx.coin();
            toast(parts.join(" · "), 1300);
        }
    }

    async function applyTargetBooster(i) {
        const id = targeting, v = val(i);
        if (id === "salt" && !isIng(v)) { toast("Pilih bahan biasa, bukan item/penghalang", 1200); sfx.bad(); return; }
        if (v === EMPTY) return;
        targeting = null;
        consume(id);
        const s = session;
        busy = true; clearHint();
        if (id === "hammer") {
            const p = board[i];
            p.ic.animate([{ transform: "scale(1)" }, { transform: "scale(1.3) rotate(-15deg)" }, { transform: "scale(.7)" }], { duration: 200 });
            shakeBoard(5);
            await sleep(180);
            if (!alive(s)) return;
            if (isSpecial(v)) { if (!await triggerSpecials([i], s)) return; }
            else {
                if (!await clearCells(new Set([i]), new Map(), 1, s)) return;
                if (!await gravity(s)) return;
            }
        } else if (id === "salt") {
            const set = new Set();
            for (let k = 0; k < N; k++) if (val(k) === v) set.add(k);
            set.forEach(k => board[k].ic.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 300 }));
            toast(`Garam ajaib: semua ${ING[v].name} hilang!`, 1300);
            await sleep(300);
            if (!alive(s)) return;
            if (!await clearCells(set, new Map(), 1, s)) return;
            if (!await gravity(s)) return;
        }
        if (!await resolve([], s)) return;
        await afterMove(s, false);
    }

    $("boosters").addEventListener("click", e => {
        const btn = e.target.closest(".booster");
        if (btn) useBooster(btn.dataset.id);
    });

    // =====================================================================
    // TOKO
    // =====================================================================
    function renderShop() {
        const coins = getCoins();
        inv = getInv();
        $("shopCoins").textContent = coins;
        $("shopList").innerHTML = BOOSTERS.map(b => {
            const full = inv[b.id] >= MAX_STOCK;
            return `<div class="shop-item" data-id="${b.id}"><i class="ico big t-b-${b.id}"></i><h4>${b.name}</h4><p>${b.desc}</p>` +
                `<span class="owned">Punya: ${inv[b.id]}/${MAX_STOCK}</span>` +
                `<button class="btn ${coins >= b.price && !full ? "secondary" : "ghost"} small buy" data-id="${b.id}">${full ? "Stok penuh" : `Beli · 🪙 ${b.price}`}</button></div>`;
        }).join("");
    }
    function buy(id) {
        const b = BOOSTERS.find(x => x.id === id);
        if (!b) return;
        const coins = getCoins(), cur = getInv();
        const card = document.querySelector(`.shop-item[data-id="${id}"]`);
        const fail = msg => { notify(msg, "err"); sfx.bad(); if (card) bumpShake(card); };
        if (cur[id] >= MAX_STOCK) return fail(`Stok ${b.name} sudah penuh (maksimal ${MAX_STOCK}).`);
        if (coins < b.price) return fail(`Koin kurang ${b.price - coins} lagi. Masak resep untuk mengumpulkan koin.`);
        const next = { ...cur, [id]: cur[id] + 1 };
        const ok1 = save("coins", coins - b.price);
        const ok2 = save("inv", next);
        if (store.persistent && (!ok1 || !ok2)) {
            // rollback agar koin dan item tetap konsisten
            store.set("coins", coins); store.set("inv", cur);
            return fail("Pembelian dibatalkan: progres tidak bisa disimpan ke browser.");
        }
        inv = next;
        sfx.coin();
        notify(`${b.name} dibeli! Sisa koin ${coins - b.price}.`, "ok");
        renderShop();
    }
    function bumpShake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
    $("shopList").addEventListener("click", e => {
        const btn = e.target.closest(".buy");
        if (btn) buy(btn.dataset.id);
    });
    function openShop() {
        const active = document.querySelector(".screen.active");
        prevScreen = active && active.id !== "shop" ? active.id : "home";
        showScreen("shop");
    }

    // =====================================================================
    // RESET PROGRES
    // =====================================================================
    function askReset() {
        if (mode && !ended) { notify("Selesaikan atau keluar dari permainan dulu sebelum mereset.", "err"); return; }
        showModal({
            icon: "🗑️", title: "Reset Progres?",
            text: "Semua bintang, resep yang terbuka, koin, power-up, dan rekor Endless akan dihapus. Kamu akan mulai lagi dari Resep 1. Tindakan ini tidak bisa dibatalkan.",
            actions: [
                { label: "Batal", cls: "secondary" },
                { label: "Ya, Reset", cls: "danger", onClick: doReset },
            ],
        });
    }
    function doReset() {
        stopGame(); session++; mode = null;
        const failed = [];
        PROGRESS_KEYS.forEach(k => { if (!store.remove(k)) failed.push(k); });
        // verifikasi: tidak boleh ada sisa data progres
        PROGRESS_KEYS.forEach(k => {
            if (failed.includes(k)) return;
            if (store.persistent) {
                try { if (localStorage.getItem(PREFIX + k) !== null) failed.push(k); } catch (e) { failed.push(k); }
            }
        });
        inv = getInv();
        if (failed.length) {
            showModal({
                icon: "⚠️", title: "Reset Gagal",
                text: `Sebagian data tidak bisa dihapus (${failed.map(k => KEY_LABEL[k] || k).join(", ")}). Kemungkinan penyimpanan browser diblokir atau sedang dipakai tab lain. Tutup tab lain game ini lalu coba lagi, atau hapus data situs dari pengaturan browser.`,
                actions: [{ label: "Coba Lagi", onClick: doReset }, { label: "Tutup", cls: "secondary" }],
            });
        } else {
            notify("Progres berhasil direset. Selamat memasak dari awal! 🍳", "ok");
        }
        showScreen("home");
    }

    // =====================================================================
    // ALUR LAYAR
    // =====================================================================
    function showScreen(id) {
        document.querySelectorAll(".screen").forEach(el => el.classList.toggle("active", el.id === id));
        menuMusic(MENU_SCREENS.includes(id));
        $("result").classList.remove("show");
        if (id === "home") {
            $("homeHigh").textContent = getHigh();
            $("homeCoins").textContent = getCoins();
        }
        if (id === "map") renderMap();
        if (id === "shop") renderShop();
    }

    function rankTitle(total) {
        if (total >= 30) return "👑 Legenda Kuliner";
        if (total >= 24) return "🌟 Restoran Bintang";
        if (total >= 16) return "🏠 Rumah Makan Terkenal";
        if (total >= 8) return "🍽️ Kedai Ramai";
        return "🪑 Warung Sederhana";
    }
    const starHtml = n => [0, 1, 2].map(k => k < n ? "★" : `<span class="off">★</span>`).join("");
    const tierBadge = t => TIER_LABEL[t] ? `<span class="tier ${t}">${TIER_LABEL[t]}</span>` : "";

    function renderMap() {
        const stars = getStars();
        const total = stars.reduce((a, b) => a + b, 0);
        $("totalStars").textContent = total;
        $("rankTitle").textContent = rankTitle(total);
        $("mapCoins").textContent = getCoins();
        const list = $("recipeList");
        list.innerHTML = "";
        RECIPES.forEach((rc, i) => {
            const unlocked = i === 0 || stars[i - 1] > 0;
            const card = document.createElement("button");
            card.className = `recipe-card ${rc.tier}` + (unlocked ? "" : " locked") + (rc.boss ? " boss" : "");
            card.disabled = !unlocked;
            card.style.animationDelay = i * 50 + "ms";
            const goals = Object.entries(rc.goals).map(([k, v]) => `<span>${ico(k)}${v}</span>`).join("");
            const extra = `<span>👣${rc.moves}</span>` + (rc.time ? `<span>⏱️${rc.time}s</span>` : "");
            card.innerHTML =
                `<span class="rc-dish">${unlocked ? rc.dish : "🔒"}</span>` +
                `<span class="rc-info"><b>${i + 1}. ${unlocked ? rc.name : "???"} ${tierBadge(rc.tier)}</b>` +
                `<small>${unlocked ? rc.customer + (rc.boss ? " · BOS" : "") : "Selesaikan resep sebelumnya"}</small>` +
                (unlocked ? `<span class="rc-goals">${goals}${extra}</span>` : "") + `</span>` +
                `<span class="rc-stars">${starHtml(stars[i])}</span>`;
            if (unlocked) card.addEventListener("click", () => openRecipeDialog(i));
            list.appendChild(card);
        });
    }

    function openDialog({ avatar, name, text, tierHtml = "", orderHtml = "", goText, onGo, onBack }) {
        $("dlgAvatar").textContent = avatar;
        $("dlgName").textContent = name;
        $("dlgTier").innerHTML = tierHtml;
        $("dlgText").textContent = text;
        $("dlgOrder").innerHTML = orderHtml;
        $("btnDlgGo").textContent = goText;
        $("btnDlgGo").onclick = onGo;
        $("btnDlgBack").onclick = onBack;
        showScreen("dialog");
    }

    function openRecipeDialog(i) {
        const rc = RECIPES[i];
        const order = Object.entries(rc.goals).map(([k, v]) => `<span class="chip">${ico(k)} ${nameOf(k)} ×${v}</span>`).join("") +
            `<span class="chip warn">👣 ${rc.moves} langkah</span>` +
            (rc.time ? `<span class="chip warn">⏱️ ${rc.time} detik</span>` : "");
        openDialog({
            avatar: rc.avatar, name: rc.customer, text: `“${rc.intro}”`,
            tierHtml: tierBadge(rc.tier),
            orderHtml: `<div class="order-title"><small>PESANAN</small><span class="od-dish">${rc.dish}</span><b>${rc.name}</b></div>` + order,
            goText: "Mulai Masak 🔥", onGo: () => beginRecipe(i), onBack: () => showScreen("map"),
        });
    }

    function enterStory() {
        if (!store.get("prologue", false)) {
            openDialog({
                avatar: "👵", name: "Surat dari Nenek Sri", text: `“${PROLOGUE}”`,
                goText: "Buka Buku Resep 📖",
                onGo: () => { save("prologue", true); showScreen("map"); },
                onBack: () => showScreen("home"),
            });
        } else showScreen("map");
    }

    function startTimer(seconds, speedup) {
        timed = true; timeMax = seconds; timeLeft = seconds; timeSpeedup = speedup; rushLevel = 0;
        updateTimeBar();
        tickTimer = setInterval(() => {
            if (ended || paused) return;
            playElapsed += 0.1;
            if (timeSpeedup) {
                const lv = Math.min(RUSH_MAX_LEVEL, Math.floor(score / RUSH_STEP));
                if (lv > rushLevel) {
                    rushLevel = lv;
                    toast(`Dapur makin sibuk! ${fmtMult(rushMult())}`, 1300);
                    sfx.special();
                    $("timeWrap").animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 400 });
                }
            }
            timeLeft -= 0.1 * (timeSpeedup ? rushMult() : 1);
            updateTimeBar();
            if (timeLeft <= 0 && !busy) {
                if (mode === "endless") endEndless(); else loseRecipe("time");
            }
        }, 100);
    }

    function resetGame(newMode, boxes = 0) {
        stopGame();
        session++;
        const s = session;
        mode = newMode;
        score = 0; movesUsed = 0; lastScoreShown = -1; playElapsed = 0;
        ended = false; paused = false; newRecord = false; targeting = null; timed = false;
        inv = getInv();
        select(null);
        fx.querySelectorAll(".particle,.score-pop,.slash,.ring,.flash").forEach(e => e.remove());
        document.querySelectorAll(".flyer").forEach(e => e.remove());
        setPaused(false);
        showScreen("game");
        renderBoosters();
        busy = true;
        const introMs = freshBoard(boxes);
        setTimeout(() => { if (alive(s)) { busy = false; armHint(); } }, introMs);
        return introMs;
    }
    function layoutHud(story, hasTime) {
        $("statMoves").style.display = story ? "" : "none";
        $("goals").style.display = story ? "" : "none";
        $("statHigh").style.display = story ? "none" : "";
        $("timeWrap").style.display = hasTime ? "" : "none";
        $("btnPause").style.display = hasTime ? "" : "none";
    }

    function startRecipe(i) {
        recipeIdx = i; recipe = RECIPES[i];
        goalsLeft = { ...recipe.goals };
        movesLeft = recipe.moves;
        const introMs = resetGame("story", recipe.boxes || 0);
        const s0 = session;
        if (i === 0 && !store.get("tutorial", false)) setTimeout(() => { if (alive(s0) && !ended) tutStart(); }, introMs + 80);
        layoutHud(true, !!recipe.time);
        if (recipe.time) startTimer(recipe.time, false);
        $("hudTitle").innerHTML = `${recipe.dish} ${recipe.name} ${tierBadge(recipe.tier)}`;
        $("hudNote").innerHTML = recipe.tier === "hard"
            ? `Pecahkan ${ico(BOX)} kardus (2 kali kena) untuk mengeluarkan ${ico(SECRET)} resep rahasia.`
            : recipe.boss ? `Waktu berjalan, dan setiap 4 langkah muncul ${ico(ROTTEN)}. Hancurkan dengan match di sebelahnya.`
            : recipe.time ? "Waktu terus berjalan! Setiap bahan yang dimasak menambah sedikit waktu."
            : `Pelanggan: ${recipe.customer}. Sisa langkah jadi bonus skor.`;
        updateHud();
    }

    function startEndless() {
        resetGame("endless");
        high = getHigh();
        layoutHud(false, true);
        startTimer(ENDLESS_TIME, true);
        $("hudTitle").textContent = "⏱️ Jam Sibuk";
        $("hudNote").textContent = "Setiap bahan yang dimasak menambah waktu. Setiap 2.000 poin dapur makin sibuk dan waktu berjalan sedikit lebih cepat!";
        updateHud();
    }

    function stopGame() {
        if (tut) tutEnd(false);
        clearInterval(tickTimer);
        clearHint();
        ended = true;
        targeting = null;
    }

    // =====================================================================
    // HASIL & KOIN
    // =====================================================================
    function awardCoins(sc) {
        const earned = coinsFor(sc);
        save("coins", getCoins() + earned);
        const tier = COIN_TIERS.find(t => sc >= t.min);
        const next = COIN_TIERS[COIN_TIERS.indexOf(tier) - 1];
        return { earned, hint: next ? `Skor ${next.min}+ dapat ${next.coins} koin` : "Tier koin tertinggi!" };
    }

    // score: { base, bonus, total } atau { base } saja
    function showResult({ icon, title, stars = null, text, note = "", score: sc = null, coins = null, primary, onPrimary, secondary, onSecondary, tertiary = "", onTertiary = null }) {
        $("resIcon").textContent = icon;
        $("resTitle").textContent = title;
        $("resStars").innerHTML = stars === null ? "" :
            [0, 1, 2].map(k => `<span class="star${k < stars ? " on" : ""}" style="animation-delay:${200 + k * 220}ms">★</span>`).join("");
        $("resText").textContent = text;
        $("resNote").textContent = note;
        let box = "";
        if (sc) {
            box = `<span class="lbl">SKOR :</span><span class="base">${sc.base}</span>`;
            if (sc.bonus !== undefined) box += `<span class="bonus">+${sc.bonus} (bonus skor)</span><span class="total">TOTAL : ${sc.total}</span>`;
            if (sc.extra) box += `<span class="bonus">${sc.extra}</span>`;
        }
        $("resScoreBox").innerHTML = box;
        $("resScoreBox").style.display = box ? "" : "none";
        $("resCoins").textContent = coins === null ? "" : `+${coins} koin 🪙`;
        $("resPrimary").textContent = primary;
        $("resPrimary").onclick = onPrimary;
        $("resSecondary").textContent = secondary;
        $("resSecondary").onclick = onSecondary;
        $("resTertiary").textContent = tertiary;
        $("resTertiary").style.display = tertiary ? "" : "none";
        $("resTertiary").onclick = onTertiary;
        $("result").classList.add("show");
    }

    function winRecipe() {
        if (ended) return;
        stopGame();
        const base = score;
        const bonus = movesLeft * BONUS_PER_MOVE + (timed ? Math.max(0, Math.floor(timeLeft)) * BONUS_PER_SEC : 0);
        score += bonus;
        updateHud();
        const eff = efficiencyOf(recipe);
        const [e2, e3] = STAR_EFFICIENCY[recipe.tier];
        const st = 1 + (eff >= e2 ? 1 : 0) + (eff >= e3 ? 1 : 0);
        const stars = getStars();
        const firstClear = stars[recipeIdx] === 0;
        stars[recipeIdx] = Math.max(stars[recipeIdx], st);
        save("stars", stars);
        const coin = awardCoins(score);
        sfx.win();
        const last = recipeIdx === RECIPES.length - 1;
        const note = firstClear ? (last ? ENDING : `Resep baru terbuka: ${RECIPES[recipeIdx + 1].name}!`) : "";
        setTimeout(() => showResult({
            icon: recipe.dish, title: "Hidangan Tersaji!", stars: st,
            text: `“${recipe.win}” — ${recipe.customer}`, note,
            score: { base, bonus, total: score }, coins: coin.earned,
            primary: last ? "Buku Resep" : "Resep Berikutnya",
            onPrimary: () => last ? showScreen("map") : openRecipeDialog(recipeIdx + 1),
            secondary: "Ulangi", onSecondary: () => startRecipe(recipeIdx),
            tertiary: last ? "🏠 Menu Utama" : "📖 Kembali ke Buku Resep",
            onTertiary: () => showScreen(last ? "home" : "map"),
        }), 400);
    }

    function loseRecipe(reason) {
        if (ended) return;
        stopGame();
        sfx.lose();
        const sisa = Object.entries(goalsLeft).filter(([, v]) => v > 0).map(([k, v]) => `${nameOf(k)} ×${v}`).join(", ");
        setTimeout(() => showResult({
            icon: reason === "time" ? "⏰" : "😢", title: reason === "time" ? "Waktu Habis…" : "Langkah Habis…",
            text: `“${recipe.lose}” — ${recipe.customer}`,
            note: `Bahan yang masih kurang: ${sisa}`,
            score: { base: score },
            primary: "Coba Lagi", onPrimary: () => startRecipe(recipeIdx),
            secondary: "Buku Resep", onSecondary: () => showScreen("map"),
        }), 400);
    }

    function endEndless() {
        if (ended) return;
        stopGame();
        newRecord ? sfx.win() : sfx.lose();
        const coin = awardCoins(score);
        showResult({
            icon: newRecord ? "🏆" : "⏱️", title: newRecord ? "High Score Baru!" : "Waktu Habis!",
            text: newRecord ? "Dapur paling sibuk sepanjang sejarah warung!" : "Pelanggan sudah pulang. Coba kalahkan high score-mu!",
            score: { base: score, extra: `High Score : ${high}` }, coins: coin.earned,
            primary: "Main Lagi", onPrimary: startEndless,
            secondary: "Menu", onSecondary: () => showScreen("home"),
        });
    }

    // =====================================================================
    // DEKORASI & INFO STATIS
    // =====================================================================
    (function floaters() {
        const box = $("floaters");
        const spots = [[6, 22], [86, 18], [12, 70], [90, 62], [4, 45], [93, 88], [22, 90], [78, 40], [70, 92], [30, 12]];
        spots.forEach(([x, y], k) => {
            const e = document.createElement("i");
            e.className = "ico t-" + (k % ING.length);
            const size = 40 + rnd(36);
            Object.assign(e.style, { left: x + "%", top: y + "%", width: size + "px", height: size + "px", animationDelay: -rnd(6000) + "ms" });
            box.appendChild(e);
        });
    })();
    $("tierTable").innerHTML = COIN_TIERS.slice().reverse().map((t, k, arr) => {
        const nxt = arr[k + 1];
        return `<tr><td>Skor ${t.min}${nxt ? `–${nxt.min - 1}` : "+"}</td><td>🪙 ${t.coins}</td></tr>`;
    }).join("");
    $("legend").innerHTML = SPECIALS.map(t =>
        `<div>${ico(t)}<span>${SPECIAL_INFO[t].name}<small>${SPECIAL_INFO[t].made}: ${SPECIAL_INFO[t].what}. Geser, atau ketuk 2x.</small></span></div>`
    ).join("");

    // =====================================================================
    // MUSIK LATAR MENU (file audio/menu.*)
    // =====================================================================
    const MENU_SCREENS = ["home", "map", "shop", "dialog"];
    const BGM_SOURCES = ["audio/menu.mp3", "audio/menu.ogg", "audio/menu.wav", "audio/menu.m4a"];
    const bgmVol = () => 0.5 * settings.music;
    const musicOff = () => settings.music <= 0;
    const bgm = new Audio();
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = 0;
    let bgmIdx = 0, bgmWanted = false, bgmFade = null, bgmUnavailable = false;
    bgm.src = BGM_SOURCES[0];
    // Kalau format pertama tidak ada, coba format berikutnya
    bgm.addEventListener("error", () => {
        bgmIdx++;
        if (bgmIdx < BGM_SOURCES.length) { bgm.src = BGM_SOURCES[bgmIdx]; if (bgmWanted && !musicOff()) startBgm(); }
        else { bgmUnavailable = true; console.warn("Musik menu tidak ditemukan: taruh audio/menu.mp3 (atau .ogg/.wav/.m4a)"); }
    });

    function fadeBgm(target, ms, then) {
        clearInterval(bgmFade);
        const steps = Math.max(1, Math.round(ms / 50)), start = bgm.volume;
        let k = 0;
        bgmFade = setInterval(() => {
            k++;
            bgm.volume = Math.min(1, Math.max(0, start + (target - start) * (k / steps)));
            if (k >= steps) { clearInterval(bgmFade); if (then) then(); }
        }, 50);
    }
    function startBgm() {
        if (bgmUnavailable || musicOff()) return;
        const p = bgm.play();
        if (p && p.then) p.then(() => fadeBgm(bgmVol(), 800)).catch(() => { /* menunggu klik pertama */ });
        else fadeBgm(bgmVol(), 800);
    }
    function stopBgm() {
        fadeBgm(0, 500, () => bgm.pause());
    }
    function menuMusic(on) {
        bgmWanted = on;
        if (on && !musicOff()) { if (bgm.paused || bgm.volume < bgmVol()) startBgm(); }
        else if (!bgm.paused) stopBgm();
    }
    // Browser baru mengizinkan suara setelah interaksi pertama
    const unlockBgm = () => { if (bgmWanted && !musicOff() && bgm.paused) startBgm(); };
    window.addEventListener("pointerdown", unlockBgm);
    window.addEventListener("keydown", unlockBgm);


    // =====================================================================
    // PENGATURAN
    // =====================================================================
    const isDesktopApp = /Electron/i.test(navigator.userAgent);
    function saveSettings() { save("settings", settings); }
    function renderSettings() {
        $("setMusic").value = Math.round(settings.music * 100);
        $("setMusicVal").textContent = Math.round(settings.music * 100) + "%";
        $("setSfx").value = Math.round(settings.sfx * 100);
        $("setSfxVal").textContent = Math.round(settings.sfx * 100) + "%";
        document.querySelectorAll("#setSpeed button").forEach(b => b.classList.toggle("on", (b.dataset.fast === "1") === settings.fast));
        const sw = (id, on) => { $(id).classList.toggle("on", on); $(id).setAttribute("aria-checked", on); };
        sw("setHints", settings.hints);
        sw("setShake", settings.shake);
        sw("setFull", !!document.fullscreenElement);
        $("rowFull").style.display = isDesktopApp ? "" : "none";
        // Reset progres hanya dari menu, bukan saat sedang bermain
        $("setReset").style.display = mode && !ended ? "none" : "";
    }
    function openSettings() {
        if (timed && !ended && !paused) setPaused(true);
        renderSettings();
        $("settings").classList.add("show");
    }
    const closeSettings = () => $("settings").classList.remove("show");
    $("setMusic").addEventListener("input", e => {
        settings.music = e.target.value / 100;
        $("setMusicVal").textContent = e.target.value + "%";
        if (musicOff()) { clearInterval(bgmFade); bgm.pause(); bgm.volume = 0; }
        else if (bgmWanted) { if (bgm.paused) startBgm(); else { clearInterval(bgmFade); bgm.volume = bgmVol(); } }
    });
    $("setMusic").addEventListener("change", saveSettings);
    $("setSfx").addEventListener("input", e => { settings.sfx = e.target.value / 100; $("setSfxVal").textContent = e.target.value + "%"; });
    $("setSfx").addEventListener("change", () => { saveSettings(); sfx.tick(); });
    $("setSpeed").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        settings.fast = b.dataset.fast === "1"; saveSettings(); renderSettings(); sfx.tick();
    });
    $("setHints").addEventListener("click", () => {
        settings.hints = !settings.hints; saveSettings(); renderSettings();
        if (!settings.hints) clearHint(); else if (mode && !ended && !busy) armHint();
    });
    $("setShake").addEventListener("click", () => { settings.shake = !settings.shake; saveSettings(); renderSettings(); if (settings.shake) shakeBoard(5); });
    function toggleFullscreen() {
        const p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        if (p && p.catch) p.catch(() => notify("Layar penuh tidak didukung di sini.", "err"));
    }
    $("setFull").addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", () => { if ($("settings").classList.contains("show")) renderSettings(); });
    document.addEventListener("keydown", e => { if (e.key === "F11" && isDesktopApp) { e.preventDefault(); toggleFullscreen(); } });
    $("setClose").addEventListener("click", closeSettings);
    $("setHowTo").addEventListener("click", () => openHowTo(0));
    $("setReset").addEventListener("click", () => { closeSettings(); askReset(); });
    $("btnSettings").addEventListener("click", openSettings);
    $("btnGameSettings").addEventListener("click", openSettings);

    // =====================================================================
    // CARA BERMAIN (slide)
    // =====================================================================
    const icoRow = (...xs) => `<div class="how-vis">${xs.join("")}</div>`;
    const arrow = `<span class="how-arrow">→</span>`;
    const HOWTO = [
        { title: "Masak pesanan pelanggan", vis: icoRow(ico(TELUR), ico(BAWANG), arrow, `<span class="how-dish">🍳</span>`),
          text: "Setiap resep punya pesanan: kumpulkan bahan sesuai target sebelum langkah (dan waktu) habis. Target dan sisa langkah ada di struk sebelah papan." },
        { title: "Tukar & cocokkan", vis: icoRow(ico(TELUR), ico(TELUR), `<span class="how-swap">⇄</span>`, ico(TELUR)),
          text: "Geser, atau ketuk dua bahan yang bersebelahan untuk menukarnya. Tiga bahan sama atau lebih yang berjajar akan dimasak dan dihitung ke target." },
        { title: "Combo berantai", vis: icoRow(`<span class="how-big">×1</span>`, arrow, `<span class="how-big">×2</span>`, arrow, `<span class="how-big">×3</span>`),
          text: "Bahan baru jatuh dari atas. Kalau jatuhannya membentuk match lagi, terjadi combo dan skor dikalikan makin besar." },
        { title: "Power-up gratis", vis: icoRow(ico(KNIFE), ico(WOK), ico(POT), ico(GOLD)),
          text: "Match 4 = Pisau (tebas baris & kolom). Match 5 atau bentuk L/T = Wajan (ledakan 3×3). Match 6 = Panci Api (4×4). Match 7+ = Sutil Emas (bersihkan papan). Aktifkan dengan menggeser, atau ketuk 2x." },
        { title: "Power-up berbayar & koin", vis: icoRow(ico("b-hammer"), ico("b-shuffle"), ico("b-extra"), ico("b-salt")),
          text: "Koin didapat setiap menyelesaikan resep atau permainan Endless, makin tinggi skor makin banyak. Belanjakan di Toko Bumbu, lalu pakai dari bar di bawah papan." },
        { title: "Level Medium & Hard", vis: icoRow(`<span class="how-big">⏱️</span>`, ico(BOX), arrow, ico(SECRET), ico(ROTTEN)),
          text: "Level ⚡ MEDIUM punya batas waktu. Level 🔥 HARD juga punya kardus: pecahkan 2 kali untuk mengambil kertas resep rahasia. Waspadai juga bahan busuk dari koki saingan." },
        { title: "Mendapat bintang", vis: `<div class="how-vis how-stars">★★★</div>`,
          text: "Menyelesaikan pesanan = 1 bintang. Makin sedikit langkah dan waktu yang kamu pakai, makin banyak bintangnya. Bintang membuka resep berikutnya dan menaikkan gelar warungmu." },
        { title: "Mode Endless", vis: icoRow(`<span class="how-big">⏱️</span>`, arrow, `<span class="how-big">🏆</span>`),
          text: "Raih skor setinggi mungkin. Bahan yang dimasak menambah waktu, tetapi salah langkah mengurangi waktu. Setiap 2.000 poin, dapur makin sibuk dan waktu berjalan 10% lebih cepat (maksimal ×1,5)." },
    ];
    let howIdx = 0;
    function renderHowTo() {
        const sl = HOWTO[howIdx];
        $("howSlide").innerHTML = `${sl.vis}<h3>${sl.title}</h3><p>${sl.text}</p>`;
        $("howSlide").animate([{ opacity: 0, transform: "translateX(16px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "ease-out" });
        $("howStep").textContent = `${howIdx + 1} / ${HOWTO.length}`;
        $("howDots").innerHTML = HOWTO.map((_, k) => `<span class="${k === howIdx ? "on" : ""}" data-k="${k}"></span>`).join("");
        $("howPrev").style.visibility = howIdx === 0 ? "hidden" : "visible";
        $("howNext").textContent = howIdx === HOWTO.length - 1 ? "Selesai ✓" : "Berikutnya →";
    }
    function openHowTo(k = 0) { howIdx = k; renderHowTo(); $("howto").classList.add("show"); }
    const closeHowTo = () => $("howto").classList.remove("show");
    $("howPrev").addEventListener("click", () => { if (howIdx > 0) { howIdx--; renderHowTo(); } });
    $("howNext").addEventListener("click", () => { if (howIdx < HOWTO.length - 1) { howIdx++; renderHowTo(); } else closeHowTo(); });
    $("howDots").addEventListener("click", e => { const d = e.target.closest("span[data-k]"); if (d) { howIdx = +d.dataset.k; renderHowTo(); } });
    $("howClose").addEventListener("click", closeHowTo);
    $("btnHowTo").addEventListener("click", () => openHowTo(0));

    // =====================================================================
    // KARTU MEKANIK BARU (muncul sekali sebelum level pertama yang memakainya)
    // =====================================================================
    const MECH = {
        time: { icon: "⏱️", title: "Baru: Batas Waktu",
            html: () => `Di level <b>⚡ MEDIUM</b>, selain batas langkah ada <b>batas waktu</b>. Waktu terus berjalan, dan setiap bahan yang dimasak menambah sedikit waktu.<br><br>Butuh berhenti sebentar? Tekan tombol <b>Jeda</b>.` },
        box: { icon: "📦", title: "Baru: Kardus Resep Rahasia",
            html: () => `<span class="mech-vis">${ico(BOX)}${arrow}${ico(BOX_CRACK)}${arrow}${ico(SECRET)}</span>Kardus <b>tidak bisa digeser</b>. Buat match tepat di sebelahnya, atau kenai ledakan power-up, <b>2 kali</b> untuk memecahkannya.<br><br>Di dalamnya ada <b>kertas resep rahasia</b> nenek yang harus dikumpulkan.` },
        rotten: { icon: "🦠", title: "Baru: Bahan Busuk",
            html: () => `<span class="mech-vis">${ico(ROTTEN)}</span>Koki saingan menaburkan <b>bahan busuk</b> setiap 4 langkah. Bahan busuk tidak bisa digeser dan menghalangi papan.<br><br>Hancurkan dengan membuat match <b>tepat di sebelahnya</b>.` },
        endless: { icon: "⏱️", title: "Mode Endless",
            html: () => `Raih skor setinggi mungkin sebelum waktu habis!<br><br>Bahan yang dimasak <b>menambah waktu</b>, tetapi <b>salah langkah mengurangi waktu</b>.<br><br>Setiap 2.000 poin, dapur makin sibuk: waktu berjalan 10% lebih cepat, maksimal ×1,5.` },
    };
    const getSeen = () => { const o = store.get("seen", {}); return o && typeof o === "object" ? o : {}; };
    function withMechCards(keys, then) {
        const seen = getSeen();
        const next = keys.find(k => !seen[k]);
        if (!next) return then();
        const m = MECH[next];
        showModal({
            icon: m.icon, title: m.title, html: m.html(),
            actions: [{ label: "Mengerti, mulai! 🔥", cls: "green", onClick: () => { save("seen", { ...getSeen(), [next]: true }); withMechCards(keys, then); } }],
        });
    }
    function beginRecipe(i) {
        const rc = RECIPES[i], keys = [];
        if (rc.time) keys.push("time");
        if (rc.boxes) keys.push("box");
        if (rc.boss) keys.push("rotten");
        withMechCards(keys, () => startRecipe(i));
    }
    function beginEndless() { withMechCards(["endless"], startEndless); }

    // =====================================================================
    // TUTORIAL INTERAKTIF (Resep 1, sekali saja)
    // =====================================================================
    const cellIdx = (r, c) => r * W + c;
    const finger = $("finger");
    let fingerAnim = null;

    // Pasang pola bahan tertentu, lalu pastikan tidak ada match yang langsung terjadi
    function prepPattern(assign) {
        Object.entries(assign).forEach(([i, v]) => { setValue(board[i], v); morph(board[i]); });
        const fixed = new Set(Object.keys(assign).map(Number));
        for (let g = 0; g < 80; g++) {
            const runs = findRuns();
            if (!runs.length) break;
            runs.forEach(run => {
                const i = run.find(x => !fixed.has(x));
                if (i === undefined) return;
                const bad = new Set(neighbors(i).map(val));
                const opts = [0, 1, 2, 3, 4, 5].filter(v => !bad.has(v));
                setValue(board[i], opts.length ? opts[rnd(opts.length)] : rnd(ING.length));
            });
        }
    }
    function showFinger(from, to = null) {
        if (fingerAnim) fingerAnim.cancel();
        const pos = i => `translate(${colOf(i) * 100}%, ${rowOf(i) * 100}%)`;
        finger.classList.add("on");
        if (to === null) {
            fingerAnim = finger.animate([
                { transform: pos(from) + " scale(1)" }, { transform: pos(from) + " scale(.75)", offset: .15 },
                { transform: pos(from) + " scale(1)", offset: .3 }, { transform: pos(from) + " scale(.75)", offset: .45 },
                { transform: pos(from) + " scale(1)", offset: .6 }, { transform: pos(from) + " scale(1)" },
            ], { duration: 1500, iterations: Infinity });
        } else {
            fingerAnim = finger.animate([
                { transform: pos(from), opacity: 0 }, { transform: pos(from), opacity: 1, offset: .15 },
                { transform: pos(to), opacity: 1, offset: .7 }, { transform: pos(to), opacity: 0 },
            ], { duration: 1500, iterations: Infinity, easing: "ease-in-out" });
        }
    }
    function hideFinger() { if (fingerAnim) fingerAnim.cancel(); fingerAnim = null; finger.classList.remove("on"); }
    function focusEl(els) {
        document.querySelectorAll(".tut-focus").forEach(e => e.classList.remove("tut-focus"));
        els.forEach(e => e && e.classList.add("tut-focus"));
    }
    function coach(text, nextLabel = null) {
        $("coach").hidden = false;
        $("coachText").innerHTML = text;
        $("coachNext").style.display = nextLabel ? "" : "none";
        if (nextLabel) $("coachNext").textContent = nextLabel;
        $("coach").animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: 250, easing: "ease-out" });
    }
    function tutAllowsSwap(a, b) {
        if (tut.pair) return (a === tut.pair[0] && b === tut.pair[1]) || (a === tut.pair[1] && b === tut.pair[0]);
        if (tut.knife !== undefined) return a === tut.knife || b === tut.knife;
        return false;
    }
    function tutAllowsTap(i) {
        if (tut.pair) return tut.pair.includes(i);
        if (tut.knife !== undefined) return i === tut.knife || (selected === tut.knife && adjacent(i, tut.knife));
        return false;
    }
    function tutNudge() { sfx.bad(); toast("Ikuti petunjuk nenek, ya 👆", 1000); }

    function tutStart() {
        tut = { step: 1 };
        clearHint();
        // Langkah 1: match 3 sederhana
        const a = cellIdx(5, 4), b = cellIdx(6, 4);
        prepPattern({ [cellIdx(6, 1)]: CABAI, [cellIdx(6, 2)]: TELUR, [cellIdx(6, 3)]: TELUR, [b]: NASI, [cellIdx(6, 5)]: SAYUR, [a]: TELUR, [cellIdx(4, 4)]: AYAM });
        tut.pair = [a, b];
        showFinger(a, b);
        coach(`Selamat datang di dapur, Cu! <b>Geser telur ini ke bawah</b> supaya tiga telur berjajar. Begitulah cara memasak di sini.`);
    }
    function tutAfterMove() {
        if (!tut) return;
        hideFinger();
        if (tut.step === 1) {
            tut = { step: 2 };
            focusEl([$("goals"), $("statMoves")]);
            coach(`Bagus! Ini <b>pesanan Pak Darto</b>. Angka target berkurang setiap telur dan bawang merah dimasak. Perhatikan juga <b>sisa langkahmu</b>.`, "Lanjut");
        } else if (tut.step === 3) {
            const k = board.findIndex(p => p && p.v === KNIFE);
            tut = { step: 4, knife: k >= 0 ? k : cellIdx(5, 3) };
            if (k < 0) { setValue(board[tut.knife], KNIFE); morph(board[tut.knife]); }
            showFinger(tut.knife);
            coach(`Kamu dapat <b>Pisau</b>! <b>Ketuk dua kali</b> (atau geser) untuk menebas satu baris dan satu kolom sekaligus.`);
        } else if (tut.step === 4) {
            tut = { step: 5 };
            focusEl([$("boosters")]);
            coach(`Hebat! Kalau kesulitan, pakai <b>power-up dari Toko Bumbu</b> di bar bawah ini. Sekarang selesaikan sisa pesanan Pak Darto. Semangat!`, "Mulai Memasak! 🔥");
        }
    }
    function tutNextStep() {
        if (!tut) return;
        if (tut.step === 2) {
            focusEl([]);
            tut = { step: 3 };
            // Langkah 3: match 4 untuk membuat Pisau
            const a = cellIdx(3, 3), b = cellIdx(4, 3);
            prepPattern({ [cellIdx(4, 0)]: AYAM, [cellIdx(4, 1)]: BAWANG, [cellIdx(4, 2)]: BAWANG, [b]: NASI, [cellIdx(4, 4)]: BAWANG, [cellIdx(4, 5)]: SAYUR, [a]: BAWANG, [cellIdx(2, 3)]: CABAI });
            tut.pair = [a, b];
            showFinger(a, b);
            coach(`Kalau <b>4 bahan</b> berjajar, kamu dapat alat masak spesial. <b>Geser bawang merah ini ke bawah!</b>`);
        } else if (tut.step === 5) {
            tutEnd(true);
        }
    }
    function tutEnd(completed) {
        if (!tut && $("coach").hidden) return;
        tut = null;
        hideFinger();
        focusEl([]);
        $("coach").hidden = true;
        if (completed) save("tutorial", true); // keluar di tengah tutorial = diulang lain kali
        if (completed && !ended) { toast("Selamat memasak! 🍳", 1200); armHint(); }
    }
    $("coachNext").addEventListener("click", tutNextStep);
    $("coachSkip").addEventListener("click", () => { const wasActive = !!tut; tutEnd(true); if (wasActive && !busy) armHint(); });

    // =====================================================================
    // TOMBOL
    // =====================================================================
    $("btnStory").addEventListener("click", enterStory);
    $("btnEndless").addEventListener("click", beginEndless);
    $("btnShopHome").addEventListener("click", openShop);
    $("btnShopMap").addEventListener("click", openShop);
    $("btnShopBack").addEventListener("click", () => showScreen(prevScreen));
    document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => showScreen(b.dataset.go)));
    // Keluar dari permainan: minta konfirmasi agar progres tidak hilang karena salah klik
    function doQuit() {
        stopGame(); session++;
        const back = mode === "story" ? "map" : "home";
        mode = null;
        setPaused(false);
        showScreen(back);
    }
    function askQuit() {
        if (!mode || ended) { doQuit(); return; }
        if ($("modal").classList.contains("show")) return; // sudah ada dialog terbuka
        const wasPaused = paused;
        if (timed && !paused) setPaused(true);              // waktu berhenti selama memilih
        if (targeting) { targeting = null; renderBoosters(); }
        const story = mode === "story";
        showModal({
            icon: "🚪", title: "Keluar dari dapur?",
            text: story
                ? `Progres "${recipe.name}" akan hilang, dan power-up yang sudah dipakai tidak kembali. Bintang dan koin dari resep lain tetap aman.`
                : "Permainan Endless ini akan berakhir tanpa skor dan tanpa koin, dan power-up yang sudah dipakai tidak kembali.",
            actions: [
                { label: "Lanjut Masak", cls: "green", onClick: () => { if (timed && !wasPaused && !ended) setPaused(false); } },
                { label: "Ya, Keluar", cls: "danger", onClick: doQuit },
            ],
        });
    }
    $("btnQuit").addEventListener("click", askQuit);
    // Versi browser: peringatan saat menutup tab di tengah permainan
    // (tidak dipakai di aplikasi desktop karena Electron akan diam-diam membatalkan penutupan jendela)
    window.addEventListener("beforeunload", e => {
        if (!isDesktopApp && mode && !ended) { e.preventDefault(); e.returnValue = ""; }
    });
    // Jeda: tombol berubah hijau (Lanjut), jendela jeda muncul di atas papan
    function setPaused(on) {
        paused = on;
        layer.classList.toggle("paused", on);
        $("pausePanel").classList.toggle("show", on);
        const btn = $("btnPause");
        btn.textContent = on ? "▶ Lanjut" : "⏸ Jeda";
        btn.classList.toggle("secondary", !on);
        btn.classList.toggle("green", on);
        if (on) { clearHint(); select(null); targeting = null; renderBoosters(); } else if (!ended) armHint();
    }
    $("btnPause").addEventListener("click", () => { if (!ended) setPaused(!paused); });
    $("btnResume").addEventListener("click", () => { if (!ended) setPaused(false); });
    $("btnPauseQuit").addEventListener("click", askQuit);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && timed && !ended && !paused) setPaused(true);
    });

    // =====================================================================
    // INISIALISASI
    // =====================================================================
    if (!store.persistent) {
        const w = $("storageWarn");
        w.hidden = false;
        w.textContent = "⚠️ Penyimpanan browser tidak tersedia (mungkin mode privat). Progres hanya bertahan selama tab ini terbuka.";
    }
    showScreen("home");
    if (store.corrupt.length) notify("Sebagian data simpanan rusak dan dipulihkan ke nilai awal.", "err", 4000);
}
