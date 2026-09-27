import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #868 (15 septembre 2026) — « ÉVALUER » MÈNE AU FORMULAIRE DE CET ÉLÈVE POUR CETTE PRODUCTION.
//
// Mesuré avant le correctif (WebKit) : le clic arrivait sur Évaluation › Annoter et évaluer, mais ni
// l'élève ni la production n'étaient choisis — la fonction qui répondait remplissait des listes
// cachées encore vides. Décisions de Grégoire (15 sept.) :
//   - copie importée, annotée ou non → la copie s'ouvre, en mode Évaluer ;
//   - aucune copie → le formulaire sans copie, avec les outils (« un enseignant pourrait évaluer une
//     copie sans l'importer dans l'application. il devrait pouvoir utiliser les outils »).
//
// LA COPIE DE BANC. WebKit refuse un Blob dans IndexedDB en contexte éphémère : `recupererBlob` est
// enveloppé pour rendre une image PNG d'un pixel. Tout le reste du trajet est le vrai.
//
// Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre) : les boutons sont cliqués par
// `el.click()` — le vrai dispatcher `data-action` de main.js —, et on attend des RENDUS.

const DA = 'TEST868B';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    // Le montage ne configure aucune échelle : l'ouverture des palettes le signale. Ce n'est pas
    // l'objet de cette porte, qui juge l'arrivée et la présélection, pas le calcul.
    /Aucune échelle de performance configurée/,
    // Ni aucune grille : « Consulter » l'évaluation du montage (sans grille) le signale. Même raison.
    /Grille introuvable ou sans critères/
];

async function monter(page) {
    const suivi = { dialogues: [], erreurs: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => { suivi.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) suivi.erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) suivi.erreurs.push(m); }
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function' && typeof window.changerSectionProfil === 'function'
        && window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate((png) => {
        const t = 'test868';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-868';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_868' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_868', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_868', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST868A', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId },
            { da: 'TEST868B', nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test
            { id: 'p868-1', titre: 'Analyse 1', type: 'travail', ponderation: 50 },
            { id: 'p868-2', titre: 'Analyse 2', type: 'travail', ponderation: 50 }
        ]);
        // Une copie importée pour « Analyse 2 » seulement ; « Analyse 1 » n'en a pas.
        window.db.setSync(window.cle('fichiersTravaux'), [{ // security-ok: fixture de test
            id: 'FT868', etudiantDA: 'TEST868B', productionId: 'p868-2', coursId, groupeCoursId: 'GC_868',
            nomFichier: 'GAGNON_TEST868B_Analyse2.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT868' ? copie : original.apply(this, arguments); };
        window.afficherSection('suivi');
        window.afficherProfilComplet('TEST868B');
    }, PNG);
    await page.waitForFunction((da) => window.profilActuelDA === da && !window._profilAutoChargement
        && !!document.querySelector('#contenuProfilEtudiant .layout-sidebar-2col'), DA, { timeout: 10000 });
    return suivi;
}

/** Le geste de l'enseignant : « Productions » dans la barre latérale du profil, puis « Évaluer » sur une ligne. */
async function evaluerDepuisLeProfil(page, productionId) {
    await page.evaluate(() => window.changerSectionProfil('productions'));
    const selecteur = `#suivi-profil [data-action="evaluerProduction"][data-param2="${productionId}"]`;
    await page.waitForFunction((s) => !!document.querySelector(s), selecteur, { timeout: 10000 });
    await page.evaluate((s) => document.querySelector(s).click(), selecteur);
}

const lireEtat = (page) => page.evaluate(() => {
    const vis = (el) => !!el && el.offsetParent !== null;
    const fa = window.travauxVisionneuse && window.travauxVisionneuse.getFichierActuel && window.travauxVisionneuse.getFichierActuel();
    return {
        section: (document.querySelector('.section.active') || {}).id || null,
        mode: window.travauxUI.getModeCourant(),
        copieOuverte: (fa && fa.id) || null,
        etudiant: document.getElementById('selectEtudiantEval').value,
        production: document.getElementById('selectProduction1').value,
        // Le statut que l'enregistrement écrit se lit dans CETTE liste (evaluation-sauvegarde.js:226).
        remise: document.getElementById('remiseProduction1').value,
        etiquetteEtudiant: document.getElementById('travaux-eval-label-etudiant').textContent,
        etiquetteProduction: document.getElementById('travaux-eval-label-production').textContent,
        formulaireSansCopie: vis(document.getElementById('evaluations-contenu-evaluation')) && vis(document.getElementById('travaux-eval-droite')),
        palettes: ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'].map((id) => vis(document.getElementById(id))),
        sousBarres: document.querySelectorAll('.retro-sous-barre').length,
        sousBarreVisible: vis(document.querySelector('.retro-sous-barre')),
        piedRetro: Array.from(document.querySelectorAll('#vueRetroGenerale .eval-retro-pied button')).map((b) => b.textContent.trim()),
        cadenas: document.querySelectorAll('#btnVerrouPalette').length
    };
});

