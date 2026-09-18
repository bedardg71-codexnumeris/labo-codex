import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #918 — LA BARRE DU CADRE SUIT CE QU'ON VIENT D'ENREGISTRER.
//
// Retour testeur du 18 sept. 2026 (Grégoire, 1.144.2) : trimestre A2024 créé,
// 55 étudiant·es importé·es, un horaire et un groupe-cours créés — et la barre
// du haut montrait encore Étudiant·es, Horaire et Groupe-cours comme à faire.
//
// La barre lisait les bonnes clés ; elle n'était recalculée qu'au démarrage et
// au changement de trimestre (#446). Entre les deux, le DOM gardait le rendu
// d'avant. Elle est maintenant rejouée par les trois rendus que chaque
// enregistrement du Cadre rejoue déjà. Ce banc mesure la PAGE : il écrit comme
// l'écran écrit, puis lit la classe `bc-complet` de chaque étape.

const etatBarre = (page) => page.evaluate(() => {
    const r = {};
    document.querySelectorAll('#barreConvergence .bc-etape').forEach((b) => {
        r[b.dataset.etape] = b.classList.contains('bc-complet');
    });
    return r;
});

test('#918 · chaque enregistrement du Cadre coche son étape sans recharger', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => d.accept());

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    // Trimestre neuf et vide, comme A2024 au moment de sa création.
    await page.evaluate(() => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync(window.cle('groupeEtudiants'), []);
        db.setSync(window.cle('horaires'), []);
        db.setSync(window.cle('groupesCours'), []); // security-ok: tableau vide littéral d'un test
        window.mettreAJourBarreContexte();
    });
    const depart = await etatBarre(page);
    expect(depart.etudiants, 'départ : aucune étudiant·e').toBe(false);
    expect(depart.horaire, 'départ : aucun horaire').toBe(false);
    expect(depart['groupe-cours'], 'départ : aucun groupe-cours').toBe(false);

    // 1. ÉTUDIANT·ES — l'import écrit la liste puis rejoue chargerListeEtudiantsV2.
    await page.evaluate(async () => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(window.cle('groupeEtudiants'), [
            { da: '9000001', nom: 'Témoin', prenom: 'Alix', groupe: '00001' }
        ]);
        await window.chargerListeEtudiantsV2();
    });
    expect((await etatBarre(page)).etudiants, 'la liste rendue coche Étudiant·es').toBe(true);

    // 2. HORAIRE — l'enregistrement écrit puis rejoue le hub des menus.
    await page.evaluate(() => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync(window.cle('horaires'), [{ id: 'HOR_TEMOIN', nom: 'Mar-Ven', seances: [] }]);
        window.populerDropdownsAssemblageV2();
    });
    expect((await etatBarre(page)).horaire, 'le hub rejoué coche Horaire').toBe(true);

    // 3. GROUPE-COURS — le trajet vécu : formulaire rempli, « Créer ».
    const nbGC = await page.evaluate(() => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync('cours', [{ id: 'COURS_TEMOIN', codeCours: '000-TEST-ZZ', nomCours: 'Témoin', dansBibliotheque: true }]);
        db.setSync('enseignants', [{ id: 'ENS_TEMOIN', prenom: 'Camille', nom: 'Témoin' }]);
        const poser = (id, valeur) => {
            const s = document.getElementById(id);
            const o = document.createElement('option');
            o.value = valeur;
            o.textContent = valeur;
            s.appendChild(o);
            s.value = valeur;
        };
        poser('v2-gc-trimestre', 'a2024');
        poser('v2-gc-cours', 'COURS_TEMOIN');
        poser('v2-gc-groupe', '00001');
        poser('v2-gc-horaire', 'HOR_TEMOIN');
        poser('v2-gc-enseignant', 'ENS_TEMOIN');
        window.sauvegarderGroupeCoursV2();
        return (db.getSync(window.cle('groupesCours'), []) || []).length;
    });
    expect(nbGC, 'le groupe-cours a bien été écrit — sinon le banc ne mesure rien').toBe(1);
    const apres = await etatBarre(page);
    expect(apres['groupe-cours'], '« Créer » coche Groupe-cours').toBe(true);

    // Le compteur suit aussi, pas seulement la coche.
    const info = await page.evaluate(() => document.getElementById('bc-info-groupe-cours').textContent);
    expect(info).toBe('1 GC');

    // 4. ET DANS L'AUTRE SENS — vider la liste décoche l'étape.
    await page.evaluate(async () => {
        await db.set(window.cle('groupeEtudiants'), []); // security-ok: tableau vide littéral d'un test
        await window.chargerListeEtudiantsV2();
    });
    expect((await etatBarre(page)).etudiants, 'une liste vidée décoche Étudiant·es').toBe(false);

    expect(erreurs, `Erreurs page : ${erreurs.join(' | ')}`).toEqual([]);
});
