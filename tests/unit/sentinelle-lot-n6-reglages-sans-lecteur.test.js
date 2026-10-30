/**
 * SENTINELLE — lot N6 (23 sept. 2026) : les réglages que rien ne lit, et un réglage lu sous deux noms.
 * (#900 ; #935 volet nom ; #899 la flèche ; dénotation à zéro cible.)
 *
 * Ce fichier porte le VERROU STRUCTUREL : aucun écrivain frais des champs retirés ne reste dans le dossier js/,
 * le seuil d'acceptabilité ne s'écrit plus que sous `seuilAcceptable`, les chemins des pratiques de notation
 * disent « → », la règle « au moins une cible » vit dans UN composant lu par les deux écrans.
 * Les comportements (création, stock, note avant/après sur les quatre familles, formulaire, assistant) sont
 * éprouvés sur les modules RÉELS dans `audit-pratiques-notation-config-2026-09-16.test.js` (bloc « lot N6 »)
 * et, pour la gestion des cibles, dans `sentinelle-717-cibles-gardent-leur-identite.test.js` (bloc « lot N6 »).
 *
 * Ce qui RESTE écrit, et pourquoi (mesuré le 23 sept.) :
 *   - `modeDEN` : lu par `denotation-jugements.js` (`conf.modeDEN !== MODE_PREMIER_LOT`) ;
 *   - `modeleBundle` : lu depuis le lot N4 ;
 *   - les passages de CONSERVATION (`conserverReglesRetirees`, `conserverReglagesSansLecteur`, les deux gardes
 *     du formulaire) : une pratique qui porte déjà ces champs les garde (limite de Grégoire du 20 sept.) ;
 *     ils copient l'ancienne valeur, ils n'en créent jamais.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** Le code seul : un champ cité dans la note qui explique son retrait n'est pas un écrivain. */
function sansCommentaires(code) {
    return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}
function fichiersJs(dossier) {
    const out = [];
    for (const nom of readdirSync(path.join(RACINE, dossier))) {
        const rel = dossier + '/' + nom;
        if (statSync(path.join(RACINE, rel)).isDirectory()) { if (nom !== 'lib') out.push(...fichiersJs(rel)); }
        else if (nom.endsWith('.js')) out.push(rel);
    }
    return out;
}
const JS = fichiersJs('js');
const CODE = Object.fromEntries(JS.map(f => [f, sansCommentaires(lire(f))]));
/** Chaque occurrence `fichier: ligne` d'un motif dans le code (sans commentaires) de js/. */
function occurrences(motif) {
    const res = [];
    for (const f of JS) {
        CODE[f].split('\n').forEach((ligne) => { if (motif.test(ligne)) res.push(f + ': ' + ligne.trim()); });
    }
    return res;
}

describe('lot N6 · le verrou tient sur tout le dossier js/', () => {
    it('le balayage lit bien le code (pas une tranche vide)', () => {
        expect(JS.length).toBeGreaterThan(150);
        expect(CODE['js/wizard-pratique-v2.js'].length).toBeGreaterThan(50000);
        expect(CODE['js/pratiques-gestion.js'].length).toBeGreaterThan(50000);
    });
});

