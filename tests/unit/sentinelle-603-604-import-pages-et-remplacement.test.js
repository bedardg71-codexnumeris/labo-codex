import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #603 + #604 — L'IMPORT DU 30 AOÛT 2026, ET SES DEUX DÉFAUTS ENCHAÎNÉS.
//
// Mesuré sur l'import réel de Grégoire : 601-101 gr.00007, « Portrait de
// lecteur - lectrice », 49 fichiers tirés de Livia. Deux élèves — Bourdages et
// Turcotte — avaient remis leur travail en DEUX pages, dézippées puis
// numérotées à la main : « …_Portrait_de_lecteur-p1__Remis_le_… » et
// « …-p2__Remis_le_… ». Ce sont les seuls fichiers que l'application a
// signalés comme doublons, et les seuls qui ne sont jamais arrivés.
//
// #603 — LA CAUSE AMONT. `parserNomFichierLea` prend tout ce qui suit le DA
// pour un nom de production. « Portrait de lecteur-p1 » et « Portrait de
// lecteur-p2 » deviennent donc deux productions distinctes, donc deux
// `groupeDocumentId`, donc DEUX DOCUMENTS là où il n'y en a qu'un. Trois
// conséquences, toutes observées : pas d'assemblage multi-pages, un faux
// « présent 2 fois dans la file » à la confirmation, et deux entrées qui
// survivent jusqu'à l'import.
//
// ⚠ Les remises multi-fichiers SANS suffixe (Postiche, Fictif, Pastiche…)
// passent correctement : même `nomProduction`, même clé, donc assemblage. Le
// défaut ne frappe QUE les pages numérotées.
//
// #604 — LE DÉFAUT DESTRUCTEUR. `importerFichier` refuse d'écrire et rend un
// SENTINEL `{doublon:true}` quand le couple (etudiantDA, productionId) existe
// déjà. Trois drapeaux le contournent ; la branche « Remplacer l'existant »
// n'en posait aucun, ET ne lisait pas la valeur rendue. Elle récupérait donc
// le sentinel — rien d'écrit — puis jetait quand même l'existant à la
// corbeille. Un `await` qui rend un objet d'échec ressemble en tout point à un
// succès : aucune exception, `catch` muet, notification de réussite.
//
// ⮕ L'ORDRE avait déjà été corrigé (#558 B1, « importer d'abord, jeter
// ensuite »). C'est la VÉRIFICATION qui manquait. Les deux moitiés sont
// verrouillées ici : le contournement côté import, la lecture du retour côté UI.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceUI = readFileSync(path.join(racineProjet, 'js', 'travaux-ui.js'), 'utf8');

/* -------------------------------------------------------------------------
   Banc
   ---------------------------------------------------------------------- */

const ETUDIANTS = [
    { da: '9000058', nom: 'Bourdages', prenom: 'Alma' },
    { da: '9000582', nom: 'Turcotte', prenom: 'Aria' },
    { da: '9000200', nom: 'Postiche', prenom: 'Lubin' }
];

// Un vrai PDF minimal : `validerMagicBytes` lit les quatre premiers octets.
const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

function faireFichier(nom, type = 'application/pdf') {
    const blob = new Blob([OCTETS_PDF], { type });
    // `preparerFichier` lit name / size / lastModified ; `validerMagicBytes`
    // appelle slice().arrayBuffer(). Un Blob nommé suffit aux deux.
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 7, 21, 15, 36, 32);
    return blob;
}

let win;
let magasin; // fichiers « déjà stockés », vus par obtenirFichiersGroupeActif
let ecrits;  // fichiers réellement écrits par ajouterFichierTravail

function monter(session) {
    magasin = [];
    ecrits = [];

    const travauxStockage = {
        obtenirFichiersGroupeActif: () => magasin,
        ajouterFichierTravail: (meta) => {
            const f = Object.assign({ id: 'ft_' + (ecrits.length + 1) }, meta);
            ecrits.push(f);
            magasin.push(f);
            return f;
        },
        stockerBlob: async () => true,
        supprimerFichierTravail: (id) => {
            const i = magasin.findIndex(f => f.id === id);
            if (i !== -1) magasin.splice(i, 1);
        },
        genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
        genererMiniatureImage: async () => '',
        stockerThumbnail: () => {}
    };

    return chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        travauxStockage,
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} },
        // #876 — une file déjà persistée, restaurée au chargement du module.
        sessionStorage: session
    });
}

