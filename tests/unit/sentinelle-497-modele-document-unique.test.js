import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

// Sentinelle #497 (25 août 2026) — LE DOCUMENT EST DÉCIDÉ UNE FOIS, RENDU DEUX.
//
// Le fil : `genererApercuCombine` (HTML) et `genererPDFCombine` (jsPDF)
// portaient chacun sa copie des règles du document — quel titre, quelles lignes
// d'en-tête, quels blocs d'information. Rien ne les tenait d'accord, et ils ne
// l'étaient pas. C'est la cause de fond du constat de Grégoire : « l'aperçu ne
// ressemble pas au PDF ». Pas un défaut de CSS — une règle écrite deux fois.
//
// ▣ CE QUE L'ÉTAPE 2 ÉTABLIT : le CONTENU se décide dans
// `construireModeleDocument`, la PRÉSENTATION reste dans chaque rendeur. Un
// titre qui change, un bloc qui s'ajoute, une ligne d'en-tête qui disparaît :
// une seule écriture, deux documents d'accord par construction.
//
// Ce que cette sentinelle tient :
//   W1 — les règles du modèle, sur les cas réels de Grégoire.
//   W2 — LE RATCHET : aucun rendeur ne reconstruit ce que le modèle décide.
//        C'est lui qui empêche la duplication de repousser.
//   X  — étape 3 : les trois crans, et la règle « les consignes seules sur leur
//        page ». Un cran sans matière est refusé ET dit pourquoi.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(
    path.resolve(__dirname, '..', '..', 'js', 'export-pdf.js'), 'utf8');

/* ------------------------------------------------------------------ harnais */

function charger() {
    // ⚠ `trimestres` n'est PAS namespacée : `obtenirNomTrimestre` la lit nue.
    // La fixture disait `a2026_trimestres` — le trimestre sortait vide, et le
    // golden figeait un document amputé de sa troisième ligne d'en-tête.
    const store = {
        'trimestres': [{ id: 'a2026', nom: 'Automne 2026', actif: true }],
        'a2026_groupesCours': [
            { id: 'GC_A', groupeNum: '00002', coursId: 'COURS_A' },
            { id: 'GC_B', groupeNum: '00008', coursId: 'COURS_A' }
        ]
    };
    return chargerScript('js/export-pdf.js', {
        db: {
            get: async () => null,
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {}, alert: () => {},
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {},
            // ⚠ Voir `element-echappant.js` : un createElement qui ne relie pas
            // textContent à innerHTML rend TOUT le document vide, en silence.
            createElement: (tag) => elementEchappant(tag)
        }
    });
}

const GRILLE = { id: 'GR_1', nom: 'Grille-4 A26', criteres: [] };
const INFOS = { sigle: '601-101-MQ', titre: 'Écriture et littérature', sigleTitre: '601-101-MQ' };
const PRODUCTION = {
    id: 'P1', titre: 'Artefact 1',
    activiteApprentissage: 'Appliquer des stratégies de lecture variées',
    objectif: 'OBJECTIF', tache: 'TACHE', detailTache: 'DETAIL'
};
const CARTOUCHE = { id: 'C1', nom: 'Cartouche', contexte: 'CONTEXTE' };

const OPTIONS = (extra = {}) => Object.assign({
    production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
    inclureDescription: true, inclureDetailTache: true, infosCours: INFOS
}, extra);

/* ---------------------------------------------------------- W1 — les règles */

