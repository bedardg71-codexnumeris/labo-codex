import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #329 Voûte Phase 1 · lot P3 — flux d'import .lcz dans WebKit (plan §4 :
// package valide, corrompu, signature invalide, clé changée). Les fichiers
// sont fabriqués DANS la page avec la vraie chaîne d'export du lot P2
// (construirePackageSigne → genererLcz → File) : on teste l'aller-retour
// réel, signature ECDSA et TOFU compris. Auteur jetable nettoyé à la fin.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    // Rejets VOLONTAIRES des scénarios 2-4 (le module logue en console.error)
    /\[partage-import\]/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

const AUTEUR = 'Collègue Test P3';

// Pose une grille + cartouche réelles, un état partage_* vide, et fabrique
// un .lcz signé avec la chaîne P2. Retourne ce qu'il faut aux assertions.
async function preparerPage(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate((auteur) => {
        window.db.setSync('grillesTemplates', [{
            id: 'GR_P3', nom: 'Grille P3',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }]
        }]);
        window.db.setSync('cartouches_GR_P3', [{ id: 'CART_P3', grilleId: 'GR_P3', nom: 'Cartouche P3' }]);
        window.db.setSync('partage_packagesImportes', []);
        window.db.setSync('partage_grilles', []);
        window.db.setSync('partage_cartouches', []);
        window.trustTofu.oublierAuteur(auteur);
    }, AUTEUR);
}

test('P3 · package valide → préviz → intégration partage_* + TOFU mémorisé + Retirer', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await preparerPage(page);

    const resultat = await page.evaluate(async (auteur) => {
        const grille = window.db.getSync('grillesTemplates')[0];
        const pkg = await window.partageFormat.construirePackageSigne(grille, { type: 'grille', identiteAuteur: auteur });
        const blob = await window.partageExport.genererLcz(pkg);
        const fichier = new File([blob], 'grille-p3.lcz');

        const promesse = window.partageImport.importerFichier(fichier);
        await new Promise(r => setTimeout(r, 400));

        const previz = document.getElementById('modalPartagePreviz');
        const prevTexte = previz ? previz.textContent : '';
        const boutonImporter = previz ? previz.querySelector('[data-decision="importer"]') : null;
        if (boutonImporter) boutonImporter.click();
        const issue = await promesse;

        const grilles = window.db.getSync('partage_grilles', []);
        const cartouches = window.db.getSync('partage_cartouches', []);
        const registre = window.db.getSync('partage_packagesImportes', []);
        const tofu = window.trustTofu.verifierConfianceTOFU(pkg);

        // Liste de la carte Réglages › Données
        window.partageImport.rafraichirSection();
        const liste = document.getElementById('partage-imports-liste');
        const listeTexte = liste ? liste.textContent : '';

        // Retrait par identité → storage remis à zéro
        const retire = window.partageImport.retirerImport(issue.idImport);
        const apres = {
            grilles: window.db.getSync('partage_grilles', []).length,
            cartouches: window.db.getSync('partage_cartouches', []).length,
            registre: window.db.getSync('partage_packagesImportes', []).length
        };
        window.trustTofu.oublierAuteur(auteur);

        return { prevTexte, issue, grilles, cartouches, registre, statutTofu: tofu.statut, listeTexte, retire, apres };
    }, AUTEUR);

    // Prévisualisation obligatoire : item, auteur, statut « premier contact »
    expect(resultat.prevTexte).toContain('Grille P3');
    expect(resultat.prevTexte).toContain(AUTEUR);
    expect(resultat.prevTexte).toContain('Premier contact');

    // Intégration : préfixage PARTAGE_, idOriginal (D7), grilleId remappé
    expect(resultat.issue.statut).toBe('importe');
    expect(resultat.grilles).toHaveLength(1);
    expect(resultat.grilles[0].id).toMatch(/^PARTAGE_/);
    expect(resultat.grilles[0].inspireDe.idOriginal).toBe('GR_P3');
    expect(resultat.cartouches[0].grilleId).toBe(resultat.grilles[0].id);
    expect(resultat.registre).toHaveLength(1);
    expect(resultat.registre[0].itemPrincipal.nom).toBe('Grille P3');

    // TOFU : clé mémorisée à l'acceptation → second contact « verifiee »
    expect(resultat.statutTofu).toBe('verifiee');

    // Liste rendue + retrait par identité
    expect(resultat.listeTexte).toContain('Grille P3');
    expect(resultat.listeTexte).toContain('Retirer');
    expect(resultat.retire).toBe(true);
    expect(resultat.apres).toEqual({ grilles: 0, cartouches: 0, registre: 0 });

    expect(erreurs).toEqual([]);
});

