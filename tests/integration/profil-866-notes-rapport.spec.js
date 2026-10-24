import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// SENTINELLE #866 (15 septembre 2026) — LES NOTES DU RAPPORT SURVIVENT AU CHANGEMENT DE SOUS-SECTION.
//
// Rapport testeur du 15 sept. 10 h 06, BLOQUANT : des notes prises dans « Rapport », un aller-retour
// vers une autre sous-section, et les notes ont disparu. Mesuré : le texte n'était enregistré NULLE
// PART — le rapport est refait à chaque ouverture, et le nœud est détruit au changement de section.
//
// #754 avait retiré les rendus en trop ; sa spec voisine (profil-754-un-seul-rendu.spec.js) prouve
// qu'un texte survit à l'OUVERTURE. Elle ne fait pas le trajet aller-retour : c'est ce que celle-ci
// ajoute, sur la zone « Mes notes », la seule qui est enregistrée.
//
// La frappe passe par le CLAVIER, pas par une affectation de `.value` : une affectation script ne
// lève pas l'événement `change` au blur, et c'est le blur qui sauve la note quand on clique sur une
// autre sous-section. Un test qui pose la valeur par script prouverait un chemin que personne n'emprunte.
//
// Les DEUX chemins de sortie sont éprouvés séparément, parce qu'ils ne se ressemblent pas (mesuré
// le 15 sept. en sondant le banc) :
//   A. le clic de souris — le champ perd le focus, `change` part, l'écriture est immédiate ;
//   B. une navigation faite par du code (`el.click()`) — le focus NE BOUGE PAS, aucun `change` :
//      seule la lecture de l'écriture en attente rend la note au rendu suivant.

const DA = 'TEST866A';

async function monter(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function'
        && typeof window.changerSectionProfil === 'function' && typeof window.db !== 'undefined');
    const montage = await page.evaluate(() => {
        const trimestreId = 'test866';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-866';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_866' }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: 'GC_866', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: 'GC_866', trimestreId, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST866A', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [{ id: 'p866-1', titre: 'Analyse 1', type: 'travail', ponderation: 100, dateEcheance: '2026-02-01' }]); // security-ok: fixture de test
        window.afficherSection('suivi');
        return { ok: true };
    });
    expect(montage.erreur, `Erreur de montage : ${montage.erreur}`).toBeUndefined();
}

/** Ouvre le profil et affiche la sous-section « Rapport », zone « Mes notes » présente. */
async function ouvrirRapport(page) {
    await page.evaluate((da) => { window.afficherProfilComplet(da); window.changerSectionProfil('rapport'); }, DA);
    await page.waitForFunction((da) => !!document.getElementById('textarea-notes-rapport-' + da), DA, { timeout: 10000 });
}

/** Clique un bouton de section de la rangée du profil (#1151) par son libellé — le vrai geste, donc le vrai blur. */
async function cliquerSousSection(page, libelle) {
    await page.evaluate((lib) => {
        const item = Array.from(document.querySelectorAll('.rangee-selection-section'))
            .find((el) => el.textContent.trim().startsWith(lib));
        if (item) item.click();
    }, libelle);
}

test('Porte #866 · une note tapée dans « Mes notes » est encore là après un aller-retour de sous-section', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await monter(page);
    await ouvrirRapport(page);

    // Taper au clavier. WebKit place le curseur au début après un focus() : on le pose à la fin.
    await page.evaluate((da) => {
        const t = document.getElementById('textarea-notes-rapport-' + da);
        t.focus();
        t.setSelectionRange(t.value.length, t.value.length);
    }, DA);
    await page.keyboard.type('Rencontre du 12 : revoir la consigne.');

    // Chemin A — le clic de souris : le champ perd le focus, `change` part, l'écriture est immédiate.
    // Pour que cet essai prouve le BLUR et non le filet du débounce, le débounce est mis hors jeu le
    // temps du geste : les rappels de 400 ms ne partent pas. Sans le blur, rien n'est écrit du tout.
    const ecritAuBlur = await page.evaluate((da) => {
        const vrai = window.setTimeout;
        window.setTimeout = function (f, d) { return d === 400 ? 0 : vrai.apply(window, arguments); };
        try {
            document.getElementById('textarea-notes-rapport-' + da).blur();
            return (window.db.getSync(window.cle('notesRapport'), {}) || {})[da] || null;
        } finally {
            window.setTimeout = vrai;
        }
    }, DA);
    expect(ecritAuBlur, 'le blur écrit tout de suite, sans le débounce').toContain('Rencontre du 12 : revoir la consigne.');

    await cliquerSousSection(page, 'Travaux soumis');
    await page.waitForFunction((da) => !document.getElementById('textarea-notes-rapport-' + da), DA, { timeout: 10000 });

    // Revenir.
    await cliquerSousSection(page, 'Rapport');
    await page.waitForFunction((da) => !!document.getElementById('textarea-notes-rapport-' + da), DA, { timeout: 10000 });

    const etat = await page.evaluate((da) => ({
        affiche: document.getElementById('textarea-notes-rapport-' + da).value,
        stocke: window.db.getSync(window.cle('notesRapport'), {})[da] || null
    }), DA);

    // AVANT #866 : rien n'était écrit, et le champ n'existait pas — la note était perdue.
    expect(etat.affiche).toContain('Rencontre du 12 : revoir la consigne.');
    expect(etat.stocke).toContain('Rencontre du 12 : revoir la consigne.');
});