beforeEach(() => { win = monter(); });

/* -------------------------------------------------------------------------
   #603 — le suffixe de page n'est pas un nom de production
   ---------------------------------------------------------------------- */

describe('#603 — le suffixe de page est détaché du nom de production', () => {

    it('les deux pages de la remise de Bourdages portent le MÊME nom de production', () => {
        const p1 = win.travauxImport.parserNomFichierLea(
            'Bourdages_9000058_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.jpg');
        const p2 = win.travauxImport.parserNomFichierLea(
            'Bourdages_9000058_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.jpg');

        expect(p1.nomProduction).toBe('Portrait de lecteur');
        expect(p2.nomProduction).toBe('Portrait de lecteur');
        expect(p1.nomProduction).toBe(p2.nomProduction);
        expect(p1.page).toBe(1);
        expect(p2.page).toBe(2);
    });

    it('un fichier sans suffixe garde son nom de production, et n\'a pas de page', () => {
        const r = win.travauxImport.parserNomFichierLea(
            'Mailhot_9000200_Portrait_de_lecteur__Remis_le_2026-08-25_09h43m56s.jpg');
        expect(r.nomProduction).toBe('Portrait de lecteur');
        expect(r.page).toBe(null);
    });

    it('reconnaît les autres formes de numérotation de page', () => {
        const formes = [
            ['Bourdages_9000058_Portrait_de_lecteur_p2__Remis_le_2026-08-21_11h36m32s.jpg', 2],
            ['Bourdages_9000058_Portrait_de_lecteur_page_3__Remis_le_2026-08-21_11h36m32s.jpg', 3],
            ['Bourdages_9000058_Portrait_de_lecteur_partie_2__Remis_le_2026-08-21_11h36m32s.jpg', 2],
            ['Bourdages_9000058_Portrait_de_lecteur_(2)__Remis_le_2026-08-21_11h36m32s.jpg', 2]
        ];
        for (const [nom, page] of formes) {
            const r = win.travauxImport.parserNomFichierLea(nom);
            expect(r.nomProduction, nom).toBe('Portrait de lecteur');
            expect(r.page, nom).toBe(page);
        }
    });

    it('ne mange PAS un nom de production qui se réduirait à son suffixe', () => {
        // Rien avant le suffixe : le retirer laisserait une production sans nom,
        // et deux remises différentes se retrouveraient sous la même clé vide.
        const r = win.travauxImport.parserNomFichierLea(
            'Bourdages_9000058_p2__Remis_le_2026-08-21_11h36m32s.jpg');
        expect(r.nomProduction).toBe('p2');
        expect(r.page).toBe(null);
    });

    it('un chiffre seul en fin de titre n\'est pas un numéro de page', () => {
        // « Artefact 9 » est un titre, pas la 9e page de « Artefact ».
        const r = win.travauxImport.parserNomFichierLea(
            'Bourdages_9000058_Artefact_9__Remis_le_2026-08-21_11h36m32s.jpg');
        expect(r.nomProduction).toBe('Artefact 9');
        expect(r.page).toBe(null);
    });

    it('les deux pages tombent dans UN SEUL groupe de document', () => {
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.pdf'),
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.pdf')
        ]);
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        expect([...groupes.values()][0]).toHaveLength(2);
    });

    it('les pages sont ordonnées par NUMÉRO, pas par ordre de dépôt', () => {
        // Les deux pages portent ici la même `dateRemise`, qui ne départage
        // donc rien. Déposées à l'envers, elles doivent
        // ressortir p1 puis p2 — sans quoi le PDF assemblé sort dans le désordre.
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.pdf'),
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.pdf')
        ]);
        const pages = [...win.travauxImport.regrouperParDocument().values()][0];
        expect(pages.map(f => f.parseLea.page)).toEqual([1, 2]);
    });

    it('deux pages d\'un même travail ne sont PLUS annoncées comme doublons', () => {
        // Le symptôme exact de la capture du 30 août :
        // « Bourdages, Alma — Portrait de lecteur - lectrice (présent 2 fois dans la file) ».
        win.travauxImport.setProductionGlobale('prod_portrait');
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.pdf'),
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.pdf')
        ]);
        expect(win.travauxImport.detecterDoublonsStockage()).toEqual([]);
    });

    it('deux travaux VRAIMENT distincts restent signalés comme doublons', () => {
        // Le témoin inverse : la correction ne doit pas éteindre la détection.
        win.travauxImport.setProductionGlobale('prod_portrait');
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur__Remis_le_2026-08-21_11h36m32s.pdf'),
            faireFichier('Bourdages_9000058_Autre_travail__Remis_le_2026-08-22_09h00m00s.pdf')
        ]);
        expect(win.travauxImport.detecterDoublonsStockage()).toHaveLength(1);
    });
});

