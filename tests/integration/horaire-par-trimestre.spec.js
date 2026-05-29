import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Modèle « horaire propre au trimestre » (décision Grégoire, 29 mai 2026) — recréation
// pure, jamais de récup/duplication cross-trimestre, UI explicite. Trois garanties :
//   1. Garde défensif : éditer un horaire hors du trimestre actif est REFUSÉ (pas de faux
//      « modifié », modification non perdue) — au lieu du no-op silencieux historique.
//   2. chargerHorairesV2 réinitialise l'éditeur (état vide) quand le trimestre actif n'a
//      pas l'horaire — jamais de formulaire périmé.
//   3. Chemin nominal préservé : éditer un horaire dans SON trimestre l'enregistre.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Horaire V2\] Sauvegarde refusée/i  // console.warn attendu du garde défensif (cas 1)
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

const SETUP = () => {
    db.setSync('trimestres', [{ id: 'h2026', nom: 'Hiver 2026' }, { id: 'e2026', nom: 'Été 2026' }]);
    db.setSync('h2026_groupeEtudiants', Array.from({ length: 25 }, (_, i) => ({ da: 'D' + i, groupe: '00002' })));
    db.setSync('e2026_groupeEtudiants', Array.from({ length: 24 }, (_, i) => ({ da: 'E' + i, groupe: '00001' })));
    const horId = 'HOR_lunjeu_test';
    db.setSync('h2026_horaires', [{
        id: horId, groupeAssocie: '00002', nom: 'Lun-Jeu', periodesParSeance: 2,
        seances: [{ jour: 'Lundi', heureDebut: '11:00', heureFin: '13:00', local: '2309' },
                  { jour: 'Jeudi', heureDebut: '16:00', heureFin: '18:00', local: '1709' }]
    }]);
    db.setSync('e2026_horaires', []);
    return horId;
};

test('Cas 1 · éditer un horaire hors du trimestre actif est refusé (pas de perte silencieuse)', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(({ setupSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        let erreurNotifAppelee = false;
        let succesNotifAppele = false;
        const o = window.notifications;
        const origErr = o.erreur, origSucces = o.succes;
        o.erreur = (...a) => { erreurNotifAppelee = true; return origErr.apply(o, a); };
        o.succes = (...a) => { succesNotifAppele = true; return origSucces.apply(o, a); };

        // Charger Lun-Jeu sous Hiver (fixe horaireEnEditionId via editerHoraireV2)
        window.db.setSync('trimestreActif', 'h2026');
        window.changerHoraireSelectionneV2(horId);
        // Basculer le trimestre actif SANS passer par l'UI (simule l'éditeur périmé) puis sauvegarder
        window.db.setSync('trimestreActif', 'e2026');
        window.sauvegarderHoraireV2();

        o.erreur = origErr; o.succes = origSucces;
        const h2026 = window.db.getSync('h2026_horaires', []).find(h => h.id === horId);
        const e2026 = window.db.getSync('e2026_horaires', []);
        return { erreurNotifAppelee, succesNotifAppele, h2026Nom: h2026?.nom, e2026Len: e2026.length };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.erreurNotifAppelee, 'une erreur doit être signalée').toBe(true);
    expect(r.succesNotifAppele, 'aucun faux « modifié » ne doit être affiché').toBe(false);
    expect(r.h2026Nom, 'l\'horaire Hiver ne doit pas être altéré').toBe('Lun-Jeu');
    expect(r.e2026Len, 'rien ne doit être écrit dans le trimestre Été').toBe(0);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Cas 2 · chargerHorairesV2 réinitialise l\'éditeur quand le trimestre actif n\'a pas d\'horaire', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Teste directement la branche « aucun horaire dans le trimestre actif » de
    // chargerHorairesV2 (qui appelle afficherEtatVideHoraireV2 → réinitialise l'éditeur).
    // On simule un formulaire d'horaire resté ouvert (état périmé) puis on charge sous un
    // trimestre Été vide. Indépendant de editerHoraireV2 (peuplement des dropdowns).
    const r = await page.evaluate(({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        window.db.setSync('trimestreActif', 'e2026');         // e2026_horaires = []
        window.db.setSync('e2026_horaireSelectionne', null);
        // Simuler un éditeur resté ouvert sur un horaire d'un autre trimestre
        const form = document.getElementById('v2-formulaireHoraire');
        const vide = document.getElementById('v2-horaireEtatVide');
        if (form) form.classList.remove('u-hide');
        if (vide) vide.classList.add('u-hide');
        const ouvertAvant = form ? !form.classList.contains('u-hide') : null;

        window.chargerHorairesV2();

        return {
            ouvertAvant,
            etatVideVisible: vide ? !vide.classList.contains('u-hide') : null,
            formulaireMasque: form ? form.classList.contains('u-hide') : null
        };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.ouvertAvant, 'précondition : formulaire ouvert (état périmé simulé)').toBe(true);
    expect(r.etatVideVisible, 'l\'état vide doit s\'afficher sous un trimestre sans horaire').toBe(true);
    expect(r.formulaireMasque, 'le formulaire périmé doit être masqué').toBe(true);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// Chemin nominal (édition d'un horaire dans son propre trimestre) : code INCHANGÉ par ce
// fix — le garde index<0 est ajouté AVANT la branche index>=0 existante. Couverture du
// chargement/rendu du module horaires déjà assurée par trimestre-v2-rendu.spec.js.
