import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LE PARCOURS D'UN UTILISATEUR NEUF, JUSQU'À LA PREMIÈRE PRÉSENCE SAISIE
// =======================================================================
//
// Retour d'un testeur, 26 août 2026, BLOQUANT : « Dans Suivi > Présences, je
// ne peux pas entrer les présences, un message d'erreur jaune doré m'indique que
// l'horaire n'est pas configuré (alors qu'il l'est dans Cadre). »
//
// #532 a corrigé deux défauts qui suffisent à produire ce rapport mot pour mot :
// l'alerte ne consultait pas l'horaire (clé db morte, condition toujours vraie),
// et son lien de secours ne menait nulle part. Mais aucun test ne parcourait le
// TRAJET — trimestre, cours, groupe, horaire, puis saisie — et c'est précisément
// celui qu'emprunte un testeur le premier jour. Tant qu'il n'est pas joué, « les
// deux bugs expliquent tout » reste une conjecture confortable.
//
// ▣ CE QUE CE BANC TIENT, et que les bancs unitaires ne peuvent pas dire :
//   qu'au bout du parcours, une présence est RÉELLEMENT saisissable. Pas que le
//   bandeau se cache — qu'il y ait un tableau, des élèves, et un champ qui prend
//   une valeur. Un écran sans avertissement mais sans saisie possible serait un
//   faux vert, et c'est exactement ce que le testeur a vécu à l'envers.
//
// ⚠ IL PART D'UN STOCKAGE VIDÉ. Les specs partagent le localStorage de l'origine
// file:// (d'où `workers: 1`). Hériter de l'état d'une spec précédente ferait
// passer ce banc pour de mauvaises raisons — un horaire laissé par une voisine
// n'est pas le parcours d'un utilisateur neuf.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

// Le trimestre du rapport : automne 2026. La séance tombe le MARDI, et la date
// choisie pour saisir est un mardi PASSÉ de ce trimestre — une date future est
// refusée par `validerDateSaisie`, et le banc mesurerait ce refus-là.
const DEBUT = '2026-08-17';   // lundi
const FIN_COURS = '2026-12-11';
const FIN_TRIMESTRE = '2026-12-21';
const JOUR_DE_SEANCE = 'Mardi';
const DATE_SAISIE = '2026-08-25'; // mardi, passé