/* -------------------------------------------------------------------------
   #604 — remplacer sans perdre
   ---------------------------------------------------------------------- */

describe('#604 — « Remplacer l\'existant » écrit le remplaçant', () => {

    const prepare = (extra = {}) => Object.assign({
        fichier: new Blob([OCTETS_PDF], { type: 'application/pdf' }),
        nomFichier: 'Bourdages_9000058_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.pdf',
        typeMIME: 'application/pdf',
        estPDF: true,
        estImage: false,
        etudiantDA: '9000058',
        parseLea: null,
        operations: []
    }, extra);

    it('SANS le drapeau, l\'import refuse d\'écrire et rend le sentinel', async () => {
        // Le comportement de base, inchangé : c'est lui qui ouvre la modale.
        magasin.push({ id: 'ft_existant', etudiantDA: '9000058', productionId: 'prod_portrait' });
        const r = await win.travauxImport.importerFichier(prepare(), 'prod_portrait');
        expect(r.doublon).toBe(true);
        expect(ecrits).toHaveLength(0);
    });

    it('AVEC `remplaceExistant`, le remplaçant est réellement écrit', async () => {
        // L'existant est TOUJOURS en place à cet instant — c'est tout l'objet de
        // l'ordre inversé #558 B1. Sans contournement, la garde le retrouve et
        // refuse d'écrire ; l'appelant jetait alors l'original pour rien.
        magasin.push({ id: 'ft_existant', etudiantDA: '9000058', productionId: 'prod_portrait' });
        const r = await win.travauxImport.importerFichier(
            prepare({ remplaceExistant: true }), 'prod_portrait');
        expect(r.doublon).toBeUndefined();
        expect(r.id).toBeTruthy();
        expect(ecrits).toHaveLength(1);
    });

    it('les trois autres contournements restent en place', async () => {
        for (const drapeau of ['estReprise', 'livrableAdditionnel']) {
            win = monter();
            magasin.push({ id: 'ft_existant', etudiantDA: '9000058', productionId: 'prod_portrait' });
            const r = await win.travauxImport.importerFichier(
                prepare({ [drapeau]: true }), 'prod_portrait');
            expect(r.doublon, drapeau).toBeUndefined();
            expect(ecrits, drapeau).toHaveLength(1);
        }
    });

    it('la file cesse d\'afficher un fichier déjà écrit', async () => {
        // `importerTous` fait son ménage AVANT l'arbitrage des doublons : sans
        // cette purge, un fichier importé depuis la modale restait dans la file,
        // déjà stocké mais affiché comme s'il attendait encore.
        win.travauxImport.setProductionGlobale('prod_portrait');
        const [f] = win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur__Remis_le_2026-08-21_11h36m32s.pdf')
        ]);
        f.statut = 'importe';
        expect(win.travauxImport.purgerFichiersImportes()).toBe(1);
        expect(win.travauxImport.obtenirFileDAttente()).toHaveLength(0);
    });
});

/* -------------------------------------------------------------------------
   #604 — le côté UI : la corbeille attend la preuve de l'écriture
   ---------------------------------------------------------------------- */

