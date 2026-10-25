// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 2 · VOLET 3 : L'APERÇU AU NIVEAU DU GABARIT
// (4 septembre 2026, arrêtés 4 et 5 du cadrage du 2 sept.).
//
// ↻ §5 (4 sept., 18 h 38 — coup d'œil de Grégoire, « ça va, bonne recommandation ») :
// L'APERÇU VIENT SOUS CHAQUE PALIER, dans la carte « Projection » ; la carte « Ce que
// l'élève lira » n'existe plus. Les cas B et D changent de SITE, pas de fond : mêmes
// phrases, même ordre décompte → projection, même copie fictive par palier.
//
//   A. les copies FICTIVES viennent des paliers (`copiesExemple`, registre réel en
//      Node) : une par palier, chacune ATTEINT son palier, plus une non corrigée ;
//      « Aucune projection » n'a plus que la non corrigée (22 oct. 2026 : la copie « 3 erreurs,
//      300 mots » est retirée, le miroir la remplace) ; aucune donnée de personne ;
//   B. la LIGNE « L'élève lira : » sous chaque palier, dans la carte « Projection » :
//      une par palier, APRÈS les deux zones et APRÈS la ligne orange d'un jeton inconnu ;
//      la phrase = décompte du bloc 3 PUIS projection du bloc 2, dans l'ordre
//      d'evaluation-calcul.js ; en bas de la carte, une fois, la copie non corrigée et
//      la note ; plus aucune carte « apercu » ; « Aucune projection » : rien ;
//   C. une phrase COMPOSÉE (badges) se voit remplie pour la copie de son palier ;
//   D. rendu PUR : aucun contrôle dans la ligne, rien d'écrit dans la grille ni le stockage ;
//   E. les jetons anti-cache du volet ont bougé.
//
// CE QUI A CHANGÉ AU §5, et pourquoi : B.a (la carte → la ligne par palier, et sa place
// après la ligne orange), B.b / C.a / C.b (même phrase, lue dans `.palier-apercu-texte` du
// palier), B.c (la copie non corrigée n'a plus d'entrée : une ligne en bas de la carte),
// B.d (la note en bas de « Projection », avant le bouton d'ajout), B.e (« Aucune
// projection » : plus rien à prévisualiser — le bloc n'a pas de palier), D.a (les lignes
// vivent dans un bloc qui porte des contrôles : on vérifie la ligne elle-même), E (jetons
// k / h). A ne change pas.
//
// ↻ §7 (5 sept., 6 h 50 — coup d'œil de Grégoire : rien ne montrait que la ligne grise est
// FABRIQUÉE à partir des deux zones) : la ligne s'intitule « L'élève lira (décompte, puis tes
// deux phrases) : » et rend DEUX segments — en gris ce qui est ENGENDRÉ (le décompte, puis le
// préfixe « Tu fais en moyenne… » s'il y en a un), dans l'encre normale ce qu'il a ÉCRIT
// (verdict et recommandation, remplis). Ce qui a changé : B.a (l'étiquette), B.b / C (la
// phrase se lit dans les deux segments, `texteDe` les recolle), D.b (l'échappement, dans le
// segment écrit) ; B.f est NEUF : la composition visible, segment par segment, et ses classes
// dans styles.css.
// ↻ §8 (5 sept., 7 h 15) : le décompte se compose dans la MÊME carte, juste au-dessus des
// paliers (sentinelle `…-etape-2-une-seule-carte`) ; l'étiquette de la ligne redevient
// « L'élève lira : » — la composition est visible au-dessus, elle n'a plus à l'expliquer (B.a).
//
// BREAK-TESTS (faits le 4 septembre 2026, chacun restauré, `cmp` identique) :
//   · A — `precedent` jamais avancé → A.a et A.c rougissent ;
//   · A — la copie non corrigée retirée → A.b rougit ;
//   · B — la projection concaténée AVANT le décompte → B.b, C.a, C.b rougissent ;
//   · B — `ligneApercu` rend '' → B.a, B.b, C, D rougissent ;
//   · B — la ligne orange rendue APRÈS la ligne d'aperçu → B.a rougit ;
//   · D — un `data-action` glissé dans la ligne → D.a rougit.
// BREAK-TESTS DU §7 (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · le verdict rendu dans le segment GRIS (l'écrit vide) → B.f et D.b rougissent, et le spec
//     WebKit `texte-troue-paliers-projection` aussi ;
//   · l'aide remise EN BAS de la carte → gabarit B.c et lot 4 G.c rougissent ;
//   · l'ancienne étiquette « Ce que l'élève lit » → gabarit B.c rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { etapeDe, etapeOuverte, atelierDe } from './_helpers/atelier-algo.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jetonAuMoins } from './_helpers/jeton-anticache.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);

