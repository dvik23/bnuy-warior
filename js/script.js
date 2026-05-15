let jatekMegy = false;
let idomero;

document.addEventListener("DOMContentLoaded", () => {
    generateBoard(10, 10);
    RandomRepa(5); // paratlan legyen check later
    drawState();
})
function generateBoard(sor, oszlop) {
    const board = document.getElementById("jatek-board");
    board.innerHTML = "";
    for (let s = 0; s < sor; s++){
        for (let o = 0; o < oszlop; o++){
            const cella = document.createElement("div");
            cella.classList.add('cella');

            //mozgáshoz kell majd
            cella.dataset.sor = s;
            cella.dataset.oszlop = o;
            cella.id = `cella-${s}-${o}`;

            cella.addEventListener('click', () => {
                kattintasKezeles(s, o);
            })

            board.appendChild(cella);
        }
    }
}
let jatekAllapot = {
    aktJatekos: 1,
    lepesek: 0,

    //jatekos statok
    nyuszi1: { repak: 0, alapMeret: 40},
    nyuszi2: { repak: 0, alapMeret: 40},

    idoLimit: 5, //jatekos allitja
    maradekIdo: 0, //ezt szamoljuk vissza

    sor: 10,
    oszlop: 10,
    map: [
        ['B1', 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 'B2'],
        ]
}

const images = {
    'B1': 'assets/bnuy1_static.png',
    'B2': 'assets/bnuy2_static.png',
    'R': 'assets/carrot.png'
};
function mutatSugo() {
    document.getElementById('sugo').style.display = 'block';
}
function bezarSugo() {
    document.getElementById('sugo').style.display = 'none';
}
function jatekStart(){
    jatekAllapot.aktJatekos = Math.random() < 0.5 ? 1 : 2;
    jatekAllapot.lepesek = 0;
    jatekMegy =  true;

    let percek = parseInt(document.getElementById("ido-set").value);
    jatekAllapot.maradekIdo = percek * 60;

    document.getElementById('hatter-zene').play();

    // idozito indit
    clearInterval(idomero); // nullazas
    idomero = setInterval(idoFrissites, 1000);

    document.getElementById('beallitasok').style.display = 'none';
    UIFrissites(); //kiirjuk ki jon
}
function idoFrissites() {
    if (!jatekMegy){
        return;
    }
    jatekAllapot.maradekIdo--;

    let p = Math.floor(jatekAllapot.maradekIdo / 60);
    let mp = jatekAllapot.maradekIdo % 60;
    // p:mp formatum
    document.getElementById('time-left').innerText = (p < 10 ? "0" : "") + p + ":" + (mp < 10 ? "0" : "") + mp;

    //ha lejart az ido
    if (jatekAllapot.maradekIdo <= 0) {
        jatekMegy = false;
        clearInterval(idomero);
        jatekVege();
    }
}
function jatekVege() {
    let r1 = jatekAllapot.nyuszi1.repak;
    let r2 = jatekAllapot.nyuszi2.repak;

    if (r1 > r2) {
        alert(`Lejárt az idő! Az 1-es Nyuszi nyert ${r1} répával!`);
    } else if (r2 > r1) {
        alert(`Lejárt az idő! A 2-es Nyuszi nyert ${r2} répával!`);
    } else {
        alert("Lejárt az idő! Döntetlen!");
    }
    jatekReset();
}
function getNyusziPozicio (jatekosId) {
    let keresettNyuszi = 'B' + jatekosId;
    for (let s = 0; s < jatekAllapot.sor; s++) {
        for (let o = 0; o < jatekAllapot.oszlop; o++) {
            if (jatekAllapot.map[s][o] === keresettNyuszi) {
                return {sor : s, oszlop : o};
            }
        }
    }
    return null;
}
function kattintasKezeles(celSor, celOszlop) {
    if (!jatekMegy) {
        alert("Előbb indítsd el a játékot!");
        return;
    }
    //hol a nyuszi?
    let nyusziPoz = getNyusziPozicio(jatekAllapot.aktJatekos);
    if (!nyusziPoz) return;
    //szomszedos cella?
    let sorTavolsag = Math.abs(nyusziPoz.sor - celSor);
    let oszlopTavolsag = Math.abs(nyusziPoz.oszlop - celOszlop);
    let szomszedos = (sorTavolsag + oszlopTavolsag === 1);

    if (!szomszedos) {
        return;
    }
    //mi van a kattintott cellaban?
    let celCellaTartalom = jatekAllapot.map[celSor][celOszlop];
    if (celCellaTartalom === 0 || celCellaTartalom === 'R') {
        if (celCellaTartalom === 'R') {
            if (jatekAllapot.aktJatekos === 1) jatekAllapot.nyuszi1.repak++;
            if (jatekAllapot.aktJatekos === 2) jatekAllapot.nyuszi2.repak++;
        }
        jatekAllapot.map[nyusziPoz.sor][nyusziPoz.oszlop] = 0; //innen mozdult a nyusz
        jatekAllapot.map[celSor][celOszlop] = 'B' + jatekAllapot.aktJatekos; // ide mozdult a nyusz

        nyusziMozog(); // lepes++
        repaUtanpotlas();
        drawState();
        harcElenorzes();
    }
}