describe('#497 · W1 — ce que le modèle décide', () => {
    const win = charger();

    it('W1.a Le titre porte la production, activité comprise', () => {
        expect(win.titreDocument(GRILLE, OPTIONS())).toBe(
            'Artefact 1 - Appliquer des stratégies de lecture variées');
    });

    it('W1.b Sans production, c\'est la grille qui nomme le document', () => {
        expect(win.titreDocument(GRILLE, { production: null })).toBe('Grille-4 A26');
        expect(win.titreDocument({ nom: '' }, {})).toBe('Grille de critères');
    });

    it('W1.c Une production sans activité garde son seul nom', () => {
        const sansActivite = { titre: 'Examen final' };
        expect(win.titreDocument(GRILLE, { production: sansActivite, inclureNomProduction: true }))
            .toBe('Examen final');
    });

    it('W1.d L\'en-tête : sigle en premier et en gras, puis cours, puis trimestre', () => {
        const lignes = win.lignesEnteteDocument(OPTIONS());
        expect(lignes.map(l => l.texte)).toEqual(
            ['601-101-MQ', 'Écriture et littérature', 'Automne 2026']);
        expect(lignes.map(l => l.gras)).toEqual([true, false, false]);
    });

    it('W1.e Chaque ligne d\'en-tête se retire séparément', () => {
        expect(win.lignesEnteteDocument(OPTIONS({ enteteCode: false })).map(l => l.texte))
            .toEqual(['Écriture et littérature', 'Automne 2026']);
        expect(win.lignesEnteteDocument(OPTIONS({ enteteNom: false })).map(l => l.texte))
            .toEqual(['601-101-MQ', 'Automne 2026']);
        expect(win.lignesEnteteDocument(OPTIONS({ enteteTrimestre: false })).map(l => l.texte))
            .toEqual(['601-101-MQ', 'Écriture et littérature']);
    });

    it('W1.f Les blocs sortent dans leur ordre de lecture', () => {
        // ⚠ « À préciser » est le bloc de date (#498) : il est TOUJOURS là,
        // même sans date posée, entre les consignes et le contexte.
        expect(win.blocsInformationDocument(CARTOUCHE, OPTIONS()).map(b => b.texte))
            .toEqual(['OBJECTIF', 'TACHE', 'DETAIL', 'À préciser', 'CONTEXTE']);
    });

    it('W1.g Un champ vide ne fabrique pas un bloc vide', () => {
        const creuse = { titre: 'X', objectif: '', tache: null, detailTache: '   ' };
        const blocs = win.blocsInformationDocument(null, OPTIONS({ production: creuse }));
        // '   ' est truthy ; « Date de remise » s'ajoute toujours (#498).
        expect(blocs.map(b => b.titre)).toEqual(['Détail de la tâche :', 'Date de remise :']);
        expect(blocs.some(b => b.texte === '' || b.texte === null)).toBe(false);
    });

    it('W1.h Le contexte de la cartouche n\'a pas besoin de production', () => {
        expect(win.blocsInformationDocument(CARTOUCHE, { production: null }).map(b => b.texte))
            .toEqual(['CONTEXTE']);
    });

    it('W1.i Le modèle porte du TEXTE BRUT, jamais du HTML échappé', () => {
        const piegee = Object.assign({}, PRODUCTION, { objectif: 'Lire « A & B » <attentivement>' });
        const blocs = win.blocsInformationDocument(null, OPTIONS({ production: piegee }));
        // L'échappement est l'affaire du rendeur HTML ; le PDF n'en veut pas.
        expect(blocs[0].texte).toBe('Lire « A & B » <attentivement>');
        expect(blocs[0].texte).not.toContain('&amp;');
    });
});

/* ----------------------------------------------------------- W2 — LE RATCHET */

describe('#497 · W2 — la duplication ne peut pas repousser', () => {
    function corps(nomFonction) {
        const debut = SOURCE.indexOf(`function ${nomFonction}(`);
        expect(debut, `${nomFonction} doit exister`).toBeGreaterThan(-1);
        // Jusqu'à la prochaine déclaration de fonction au niveau du module.
        const suite = SOURCE.indexOf('\nfunction ', debut + 10);
        const suiteAsync = SOURCE.indexOf('\nasync function ', debut + 10);
        const fins = [suite, suiteAsync].filter(i => i > -1);
        return SOURCE.slice(debut, fins.length ? Math.min(...fins) : SOURCE.length);
    }

    it('W2.a Les deux rendeurs partent du modèle', () => {
        expect(corps('genererApercuCombine')).toContain('construireModeleDocument(');
        expect(corps('genererPDFCombine')).toContain('construireModeleDocument(');
    });

    it('W2.b Aucun rendeur ne reconstruit le titre de son côté', () => {
        // Le marqueur est le REPLI du titre, pas `activiteApprentissage` : ce
        // champ sert aussi à nommer le FICHIER téléchargé, usage légitime et
        // distinct. Chercher le mauvais marqueur aurait rendu la garde
        // impossible à satisfaire, donc bonne à désactiver un jour de fatigue.
        for (const nom of ['genererApercuCombine', 'genererPDFCombine']) {
            expect(corps(nom), `${nom} ne doit plus composer le titre`)
                .not.toContain("'Grille de critères'");
        }
        expect(corps('titreDocument'), 'le repli vit dans le modèle')
            .toContain("'Grille de critères'");
    });

    it('W2.c Aucun rendeur ne redécide quels blocs montrer', () => {
        for (const nom of ['genererApercuCombine', 'genererPDFCombine']) {
            const c = corps(nom);
            expect(c, `${nom} ne doit plus lire les champs de la production`)
                .not.toContain('inclureObjectif');
            expect(c).not.toContain('inclureDetailTache');
        }
    });

    it('W2.d L\'en-tête du PDF passe aussi par le modèle', () => {
        expect(corps('ajouterEntetePage')).toContain('lignesEnteteDocument(');
    });

    it('W2.f LA RÈGLE DE PAGINATION VAUT DES DEUX CÔTÉS', () => {
        // Elle n'a d'abord existé que dans l'aperçu : le PDF enchaînait tout, et
        // la grille commençait au BAS de la page 1 pour se poursuivre au verso.
        // L'écran et le fichier se contredisaient sur la seule chose que le
        // lecteur regarde — où commence ce sur quoi on l'évalue.
        const c = corps('genererPDFCombine');
        expect(c, 'le PDF doit ouvrir une page pour l\'évaluation').toContain('doc.addPage()');
        expect(c, 'et la conditionner à la présence de consignes')
            .toContain('modele.blocsInfo.length > 0 && modele.afficheEvaluation');
    });

    it('W2.h Le titre ne peut pas recouvrir les infos du cours', () => {
        // `doc.text()` n'enveloppe pas : « Artefact 1 - Appliquer des stratégies
        // de lecture variées (Madawigouche) » sortait de la page ET passait
        // par-dessus le sigle, le nom du cours et le trimestre. Deux textes
        // superposés, illisibles tous les deux.
        const c = corps('ajouterEntetePage');
        expect(c, 'le titre doit être enveloppé').toContain('splitTextToSize(titre');
        expect(c, 'sur la largeur qui RESTE, mesurée et non estimée')
            .toContain('getTextWidth(ligne.texte)');
        expect(c, 'et la séparation descend avec lui').toContain('lignesTitre.length');
    });

    it('W2.g Le badge de licence tient dans un pied de page', () => {
        // 144 mm sur une page de 216 : le badge en couvrait les deux tiers et
        // recouvrait le tableau. Découvert le 25 août, en usage réel.
        const largeur = Number((SOURCE.match(/const CC_LOGO_W = (\d+(?:\.\d+)?)/) || [])[1]);
        expect(largeur, 'CC_LOGO_W doit être lisible dans le source').toBeGreaterThan(0);
        expect(largeur, 'un badge de pied de page ne dépasse pas ~40 mm').toBeLessThan(40);
        // La hauteur SUIT la largeur : une constante à part se déforme au premier ajustement.
        expect(SOURCE).toContain('const CC_LOGO_H = CC_LOGO_W *');
    });

    it('W2.e LE CRAN VOYAGE JUSQU\'AU FICHIER EXPORTÉ', () => {
        // La porte de sortie est l'endroit où l'écart se rouvre : l'aperçu
        // montrerait les consignes seules pendant que le PDF sortirait tout.
        expect(corps('exporterPDFDepuisApercu'), 'l\'export doit lire le cran choisi')
            .toContain("apercuPDF-cran");
        expect(corps('rafraichirApercuPDF'), 'l\'aperçu le lit au même endroit')
            .toContain('accorderSelecteurCran(');
    });
});