test('P3 · package corrompu (champ inconnu) → rejet validation, rien d\'écrit', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await preparerPage(page);

    const resultat = await page.evaluate(async (auteur) => {
        const grille = window.db.getSync('grillesTemplates')[0];
        const pkg = await window.partageFormat.construirePackageSigne(grille, { type: 'grille', identiteAuteur: auteur });
        pkg.entites.grilles[0].champMystere = 'x'; // schéma fermé → rejet
        const blob = await window.partageExport.genererLcz(pkg);

        const promesse = window.partageImport.importerFichier(new File([blob], 'corrompu.lcz'));
        await new Promise(r => setTimeout(r, 400));
        const rejet = document.getElementById('modalPartageRejet');
        const rejetTexte = rejet ? rejet.textContent : '';
        if (rejet) rejet.querySelector('[data-decision="fermer"]').click();
        const issue = await promesse;
        window.trustTofu.oublierAuteur(auteur);
        return {
            issue, rejetTexte,
            grilles: window.db.getSync('partage_grilles', []).length,
            registre: window.db.getSync('partage_packagesImportes', []).length
        };
    }, AUTEUR);

    expect(resultat.issue.statut).toBe('rejete_validation');
    expect(resultat.rejetTexte).toContain('Rien n\'a été importé');
    expect(resultat.rejetTexte).toContain('champ inconnu');
    expect(resultat.grilles).toBe(0);
    expect(resultat.registre).toBe(0);
    expect(erreurs).toEqual([]);
});

test('P3 · package altéré après signature → rejet signature (critère 16)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await preparerPage(page);

    const resultat = await page.evaluate(async (auteur) => {
        const grille = window.db.getSync('grillesTemplates')[0];
        const pkg = await window.partageFormat.construirePackageSigne(grille, { type: 'grille', identiteAuteur: auteur });
        pkg.entites.grilles[0].nom = 'Grille altérée'; // payload signé invalidé
        const blob = await window.partageExport.genererLcz(pkg);

        const promesse = window.partageImport.importerFichier(new File([blob], 'altere.lcz'));
        await new Promise(r => setTimeout(r, 600));
        const rejet = document.getElementById('modalPartageRejet');
        const rejetTexte = rejet ? rejet.textContent : '';
        if (rejet) rejet.querySelector('[data-decision="fermer"]').click();
        const issue = await promesse;
        window.trustTofu.oublierAuteur(auteur);
        return {
            issue, rejetTexte,
            grilles: window.db.getSync('partage_grilles', []).length
        };
    }, AUTEUR);

    expect(resultat.issue.statut).toBe('rejete_signature');
    expect(resultat.issue.code).toBe('SIGNATURE_INVALIDE');
    expect(resultat.rejetTexte).toContain('Signature refusée');
    expect(resultat.grilles).toBe(0);
    expect(erreurs).toEqual([]);
});

test('P3 · bouton « Importer un partage (.lcz) » présent dans les 5 modales de bibliothèque', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await preparerPage(page);

    const resultat = await page.evaluate(async () => {
        const modales = [
            ['grilles', 'afficherBibliothequeGrilles', 'modalBibliothequeGrilles'],
            ['echelles', 'afficherBibliothequeEchelles', 'modalBibliothequeEchelles'],
            ['cartouches', 'afficherBibliothequeCartouches', 'modalBibliothequeCartouches'],
            ['productions', 'afficherBibliothequeProductions', 'modalBibliothequeProductions'],
            ['pratiques', 'afficherBibliothequePratiques', 'modalBibliothequePratiques']
        ];
        const presence = {};
        for (const [nom, fnNom, modalId] of modales) {
            if (typeof window[fnNom] !== 'function') {
                presence[nom] = 'fonction absente : ' + fnNom;
                continue;
            }
            await window[fnNom]();
            const modal = document.getElementById(modalId);
            const bouton = modal
                ? modal.querySelector('[data-action="partageImport.ouvrirSelecteurFichier"]')
                : null;
            presence[nom] = bouton ? 'ok' : 'bouton absent (modale ' + (modal ? 'trouvée' : 'introuvable') + ')';
            if (modal) modal.remove();
        }
        // L'input caché que le bouton déclenche vit dans Réglages › Données,
        // présent dans le DOM en permanence.
        const inputGlobal = !!document.getElementById('partage-fichier-import');
        return { presence, inputGlobal };
    });

    expect(resultat.presence).toEqual({
        grilles: 'ok', echelles: 'ok', cartouches: 'ok', productions: 'ok', pratiques: 'ok'
    });
    expect(resultat.inputGlobal).toBe(true);
    expect(erreurs).toEqual([]);
});