describe('lot N6 · #900 — aucun écrivain frais des champs sans lecteur', () => {
    // Un littéral d'objet qui POSE la clé : c'est la forme de tous les écrivains retirés. (Le « (?<![.\w]) » écarte
    // la branche d'un ternaire, `x.cle : y`, qui est une LECTURE.)
    const CLES_LITTERALES = ['varianteCalcul', 'afficherRang', 'afficherMoyenneGroupe', 'decouplerPN', 'delaiActif', 'repriseActif',
        'vaBien', 'grandeDifficulte'];
    const litteral = (cle) => new RegExp('(?<![.\\w])' + cle + '\\s*:');
    for (const cleMorte of CLES_LITTERALES) {
        it(`« ${cleMorte}: » ne s'écrit dans aucun littéral`, () => {
            expect(occurrences(litteral(cleMorte))).toEqual([]);
        });
    }

    it('le drapeau `hybride` n\'est plus créé par l\'assistant (seule la conservation l\'aligne)', () => {
        expect(occurrences(/\bhybride\s*:\s*estHybride/)).toEqual([]);
        expect(occurrences(/\.hybride\s*=(?!=)/)).toEqual([
            'js/wizard-pratique-v2.js: if (avant.portfolio.hybride !== undefined) portfolio.hybride = !!(pratique.configuration.categories && pratique.configuration.categories.actif);'
        ]);
    });

    it('le portfolio d\'une sommative (`nbArtefacts`) n\'est plus écrit', () => {
        expect(occurrences(/nbArtefacts\s*:\s*parseInt\(r\.nbArtefactsPortfolio/)).toEqual([]);
        expect(occurrences(/nbArtefactsPortfolio|portfolioQualitatif/)).toEqual([]);
    });

    it('les affectations restantes ne font que CONSERVER une valeur déjà écrite', () => {
        expect(occurrences(/\.varianteCalcul\s*=(?!=)/)).toEqual([
            'js/wizard-pratique-v2.js: if (avant.varianteCalcul !== undefined) pratique.configuration.varianteCalcul = clone(avant.varianteCalcul);'
        ]);
        // Lot 5 des standards sans portfolio : `decouplerPN`, `utiliser` et `nombreTotal` passent par une même boucle, aux deux endroits.
        expect(occurrences(/\.decouplerPN\s*=(?!=)/)).toEqual([]);
        expect(occurrences(/\['decouplerPN', 'utiliser', 'nombreTotal'\]/)).toHaveLength(2);
        expect(occurrences(/portfolio\[champ\]\s*=(?!=)/)).toEqual([
            'js/wizard-pratique-v2.js: if (avant.portfolio[champ] !== undefined) portfolio[champ] = clone(avant.portfolio[champ]);',
            'js/pratiques-gestion.js: if (avant[champ] !== undefined) portfolio[champ] = avant[champ];'
        ].sort((a, b) => JS.indexOf(a.split(':')[0]) - JS.indexOf(b.split(':')[0])));
        expect(occurrences(/configuration\.reglesSommatives\s*=(?!=)/)).toEqual([
            'js/wizard-pratique-v2.js: if (reglesSommatives !== undefined) pratique.configuration.reglesSommatives = reglesSommatives;'
        ]);
        expect(occurrences(/\.(afficherRang|afficherMoyenneGroupe)\s*=(?!=)/)).toEqual([]);
    });

    it('la projection `varianteCalculDepuisMode` et la migration `decouplerPR` sont parties', () => {
        expect(occurrences(/varianteCalculDepuisMode/)).toEqual([]);
        expect(occurrences(/decouplerPR\b/)).toEqual([]);
    });

    it('l\'étape « Configuration sommative » (rang, moyenne du groupe) n\'existe plus, et rien n\'y mène', () => {
        expect(occurrences(/'config-sommative'/)).toEqual([]);
    });

    it('les cases « actif » du délai et de la reprise ont quitté la page ; celle de la reprise ciblée reste', () => {
        const html = lire('index.html');
        expect(html).not.toContain('id="mat-jeton-delai-actif"');
        expect(html).not.toContain('id="mat-jeton-reprise-actif"');
        expect(html).toContain('<strong>Jetons de délai</strong>');
        expect(html).toContain('<strong>Jetons de reprise</strong>');
        expect(html).toContain('id="mat-jeton-ciblee-actif"');
        expect(occurrences(/mat-jeton-(delai|reprise)-actif/)).toEqual([]);
    });

    it('TÉMOIN · `modeDEN` et `modeleBundle` ont un lecteur : ils restent écrits', () => {
        expect(CODE['js/pratiques/denotation-jugements.js']).toMatch(/conf\.modeDEN !== MODE_PREMIER_LOT/);
        expect(occurrences(/\bmodeDEN\s*:\s*'eliminee'/).length).toBeGreaterThanOrEqual(2);
    });
});

describe('lot N6 · #935 — un réglage, un nom', () => {
    it('l\'assistant écrit `seuilAcceptable` ; aucun écrivain de `seuilAcceptabilite` dans js/', () => {
        expect(CODE['js/wizard-pratique-v2.js']).toContain('seuilAcceptable: Number.isFinite(parseInt(r.seuilAcceptabilite)) ? parseInt(r.seuilAcceptabilite) : 100,');   // ↻ #935 (15 oct.) : un 0 reste 0
        // Deux exceptions nommées, qui ne sont pas des écrivains de la pratique : la réponse de l'assistant garde son
        // id d'étape, et la pratique configurable TRANSMET au moteur la valeur que la pratique porte (lecture).
        expect(occurrences(/(?<![.\w])seuilAcceptabilite\s*:|\.seuilAcceptabilite\s*=(?!=)/)).toEqual([
            'js/wizard-pratique-v2.js: if (seuil !== undefined) wizardState.reponses.seuilAcceptabilite = seuil;',
            'js/pratiques/pratique-configurable.js: seuilAcceptabilite: cfg.seuilAcceptabilite,'
        ].sort((a, b) => JS.indexOf(a.split(':')[0]) - JS.indexOf(b.split(':')[0])));
    });
    it('les trois lecteurs lisent dans l\'ordre du moteur : `seuilAcceptable`, puis l\'ancien nom', () => {
        expect(CODE['js/pratiques/pratique-pan-specifications.js']).toMatch(/typeof cfg\.seuilAcceptable === 'number'\) \? cfg\.seuilAcceptable\s*: \(typeof cfg\.seuilAcceptabilite/);
        expect(CODE['js/pratiques-gestion.js']).toMatch(/typeof config\.seuilAcceptable === 'number'\) \? config\.seuilAcceptable\s*: \(typeof config\.seuilAcceptabilite === 'number' \? config\.seuilAcceptabilite : null\)/);
        expect(CODE['js/wizard-pratique-v2.js']).toContain("(typeof config.seuilAcceptable === 'number') ? config.seuilAcceptable : config.seuilAcceptabilite");
        expect(CODE['js/pratiques/construction-attributs.js']).toMatch(/_lire\(config, 'seuilAcceptable'\);\s*if \(typeof seuil !== 'number'\) seuil = _lire\(config, 'seuilAcceptabilite'\)/);
    });
});

