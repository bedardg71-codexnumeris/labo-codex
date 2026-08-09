import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — #436 / Phase G2-b : fin du miroir `configPAN`
// =======================================================================
//
// `modalitesEvaluation.configPAN` était un INSTANTANÉ de la configuration de
// pratique. La SSOT est `pratiquesConfigurables[id].configuration`. L'instantané
// n'est réécrit qu'à l'APPLICATION d'une pratique : il dérive dès que
// l'enseignant édite cette pratique ensuite.
//
// G2-a (24 mai 2026) a coupé le CALCUL DE LA NOTE du miroir. G2-b coupe tout le
// reste : sept lectures d'affichage, les deux écrivains, et l'îlot mort qui en
// dépendait.
//
// ⚠ CE QUE CE FICHIER PROTÈGE VRAIMENT — la dérive est INVISIBLE. Rien ne
// plante quand un écran lit le miroir : il affiche un nombre plausible, mais
// périmé, à côté d'un autre écran qui lit la SSOT. C'est le motif de #328, et
// c'est pour ça qu'un cliquet statique vaut mieux qu'un test de comportement
// ici : ce qu'on veut interdire, c'est la RÉAPPARITION d'une lecture.
//
// ⚠ DEUX LECTURES SONT LÉGITIMES ET DOIVENT SURVIVRE :
//   • `modalites-evaluation.js` — le module PROPRIÉTAIRE, qui purge le
//     sous-champ jetons mort (#328 L2-c) ;
//   • `pratique-pan-standards.js` — le chemin d'INJECTION de simulation (#307,
//     comparateur) : `this.config.modalites.configPAN` est une config injectée
//     en mémoire, pas un instantané relu du stockage.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

/** Lignes de CODE (hors commentaires) qui mentionnent configPAN. */
function lignesCodeConfigPAN(src) {
    return src.split('\n')
        .map((l, i) => ({ n: i + 1, t: l }))
        .filter(({ t }) => t.includes('configPAN'))
        .filter(({ t }) => !/^\s*(\/\/|\*|\/\*)/.test(t));
}

const MODULES_AFFICHAGE = [
    ['js', 'profil-etudiant-calculs.js'],
    ['js', 'profil-etudiant-sections-affichage.js'],
    ['js', 'tableau-bord-apercu.js'],
    ['js', 'etudiants.js'],
    ['js', 'liste-evaluations.js'],
    ['js', 'pratiques.js'],
    ['js', 'objectifs.js'],
];

describe('G2-b · plus aucun écran ne lit le miroir', () => {
    for (const mod of MODULES_AFFICHAGE) {
        it(`${mod[1]} : zéro lecture de configPAN`, () => {
            const restes = lignesCodeConfigPAN(lire(...mod));
            expect(restes.map(r => `${mod[1]}:${r.n}`), 'lectures résiduelles').toEqual([]);
        });
    }
});

describe('G2-b · les deux écrivains du miroir sont retirés', () => {
    const pratiques = lire('js', 'pratiques.js');

    it('la migration V1 qui alimentait configPAN.portfolio n’existe plus', () => {
        expect(pratiques).not.toMatch(/function migrerConfigurationPortfolio/);
        // Le drapeau : on vise l'ÉCRITURE, pas le jeton — sinon le commentaire
        // qui documente le retrait ferait rougir le test qui l'accompagne.
        expect(pratiques).not.toMatch(/_migrationV1Complete\s*=/);
    });

    it('et elle n’est plus appelée au démarrage du module', () => {
        expect(pratiques).not.toMatch(/^\s*migrerConfigurationPortfolio\(\);/m);
    });

    it('appliquer une pratique ne miroite plus son portfolio', () => {
        expect(pratiques).not.toMatch(/modalites\.configPAN\.portfolio = config\.portfolio/);
    });
});