describe('#604 — la mise à la corbeille est conditionnée à un import vérifié', () => {

    // La branche vit dans `traiterDoublonsImport`, au milieu d'un module qui
    // construit son overlay dans le DOM : elle ne se monte pas sur ce banc.
    // On lit donc la source — commentaires retirés d'abord, sinon le récit du
    // défaut, qui cite le code fautif, ferait passer l'assertion à tort.
    const codeUI = sourceUI
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

    const branche = (() => {
        const debut = codeUI.indexOf("choix === 'remplacer'");
        const fin = codeUI.indexOf("choix === 'additionnel'", debut);
        expect(debut, 'branche « remplacer » introuvable').toBeGreaterThan(-1);
        expect(fin, 'fin de branche introuvable').toBeGreaterThan(debut);
        return codeUI.slice(debut, fin);
    })();

    it('pose le drapeau qui autorise l\'écriture', () => {
        expect(branche).toMatch(/remplaceExistant\s*=\s*true/);
    });

    it('lit la valeur rendue par l\'import avant de jeter quoi que ce soit', () => {
        expect(branche).toMatch(/=\s*await\s+travauxImport\.importerFichier/);
        expect(branche).toMatch(/\.doublon/);
    });

    it('la corbeille vient APRÈS la vérification, jamais avant', () => {
        const iVerif = branche.search(/\.doublon/);
        const iCorbeille = branche.indexOf('deplacerEnCorbeille');
        expect(iCorbeille, 'deplacerEnCorbeille absent').toBeGreaterThan(-1);
        expect(iVerif).toBeGreaterThan(-1);
        expect(iCorbeille).toBeGreaterThan(iVerif);
    });

    it('relâche le drapeau, y compris quand l\'import échoue', () => {
        expect(branche).toMatch(/finally\s*\{[\s\S]*remplaceExistant\s*=\s*false/);
    });
});

/* -------------------------------------------------------------------------
   #609 — l'assemblage ne soude que ce qui est vraiment UN document
   ---------------------------------------------------------------------- */

// #609 (S3 du plan « chaîne d'importation des travaux », constat B1 de l'audit
// du 30 août 2026) — L'ASSEMBLAGE AUTOMATIQUE FUSIONNAIT DES FICHIERS QUI NE
// SONT PAS LES PAGES D'UN MÊME DOCUMENT.
//
// L'assemblage est FORCÉ (la case a été retirée) et regroupe toute paire
// d'images partageant une clé. Deux clés étaient fautives :
//
//  · `_solo_<nomFichier>` — deux images sans DA qui portent le même nom
//    formaient un « document ». Le scénario mesuré : l'enseignant photographie
//    des copies avec l'iPad, dépose `IMG_0412.jpg` (élève A, associé à la
//    main), puis un second lot venu d'un autre appareil qui contient aussi
//    `IMG_0412.jpg` (élève B). À « Oui, importer », B est retiré de la file et
//    sa photo devient la page 2 du PDF de A. B reste « Non reçu », et RIEN ne
//    le signale. L'association manuelle ne recalcule pas `groupeDocumentId` :
//    la clé reste `_solo_`.
//
//  · `DA_nomProduction` sans la date de remise — deux remises Livia distinctes
//    d'un même élève (v1 lundi, v2 mercredi) partageaient la clé et sortaient
//    en un seul PDF de deux pages, trié par date, jamais présenté comme
//    doublon. Le correctif #603 a rendu ce cas PLUS probable en retirant le
//    suffixe de page sans discriminer par date.
//
// DÉCISION D1 (Grégoire, 30 août 2026, option A) : deux remises datées
// différemment sont DEUX DOCUMENTS — sur la prémisse que les pages d'une même
// remise partagent la seconde.
//
// #873 — RÉVISÉE (Grégoire, 15 sept. 2026). La prémisse est fausse sur le lot
// réel : les photos d'une même remise portent 09h46m45s, 09h46m55s… Chaque page
// devenait un document, rien ne s'assemblait, et toutes les pages après la
// première étaient annoncées « doublon ». Nouvelle règle : tous les fichiers
// d'un élève pour une production forment UN document ; l'enseignant trie à la
// main (« Défaire le regroupement »), les aperçus rangés par date.

describe('#609 — deux fichiers ne sont un document que si le document le dit', () => {

    it('deux images HOMONYMES sans DA font DEUX groupes, pas un document de deux pages', () => {
        // Le nom de fichier ne dit rien de l'élève : deux `IMG_0412.jpg` venus
        // de deux appareils sont deux copies, pas deux pages.
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('IMG_0412.jpg', 'image/jpeg'),
            faireFichier('IMG_0412.jpg', 'image/jpeg')
        ]);
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(2);
        for (const fichiers of groupes.values()) expect(fichiers).toHaveLength(1);
    });

    it('trois images sans DA, toutes de noms différents, restent trois groupes', () => {
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('IMG_0412.jpg', 'image/jpeg'),
            faireFichier('IMG_0413.jpg', 'image/jpeg'),
            faireFichier('IMG_0414.jpg', 'image/jpeg')
        ]);
        expect(win.travauxImport.regrouperParDocument().size).toBe(3);
    });

    it('#873 — les photos d\'une remise à secondes DIFFÉRENTES font UN document, sans doublon', () => {
        // Le symptôme exact de la capture du 15 sept. (noms fictifs, secondes
        // réelles) : « présent 2 fois dans la file », « présent 3 fois »…
        win.travauxImport.setProductionGlobale('prod_artefact_1');
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Artefact_1_Remis_le_2026-09-15_09h46m55s.jpg', 'image/jpeg'),
            faireFichier('Bourdages_9000058_Artefact_1_Remis_le_2026-09-15_09h46m45s.jpg', 'image/jpeg'),
            faireFichier('Bourdages_9000058_Artefact_1_Remis_le_2026-09-15_09h47m04s.jpg', 'image/jpeg')
        ]);
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        const pages = [...groupes.values()][0];
        // Rangées par date : l'ordre de dépôt (55 s, 45 s, 04 s) ne compte pas.
        expect(pages.map(f => f.nomFichier.match(/(\d{2}h\d{2}m\d{2}s)/)[1]))
            .toEqual(['09h46m45s', '09h46m55s', '09h47m04s']);
        expect(win.travauxImport.detecterDoublonsStockage()).toEqual([]);
    });

    it('deux remises du MÊME élève à des dates différentes font UN groupe, trié par date (#873)', () => {
        // Le tri v1 / v2 revient à l'enseignant, dans le pipeline.
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur__Remis_le_2026-08-26_14h22m00s.jpg', 'image/jpeg'),
            faireFichier('Bourdages_9000058_Portrait_de_lecteur__Remis_le_2026-08-24_09h10m00s.jpg', 'image/jpeg')
        ]);
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        const fichiers = [...groupes.values()][0];
        expect(fichiers.map(f => f.parseLea.dateRemise.getDate())).toEqual([24, 26]);
    });

    it('les pages d\'une MÊME remise restent UN seul groupe', () => {
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.jpg', 'image/jpeg'),
            faireFichier('Bourdages_9000058_Portrait_de_lecteur-p2__Remis_le_2026-08-21_11h36m32s.jpg', 'image/jpeg')
        ]);
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        expect([...groupes.values()][0]).toHaveLength(2);
    });

    it('#873 — un fichier DÉJÀ importé pour le même élève et la même production reste signalé', () => {
        // Le témoin inverse : regrouper la file n'éteint pas la détection
        // contre ce qui est déjà en base.
        win.travauxImport.setProductionGlobale('prod_artefact_1');
        magasin.push({ id: 'ft_ancien', etudiantDA: '9000058', productionId: 'prod_artefact_1' });
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Artefact_1_Remis_le_2026-09-15_09h46m45s.jpg', 'image/jpeg')
        ]);
        const doublons = win.travauxImport.detecterDoublonsStockage();
        expect(doublons).toHaveLength(1);
        expect(doublons[0].stockes).toHaveLength(1);
    });

    it('deux élèves DIFFÉRENTS, même production, même date : deux groupes (inchangé)', () => {
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Bourdages_9000058_Portrait_de_lecteur__Remis_le_2026-08-21_11h36m32s.jpg', 'image/jpeg'),
            faireFichier('Turcotte_9000582_Portrait_de_lecteur__Remis_le_2026-08-21_11h36m32s.jpg', 'image/jpeg')
        ]);
        expect(win.travauxImport.regrouperParDocument().size).toBe(2);
    });

    it('la file persistée bouge avec la file en mémoire : persisterFileDAttente est exposée', () => {
        // M5 — `assemblerGroupesPipeline` splice la file sans la persister :
        // après une interruption, les entrées fusionnées ressuscitent au
        // rechargement comme « à re-déposer ». L'UI ne peut les faire bouger
        // ensemble que si la fonction lui est accessible.
        expect(typeof win.travauxImport.persisterFileDAttente).toBe('function');
    });
});