test('P4 · section « Partagés » dans la modale grilles + duplication vers mes documents', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await preparerPage(page);

    const resultat = await page.evaluate(async (auteur) => {
        // Import réel d'un package signé (chaîne P2 → P3 complète).
        const grille = window.db.getSync('grillesTemplates')[0];
        const pkg = await window.partageFormat.construirePackageSigne(grille, { type: 'grille', identiteAuteur: auteur });
        const blob = await window.partageExport.genererLcz(pkg);
        const promesse = window.partageImport.importerFichier(new File([blob], 'p4.lcz'));
        await new Promise(r => setTimeout(r, 400));
        document.querySelector('#modalPartagePreviz [data-decision="importer"]').click();
        await promesse;

        const partagee = window.db.getSync('partage_grilles', [])[0];
        const nbGrillesAvant = window.db.getSync('grillesTemplates', []).length;
        const partagesAvant = JSON.stringify([
            window.db.getSync('partage_grilles', []), window.db.getSync('partage_cartouches', [])
        ]);

        // La modale grilles rend la section « Partagés » avec le bouton.
        await window.afficherBibliothequeGrilles();
        const modal = document.getElementById('modalBibliothequeGrilles');
        const texteModal = modal ? modal.textContent : '';
        const bouton = modal ? modal.querySelector(
            '[data-action="partageSection.dupliquer"][data-param2="' + partagee.id + '"]') : null;
        if (modal) modal.remove();

        // Duplication vers les documents de l'utilisateur.
        const dup = window.partageSection.dupliquerVersMesDocuments('grille', partagee.id);
        const grilles = window.db.getSync('grillesTemplates', []);
        const copie = grilles.filter(g => g.id === dup.idNouveau)[0];
        const cartouchesCopiees = window.db.getSync('cartouches_' + dup.idNouveau, []);
        const partagesApres = JSON.stringify([
            window.db.getSync('partage_grilles', []), window.db.getSync('partage_cartouches', [])
        ]);

        window.trustTofu.oublierAuteur(auteur);
        return {
            texteModal, boutonPresent: !!bouton,
            nbGrillesAvant, nbGrillesApres: grilles.length,
            copie: copie ? {
                prefixeUtilisateur: copie.id.indexOf('GRILLE_') === 0,
                inspireAuteur: copie.inspireDe && copie.inspireDe.auteur,
                metadataCcRetire: !('metadata_cc' in copie),
                dansBibliotheque: copie.dansBibliotheque
            } : null,
            nbCartouchesCopiees: cartouchesCopiees.length,
            grilleIdRemappe: cartouchesCopiees.length ? cartouchesCopiees[0].grilleId === dup.idNouveau : false,
            partagesIntacts: partagesAvant === partagesApres
        };
    }, AUTEUR);

    expect(resultat.texteModal).toContain('Partagés par des collègues');
    expect(resultat.texteModal).toContain('Dupliquer vers mes documents');
    expect(resultat.boutonPresent).toBe(true);

    expect(resultat.nbGrillesApres).toBe(resultat.nbGrillesAvant + 1);
    expect(resultat.copie).toEqual({
        prefixeUtilisateur: true,
        inspireAuteur: AUTEUR,
        metadataCcRetire: true,
        dansBibliotheque: true
    });
    expect(resultat.nbCartouchesCopiees).toBe(1);
    expect(resultat.grilleIdRemappe).toBe(true);
    // Lecture seule : la duplication ne touche jamais les clés partage_*.
    expect(resultat.partagesIntacts).toBe(true);
    expect(erreurs).toEqual([]);
});

test('P3 · clé changée → alerte bloquante, Refuser n\'intègre rien (critère 19)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await preparerPage(page);

    const resultat = await page.evaluate(async (auteur) => {
        // Une AUTRE clé est déjà mémorisée pour cet auteur (premier contact
        // antérieur) — l'import signé localement présentera une clé différente.
        window.trustTofu.memoriserContact({
            manifest: { auteur: { nom: auteur }, clePublique: 'CLE_ANTERIEURE_FACTICE' }
        });

        const grille = window.db.getSync('grillesTemplates')[0];
        const pkg = await window.partageFormat.construirePackageSigne(grille, { type: 'grille', identiteAuteur: auteur });
        const blob = await window.partageExport.genererLcz(pkg);

        const promesse = window.partageImport.importerFichier(new File([blob], 'cle-changee.lcz'));
        await new Promise(r => setTimeout(r, 600));

        const alerte = document.getElementById('modalConfianceCleChangee');
        const alerteTexte = alerte ? alerte.textContent : '';
        const boutonRefuser = alerte ? alerte.querySelector('[data-decision="refuser"]') : null;
        if (boutonRefuser) boutonRefuser.click();
        const issue = await promesse;

        const fiche = window.trustTofu.listerAuteursConnus().filter(
            f => f.nom === auteur
        )[0];
        window.trustTofu.oublierAuteur(auteur);
        return {
            issue, alerteTexte,
            clePreservee: fiche ? fiche.clePubliqueB64 : null,
            grilles: window.db.getSync('partage_grilles', []).length,
            registre: window.db.getSync('partage_packagesImportes', []).length
        };
    }, AUTEUR);

    expect(resultat.alerteTexte).toContain('La clé de signature a changé');
    expect(resultat.alerteTexte).toContain(AUTEUR);
    expect(resultat.issue.statut).toBe('refuse_cle');
    // Refus = la clé connue n'est PAS remplacée, rien n'est intégré
    expect(resultat.clePreservee).toBe('CLE_ANTERIEURE_FACTICE');
    expect(resultat.grilles).toBe(0);
    expect(resultat.registre).toBe(0);
    expect(erreurs).toEqual([]);
});