describe('G2-b · l’îlot multi-objectifs, dernier consommateur, est retiré', () => {
    const objectifs = lire('js', 'objectifs.js');

    it('les trois fonctions et leurs exports sont partis', () => {
        // Elles étaient exposées sur window sans aucun appelant — ni data-action,
        // ni appel JS. Elles lisaient `configPAN.ensembleObjectifsId`.
        for (const morte of ['function activerPratiqueMultiObjectifs',
                             'function desactiverPratiqueMultiObjectifs',
                             'function verifierPratiqueMultiObjectifs',
                             'window.activerPratiqueMultiObjectifs']) {
            expect(objectifs, morte).not.toContain(morte);
        }
    });

    it('et rien dans l’app ne les appelait — le cliquet le rappelle', () => {
        for (const mod of [['index.html'], ['js', 'portfolio.js'], ['js', 'pratiques.js']]) {
            expect(lire(...mod)).not.toMatch(/\bactiverPratiqueMultiObjectifs\s*\(/);
        }
    });
});

describe('G2-b · ce qui doit SURVIVRE (le piège du prochain nettoyage)', () => {
    it('le module propriétaire garde sa purge du sous-champ jetons mort', () => {
        const owner = lire('js', 'pratiques', 'modalites-evaluation.js');
        expect(owner).toMatch(/delete m\.configPAN\[SOUS_CHAMP_JETONS_MORT\]/);
    });

    it('le chemin d’injection de simulation (#307) reste lisible par le moteur', () => {
        // Ce n'est PAS un instantané relu du stockage : c'est la config qu'une
        // instance simulée porte en mémoire pour le banc de décision.
        const std = lire('js', 'pratiques', 'pratique-pan-standards.js');
        expect(std).toMatch(/this\.config\.modalites\.configPAN/);
    });
});

describe('G2-b · les valeurs affichées n’ont PAS bougé', () => {
    // Deux lectures visaient des champs du miroir qu'aucun code n'écrivait :
    // elles rendaient toujours leur repli. Elles alimentent des nombres à
    // l'écran (indice C, barre de jetons) — les brancher sur la SSOT aurait
    // changé ce que l'utilisateur voit. Gelées explicitement, question ouverte.
    it('le dénominateur de la complétion alternative reste sa valeur historique', () => {
        const src = lire('js', 'liste-evaluations.js');
        expect(src).toMatch(/const NB_ARTEFACTS_COMPLETION_ALTERNATIVE = 3;/);
        expect(src).toMatch(/nombreArtefacts = NB_ARTEFACTS_COMPLETION_ALTERNATIVE/);
    });

    it('le quota affiché des jetons reste sa valeur historique', () => {
        const src = lire('js', 'profil-etudiant-sections-affichage.js');
        expect(src).toMatch(/const QUOTA_JETONS_AFFICHE_DEFAUT = 2;/);
        expect(src).toMatch(/quotaGlobal = QUOTA_JETONS_AFFICHE_DEFAUT/);
    });

    it('la fenêtre « artefacts récents » reste à 6', () => {
        const src = lire('js', 'profil-etudiant-calculs.js');
        expect(src).toMatch(/const NB_ARTEFACTS_RECENTS_DEFAUT = 6;/);
    });
});

describe('G2-b · les lectures migrées visent bien la SSOT', () => {
    it('le N du profil vient de la pratique active, plus du miroir', () => {
        const src = lire('js', 'profil-etudiant-calculs.js');
        expect(src).toMatch(/cfgActive\?\.portfolio\?\.nombreARetenir \|\| 4/);
    });

    it('le minimum de complétion des écrans de suivi vient de la pratique active', () => {
        expect(lire('js', 'etudiants.js')).toMatch(/configPratiqueActiveTab\?\.portfolio \|\| \{\}/);
        expect(lire('js', 'profil-etudiant-sections-affichage.js'))
            .toMatch(/configPratiqueActive\?\.portfolio \|\| \{\}/);
    });
});