/* -------------------------------------------------------------------------
   #876 — la file restaurée RECALCULE sa clé, elle ne la recopie pas
   ---------------------------------------------------------------------- */

// Rapport de Grégoire du 15 sept. 2026, 18 h 18, en 1.142.3 : « On me signale
// encore des doublons alors qu'aucun de ces documents n'a le même nom. » Il
// avait repris par « Re-déposer les fichiers » une file déposée sous 1.142.2.
// `restaurerFileDAttente` recopiait la clé persistée — l'horodatage de #609 —
// au lieu de la dériver du nom : #873 était tari à la source, pas dans le stock.

function sessionAvecFile(entrees) {
    return {
        _data: { pipeline_queue: JSON.stringify(entrees) },
        getItem(k) { return this._data[k] != null ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    };
}

// Une entrée telle que `persisterFileDAttente` l'écrit (JSON : la date est une chaîne).
function entreePersistee(secondes, groupeDocumentId, parseLea) {
    const nom = 'Bourdages_9000058_Artefact_1_Remis_le_2026-09-15_09h46m' + secondes + 's.jpg';
    return {
        nomFichier: nom, typeMIME: 'image/jpeg', tailleFichier: 100, tailleOriginale: 100,
        daDetecte: '9000058', etudiantDA: '9000058', estPDF: false, estImage: true,
        statut: 'en-attente', pipelineStatut: 'apercu', productionId: 'prod_artefact_1',
        parseLea: parseLea || { nom: 'Bourdages', da: '9000058', nomProduction: 'Artefact 1', page: null,
            dateRemise: '2026-09-15T13:46:' + secondes + '.000Z', raw: nom },
        groupeDocumentId: groupeDocumentId
    };
}

// La clé de #609 : DA + production + horodatage de la remise, en millisecondes.
const cleHorodatee = (secondes) => '9000058_Artefact-1_' + Date.UTC(2026, 8, 15, 13, 46, Number(secondes));

describe('#876 — une file restaurée recalcule sa clé de regroupement', () => {

    it('une file persistée avec l\'ANCIENNE clé horodatée se regroupe au restaurer, sans doublon', () => {
        win = monter(sessionAvecFile(['45', '55', '04'].map(s => entreePersistee(s, cleHorodatee(s)))));
        const file = win.travauxImport.obtenirFileDAttente();
        expect(file).toHaveLength(3);
        for (const f of file) expect(f.groupeDocumentId).toBe('9000058_Artefact-1');
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        expect(win.travauxImport.detecterDoublonsStockage()).toEqual([]);
        // La date revient de JSON en chaîne : rendue en Date, elle range
        // encore les pages (persistées dans l'ordre 45, 55, 04).
        const pages = [...groupes.values()][0];
        expect(pages[0].parseLea.dateRemise).toBeInstanceOf(Date);
        expect(pages.map(f => f.parseLea.dateRemise.getUTCSeconds())).toEqual([4, 45, 55]);
    });

    it('une clé vidée à la main (« Défaire le regroupement ») reste vide', () => {
        win = monter(sessionAvecFile([entreePersistee('45', ''), entreePersistee('55', '')]));
        const file = win.travauxImport.obtenirFileDAttente();
        expect(file.map(f => f.groupeDocumentId)).toEqual(['', '']);
        expect(win.travauxImport.regrouperParDocument().size).toBe(2);
    });

    it('un nom hors format LÉA garde la clé qu\'il avait', () => {
        const horsLea = { nom: '', da: '', nomProduction: '', page: null, dateRemise: null, raw: 'IMG_0412.jpg' };
        win = monter(sessionAvecFile([entreePersistee('45', '9000058_auto', horsLea)]));
        expect(win.travauxImport.obtenirFileDAttente()[0].groupeDocumentId).toBe('9000058_auto');
    });
});
