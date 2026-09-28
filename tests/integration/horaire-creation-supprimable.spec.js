import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle — retour terrain du 22 août 2026, porte 2.4 du lot Cadre :
// « Il n'y a pas de possibilité de supprimer l'horaire <b>ZZ</b> ».
//
// Le bouton Supprimer porte `u-hide` dans index.html et n'est démasqué que par
// `editerHoraireV2` (mode édition). Après une CRÉATION, la sauvegarde
// repositionnait le menu déroulant sur le nouvel horaire — mais poser
// `select.value` par code ne déclenche PAS l'événement `change`, donc
// `changerHoraireSelectionneV2` n'était jamais appelée : le formulaire restait
// en mode création, sans bouton Supprimer, jusqu'à ce qu'on sélectionne un
// AUTRE horaire puis qu'on revienne.
//
// La sentinelle unitaire jumelle (tests/unit/sentinelle-horaire-creation-
// supprimable.test.js) verrouille la classe sur un faux DOM. Celle-ci va plus
// loin et vérifie ce que le faux DOM ne peut pas dire : que le bouton est
// réellement RENDU, avec une taille non nulle, dans le vrai index.html.

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

test('terrain 2.4 · un horaire qu\'on vient de créer porte un bouton Supprimer RENDU', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    const r = await page.evaluate(async () => {
        const out = {};
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync('a2026_groupeEtudiants', [{ da: '1', nom: 'X', groupe: '00001' }]);
        db.setSync('a2026_horaires', []);

        naviguerVers('calendrier', 'trimestre');
        await new Promise((res) => setTimeout(res, 500));

        const btn = () => document.getElementById('v2-btnSupprimerHoraire');

        // « + Nouvel horaire » : en création, le bouton est légitimement caché
        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        await new Promise((res) => setTimeout(res, 200));
        out.cacheEnCreation = btn().classList.contains('u-hide');

        // remplir comme au terrain
        document.getElementById('v2-hor-groupeAssocie').value = '00001';
        document.getElementById('v2-hor-nom').value = '<b>ZZ</b>';
        document.getElementById('v2-hor-nbSeances').value = '1';
        window.mettreAJourSeancesHoraireV2();
        await new Promise((res) => setTimeout(res, 150));
        const j = document.getElementById('v2-hor-seance-0-jour');
        const d = document.getElementById('v2-hor-seance-0-debut');
        // #540 lot E1 (26 août 2026) : la séance porte SON nombre de périodes, requis à
        // l'enregistrement — une période comprend sa pause, elle ne se déduit pas des
        // heures. Sans lui, la sauvegarde refuse et ce cas ne créait plus d'horaire : il
        // rougissait sur l'absence du bouton Supprimer, pas sur ce qu'il verrouille.
        const p = document.getElementById('v2-hor-seance-0-periodes');
        if (j) j.value = 'Mardi';
        if (d) d.value = '08:00';
        if (p) p.value = '2';

        window.sauvegarderHoraireV2();
        await new Promise((res) => setTimeout(res, 400));

        const boite = btn().getBoundingClientRect();
        out.cacheApresCreation = btn().classList.contains('u-hide');
        out.largeur = Math.round(boite.width);
        out.hauteur = Math.round(boite.height);
        out.titre = document.getElementById('v2-titreFormHoraire').textContent;
        out.nbHoraires = db.getSync('a2026_horaires', []).length;
        out.nomStocke = (db.getSync('a2026_horaires', [])[0] || {}).nom;
        return out;
    });

    expect(r.cacheEnCreation, 'en création pure, le bouton reste caché').toBe(true);
    expect(r.cacheApresCreation, 'après création, le bouton doit être démasqué').toBe(false);
    expect(r.largeur, 'le bouton doit être RENDU, pas seulement démasqué').toBeGreaterThan(0);
    expect(r.hauteur).toBeGreaterThan(0);
    expect(r.titre).toBe('Modifier l\'horaire');
    expect(r.nbHoraires).toBe(1);
    // le nom est stocké tel quel ; c'est l'AFFICHAGE qui l'échappe (CT-09)
    expect(r.nomStocke).toBe('<b>ZZ</b>');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
