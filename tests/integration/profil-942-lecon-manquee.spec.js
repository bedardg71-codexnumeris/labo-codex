import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #942 — PROFIL › ENGAGEMENT : CHAQUE ABSENCE NOMME LA LEÇON MANQUÉE, DANS LA VRAIE PAGE (WebKit).
//
// La sentinelle Vitest (sentinelle-942-…) garde le calcul (l'inverse de #695) et chaque cas de la consigne. Ce
// banc joue ce que la machine virtuelle ne monte pas : la carte « Assiduité » rendue par `afficherProfilComplet`,
// sur le pack démo (ses vraies présences, son vrai horaire de groupe), avec une carte d'alignement rattachée au
// cours. Deux absences ont une leçon posée à leur date → deux pastilles, deux titres ; une troisième n'en a pas
// → une pastille sans titre.
//
// La semaine et le rang de chaque date sont calculés ICI, à la main, dans la table de l'horaire du groupe
// (`seancesCompletes_gc_<id>`, dates d'une même semaine triées) : le banc ne se sert pas de la fonction qu'il juge.
//
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

// Un titre porteur de HTML (relecture de Cowork, § 2) : il doit se lire, pas s'exécuter.
const TITRE_PIEGE = 'Le plan <img src=x onerror="window.__xss942=1"> détaillé';

for (const largeur of [1280, 768]) {
test(`profil › Engagement (${largeur} px) · deux absences, deux titres de leçon ; une absence sans leçon, une pastille sans titre`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: largeur, height: 1024 });   // 768 : l'iPad en portrait
    page.on('dialog', (d) => d.dismiss());
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
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

    const r = await page.evaluate(async (TITRE_PIEGE) => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        await window.activerModeDemo();
        await pause(1500);

        // Un élève du pack démo avec au moins trois absences ou retards.
        const eleves = obtenirDonneesSelonMode('groupeEtudiants') || [];
        const eleve = eleves.find(e => (obtenirDetailsAssiduite(e.da).absences || []).length >= 3);
        if (!eleve) return { erreur: 'aucun élève du pack démo n\'a trois absences' };
        const da = eleve.da;
        const gcId = window.syntheseRetroactionData.groupeCoursIdDeLEleve(da);
        const gc = (obtenirDonneesSelonMode('groupesCours') || []).find(g => g.id === gcId);
        const table = db.getSync('seancesCompletes_gc_' + gcId, {}) || {};

        // Semaine et rang d'une date, à la main : les dates de la même semaine, triées.
        const position = (date) => {
            const sem = parseInt(((table[date] || [])[0] || {}).numeroSemaine, 10);
            const memes = Object.keys(table).filter(d => (table[d] || []).length && parseInt(table[d][0].numeroSemaine, 10) === sem).sort();
            return { semaine: sem, rang: memes.indexOf(date) + 1 };
        };
        const absences = obtenirDetailsAssiduite(da).absences;
        const [a1, a2, a3] = absences;
        const p1 = position(a1.date), p2 = position(a2.date);

        // La carte d'alignement du cours : deux leçons aux dates des deux premières absences, rien à la troisième.
        const noeud = (id, titre, p) => ({ id, type: 'lecon', titre, parent: null, enfants: [], x: 0, y: 0,
            metadata: { semaine: p.semaine, rangSeance: p.rang } });
        db.setSync(cle('planification_mindmap'), {
            index: { active: 'carte_942', compteurCartes: 1, cartes: [{ id: 'carte_942', nom: 'Carte banc', coursId: gc.coursId }] },
            cartes: { carte_942: { compteur: 2, compteurLiens: 0, liens: [], noeuds: [
                noeud('L1', 'La carte mentale', p1), noeud('L2', TITRE_PIEGE, p2)
            ] } }
        });

        afficherProfilComplet(da); await pause(500);
        changerSectionProfil('mobilisation'); await pause(500);
        const racine = document.getElementById('contenuProfilEtudiant') || document.body;
        const pastilles = Array.from(racine.querySelectorAll('.badge-absence[data-action="naviguerVersPresenceAvecDate"]')).map(b => ({
            date: b.getAttribute('data-param'),
            lecons: Array.from(b.querySelectorAll('.badge-absence-lecon')).map(s => s.textContent.trim()),
            balisesInjectees: b.querySelectorAll('.badge-absence-lecon *').length,
            largeur: Math.round(b.getBoundingClientRect().width)
        }));
        const carteAssiduite = pastilles.length ? Math.round(racine.querySelector('.badge-absence').closest('.profil-carte').getBoundingClientRect().width) : null;
        return { da, gcId, dates: [a1.date, a2.date, a3.date], p1, p2, pastilles, carteAssiduite, xss: window.__xss942 === 1 };
    }, TITRE_PIEGE);

    console.log('PROFIL-942 ' + largeur + ' ' + JSON.stringify(r));
    expect(r.erreur).toBeUndefined();
    const parDate = Object.fromEntries(r.pastilles.map(p => [p.date, p.lecons]));
    expect(parDate[r.dates[0]]).toEqual(['La carte mentale']);
    // Relecture de Cowork, § 2 : le titre d'une leçon est une donnée utilisateur (une carte peut venir d'un import).
    // Il sort ÉCHAPPÉ : le texte tel quel dans la pastille, aucune balise créée, aucun gestionnaire exécuté.
    expect(parDate[r.dates[1]]).toEqual([TITRE_PIEGE]);
    expect(r.pastilles.every(p => p.balisesInjectees === 0), 'aucune balise créée par un titre').toBe(true);
    expect(r.xss, 'aucun gestionnaire onerror exécuté').toBe(false);
    expect(parDate[r.dates[2]], 'une absence sans leçon : pastille sans titre').toEqual([]);
    // La pastille reste dans sa carte : aucun titre ne la fait déborder.
    r.pastilles.forEach(p => expect(p.largeur).toBeLessThanOrEqual(r.carteAssiduite));
    expect(erreurs).toEqual([]);
});
}