test('Porte #866 · chemin B — une navigation faite par du code n\'émet aucun blur : la note revient quand même', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await monter(page);
    await ouvrirRapport(page);

    await page.evaluate((da) => {
        const t = document.getElementById('textarea-notes-rapport-' + da);
        t.focus();
        t.setSelectionRange(t.value.length, t.value.length);
    }, DA);
    await page.keyboard.type('Note sans blur.');

    // Aucun blur, aucun délai : le champ est encore celui qui a le focus quand il est détruit.
    const focusGarde = await page.evaluate((da) => {
        const avant = document.activeElement && document.activeElement.id;
        const item = Array.from(document.querySelectorAll('.rangee-selection-section')).find((el) => el.textContent.trim().startsWith('Travaux soumis'));
        item.click();
        return avant === 'textarea-notes-rapport-' + da;
    }, DA);
    expect(focusGarde, 'le champ avait bien le focus au moment du geste').toBe(true);

    await cliquerSousSection(page, 'Rapport');
    await page.waitForFunction((da) => !!document.getElementById('textarea-notes-rapport-' + da), DA, { timeout: 10000 });
    const affiche = await page.evaluate((da) => document.getElementById('textarea-notes-rapport-' + da).value, DA);
    // AVANT la lecture de l'écriture en attente : le rendu relisait un stockage en retard — champ vide.
    expect(affiche).toContain('Note sans blur.');

    // Et le débounce finit bien par écrire, même sans blur.
    await page.waitForFunction((da) => (window.db.getSync(window.cle('notesRapport'), {})[da] || '').includes('Note sans blur.'), DA, { timeout: 5000 });
});

test('Porte #866 · le rapport, lui, reste refait à chaque ouverture — on ne copie pas des chiffres périmés', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await monter(page);
    await ouvrirRapport(page);
    await page.waitForFunction((da) => { const t = document.getElementById('textarea-rapport-' + da); return !!(t && t.value.length > 0); }, DA, { timeout: 10000 });

    await page.evaluate((da) => { document.getElementById('textarea-rapport-' + da).value = 'CHIFFRES PÉRIMÉS'; }, DA);
    await cliquerSousSection(page, 'Travaux soumis');
    await page.waitForFunction((da) => !document.getElementById('textarea-rapport-' + da), DA, { timeout: 10000 });
    await cliquerSousSection(page, 'Rapport');
    await page.waitForFunction((da) => { const t = document.getElementById('textarea-rapport-' + da); return !!(t && t.value.length > 0); }, DA, { timeout: 10000 });

    const rapport = await page.evaluate((da) => document.getElementById('textarea-rapport-' + da).value, DA);
    expect(rapport).not.toContain('CHIFFRES PÉRIMÉS');
    expect(rapport).toContain('Assiduité');
    // Et rien du texte du rapport n'est parti au stockage : seule « Mes notes » s'y écrit.
    // (Le filtre porte sur le CONTENU, pas sur le nom des clés : `migration_rapports_bug_20_done`
    //  contient « rapport » sans rien avoir à voir avec celui-ci.)
    const clesPorteuses = await page.evaluate(() => Object.keys(localStorage)
        .filter((k) => ((localStorage.getItem(k) || '').includes('Assiduité :') || (localStorage.getItem(k) || '').includes('CHIFFRES PÉRIMÉS'))));
    expect(clesPorteuses).toEqual([]);
});