const attendreCopieEnModeEvaluer = (page, id) => page.waitForFunction((fid) => {
    const fa = window.travauxVisionneuse && window.travauxVisionneuse.getFichierActuel && window.travauxVisionneuse.getFichierActuel();
    return fa && fa.id === fid && window.travauxUI.getModeCourant() === 'evaluer' && !!document.getElementById('travaux-palette-eval-retro');
}, id, { timeout: 10000 });

const attendreSansCopie = (page, productionId) => page.waitForFunction((pid) =>
    document.getElementById('selectProduction1').value === pid && !window._modifierEvaluationEnCours
    && !document.getElementById('evaluations-contenu-evaluation').classList.contains('u-hide'), productionId, { timeout: 10000 });

const ETAT_AVEC_COPIE = {
    section: 'section-evaluations', mode: 'evaluer', copieOuverte: 'FT868',
    etudiant: DA, production: 'p868-2', etiquetteEtudiant: 'Léa Gagnon (TEST868B)', etiquetteProduction: 'Analyse 2',
    remise: 'importe',
    palettes: [true, true, true], sousBarres: 1, sousBarreVisible: true,
    // « Régénérer » restait retiré du mode Évaluer par le nettoyage des palettes (même classe que « Copier »).
    piedRetro: ['Régénérer', 'Copier'], cadenas: 1
};

const ETAT_SANS_COPIE = {
    section: 'section-evaluations', etudiant: DA, production: 'p868-1',
    // « Reçu » : remis, non importé (Grégoire, 15 sept.). « Non reçu » verrouillait les critères.
    remise: 'recu',
    etiquetteEtudiant: 'Léa Gagnon (TEST868B)', etiquetteProduction: 'Analyse 1',
    formulaireSansCopie: true, palettes: [false, false, false], sousBarres: 1, sousBarreVisible: true,
    piedRetro: ['Régénérer', 'Copier'], cadenas: 1
};

const sansModeNiCopie = ({ mode, copieOuverte, ...reste }) => reste;