describe('lot N6 · #899 — la flèche des pratiques de notation', () => {
    const CHEMINS = {
        'js/wizard-pratique-v2.js': ['Conception → Pratiques de notation (clique sur la pratique)'],
        'js/pratiques/construction-attributs.js': ['Par production (réglée dans Conception → Productions)', 'Réglage global (note différée), dans Réglages → Préférences'],
        'js/pratiques-gestion.js': ['<strong>Labo → Exploration des pratiques</strong>'],   // ↻ #1152, retouche du lot 5 (29 oct. 2026) : plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md.
        'js/comparateur-pratiques.js': ['<strong>Conception → Échelles</strong>'],
        'js/etudiants.js': ['<strong>Conception → Pratiques de notation</strong>']
    };
    for (const [f, phrases] of Object.entries(CHEMINS)) {
        it(`${f} : « → », et plus aucun « › » dans son code`, () => {
            for (const p of phrases) expect(CODE[f], p).toContain(p);
            // Le texte 5 du lot 5 des standards (validé par Grégoire le 29 oct., 21 h 39) est posé mot pour mot, avec son « › ».
            expect(CODE[f].replace('dans Conception › Pratiques de notation.', '').includes('›'), f).toBe(false);
        });
    }
});

describe('lot N6 · dénotation — la règle « au moins une cible » est écrite UNE fois', () => {
    it('le composant la porte ; l\'assistant et la gestion la lisent, sans recopie', () => {
        expect(CODE['js/pratiques/editeur-cibles.js']).toMatch(/function motifRefusCibles\(cibles\)/);
        expect(CODE['js/pratiques/editeur-cibles.js']).toContain('motifRefus: motifRefusCibles');
        expect(CODE['js/wizard-pratique-v2.js']).toContain('window.EditeurCibles.motifRefus(window.EditeurCibles.lire(element)) === null');
        expect(CODE['js/pratiques-gestion.js']).toContain('const motif = window.EditeurCibles.motifRefus(cibles);');
        // Plus de comptage à la main de la liste dans l'un ou l'autre écran.
        expect(CODE['js/wizard-pratique-v2.js']).not.toMatch(/EditeurCibles\.lire\([^)]*\)\.length\s*>\s*0/);
        expect(CODE['js/pratiques-gestion.js']).not.toMatch(/EditeurCibles\.lire\([^)]*\)\.length/);
    });
});