const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));

/* ------------------------------------------------------------------ harnais */

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function fauxDocument() {
    const elements = {};
    return {
        _elements: elements, activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}

const CLE = 'a2026_grillesTemplates';

function monter(grilles) {
    const store = { [CLE]: JSON.parse(JSON.stringify(grilles)) };
    const ecrits = [];
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { ecrits.push(k); store[k] = v; },
        setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            ecrits.push(k);
            const valeur = (k in store ? store[k] : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const document = fauxDocument();
    const globaux = {
        db, document,
        cle: (k) => 'a2026_' + k,
        echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null,
                          filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = E;
    win.projectionAlgo = P;
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.atelierAlgo = require(path.join(racine, 'js/atelier-algo.js'));   // #1150 : l'atelier du critère, qui rend le gabarit
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, ecrits, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +' } };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

// ↻ #1150, lot 4 (24 oct. 2026) : les cartes sont devenues les étapes de l'atelier (`_helpers/atelier-algo.js`).
const ETAPE_DE = { formule: 'note', projection: 'paliers', commentaire: 'eleve' };
const carte = (html, section) => etapeDe(html, 'CR', ETAPE_DE[section] || section);
/** Les blocs de palier de la carte « Projection », chacun jusqu'au suivant. */
const paliersDe = (projection) => projection.split('class="sous-critere-item palier-projection"').slice(1);
const ligneDe = (pal) => (pal.match(/<div class="palier-apercu">[\s\S]*?<\/div>/) || [])[0] || '';
/** Un segment de la ligne (§7 : `engendre` ou `ecrit`), échappé tel que rendu ; et la phrase recollée. */
const segmentDe = (pal, quel) => (ligneDe(pal).match(new RegExp('<span class="palier-apercu-' + quel + '">([\\s\\S]*?)<\\/span>')) || [])[1] || '';
const texteDe = (pal) => [segmentDe(pal, 'engendre'), segmentDe(pal, 'ecrit')].filter(Boolean).join(' ');
const desechapper = (t) => String(t).replace(/&#x27;|&#39;/g, '\'').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/** Le rendu de la carte « Projection » d'une grille, en édition. */
function projectionRendue(grille) {
    const m = monter([grille || GRILLE]);
    m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(grille || GRILLE)));
    return Object.assign(m, { html: m.liste().innerHTML, projection: carte(m.liste().innerHTML, 'projection') });
}

/* ============================================================ A — LES COPIES */

describe('texte troué 2 · A — les copies fictives viennent des paliers, et chacune atteint le sien', () => {
    const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: 'Passerelle +' });

    it('A.a une copie par palier, mots = longueur de référence, et `calculer` la place sur CE palier', () => {
        const copies = P.copiesExemple(c);
        const corrigees = copies.filter((x) => x.corrigee);
        expect(corrigees.map((x) => x.cle)).toEqual(['sans_erreur', 'excellent', 'tres_bien', 'bien', 'risque', 'echec']);
        expect(corrigees.map((x) => x.erreurs)).toEqual([0, 5, 11, 14, 23, 45]);
        for (const x of corrigees) {
            expect(x.mots).toBe(900);
            const r = P.calculer(c, { erreurs: x.erreurs, mots: x.mots });
            expect(r.applicable, x.cle).toBe(true);
            expect(r.palier.cle, x.cle).toBe(x.cle);
        }
    });

    it('A.b la dernière copie est NON corrigée : ni erreurs ni mots, et la projection ne conclut pas', () => {
        const copies = P.copiesExemple(c);
        const derniere = copies[copies.length - 1];
        expect(derniere).toEqual({ cle: 'non_corrigee', libelle: '', erreurs: null, mots: null, corrigee: false });
        expect(copies.filter((x) => !x.corrigee).length).toBe(1);
        expect(P.calculer(c, { erreurs: derniere.erreurs, mots: derniere.mots }).applicable).toBe(false);
    });

    it('A.c une autre norme (600 mots, 20 erreurs) et des seuils déplacés : chaque copie atteint encore son palier', () => {
        const autre = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 600, erreursTolerees: 20 }, [
            { cle: 'z', libelle: 'Zéro', sansErreur: true, ratioMax: null, texte: 'z' },
            { cle: 'ok', libelle: 'OK', ratioMax: 0.6, texte: 'ok' },
            { cle: 'limite', libelle: 'Limite', ratioMax: 1.2, texte: 'l' },
            { cle: 'non', libelle: 'Non', ratioMax: null, texte: 'n' }
        ]);
        const copies = P.copiesExemple(autre).filter((x) => x.corrigee);
        expect(copies.map((x) => x.cle)).toEqual(['z', 'ok', 'limite', 'non']);
        for (const x of copies) {
            expect(x.mots).toBe(600);
            expect(P.calculer(autre, { erreurs: x.erreurs, mots: x.mots }).palier.cle, x.cle).toBe(x.cle);
        }
    });

    it('A.d « Aucune projection » : la non corrigée seule — plus de copie « 3 erreurs, 300 mots » (22 oct. 2026, le miroir la remplace)', () => {
        const copies = P.copiesExemple(P.appliquerAuCritere({}, 'aucune', {}));
        expect(copies.map((x) => x.cle)).toEqual(['non_corrigee']);
        expect(source('js/evaluation-projection.js')).not.toMatch(/erreurs: 3, mots: 300/);
    });

    it('A.e le registre ne lit toujours rien d\'autre que le critère — aucune donnée de personne', () => {
        const src = source('js/evaluation-projection.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(src).not.toMatch(/\bdb\./);
        expect(src).not.toMatch(/evaluationEnCours/);
        expect(src).not.toMatch(/\bdocument\./);
    });
});