/* ------------------------------------------- X — les crans et les feuilles */

describe('#497 · X1 — ce que le document peut porter', () => {
    const win = charger();
    const GRILLE_PLEINE = { id: 'G', nom: 'G', criteres: [{ nom: 'C', ponderation: 100 }] };
    const CART = { id: 'C', nom: 'C' };

    it('X1.a Le document complet porte les trois crans', () => {
        expect(win.cransDisponibles(GRILLE_PLEINE, CART, { production: PRODUCTION }))
            .toEqual(['consignes', 'evaluation', 'retroaction']);
    });

    it('X1.b Sans grille, on ne monte pas plus haut que les consignes', () => {
        expect(win.cransDisponibles(null, CART, { production: PRODUCTION })).toEqual(['consignes']);
        expect(win.cransDisponibles({ criteres: [] }, CART, { production: PRODUCTION }))
            .toEqual(['consignes']);
    });

    it('X1.c Sans cartouche, pas de cran Rétroaction', () => {
        expect(win.cransDisponibles(GRILLE_PLEINE, null, { production: PRODUCTION }))
            .toEqual(['consignes', 'evaluation']);
    });

    it('X1.d Sans production, le document commence à l\'évaluation', () => {
        // C'est le chemin des boutons qui partent d'une échelle ou d'une cartouche.
        expect(win.cransDisponibles(GRILLE_PLEINE, CART, { production: null }))
            .toEqual(['evaluation', 'retroaction']);
    });

    it('X1.e Une production vide de consignes n\'ouvre pas le premier cran', () => {
        const creuse = { id: 'P', titre: 'Vide' };
        expect(win.cransDisponibles(GRILLE_PLEINE, null, { production: creuse }))
            .toEqual(['evaluation']);
    });
});

