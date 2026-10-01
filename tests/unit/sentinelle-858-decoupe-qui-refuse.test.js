import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche, position } from './_helpers/tranche.js';

// #858 — UNE DÉCOUPE QUI REFUSE DE RENDRE UNE TRANCHE VIDE (13 septembre 2026).
//
// Règle 10 du PROTOCOLE : une assertion négative sur une tranche vide est vraie
// par construction. L'idiome qui la produisait passait un `indexOf` tel quel à
// `slice` : un marqueur disparu rend −1, et une fin trouvée AVANT le début rend
// une tranche inversée. Dans les deux cas la tranche est vide et le banc reste
// VERT.
//
// MESURÉ LE 13 SEPT., avant tout code, sur HEAD `2bc43ed1` :
//  • 167 découpes de ce genre dans tests/ — lues sur le contenu entier. Le grep
//    ligne à ligne de la consigne en voyait 112 : il manquait les découpes
//    écrites sur deux lignes, dont les DEUX seules qui étaient mortes ;
//  • une sonde posée sur String.prototype.slice pendant toute la suite : deux
//    tranches VIDES aujourd'hui, et elles seules —
//    sentinelle-poignee-redimension-noeud (les deux bornes retirées par #418,
//    l'essai est retiré : son objet a disparu, l'ablation de #418 le tient) et
//    sentinelle-enseignement-explicite (la borne `<!-- #444` apparaît aussi
//    AVANT la palette : tranche inversée) ;
//  • 48 découpes portaient une assertion négative sans garde de longueur, les
//    deux mortes comprises : routées par tranche() (l'essai de la poignée, lui,
//    est retiré), avec leurs répétitions identiques et le bord C de #520 —
//    167 → 113 découpes restantes.
//
// LE CLIQUET EST UN CLIQUET DE COMPTE, pas une interdiction (décision de Cowork,
// renversable par Grégoire) : les découpes restantes portent déjà leur garde, ou
// aucune assertion négative. Les réécrire pour la forme serait l'élargissement
// que la révision du 1er sept. a fermé. Elles sont figées ici, fichier par
// fichier ; le compte ne peut que descendre, et la liste suit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineTests = path.resolve(__dirname, '..');