function drawState() {
    const cellaLista = document.querySelectorAll('.cella');
    cellaLista.forEach(cella => cella.innerHTML = '');

    for (let s = 0; s < jatekAllapot.sor; s++) {
        for (let o = 0; o < jatekAllapot.oszlop; o++) {
            const item = jatekAllapot.map[s][o];

            if (item !== 0) {
                const img = document.createElement('img');
                img.style.position = 'absolute';
                img.style.top = '50%';
                img.style.left = '50%';
                img.style.transform = 'translate(-50%, -50%)'; // maradjon cella közepén

                img.classList.add('bunny-img');

                if (item === 'B1') {
                    // nyusz 1 gif ha mozog, kulonben static image
                    img.src = (jatekAllapot.aktJatekos === 1) ? 'assets/bnuy1_move.gif' : 'assets/bnuy1_static.png';
                    let meret1 = jatekAllapot.nyuszi1.alapMeret + (jatekAllapot.nyuszi1.repak * 4);
                    img.style.width = meret1 + 'px';
                    img.style.height = meret1 + 'px';
                } else if (item === 'B2') {
                    // nyusz 2 gif ha mozog, kulonben static image
                    img.src = (jatekAllapot.aktJatekos === 2) ? 'assets/bnuy2_move.gif' : 'assets/bnuy2_static.png';
                    let meret2 = jatekAllapot.nyuszi2.alapMeret + (jatekAllapot.nyuszi2.repak * 4);
                    img.style.width = meret2 + 'px';
                    img.style.height = meret2 + 'px';
                } else {
                    // repa meret
                    img.src = images['R'];
                    img.style.width = '40px';
                    img.style.height = '40px';
                }
                document.getElementById(`cella-${s}-${o}`).appendChild(img);
            }
        }
    }
}
function RandomRepa(mennyit){
    let repaLerak = 0;

    while (repaLerak < mennyit){
        let s = Math.floor(Math.random() * jatekAllapot.sor);
        let o = Math.floor(Math.random() * jatekAllapot.oszlop);
        if (jatekAllapot.map[s][o] === 0){
            jatekAllapot.map[s][o] = 'R';
            repaLerak++;
        }
    }
}
function nyusziMozog() {
   jatekAllapot.lepesek++;
   UIFrissites()
   if(jatekAllapot.lepesek >=5){
       valtas();
   }
}
function valtas(){
    jatekAllapot.lepesek = 0;
     if ( jatekAllapot.aktJatekos === 1){
         jatekAllapot.aktJatekos = 2;
     } else {
         jatekAllapot.aktJatekos = 1;
     }
     UIFrissites();
}
function UIFrissites(){
    let hatralevoLepesek = 5 - jatekAllapot.lepesek;
    document.getElementById('aktualis-jatekos').innerText = `Nyuszi #${jatekAllapot.aktJatekos} (${jatekAllapot.lepesek} / 5 lépés)`;
    document.getElementById('repa-count').innerText = (jatekAllapot.aktJatekos === 1) ? jatekAllapot.nyuszi1.repak : jatekAllapot.nyuszi2.repak;
}
function harcElenorzes() {
    let p1 = getNyusziPozicio(1);
    let p2 = getNyusziPozicio(2);

    // Ha valamiért nem találná a nyuszikat, kilép
    if (!p1 || !p2) return;

    // tavolsag szamolasa
    let sorTavolsag = Math.abs(p1.sor - p2.sor);
    let oszlopTavolsag = Math.abs(p1.oszlop - p2.oszlop);
    let szomszedos = (sorTavolsag + oszlopTavolsag === 1);

    if (szomszedos) {
        let r1 = jatekAllapot.nyuszi1.repak;
        let r2 = jatekAllapot.nyuszi2.repak;

        if (r1 > r2) {
            document.getElementById('lecsap').play();
            setTimeout(() => { // kesleltetni kell a pop-up-ot, mert nem játsza le a hangot
                alert("Bumm! A nyuszik egymás mellé értek, és az 1-es Nyuszi nagyobb! Az 1-es Nyuszi nyert!");
                jatekVegeHarc();
            }, 100);
        } else if (r2 > r1) {
            document.getElementById('lecsap').play();
            setTimeout(() => {
                alert("Bumm! A nyuszik egymás mellé értek, és a 2-es Nyuszi nagyobb! A 2-es Nyuszi nyert!");
                jatekVegeHarc();
            }, 100);
            // ha ugyanannyi repajuk van, nem tortenik semmi
        }
    }
}
function jatekVegeHarc() {
    jatekMegy = false;
    clearInterval(idomero);
    jatekReset();
}
function repaUtanpotlas() {
    let vanRepa = false;

    // checkoljuk hogy van e meg répa
    for (let s = 0; s < jatekAllapot.sor; s++) {
        for (let o = 0; o < jatekAllapot.oszlop; o++) {
            if (jatekAllapot.map[s][o] === 'R') {
                vanRepa = true;
                break;
            }
        }
        if (vanRepa) break; // ha van, akkor break
    }

    // ha nincs, újakat rakunk le
    if (!vanRepa) {
        RandomRepa(5);
    }
}
function jatekReset() {
    // statok és térkép reset
    jatekAllapot.nyuszi1.repak = 0;
    jatekAllapot.nyuszi2.repak = 0;
    jatekAllapot.lepesek = 0;
    jatekAllapot.map = [
        ['B1', 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 'B2'],
    ];

    let zene = document.getElementById('hatter-zene');
    zene.pause();
    zene.currentTime = 0; // Vzene elejére ugrik

    // UI reset
    document.getElementById('beallitasok').style.display = 'block';
    document.getElementById('time-left').innerText = "00:00";
    document.getElementById('repa-count').innerText = "0";
    document.getElementById('aktualis-jatekos').innerText = "Nyuszi #1";

    // pálya reset
    generateBoard(jatekAllapot.sor, jatekAllapot.oszlop);
    RandomRepa(5);
    drawState();
}