describe('#497 · X2 — une demande impossible est rabattue, jamais servie', () => {
    const win = charger();
    const GRILLE_PLEINE = { id: 'G', nom: 'G', criteres: [{ nom: 'C', ponderation: 100 }] };

    it('X2.a LE CAS QUI PORTE LE SENS : un réglage mémorisé sur un cran devenu impossible', () => {
        // Sans ce rabattement, ouvrir une production sans cartouche après en
        // avoir vu une avec afficherait un document VIDE, et le menu dirait
        // « + Rétroaction » sans que rien ne s'affiche.
        const modele = win.construireModeleDocument(GRILLE_PLEINE, null,
            { cran: 'retroaction', production: PRODUCTION });
        expect(modele.cran).toBe('evaluation');
        expect(modele.afficheRetroaction).toBe(false);
        expect(modele.afficheEvaluation).toBe(true);
    });

    it('X2.b Sans demande, le cran le plus haut : rien ne disparaît à l\'ouverture', () => {
        const modele = win.construireModeleDocument(GRILLE_PLEINE, { id: 'C' },
            { production: PRODUCTION });
        expect(modele.cran).toBe('retroaction');
    });

    it('X2.c Le cran Consignes coupe l\'évaluation ET la rétroaction', () => {
        const modele = win.construireModeleDocument(GRILLE_PLEINE, { id: 'C' },
            { cran: 'consignes', production: PRODUCTION, inclureObjectif: true });
        expect(modele.afficheEvaluation).toBe(false);
        expect(modele.afficheRetroaction).toBe(false);
    });

    it('X2.d Le contexte de la cartouche suit la cartouche, pas les consignes', () => {
        const options = { cran: 'evaluation', production: PRODUCTION,
                          inclureObjectif: true, inclureDescription: true, inclureDetailTache: true };
        const modele = win.construireModeleDocument(GRILLE_PLEINE, CARTOUCHE, options);
        expect(modele.blocsInfo.map(b => b.texte)).not.toContain('CONTEXTE');
    });
});

describe('#497 · X3 — les consignes seules sur leur page', () => {
    const win = charger();
    const GRILLE_PLEINE = { id: 'G', nom: 'G', criteres: [{ nom: 'C', ponderation: 100 }] };

    it('X3.a Le document complet fait deux feuilles : consignes, puis le reste', () => {
        const modele = win.construireModeleDocument(GRILLE_PLEINE, CARTOUCHE,
            { production: PRODUCTION, inclureObjectif: true });
        expect(win.feuillesDuDocument(modele)).toEqual(['consignes', 'evaluation']);
    });

    it('X3.b Au cran Consignes, une seule feuille', () => {
        const modele = win.construireModeleDocument(GRILLE_PLEINE, CARTOUCHE,
            { cran: 'consignes', production: PRODUCTION, inclureObjectif: true });
        expect(win.feuillesDuDocument(modele)).toEqual(['consignes']);
    });

    it('X3.c Un document sans consignes n\'ouvre pas sur une page vide', () => {
        const modele = win.construireModeleDocument(GRILLE_PLEINE, null, { production: null });
        expect(win.feuillesDuDocument(modele)).toEqual(['evaluation']);
    });

    it('X3.d La liste des feuilles n\'est jamais vide', () => {
        const modele = win.construireModeleDocument({ criteres: [] }, null, { production: null });
        expect(win.feuillesDuDocument(modele).length).toBeGreaterThan(0);
    });
});

describe('#497 · X4 — le rendu obéit au cran et à la feuille', () => {
    const win = charger();
    const GRILLE_PLEINE = {
        id: 'G', nom: 'G',
        criteres: [{ nom: 'CRITERE-TEMOIN', description: '', ponderation: 100 }]
    };
    const ECHELLE = { id: 'E', nom: 'E', config: {},
        niveaux: [{ code: 'E', nom: 'NIVEAU-TEMOIN', description: '', min: 90, max: 100 }] };
    const BASE = { production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
                   inclureDescription: true, inclureDetailTache: true, infosCours: INFOS };

    it('X4.a Au cran Consignes, aucun critère ne paraît', () => {
        const html = win.genererApercuCombine(GRILLE_PLEINE, ECHELLE, CARTOUCHE,
            Object.assign({}, BASE, { cran: 'consignes' }));
        expect(html).toContain('OBJECTIF');
        expect(html).not.toContain('CRITERE-TEMOIN');
    });

    it('X4.b La feuille « consignes » ne porte pas l\'évaluation, et l\'inverse', () => {
        const p1 = win.genererApercuCombine(GRILLE_PLEINE, ECHELLE, CARTOUCHE,
            Object.assign({}, BASE, { partie: 'consignes' }));
        const p2 = win.genererApercuCombine(GRILLE_PLEINE, ECHELLE, CARTOUCHE,
            Object.assign({}, BASE, { partie: 'evaluation' }));
        expect(p1).toContain('OBJECTIF');
        expect(p1).not.toContain('CRITERE-TEMOIN');
        expect(p2).toContain('CRITERE-TEMOIN');
        expect(p2).not.toContain('OBJECTIF');
    });

    it('X4.c Sans `partie`, le rendu reste entier — l\'ancien comportement', () => {
        const tout = win.genererApercuCombine(GRILLE_PLEINE, ECHELLE, CARTOUCHE, BASE);
        expect(tout).toContain('OBJECTIF');
        expect(tout).toContain('CRITERE-TEMOIN');
    });
});