test('parcours neuf · de la configuration à la première présence saisissable', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    // ── On repart d'un stockage vide, comme un poste qui découvre l'app ───────
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const r = await page.evaluate(async ({ DEBUT, FIN_COURS, FIN_TRIMESTRE, JOUR_DE_SEANCE, DATE_SAISIE }) => {
        const out = {};
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));

        // ── Ce qu'un enseignant pose avant de pouvoir configurer quoi que ce soit
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync(cle('cadreCalendrier'), { dateDebut: DEBUT, finCours: FIN_COURS, finTrimestre: FIN_TRIMESTRE }); // security-ok: fixture de test locale
        db.setSync('cours', [{ id: 'COURS_PARCOURS', codeCours: '601-013-VL', nomCours: 'Litterature' }]);
        db.setSync('enseignants', [{ id: 'ENS_PARCOURS', prenom: 'Jean', nom: 'Tremblay' }]); // security-ok: fixture de test locale
        db.setSync(cle('groupeEtudiants'), Array.from({ length: 15 }, (_, i) => ({ // security-ok: fixture de test locale
            da: String(2000000 + i), nom: `Eleve${i}`, prenom: 'Test', groupe: '00001'
        })));
        db.setSync(cle('horaires'), []); // security-ok: fixture de test locale
        db.setSync(cle('groupesCours'), []); // security-ok: fixture de test locale

        naviguerVers('calendrier', 'trimestre');
        await pause(700);

        // ── 1. L'HORAIRE, tel qu'on le crée à l'écran ────────────────────────
        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        await pause(250);
        document.getElementById('v2-hor-groupeAssocie').value = '00001';
        document.getElementById('v2-hor-nom').value = 'Mardi matin';
        document.getElementById('v2-hor-nbSeances').value = '1';
        window.mettreAJourSeancesHoraireV2();
        await pause(250);
        const j = document.getElementById('v2-hor-seance-0-jour');
        const d = document.getElementById('v2-hor-seance-0-debut');
        const f = document.getElementById('v2-hor-seance-0-fin');
        // #540 lot E1 (26 août 2026) : la séance porte SON nombre de périodes, saisi et
        // non déduit — une période comprend sa pause, la convention varie d'un cégep à
        // l'autre. Le formulaire le refuse absent, donc ce parcours le saisit comme
        // l'utilisateur le fera. C'est un pas de plus au terrain, assumé : ce nombre est
        // le dénominateur de l'assiduité que ce parcours va justement vérifier.
        const p = document.getElementById('v2-hor-seance-0-periodes');
        if (j) j.value = JOUR_DE_SEANCE;
        if (d) d.value = '08:00';
        if (f) f.value = '10:00';
        if (p) p.value = '2';
        window.sauvegarderHoraireV2();
        await pause(500);

        const horaires = db.getSync(cle('horaires'), []);
        out.horaireCree = horaires.length;
        out.seancesDeLHoraire = horaires[0]?.seances?.length ?? 0;
        const horaireId = horaires[0]?.id;

        // ── 2. LE GROUPE-COURS, qui relie tout ───────────────────────────────
        if (typeof window.nouveauGroupeCoursV2 === 'function') window.nouveauGroupeCoursV2();
        await pause(250);
        const poser = (id, valeur) => {
            const el = document.getElementById(id);
            if (!el) return `champ absent: ${id}`;
            el.value = valeur;
            if (el.value !== valeur) return `valeur refusée par ${id} (option absente ?) : ${valeur}`;
            return null;
        };
        out.champs = [
            poser('v2-gc-trimestre', 'a2026'),
            poser('v2-gc-cours', 'COURS_PARCOURS'),
            poser('v2-gc-groupe', '00001'),
            poser('v2-gc-horaire', horaireId),
            poser('v2-gc-enseignant', 'ENS_PARCOURS')
        ].filter(Boolean);

        window.sauvegarderGroupeCoursV2();
        await pause(600);

        const gcs = db.getSync(cle('groupesCours'), []);
        out.groupeCoursCree = gcs.length;
        out.horaireRattache = gcs[0]?.horaireId === horaireId;

        // ── 3. On active le groupe-cours, comme le sélecteur d'en-tête le fait
        if (gcs[0]) {
            await window.changerGroupeCoursActifV2(gcs[0].id);
            await pause(600);
        }

        // ── 4. Ce que la saisie voit de l'horaire ────────────────────────────
        out.seancesVues = (typeof obtenirSeancesHoraire === 'function' ? obtenirSeancesHoraire() : []).length;

        // ── 5. L'écran de saisie lui-même ────────────────────────────────────
        naviguerVers('suivi', 'saisie');
        await pause(800);

        const bandeau = document.getElementById('alerteFormatHoraire');
        out.bandeauVisible = bandeau ? !bandeau.classList.contains('u-hide') : null;

        const champDate = document.getElementById('date-cours');
        if (champDate) {
            champDate.value = DATE_SAISIE;
            if (typeof window.initialiserSaisiePresences === 'function') window.initialiserSaisiePresences();
            await pause(800);
        }
        out.dateRetenue = champDate ? champDate.value : null;

        // ── 6. LA QUESTION : peut-on saisir ? ────────────────────────────────
        const lignes = document.querySelectorAll('#tbody-saisie-presences tr');
        out.lignesTableau = lignes.length;
        const champsPeriodes = document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]');
        out.champsSaisie = champsPeriodes.length;
        out.messageTableau = (document.getElementById('tbody-saisie-presences')?.textContent || '').trim().slice(0, 120);

        return out;
    }, { DEBUT, FIN_COURS, FIN_TRIMESTRE, JOUR_DE_SEANCE, DATE_SAISIE });

    // ── Le parcours a-t-il seulement pu se dérouler ? ────────────────────────
    expect(r.champs, 'un champ du formulaire groupe-cours n\'a pas accepté sa valeur').toEqual([]);
    expect(r.horaireCree, 'l\'horaire n\'a pas été créé').toBe(1);
    expect(r.seancesDeLHoraire, 'un horaire sans séance ne peut rien rendre saisissable').toBeGreaterThan(0);
    expect(r.groupeCoursCree, 'le groupe-cours n\'a pas été créé').toBe(1);
    expect(r.horaireRattache, 'LE POINT NON TRANCHÉ DE #532 : l\'horaire doit être rattaché au groupe-cours').toBe(true);

    // ── Ce que la saisie en fait ─────────────────────────────────────────────
    expect(r.seancesVues, 'obtenirSeancesHoraire() ne voit pas les séances du groupe-cours actif').toBeGreaterThan(0);
    expect(
        r.bandeauVisible,
        'LE CAS DU RETOUR DU 26 AOÛT : horaire configuré ET rattaché, le bandeau doit se taire'
    ).toBe(false);

    // ── LA question ──────────────────────────────────────────────────────────
    expect(
        r.champsSaisie,
        `aucun champ de saisie au bout du parcours — le tableau dit : « ${r.messageTableau} »`
    ).toBe(15);

    expect(erreurs, 'erreurs console pendant le parcours').toEqual([]);
});
