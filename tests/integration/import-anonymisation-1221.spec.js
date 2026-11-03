import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1221 (3 nov. 2026) — EN MODE ANONYMISATION, L'ÉTAPE « OPTIMISATION » NE MONTRE AUCUN VRAI NOM.
// Rapport de Grégoire (Mac, 1.231.0) : « Elle s'applique à l'affichage des noms des élèves dans
// les productions reçues, mais pas à leur affichage après l'optimisation des copies. » Ses
// dernières actions : les fichiers déposés en mode normal, PUIS l'anonymisation basculée.
// `f.etudiantAssocie` est un instantané pris au dépôt ; « Aperçu » et « Informations du fichier »
// le lisaient tel quel, alors que « Originaux » se calcule au rendu.
// Appels scriptés, attentes sur l'état. Noms fictifs (règle 6).

const ETUDIANT = { da: '1000001', nom: 'Fictivenom', prenom: 'Fictiprenom', groupe: '00007' };

test('#1221 — déposé en mode normal, puis anonymisé : l\'étape 2 ne porte plus le vrai nom', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => d.dismiss());
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.travauxImport && window.travauxUI && typeof window.changerMode === 'function'
        && typeof window.db !== 'undefined');

    const r = await page.evaluate(async (etu) => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync('trimestres', [{ id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        await db.set(cle('groupesCours'), [{ id: 'GC1', trimestreId: 'a2026', numero: '00007' }]);
        await db.set(cle('groupeEtudiants'), [{ ...etu, groupeCoursId: 'GC1' }]);
        await db.set(cle('productions'), [{ id: 'p_devoir', titre: 'Devoir 1', type: 'artefact' }]);

        // Le conteneur de l'onglet Importer, s'il n'est pas déjà dans la page.
        if (!document.getElementById('evaluations-contenu-import')) {
            const c = document.createElement('div');
            c.id = 'evaluations-contenu-import';
            document.body.appendChild(c);
        }

        // 1. Dépôt en mode NORMAL, par la porte réelle.
        await window.changerMode('normal');
        const octets = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
        window.travauxImport.viderFileDAttente();
        window.travauxImport.ajouterFichiersEnAttente([new File([octets], etu.da + '_devoir.pdf', { type: 'application/pdf' })]);
        const associe = !!(window.travauxImport.obtenirFileDAttente()[0] || {}).etudiantAssocie;

        // 2. Bascule en anonymisation, puis rendu de l'étape 2 avec la copie choisie
        //    (« Informations du fichier » ne se montre qu'alors).
        await window.changerMode('anonymisation');
        window.travauxUI.selectionnerFichierPipeline(0);
        window.travauxUI.afficherImport();
        const conteneur = document.getElementById('evaluations-contenu-import');
        const apercu = (conteneur.querySelector('.pipeline-col-confirmes') || {}).textContent || '';
        const champ = (conteneur.querySelector('.pipeline-input-etudiant') || {}).value;
        const tout = conteneur.innerHTML;

        // 3. Retour au mode normal : le vrai nom revient (l'Aperçu n'est pas vidé pour de bon).
        await window.changerMode('normal');
        window.travauxUI.afficherImport();
        const apercuNormal = (conteneur.querySelector('.pipeline-col-confirmes') || {}).textContent || '';
        window.travauxImport.viderFileDAttente();
        return { associe, apercu, champ, tout, apercuNormal };
    }, ETUDIANT);

    expect(r.associe, 'le DA du nom de fichier associe l\'élève').toBe(true);
    expect(r.apercu, 'la colonne « Aperçu » est rendue').toMatch(/Aper/);
    expect(r.champ, 'le champ « Étudiant·e » de la copie choisie est rendu').toBeDefined();
    expect(r.tout, 'aucun vrai nom dans l\'étape 2 anonymisée').not.toMatch(/Fictivenom|Fictiprenom/);
    expect(r.apercu, 'l\'Aperçu nomme l\'élève anonymisé').toMatch(/Élève \d+/);
    expect(r.champ, 'le champ nomme l\'élève anonymisé').toMatch(/Élève \d+/);
    expect(r.apercuNormal, 'en mode normal, le vrai nom revient').toMatch(/Fictivenom/);
    expect(erreurs, `Erreurs : ${erreurs.join(' | ')}`).toEqual([]);
});