describe('#497 · X5 — un cran refusé dit POURQUOI', () => {
    const win = charger();

    it('X5.a La raison nomme ce qui manque, pas « indisponible »', () => {
        const raison = win.raisonCranIndisponible('evaluation', null, null, {});
        expect(raison).toContain('grille');
        expect(raison.length).toBeGreaterThan(20);
    });

    it('X5.b Rétroaction distingue « pas de grille » de « pas de cartouche »', () => {
        const sansGrille = win.raisonCranIndisponible('retroaction', null, null, {});
        const sansCartouche = win.raisonCranIndisponible('retroaction',
            { criteres: [{ nom: 'C' }] }, null, {});
        expect(sansGrille).not.toBe(sansCartouche);
        expect(sansCartouche).toContain('cartouche');
    });

    it('X5.c Chaque cran a sa raison', () => {
        for (const cran of ['consignes', 'evaluation', 'retroaction']) {
            expect(win.raisonCranIndisponible(cran, null, null, {}).length).toBeGreaterThan(20);
        }
    });
});

/* ------------------------------------------ Y — la disposition (étape 4) */

describe('#497 · Y1 — la mise en page est un choix', () => {
    const win = charger();
    const BLOCS = [
        { titre: 'Objectif :', texte: 'x'.repeat(150) },
        { titre: 'Description de la tâche :', texte: 'y'.repeat(200) },
        { titre: 'Détail de la tâche :', texte: 'z'.repeat(900) }
    ];

    it('Y1.a Le continu est le défaut : rien ne change sans demande', () => {
        expect(win.dispositionDocument({})).toBe('continu');
        expect(win.dispositionDocument({ disposition: 'fantaisie' })).toBe('continu');
        expect(win.dispositionDocument({ disposition: 'deux-colonnes' })).toBe('deux-colonnes');
    });

    it('Y1.b La répartition équilibre sans réordonner', () => {
        const { gauche, droite } = win.repartirEnDeuxColonnes(BLOCS);
        expect(gauche.length + droite.length).toBe(3);
        // L'ordre de lecture est intact dans chaque colonne.
        const remis = gauche.concat(droite).map(b => b.titre);
        expect(remis).toEqual(BLOCS.map(b => b.titre));
        // Le bloc long ne rejoint pas les deux courts.
        expect(droite.map(b => b.titre)).toContain('Détail de la tâche :');
    });

    it('Y1.c La colonne de droite ne reste pas vide', () => {
        const deux = win.repartirEnDeuxColonnes(BLOCS.slice(0, 2));
        expect(deux.gauche.length).toBeGreaterThan(0);
        expect(deux.droite.length).toBeGreaterThan(0);
    });

    it('Y1.d Un bloc unique reste à gauche, sans colonne fantôme', () => {
        const un = win.repartirEnDeuxColonnes([BLOCS[0]]);
        expect(un.gauche).toHaveLength(1);
        expect(un.droite).toHaveLength(0);
    });

    it('Y1.e Le poids compte le bandeau, pas seulement le texte', () => {
        // Quatre blocs vides : sans forfait, leur poids serait nul et tout
        // partirait dans la même colonne.
        const vides = [1, 2, 3, 4].map(i => ({ titre: `T${i}`, texte: '' }));
        const r = win.repartirEnDeuxColonnes(vides);
        expect(r.gauche.length).toBeGreaterThan(0);
        expect(r.droite.length).toBeGreaterThan(0);
    });
});

describe('#497 · Y2 — le format du Manuel, bandeaux compris', () => {
    const win = charger();
    const modele = (disposition) => ({
        disposition: disposition,
        blocsInfo: [
            { titre: 'Objectif d\'apprentissage :', texte: 'PREMIER' },
            { titre: 'Détail de la tâche :', texte: 'SECOND' }
        ]
    });
    const STYLES = { styleTexteNormal: 'font-size: 8.5pt;', couleurTexte: '#333',
                     couleurTitre: '#032e5c', facteurTaille: 1 };

    it('Y2.a Deux colonnes portent un bandeau par bloc', () => {
        const html = win.blocsInfoHTML(modele('deux-colonnes'), STYLES);
        expect(html).toContain('text-transform: uppercase');
        expect((html.match(/text-transform: uppercase/g) || []).length).toBe(2);
        expect(html).toContain('display: flex');
    });

    it('Y2.b Le bandeau perd le deux-points du libellé', () => {
        const html = win.blocsInfoHTML(modele('deux-colonnes'), STYLES);
        expect(html).toContain('>Objectif d\'apprentissage<');
        expect(html).not.toContain('>Objectif d\'apprentissage :<');
    });

    it('Y2.c Le continu empile, il ne met plus en colonnes', () => {
        // C'était le défaut : `flex: 1` sur chaque bloc, quoi qu'il arrive.
        const html = win.blocsInfoHTML(modele('continu'), STYLES);
        expect(html).not.toContain('display: flex');
        expect(html).not.toContain('flex: 1');
        expect(html).toContain('PREMIER');
        expect(html).toContain('SECOND');
    });

    it('Y2.d Les retours à la ligne des consignes sont préservés', () => {
        // « 1. Lis et annote » / « 2. Identifie » vivaient sur des lignes
        // séparées, et le rendu les écrasait en un seul paragraphe.
        for (const d of ['continu', 'deux-colonnes']) {
            expect(win.blocsInfoHTML(modele(d), STYLES)).toContain('white-space: pre-line');
        }
    });
});