/* ====================================================== B — LA LIGNE SOUS CHAQUE PALIER */

describe('texte troué 2 · B — « L\'élève lira : » sous chaque palier, dans la carte « Projection »', () => {
    it('B.a une ligne par palier, APRÈS ses deux zones et APRÈS la ligne orange ; plus aucune carte « apercu », ni en édition ni en création', () => {
        const { html, projection } = projectionRendue({ ...GRILLE, criteres: [{ ...ALGO,
            paliersProjection: P.paliersMigration().map((p) => (p.cle === 'bien' ? { ...p, texte: 'Bien {truc}.' } : p)) }] });
        expect(html).not.toContain('data-pli="CR:apercu"');
        expect(source('js/grilles.js')).not.toContain('rendreBlocApercuAlgo');
        const paliers = paliersDe(projection);
        expect(paliers.length).toBe(6);
        expect((projection.match(/class="palier-apercu"/g) || []).length).toBe(6);
        paliers.forEach((pal, i) => {
            const rangees = [...pal.matchAll(/class="grille-form-2col palier-rangee"/g)].map((m) => m.index);
            const ligne = pal.indexOf('class="palier-apercu"');
            expect(rangees.length, 'palier ' + i).toBe(2);
            expect(ligne, 'palier ' + i).toBeGreaterThan(rangees[1]);
            expect(ligneDe(pal)).toContain('<span class="palier-apercu-mot">L\'élève lira :</span>');
        });
        // Le palier « Bien » porte un jeton inconnu : la ligne orange PRÉCÈDE la ligne d'aperçu.
        const bien = paliers[3];
        expect(bien).toContain('palier-jetons-inconnus');
        expect(bien.indexOf('palier-jetons-inconnus')).toBeLessThan(bien.indexOf('class="palier-apercu"'));
        // En création aussi (mode temp).
        const { win, liste } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        win.afficherCriteresTemp();
        expect(liste().innerHTML).not.toContain('data-pli="T:apercu"');
        expect((liste().innerHTML.match(/class="palier-apercu"/g) || []).length).toBe(6);
    });

    it('B.b la phrase de chaque palier = décompte du bloc 3 PUIS projection du bloc 2, pour SA copie fictive, exactement', () => {
        const { projection } = projectionRendue();
        const paliers = paliersDe(projection);
        const attendues = P.copiesExemple(ALGO).filter((x) => x.corrigee);
        attendues.forEach((x, i) => {
            const decompte = E.enonce(ALGO, 'decompte', { erreurs: x.erreurs, mots: x.mots });
            const proj = P.calculer(ALGO, { erreurs: x.erreurs, mots: x.mots });
            const phrase = [decompte, proj.texte].filter(Boolean).join(' ');
            expect(desechapper(texteDe(paliers[i])), x.cle).toBe(phrase);
            expect(ligneDe(paliers[i])).toContain(`— copie fictive, ${x.erreurs} erreur${x.erreurs > 1 ? 's' : ''} pour ${x.mots} mots`);
        });
        // Le témoin du contenu : le palier « Risqué » lit bien le service réglé, après le décompte.
        expect(desechapper(texteDe(paliers[4]))).toBe('Ta production contient 23 erreurs pour 900 mots. Tu fais en moyenne 1 erreur à chaque 39 mots. En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec. Il est recommandé de t\'inscrire au Passerelle +.');
    });

    it('B.c la copie non corrigée n\'a plus d\'entrée : UNE ligne en bas de la carte le dit — comme l\'application, muette sans erreurs ni mots', () => {
        const { projection } = projectionRendue();
        expect((projection.match(/palier-apercu-non-corrigee/g) || []).length).toBe(1);
        expect(projection).toContain('Copie non corrigée : aucune phrase avant la correction.');
        expect(projection.indexOf('palier-apercu-non-corrigee')).toBeGreaterThan(projection.lastIndexOf('class="palier-apercu"'));
        expect(projection.indexOf('palier-apercu-non-corrigee')).toBeGreaterThan(projection.indexOf('palier-note-composer'));
    });

    it('B.d la note dit ce que l\'aperçu ne montre pas, et d\'où viennent les copies — une fois, en bas, avant le bouton d\'ajout', () => {
        const { projection } = projectionRendue();
        expect((projection.match(/palier-apercu-note/g) || []).length).toBe(1);
        expect(projection).toContain('Copies fictives, calculées depuis tes paliers — aucune donnée d');
        expect(projection).toContain('ne montre pas la rétroaction du sous-critère dominant');
        expect(projection.indexOf('palier-apercu-note')).toBeGreaterThan(projection.lastIndexOf('class="palier-apercu"'));
        expect(projection.lastIndexOf('+ Ajouter un palier')).toBeGreaterThan(projection.indexOf('palier-apercu-note'));
    });

    it('B.e « Aucune projection » : pas de palier, donc rien à prévisualiser dans cette carte — ni ligne, ni note', () => {
        const { projection } = projectionRendue({ ...GRILLE, criteres: [{ ...ALGO, modeleProjection: 'aucune', paramsProjection: {} }] });
        expect(projection).toContain('Aucune projection ne sera proposée');
        expect(projection).not.toContain('palier-apercu');
    });

    it('B.f (§7) la composition visible : en GRIS le décompte puis le préfixe engendré, dans l\'ENCRE ce qu\'il a écrit — jamais l\'inverse', () => {
        const composes = P.paliersMigration().map((p) => (p.cle === 'risque'
            ? { ...p, texte: 'Palier {palier} : {projection} erreurs.', texteAide: 'Va voir {service}.' }
            : p));
        const critere = { ...ALGO, paliersProjection: composes };
        const { projection } = projectionRendue({ ...GRILLE, criteres: [critere] });
        const blocs = paliersDe(projection);
        const copies = P.copiesExemple(critere).filter((x) => x.corrigee);
        expect(copies.length).toBe(6);
        copies.forEach((x, i) => {
            const decompte = E.enonce(critere, 'decompte', { erreurs: x.erreurs, mots: x.mots });
            const proj = P.calculer(critere, { erreurs: x.erreurs, mots: x.mots });
            const engendre = desechapper(segmentDe(blocs[i], 'engendre'));
            const ecrit = desechapper(segmentDe(blocs[i], 'ecrit'));
            expect(engendre, x.cle).toBe([decompte, proj.prefixe].filter(Boolean).join(' '));
            expect(ecrit, x.cle).toBe(proj.texte.slice(proj.prefixe.length).trim());
            expect(ecrit, x.cle).not.toBe('');
            expect(engendre, 'le verdict ne va pas dans le gris — ' + x.cle).not.toContain(ecrit);
            expect(ecrit, 'le décompte ne va pas dans l\'encre — ' + x.cle).not.toContain('Ta production contient');
        });
        // Au mot : « Sans erreur » n'a pas de préfixe (aucune moyenne) ; « Excellent » en a un ; le composé n'en a plus.
        expect(desechapper(segmentDe(blocs[0], 'engendre'))).toBe('Ta production contient 0 erreur pour 900 mots.');
        expect(desechapper(segmentDe(blocs[0], 'ecrit'))).toBe('En prévision de l\'EUF, l\'absence d\'erreur est exceptionnelle.');
        expect(desechapper(segmentDe(blocs[1], 'engendre'))).toBe('Ta production contient 5 erreurs pour 900 mots. Tu fais en moyenne 1 erreur à chaque 180 mots.');
        expect(desechapper(segmentDe(blocs[1], 'ecrit'))).toBe('En prévision de l\'EUF, ce ratio est excellent.');
        expect(desechapper(segmentDe(blocs[4], 'engendre'))).toBe('Ta production contient 23 erreurs pour 900 mots.');
        expect(desechapper(segmentDe(blocs[4], 'ecrit'))).toBe('Palier Risqué : 23 erreurs. Va voir Passerelle +.');
        // Le préfixe se retire par sa longueur, pas par regex ; les classes vivent dans styles.css, scopées à l'éditeur :
        // gris moyen pour l'engendré, encre normale pour l'écrit, et un segment vide ne prend pas de place.
        expect(source('js/grilles.js')).toMatch(/texte\.slice\(prefixe\.length\)\.trim\(\)/);
        const css = source('styles.css');
        expect(css).toMatch(/#listeCriteres \.palier-apercu-engendre \{[^}]*color: var\(--gris-moyen\)/);
        expect(css).toMatch(/#listeCriteres \.palier-apercu-ecrit \{[^}]*color: var\(--texte-principal\)/);
        expect(css).toMatch(/#listeCriteres \.palier-apercu-engendre:empty,\s*#listeCriteres \.palier-apercu-ecrit:empty \{[^}]*display: none/);
        expect(ligneDe(blocs[4])).not.toMatch(/palier-apercu-(engendre|ecrit)"[^>]*style=/);
    });
});

/* ============================================================ C — COMPOSÉE */

describe('texte troué 2 · C — une phrase composée se voit remplie pour la copie de son palier', () => {
    it('C.a les badges de « Ce que l\'élève lit » et de la recommandation, remplis ; le préfixe engendré absent', () => {
        const paliers = P.paliersMigration().map((p) => (p.cle === 'risque'
            ? { ...p, texte: 'Palier {palier} : {projection} erreurs pour {longueur} mots, 1 erreur tous les {moyenne} mots.', texteAide: 'Va voir {service} — seuil {seuil}.' }
            : p));
        const { projection } = projectionRendue({ ...GRILLE, criteres: [{ ...ALGO, paliersProjection: paliers }] });
        const blocs = paliersDe(projection);
        expect(desechapper(texteDe(blocs[4]))).toBe('Ta production contient 23 erreurs pour 900 mots. Palier Risqué : 23 erreurs pour 900 mots, 1 erreur tous les 39 mots. Va voir Passerelle + — seuil 30.');
        // Les autres paliers, non composés, gardent le préfixe d'hier.
        expect(desechapper(texteDe(blocs[1]))).toContain('Tu fais en moyenne 1 erreur à chaque 180 mots. En prévision de l\'EUF, ce ratio est excellent.');
    });

    it('C.b l\'aperçu suit le gabarit : changer la longueur de référence change les copies ET les phrases', () => {
        const { projection } = projectionRendue({ ...GRILLE, criteres: [{ ...ALGO, paramsProjection: { motsReference: 600, erreursTolerees: 30, nomServiceAide: '' } }] });
        const blocs = paliersDe(projection);
        expect(ligneDe(blocs[4])).toContain('— copie fictive, 23 erreurs pour 600 mots');
        expect(desechapper(texteDe(blocs[4]))).toBe('Ta production contient 23 erreurs pour 600 mots. Tu fais en moyenne 1 erreur à chaque 26 mots. En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec.');
    });
});

/* ============================================================ D — RENDU PUR */

describe('texte troué 2 · D — rendu pur : aucun contrôle dans la ligne, rien d\'écrit', () => {
    it('D.a la ligne ne porte ni handler ni action, et le rendu n\'écrit ni dans la grille ni dans le stockage', () => {
        // ⚠ Mesuré : au CHARGEMENT de grilles.js (pas au rendu), `migrerCategoriesVersSousCriteres`
        // fait un `db.modifier` sur la clé des grilles — hors de ce lot. On remet le compteur à
        // zéro après le montage : ce qui compte ici, c'est ce que le RENDU écrit.
        const m = monter([GRILLE]);
        m.ecrits.length = 0;
        const avant = JSON.stringify(m.store[CLE]);
        const copie = JSON.parse(JSON.stringify(GRILLE));
        m.win.afficherCriteresGrille(copie);
        const projection = carte(m.liste().innerHTML, 'projection');
        const lignes = projection.match(/<div class="palier-apercu">[\s\S]*?<\/div>/g) || [];
        expect(lignes.length).toBe(6);
        for (const l of lignes) expect(l).not.toMatch(/data-action=|data-on-change=|<textarea|<input|<select|<button/);
        expect(JSON.stringify(m.store[CLE])).toBe(avant);
        expect(copie).toEqual(GRILLE);
        expect(m.ecrits, 'écritures pendant le rendu en édition').toEqual([]);
        // En CRÉATION : AUCUNE écriture non plus, et rien n'est matérialisé sur le critère.
        const t = monter([]);
        t.ecrits.length = 0;
        t.win.tempCriteres = [{ ...ALGO, id: 'T' }];
        t.win.afficherCriteresTemp();
        expect((t.liste().innerHTML.match(/class="palier-apercu"/g) || []).length).toBe(6);
        expect(t.ecrits).toEqual([]);
        expect(t.win.tempCriteres[0].paliersProjection).toBeUndefined();
    });

    it('D.b tout ce qui vient de la grille est échappé dans la ligne', () => {
        const { projection } = projectionRendue({ ...GRILLE, criteres: [{ ...ALGO,
            paliersProjection: [{ cle: 'x', libelle: 'A <b>gras</b>', ratioMax: null, texte: 'Texte <i>libre</i> "cité".', texteAide: '' }] }] });
        const ligne = ligneDe(paliersDe(projection)[0]);
        expect(ligne).not.toContain('<i>libre</i>');
        expect(ligne).toContain('&lt;i&gt;libre&lt;/i&gt; &quot;cité&quot;.');
        expect(segmentDe(paliersDe(projection)[0], 'ecrit')).toContain('&lt;i&gt;libre&lt;/i&gt; &quot;cité&quot;.');
    });
});

/* ============================================================ E — ANTI-CACHE */

describe('texte troué 2 · E — les jetons anti-cache du volet ont bougé', () => {
    it('E.a grilles.js, evaluation-projection.js et styles.css', () => {
        const html = source('index.html');
        { const j = jetonAuMoins(html, 'js/grilles.js', '20260904k'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'js/evaluation-projection.js', '20260904e'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'styles.css', '20260904h'); expect(j.ok, j.message).toBe(true); }
    });
});