// Un `slice(` dont le premier argument est directement un appel à `.indexOf(`.
const IDIOME = /\.slice\(\s*[A-Za-z_$][A-Za-z0-9_$.]*\.indexOf\(/g;

function mesurer() {
    const comptes = {};
    let lus = 0;
    (function parcourir(dossier) {
        for (const e of readdirSync(dossier, { withFileTypes: true })) {
            if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
            const p = path.join(dossier, e.name);
            if (e.isDirectory()) { parcourir(p); continue; }
            if (!e.name.endsWith('.js') || e.name.includes('.timestamp-')) continue;
            lus++;
            const n = (readFileSync(p, 'utf8').match(IDIOME) || []).length;
            if (n) comptes[path.relative(racineTests, p).split(path.sep).join('/')] = n;
        }
    })(racineTests);
    return { comptes, lus };
}

describe('#858 · A — tranche() refuse de rendre une tranche vide', () => {
    const SRC = 'avant FIN ; DEBUT corps utile FIN ; après';

    it('rend la tranche du début (inclus) à la fin (exclue)', () => {
        expect(tranche(SRC, 'DEBUT', 'FIN')).toBe('DEBUT corps utile ');
    });

    it('cherche la fin APRÈS le début : une tranche ne peut pas être inversée', () => {
        // `FIN` existe AVANT `DEBUT` : l'ancien idiome rendait ici une tranche vide.
        expect(SRC.indexOf('FIN')).toBeLessThan(SRC.indexOf('DEBUT'));
        expect(tranche(SRC, 'DEBUT', 'FIN').length).toBeGreaterThan(10);
    });

    it('jette en NOMMANT le marqueur de début absent', () => {
        expect(() => tranche(SRC, 'ABSENT', 'FIN')).toThrow(/marqueur introuvable : "ABSENT"/);
    });

    it('jette si la fin n\'existe qu\'avant le début', () => {
        expect(() => tranche('FIN puis DEBUT sans borne', 'DEBUT', 'FIN')).toThrow(/marqueur introuvable : "FIN"/);
    });

    it('une fin numérique est une longueur ; une fin omise va jusqu\'au bout', () => {
        expect(tranche(SRC, 'DEBUT', 5)).toBe('DEBUT');
        expect(tranche(SRC, 'DEBUT')).toBe('DEBUT corps utile FIN ; après');
    });

    it('longueurMin refuse une tranche tronquée', () => {
        expect(() => tranche(SRC, 'DEBUT', 'FIN', { longueurMin: 100 })).toThrow(/tranche trop courte \(18 < 100\)/);
    });

    it('position() rend l\'index, ou jette', () => {
        expect(position(SRC, 'DEBUT')).toBe(12);
        expect(() => position(SRC, 'ABSENT')).toThrow(/marqueur introuvable/);
    });
});

describe('#858 · B — cliquet : les découpes par indexOf ne font que descendre', () => {
    it('aucun fichier neuf ne l\'emploie, aucun compte n\'est en hausse', () => {
        const { comptes, lus } = mesurer();
        // Règle 10, appliquée à ce banc : il a bien lu tests/, et le motif y trouve encore quelque chose.
        expect(lus, 'fichiers .js lus dans tests/').toBeGreaterThan(600);
        expect(Object.keys(comptes).length, 'fichiers porteurs mesurés').toBeGreaterThan(0);
        const nouveaux = Object.keys(comptes).filter(f => !(f in TOLEREES));
        expect(nouveaux, 'découpe neuve par indexOf — passer par tranche() (tests/unit/_helpers/tranche.js)').toEqual([]);
        const enHausse = Object.keys(comptes).filter(f => comptes[f] > TOLEREES[f]).map(f => f + ' ' + TOLEREES[f] + ' → ' + comptes[f]);
        expect(enHausse, 'découpe(s) en plus dans un fichier déjà listé — passer par tranche()').toEqual([]);
    });

    it('la liste suit le code quand il descend (retirer ou abaisser)', () => {
        const { comptes } = mesurer();
        expect(Object.keys(TOLEREES).length).toBeGreaterThan(0);
        const perimees = Object.keys(TOLEREES).filter(f => (comptes[f] || 0) < TOLEREES[f]).map(f => f + ' ' + TOLEREES[f] + ' → ' + (comptes[f] || 0));
        expect(perimees, 'abaisser ces comptes dans TOLEREES (ou retirer l\'entrée à zéro)').toEqual([]);
    });
});

// Liste fermée au 13 septembre 2026, après routage : fichier → découpes restantes.
// 113 découpes dans 62 fichiers. Ne peut que descendre.
const TOLEREES = {
    'unit/audit-onglet-suivi-2026-09-05.test.js': 1,   // lot N2 (#716) : la découpe du filtre du repli est partie avec lui
    'unit/audit-sous-onglets-suivi-2026-09-06.test.js': 2,
    'unit/sentinelle-418-db-ready-sans-idb.test.js': 1,
    'unit/sentinelle-448-fusion-par-identite.test.js': 2,
    'unit/sentinelle-452-reprise-sans-dates.test.js': 1,
    'unit/sentinelle-453-reference-preservee.test.js': 1,
    'unit/sentinelle-454-doublon-identique-ecarte.test.js': 1,
    'unit/sentinelle-468-boutons-qui-mentent.test.js': 1,
    'unit/sentinelle-503-actions-fiche-en-tete.test.js': 2,
    'unit/sentinelle-511-transport-productions.test.js': 1,
    'unit/sentinelle-516-nom-critere-refuse.test.js': 2,
    'unit/sentinelle-524-code-niveau-obligatoire.test.js': 1,
    'unit/sentinelle-532-horaire-presences.test.js': 1,
    'unit/sentinelle-533-verdict-avant-connexion.test.js': 4,
    'unit/sentinelle-540-ponderation-requise.test.js': 1,
    'unit/sentinelle-542-interpreter-niveau-atteint.test.js': 1,
    'unit/sentinelle-555-reperes-maitrise-echelle.test.js': 1,
    'unit/sentinelle-563-jetons-echec-silencieux.test.js': 1,
    'unit/sentinelle-576-bilan-sans-grille-origine.test.js': 1,
    'unit/sentinelle-597-heic-decode-avant-pipeline.test.js': 4,
    'unit/sentinelle-598-apercu-reflete-traitement.test.js': 5,
    'unit/sentinelle-612-da-inconnu.test.js': 1,
    'unit/sentinelle-668-projection-euf-livree-par-le-gabarit.test.js': 2,
    'unit/sentinelle-672-retroaction-mode-simple.test.js': 1,
    'unit/sentinelle-749-lot2-liste-des-etudiants.test.js': 1,
    'unit/sentinelle-749-lot3-presences-verrou-par-groupe-cours.test.js': 1,
    'unit/sentinelle-765-selecteur-production-barre-annotation.test.js': 1,
    'unit/sentinelle-773-palette-poignee-redim.test.js': 1,
    'unit/sentinelle-accompagnement-carte.test.js': 1,
    'unit/sentinelle-aimantation-et-alignement.test.js': 4,
    'unit/sentinelle-ancrage-temporel-lecon.test.js': 1,
    'unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js': 1,
    'unit/sentinelle-audit-aide-lot-B-surfaces-concordent.test.js': 1,
    'unit/sentinelle-audit-aide-lot-C-visite-guidee.test.js': 2,
    'unit/sentinelle-carte-bilan.test.js': 1,
    'unit/sentinelle-carte-rendu-unique-437.test.js': 1,
    'unit/sentinelle-codex-etat-db-ready.test.js': 1,
    'unit/sentinelle-collections-gabarit.test.js': 2,
    'unit/sentinelle-collections-projection.test.js': 1,
    'unit/sentinelle-conteneur-recouvrement.test.js': 5,
    'unit/sentinelle-detachement-clone.test.js': 1,
    'unit/sentinelle-drag-palettes-pointer.test.js': 3,
    'unit/sentinelle-duplication-conteneur.test.js': 2,
    'unit/sentinelle-duree-entete-noeud.test.js': 3,
    'unit/sentinelle-echelle-idme-de-depart.test.js': 1,
    'unit/sentinelle-etiquettes-nature-un-point-unique.test.js': 1,
    'unit/sentinelle-frictions-355-305.test.js': 1,
    'unit/sentinelle-grille-planificateur.test.js': 5,
    'unit/sentinelle-liens-routage.test.js': 4,
    'unit/sentinelle-lot-C-memes-gestes.test.js': 1,   // 13 sept. : 2 → 1, le cas C.a est parti avec la table (#658)
    'unit/sentinelle-lot4-B-solo-aucun.test.js': 2,
    'unit/sentinelle-noop-groupe-cours-332.test.js': 1,
    'unit/sentinelle-objectif-lecon-metadata.test.js': 1,
    'unit/sentinelle-phase-D-variante-calcul-434.test.js': 1,
    'unit/sentinelle-recherche-carte.test.js': 3,
    'unit/sentinelle-section-cours-suit-la-nature-842.test.js': 4,
    'unit/sentinelle-skill-alignement.test.js': 3,
    'unit/sentinelle-source-unique-codes.test.js': 1,
    'unit/sentinelle-texte-troue-etape-2-gabarit.test.js': 1,
    'unit/sentinelle-tout-voir-et-loupe.test.js': 5,
    'unit/sentinelle-ui-rapport-et-seances.test.js': 2,
};