describe('#497 · Y3 — la disposition voyage jusqu\'au fichier', () => {
    function corpsDe(nom) {
        const debut = SOURCE.indexOf(`function ${nom}(`);
        const suite = SOURCE.indexOf('\nfunction ', debut + 10);
        const suiteAsync = SOURCE.indexOf('\nasync function ', debut + 10);
        const fins = [suite, suiteAsync].filter(i => i > -1);
        return SOURCE.slice(debut, fins.length ? Math.min(...fins) : SOURCE.length);
    }

    it('Y3.a L\'aperçu et l\'export lisent le même réglage', () => {
        expect(corpsDe('rafraichirApercuPDF')).toContain('apercuPDF-disposition');
        expect(corpsDe('exporterPDFDepuisApercu')).toContain('apercuPDF-disposition');
    });

    it('Y3.b Les deux rendeurs partagent LA répartition', () => {
        expect(corpsDe('blocsInfoHTML')).toContain('repartirEnDeuxColonnes(');
        expect(corpsDe('poserBlocsInfoPDF')).toContain('repartirEnDeuxColonnes(');
    });

    it('Y3.c La page d\'évaluation reste pleine largeur', () => {
        // La disposition règle les CONSIGNES. Un tableau de six colonnes de
        // descripteurs dans une demi-page ne se lit pas.
        expect(corpsDe('poserBlocsInfoPDF')).toContain('modele.blocsInfo');
        expect(corpsDe('genererPDFCombine')).not.toContain('DISPO_DEUX_COLONNES');
    });
});

/* ------------------------------------- Z — la date de remise (#498, étape C) */

describe('#498 · Z1 — la date de remise est toujours dans les consignes', () => {
    const win = charger();

    it('Z1.a Une seule date : en toutes lettres', () => {
        const bloc = win.blocEcheance({ dateEcheance: '2026-09-15' });
        expect(bloc.titre).toBe('Date de remise :');
        expect(bloc.texte).toBe('mardi 15 septembre 2026');
    });

    it('Z1.b LE CAS QUI PORTE LE SENS : deux groupes, deux dates, toutes deux nommées', () => {
        // En choisir une donnerait à la moitié des étudiant·es une date qui
        // n'est pas la leur — sur le document même qui la leur annonce.
        const bloc = win.blocEcheance({
            echeancesParGroupe: {
                GC_A: { assignee: true, date: '2026-02-16' },
                GC_B: { assignee: true, date: '2026-02-17' }
            }
        });
        expect(bloc.texte).toContain('gr. 00002 : lundi 16 février 2026');
        expect(bloc.texte).toContain('gr. 00008 : mardi 17 février 2026');
    });

    it('Z1.c Sans date, le bloc reste et l\'avoue', () => {
        // Le taire laisserait l'étudiant chercher ailleurs une information
        // qu'il attend à cet endroit.
        const bloc = win.blocEcheance({ dateEcheance: null });
        expect(bloc).not.toBeNull();
        expect(bloc.texte).toBe('À préciser');
    });

    it('Z1.d Une date NON assignée s\'affiche quand même', () => {
        // Ce document EST l'acte de transmission : au moment de l'imprimer, la
        // case « consignes transmises » n'est pas encore cochée. La taire
        // obligerait à déclarer transmis ce qui ne l'est pas encore.
        const bloc = win.blocEcheance({
            echeancesParGroupe: { GC_A: { assignee: false, date: '2026-09-15' } }
        });
        expect(bloc.texte).toContain('15 septembre 2026');
    });

    it('Z1.e Un groupe sans date ne fabrique pas une ligne vide', () => {
        const bloc = win.blocEcheance({
            echeancesParGroupe: {
                GC_A: { assignee: true, date: '2026-02-16' },
                GC_B: { assignee: false, date: null }
            }
        });
        expect(bloc.texte).toBe('lundi 16 février 2026');   // une seule date ⇒ pas de nom de groupe
    });

    it('Z1.f Le modèle par groupe prime sur le legacy', () => {
        // Deux lectures différentes finiraient par annoncer deux dates
        // différentes pour la même remise.
        const bloc = win.blocEcheance({
            dateEcheance: '2026-01-01',
            echeancesParGroupe: { GC_A: { assignee: true, date: '2026-09-15' } }
        });
        expect(bloc.texte).toContain('15 septembre 2026');
        expect(bloc.texte).not.toContain('janvier');
    });

    it('Z1.g Sans production, pas de bloc', () => {
        expect(win.blocEcheance(null)).toBeNull();
    });
});