test('Porte #868 · avec copie : « Évaluer » ouvre la copie de l\'élève, en mode Évaluer', async ({ page }) => {
    const suivi = await monter(page);
    await evaluerDepuisLeProfil(page, 'p868-2');
    // AVANT : aucune copie ne s'ouvrait, les listes restaient vides — cette attente expirait.
    await attendreCopieEnModeEvaluer(page, 'FT868');
    const etat = await lireEtat(page);
    delete etat.formulaireSansCopie;
    expect(etat).toEqual(ETAT_AVEC_COPIE);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #868 · sans copie : « Évaluer » ouvre le formulaire, élève et production choisis, avec les outils', async ({ page }) => {
    const suivi = await monter(page);
    await evaluerDepuisLeProfil(page, 'p868-1');
    // AVANT : `selectProduction1` restait vide — cette attente expirait.
    await attendreSansCopie(page, 'p868-1');
    const etat = await lireEtat(page);
    expect(sansModeNiCopie(etat)).toEqual(ETAT_SANS_COPIE);
    // L'en-tête « Paramètres » porte le cadenas (caché tant que rien n'est enregistré).
    const cadenasDansLEnTete = await page.evaluate(() => !!document.querySelector('#travaux-eval-gauche .travaux-panneau-header #btnVerrouPalette'));
    expect(cadenasDansLEnTete).toBe(true);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #868 · la liste des évaluations passe par le même chemin', async ({ page }) => {
    const suivi = await monter(page);
    // Le menu « Actions… » d'une ligne : `executerActionEval` reçoit le <select> dont la valeur est choisie.
    await page.evaluate(() => window.executerActionEval({ value: 'evaluer|TEST868B|p868-1' }));
    await attendreSansCopie(page, 'p868-1');
    expect(sansModeNiCopie(await lireEtat(page))).toEqual(ETAT_SANS_COPIE);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #868 · « Consulter » une évaluation sans copie : le même formulaire, les mêmes outils, le cadenas visible', async ({ page }) => {
    // Relecture croisée de Cowork (15 sept., 1.142.0) : le changelog promettait ce cas, aucun essai ne le jugeait.
    const suivi = await monter(page);
    // Une évaluation ENREGISTRÉE, sans copie, pour « Analyse 1 » — posée dans cet essai seulement : les autres
    // ont besoin qu'« Analyse 1 » reste à évaluer.
    await page.evaluate((da) => {
        window.db.setSync(window.cle('evaluationsSauvegardees'), [{ // security-ok: fixture de test
            id: 'EVAL868', etudiantDA: da, productionId: 'p868-1', statutRemise: 'recu', statutIntegrite: 'recevable',
            criteres: [], noteFinale: 80, dateEvaluation: '2026-02-02T12:00:00.000Z', verrouillee: false
        }]);
        window.afficherSection('suivi');
        window.afficherProfilComplet(da);
    }, DA);
    await page.waitForFunction((da) => window.profilActuelDA === da && !window._profilAutoChargement, DA, { timeout: 10000 });
    await page.evaluate(() => window.changerSectionProfil('productions'));
    const selecteur = '#suivi-profil [data-action="consulterEvaluation"][data-param2="p868-1"]';
    await page.waitForFunction((s) => !!document.querySelector(s), selecteur, { timeout: 10000 });
    await page.evaluate((s) => document.querySelector(s).click(), selecteur);

    await attendreSansCopie(page, 'p868-1');
    // Le chargement d'une évaluation enregistrée montre le cadenas : on l'attend, c'est la fin du chargement.
    await page.waitForFunction(() => {
        const b = document.getElementById('btnVerrouPalette');
        return !!b && b.style.display !== 'none';
    }, null, { timeout: 10000 });
    expect(sansModeNiCopie(await lireEtat(page))).toEqual(ETAT_SANS_COPIE);
    const cadenasDansLEnTete = await page.evaluate(() => !!document.querySelector('#travaux-eval-gauche .travaux-panneau-header #btnVerrouPalette'));
    expect(cadenasDansLEnTete).toBe(true);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #868 · sans copie, puis avec, puis sans : un seul cadenas, une seule sous-barre, chaque fois le bon élève', async ({ page }) => {
    const suivi = await monter(page);
    await evaluerDepuisLeProfil(page, 'p868-1');
    await attendreSansCopie(page, 'p868-1');

    await page.evaluate((da) => { window.afficherSection('suivi'); window.afficherProfilComplet(da); }, DA);
    await evaluerDepuisLeProfil(page, 'p868-2');
    await attendreCopieEnModeEvaluer(page, 'FT868');
    const avecCopie = await lireEtat(page);
    delete avecCopie.formulaireSansCopie;
    expect(avecCopie).toEqual(ETAT_AVEC_COPIE);

    await page.evaluate((da) => { window.afficherSection('suivi'); window.afficherProfilComplet(da); }, DA);
    await evaluerDepuisLeProfil(page, 'p868-1');
    await attendreSansCopie(page, 'p868-1');
    expect(sansModeNiCopie(await lireEtat(page))).toEqual(ETAT_SANS_COPIE);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

// LOT C DE L'ENREGISTREMENT (D1) — « Enregistrer » devient « Verrouiller l'évaluation », et « Déverrouiller
// l'évaluation » sous le verrou : le plus long des deux libellés, sur les deux surfaces (palette « Paramètres »
// avec copie, formulaire sans copie), à 360, 768, 1024 et 1180 px. Il tient dans sa ligne sans être coupé, ne
// passe pas sous le témoin commun (lot B, affiché en échec : sa plus grande forme), et ne pousse pas la barre :
// le bouton ↺ reste sur la même ligne, et le bouton reste dans son panneau. ⚠ Mesuré le 27 sept. : à 360 px avec
// copie, la palette « Paramètres » commence déjà hors de la vue (−74 px), avec « Enregistrer » comme avec le nouveau
// libellé (bouton de 152 px dans les deux cas) : ce n'est pas le libellé, la mesure se fait donc contre le panneau.
for (const largeur of [360, 768, 1024, 1180]) {
    for (const avecCopie of [true, false]) {
        test(`lot C · « Déverrouiller l'évaluation » à ${largeur} px, ${avecCopie ? 'avec' : 'sans'} copie : entier, hors du témoin, sur sa ligne`, async ({ page }) => {
            await page.setViewportSize({ width: largeur, height: { 360: 740, 768: 1024, 1024: 768, 1180: 820 }[largeur] });
            const suivi = await monter(page);
            await evaluerDepuisLeProfil(page, avecCopie ? 'p868-2' : 'p868-1');
            if (avecCopie) await attendreCopieEnModeEvaluer(page, 'FT868');
            else await attendreSansCopie(page, 'p868-1');
            const m = await page.evaluate(() => {
                window.afficherOuMasquerBoutonVerrouillage(true, true);   // l'état verrouillé : le libellé long
                window.temoinEnregistrement.nonEnregistre('la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre.',
                    'Verrouillage de l\'évaluation');
                const b = document.getElementById('btnVerrouillerEvaluation');
                const r = b.getBoundingClientRect();
                const t = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec').getBoundingClientRect();
                const voisin = b.parentElement.querySelector('[data-action="reinitialiserFormulaire"]').getBoundingClientRect();
                const panneau = b.closest('.palette-flottante, .travaux-panneau-lateral').getBoundingClientRect();
                return {
                    texte: b.textContent.trim(),
                    visible: r.width > 0 && r.height > 0,
                    coupe: b.scrollWidth > b.clientWidth + 1,
                    sousLeTemoin: r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top,
                    memeLigne: Math.abs(voisin.top - r.top) < 4,
                    dansSonPanneau: r.left >= panneau.left - 1 && r.right <= panneau.right + 1
                };
            });
            expect(m).toEqual({ texte: 'Déverrouiller l\'évaluation', visible: true, coupe: false, sousLeTemoin: false, memeLigne: true, dansSonPanneau: true });
            expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
        });
    }
}
