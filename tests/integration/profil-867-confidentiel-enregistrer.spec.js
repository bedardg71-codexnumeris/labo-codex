import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// SENTINELLE #867 (15 septembre 2026) — ENREGISTRER UNE NOTE CONFIDENTIELLE N'ACCUSE PLUS L'ÉLÈVE D'ÊTRE INTROUVABLE.
//
// Rapport testeur du 15 sept. 12 h 16 : « J'ai enregistré un commentaire sur un élève et je reçois un
// message d'erreur. Pourtant, le message est bien enregistré. » — alerte « Étudiant·e introuvable ».
//
// Mesuré : `sauvegarderConfidentiel` appelle `fermerModalConfidentiel()`, qui remet
// `_confidentielDaActuel` à null, PUIS passe cette variable à `afficherProfilComplet`. L'alerte vient
// donc du profil, pas de l'enregistrement — qui, lui, a déjà eu lieu.
//
// La moitié silencieuse, plus gênante que l'alerte : `_resoudreEtudiantProfil` écrit l'état pivot
// `profilActuelDA` AVANT de vérifier que l'élève existe. Après l'alerte il vaut null, et
// `changerSectionProfil` refuse tout — la barre latérale du profil ne répond plus.

const DA = 'TEST867A';

// ↻ Lot E3 (D3, 28 sept. 2026) : le volet s'enregistre tout seul, champ par champ ; « Enregistrer » est
// parti, « Fermer » reste. Le geste de #867 devient donc : un champ changé, puis « Fermer » — et c'est
// « Fermer » qui rafraîchit le profil (la pastille), avec le DA tenu AVANT d'être vidé.
async function ecrireNoteEtFermer(page, texte) {
    await page.evaluate((texte) => {
        const champ = document.getElementById('confidentiel-notes');
        if (texte !== undefined) champ.value = texte;
        champ.dispatchEvent(new Event('change', { bubbles: true }));
    }, texte);
    await page.waitForTimeout(300);
    await page.evaluate(() => { document.querySelector('#modalConfidentiel .btn-annuler[data-action="fermerModalConfidentiel"]').click(); });
}

async function monter(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function'
        && typeof window.ouvrirModalConfidentiel === 'function' && typeof window.db !== 'undefined');
    await page.evaluate(() => {
        const trimestreId = 'test867';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-867';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_867' }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: 'GC_867', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: 'GC_867', trimestreId, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST867A', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [{ id: 'p867-1', titre: 'Analyse 1', type: 'travail', ponderation: 100 }]); // security-ok: fixture de test
        window.afficherSection('suivi');
        window.afficherProfilComplet('TEST867A');
    });
    await page.waitForFunction((da) => window.profilActuelDA === da, DA, { timeout: 10000 });
}

test('Porte #867 · enregistrer une note confidentielle : aucune alerte, et le profil reste vivant', async ({ page }) => {
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    await monter(page);

    // Ouvrir le volet, écrire une note, enregistrer — les gestes que fait l'enseignant.
    await page.evaluate((da) => { window.ouvrirModalConfidentiel(da); }, DA);
    await page.waitForFunction(() => !!document.getElementById('confidentiel-notes'));
    await ecrireNoteEtFermer(page, 'Message du 15 sept. : 7 h d\'absences sur 16 h.');
    await page.waitForTimeout(600);

    const etat = await page.evaluate((da) => ({
        note: (window.db.getSync(window.cle('confidentielEtudiants'), {})[da] || {}).notes || null,
        pivot: window.profilActuelDA,
        modalFerme: !document.getElementById('modalConfidentiel').classList.contains('actif')
    }), DA);

    // La note était DÉJÀ enregistrée avant le correctif : c'est ce qui rendait l'alerte absurde.
    expect(etat.note).toContain('7 h d\'absences');
    expect(etat.modalFerme).toBe(true);
    // AVANT : « Étudiant·e introuvable », parce que le DA venait d'être remis à null.
    expect(dialogues, `Alerte(s) reçue(s) : ${dialogues.join(' | ')}`).toEqual([]);
    // AVANT : l'état pivot tombait à null, et la barre latérale du profil ne répondait plus.
    expect(etat.pivot).toBe(DA);
});

test('Porte #867 · après l\'enregistrement, la barre latérale du profil répond encore', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await monter(page);
    await page.evaluate((da) => { window.ouvrirModalConfidentiel(da); }, DA);
    await page.waitForFunction(() => !!document.getElementById('confidentiel-notes'));
    await ecrireNoteEtFermer(page, 'Note fictive #867');
    await page.waitForTimeout(600);

    // Le geste suivant de l'enseignant : changer de sous-section.
    await page.evaluate(() => {
        const item = Array.from(document.querySelectorAll('.sidebar-item')).find((el) => el.textContent.trim().startsWith('Travaux soumis'));
        if (item) item.click();
    });
    await page.waitForTimeout(400);
    const section = await page.evaluate(() => (document.querySelector('.sidebar-item.active') || {}).textContent?.trim() || null);
    // AVANT : `changerSectionProfil` sortait sur « Aucun profil actuel » — le clic ne faisait rien.
    expect(section).toBe('Travaux soumis');
});

test('Porte #867 · un profil vraiment introuvable ne détruit pas celui qui est ouvert', async ({ page }) => {
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    await monter(page);

    await page.evaluate(() => { window.afficherProfilComplet('DA-QUI-N-EXISTE-PAS'); });
    await page.waitForTimeout(400);
    const pivot = await page.evaluate(() => window.profilActuelDA);

    // L'alerte reste due : c'est un vrai cas d'erreur, et elle nomme le problème.
    expect(dialogues).toEqual(['Étudiant·e introuvable']);
    // Mais l'élève ouvert reste l'élève ouvert : l'état pivot n'est pas écrasé par un DA refusé.
    expect(pivot).toBe(DA);
});