describe('#498 · Z2 — sa place dans le document', () => {
    const win = charger();
    const OPTIONS_COMPLETES = {
        production: Object.assign({}, PRODUCTION, { dateEcheance: '2026-09-15' }),
        inclureObjectif: true, inclureDescription: true, inclureDetailTache: true
    };

    it('Z2.a Après les consignes, avant le contexte de rétroaction', () => {
        // L'étudiant lit ce qu'on lui demande, puis quand le rendre. Le
        // contexte, lui, parle de l'évaluation et non de la tâche.
        const blocs = win.blocsInformationDocument(CARTOUCHE, OPTIONS_COMPLETES);
        const titres = blocs.map(b => b.titre);
        expect(titres.indexOf('Date de remise :')).toBeGreaterThan(titres.indexOf('Détail de la tâche :'));
        expect(titres.indexOf('Date de remise :')).toBeLessThan(titres.indexOf('Contexte de la rétroaction :'));
    });

    it('Z2.b Elle voyage dans les deux dispositions', () => {
        const modele = win.construireModeleDocument(
            { id: 'G', nom: 'G', criteres: [] }, null, OPTIONS_COMPLETES);
        const STYLES = { styleTexteNormal: '', couleurTexte: '#333',
                         couleurTitre: '#032e5c', facteurTaille: 1 };
        for (const disposition of ['continu', 'deux-colonnes']) {
            const html = win.blocsInfoHTML(Object.assign({}, modele, { disposition }), STYLES);
            expect(html, disposition).toContain('15 septembre 2026');
        }
    });
});

/* ------------------------- AC — les champs deviennent des blocs (#499, étape B) */

describe('#499 · AC — les champs rejoignent les consignes', () => {
    const win = charger();
    const AVEC_CHAMPS = (champs) => ({
        production: Object.assign({}, PRODUCTION, {
            dateEcheance: '2026-09-15', champsPersonnalises: champs
        }),
        inclureObjectif: true, inclureDescription: true, inclureDetailTache: true
    });

    it('AC.a Ils suivent le détail et précèdent la date', () => {
        // L'étudiant lit ce qu'on lui demande, puis comment le rendre, puis quand.
        const blocs = win.blocsInformationDocument(null, AVEC_CHAMPS([
            { id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' }
        ]));
        const titres = blocs.map(b => b.titre);
        expect(titres.indexOf('Remise du travail :')).toBeGreaterThan(titres.indexOf('Détail de la tâche :'));
        expect(titres.indexOf('Remise du travail :')).toBeLessThan(titres.indexOf('Date de remise :'));
    });

    it('AC.b Leur ORDRE est celui que Grégoire a posé', () => {
        const blocs = win.blocsInformationDocument(null, AVEC_CHAMPS([
            { id: 'C1', titre: 'Format', contenu: 'A' },
            { id: 'C2', titre: 'Remise', contenu: 'B' },
            { id: 'C3', titre: 'À vérifier', contenu: 'C' }
        ]));
        const perso = blocs.map(b => b.titre).filter(t => ['Format :', 'Remise :', 'À vérifier :'].includes(t));
        expect(perso).toEqual(['Format :', 'Remise :', 'À vérifier :']);
    });

    it('AC.c LE CAS QUI PORTE LE SENS : un champ sans contenu n\'entre pas dans le document', () => {
        // Dans le GABARIT, un champ nommé mais vide est une section en
        // préparation — on le garde. Dans le document REMIS, ce serait un
        // bandeau au-dessus du vide : une promesse sans contenu.
        const blocs = win.blocsInformationDocument(null, AVEC_CHAMPS([
            { id: 'C1', titre: 'À vérifier', contenu: '' },
            { id: 'C2', titre: 'Remise', contenu: 'Sur Léa' }
        ]));
        const titres = blocs.map(b => b.titre);
        expect(titres).not.toContain('À vérifier :');
        expect(titres).toContain('Remise :');
    });

    it('AC.d Un champ sans titre n\'entre pas non plus', () => {
        const blocs = win.blocsInformationDocument(null, AVEC_CHAMPS([
            { id: 'C1', titre: '', contenu: 'du texte orphelin' }
        ]));
        expect(blocs.map(b => b.texte)).not.toContain('du texte orphelin');
    });

    it('AC.e Ils se rendent dans les deux dispositions', () => {
        const modele = win.construireModeleDocument({ id: 'G', nom: 'G', criteres: [] }, null,
            AVEC_CHAMPS([{ id: 'C1', titre: 'Remise du travail', contenu: 'SUR-LEA-UNIQUEMENT' }]));
        const STYLES = { styleTexteNormal: '', couleurTexte: '#333',
                         couleurTitre: '#032e5c', facteurTaille: 1 };
        for (const disposition of ['continu', 'deux-colonnes']) {
            const html = win.blocsInfoHTML(Object.assign({}, modele, { disposition }), STYLES);
            expect(html, disposition).toContain('SUR-LEA-UNIQUEMENT');
            expect(html, disposition).toContain('Remise du travail');
        }
    });

    it('AC.f Une production sans champs se comporte comme avant', () => {
        const sans = win.blocsInformationDocument(null, AVEC_CHAMPS(undefined));
        expect(sans.map(b => b.titre)).toEqual([
            'Objectif d\'apprentissage :', 'Description de la tâche :',
            'Détail de la tâche :', 'Date de remise :'
        ]);
    });
});

/* ------------ AD — les blocs ancrés se renomment et se déplacent (#500) */

describe('#500 · AD — le gabarit commande le titre et l\'ordre', () => {
    const win = charger();
    const BASE = (extra) => Object.assign({
        production: Object.assign({}, PRODUCTION, extra),
        inclureObjectif: true, inclureDescription: true, inclureDetailTache: true
    }, {});

    it('AD.a Sans titres posés, les libellés d\'origine', () => {
        const titres = win.blocsInformationDocument(null, BASE({})).map(b => b.titre);
        expect(titres.slice(0, 3)).toEqual([
            'Objectif d\'apprentissage :', 'Description de la tâche :', 'Détail de la tâche :'
        ]);
    });

    it('AD.b LE CAS QUI PORTE LE SENS : un titre réécrit remplace le libellé', () => {
        // « Description de la tâche » → « TÂCHE », comme dans son Manuel.
        const titres = win.blocsInformationDocument(null, BASE({
            titresBlocs: { tache: 'TÂCHE' }
        })).map(b => b.titre);
        expect(titres).toContain('TÂCHE :');
        expect(titres).not.toContain('Description de la tâche :');
        // Les autres ne bougent pas.
        expect(titres).toContain('Objectif d\'apprentissage :');
    });

    it('AD.c Un titre vide ou blanc retombe sur le défaut', () => {
        for (const pose of ['', '   ', null]) {
            const titres = win.blocsInformationDocument(null, BASE({
                titresBlocs: { tache: pose }
            })).map(b => b.titre);
            expect(titres, String(pose)).toContain('Description de la tâche :');
        }
    });

    it('AD.d L\'ordre du gabarit fait foi', () => {
        const titres = win.blocsInformationDocument(null, BASE({
            ordreBlocs: ['detailTache', 'objectif', 'tache']
        })).map(b => b.titre);
        expect(titres.slice(0, 3)).toEqual([
            'Détail de la tâche :', 'Objectif d\'apprentissage :', 'Description de la tâche :'
        ]);
    });

    it('AD.e Les champs libres se glissent entre les ancrés', () => {
        const titres = win.blocsInformationDocument(null, BASE({
            champsPersonnalises: [{ id: 'C1', titre: 'Remise', contenu: 'Sur Léa' }],
            ordreBlocs: ['objectif', 'C1', 'tache', 'detailTache']
        })).map(b => b.titre);
        expect(titres.slice(0, 4)).toEqual([
            'Objectif d\'apprentissage :', 'Remise :',
            'Description de la tâche :', 'Détail de la tâche :'
        ]);
    });

    it('AD.f Un ordre PÉRIMÉ ne fait pas disparaître un bloc', () => {
        // Un champ supprimé laisse son id dans la liste ; un champ ajouté depuis
        // n'y figure pas. On repart de ce qui EXISTE.
        const titres = win.blocsInformationDocument(null, BASE({
            champsPersonnalises: [{ id: 'C_NEUF', titre: 'Ajouté depuis', contenu: 'X' }],
            ordreBlocs: ['objectif', 'C_DISPARU', 'tache']
        })).map(b => b.titre);
        expect(titres).toContain('Détail de la tâche :');   // absent de l'ordre mémorisé
        expect(titres).toContain('Ajouté depuis :');        // créé après
        expect(titres.filter(t => t === undefined)).toHaveLength(0);
    });

    it('AD.g La date reste après les consignes, quel que soit l\'ordre', () => {
        const titres = win.blocsInformationDocument(CARTOUCHE, BASE({
            dateEcheance: '2026-09-15',
            ordreBlocs: ['detailTache', 'tache', 'objectif']
        })).map(b => b.titre);
        expect(titres.indexOf('Date de remise :')).toBe(titres.length - 2);
        expect(titres[titres.length - 1]).toBe('Contexte de la rétroaction :');
    });
});
