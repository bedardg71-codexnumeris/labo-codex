import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// =======================================================================
// SENTINELLE DU LOT « JE REGARDE » D'« ÉVALUER UNE PREMIÈRE PRODUCTION » (18 NOVEMBRE 2026)
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md`. Remplace la sentinelle du 13 nov.
// (`sentinelle-deux-temps-modeles-2026-11-13.test.js`, l'ancien ordre à neuf étapes repris du parcours), dont elle
// garde ce qui vaut encore : le matériel relu dans la consigne du 13 nov., le confinement, le refus du panneau.
//   1. Le matériel : la grille renommée, ses critères inchangés ; les vingt commentaires et la grille d'autoévaluation
//      sont les fichiers de Grégoire (`plans de travail/materiel-evaluer/`), tels quels ; la cartouche porte le nom de
//      la production ; l'échéance est le mardi 9 septembre 2025.
//   2. Les textes des dix bulles : ceux de la section D de la consigne, MOT POUR MOT, dans les deux sens (chaque ligne
//      de la consigne est dans le code, chaque texte du code est dans la consigne), sauf les lignes PROPOSÉES.
//   3. Dix étapes, dans l'ordre et sous les titres de la consigne ; la Pratique guidée ne bouge pas.
//   4. Le confinement : le modèle ne retient rien hors de la démo et ne remplit que par les outils communs.
// Break-test (18 nov. 2026) : dans `TEXTES.etape3.lignes[2]`, « (un M vaut 75 %) » remplacé par « (un M vaut 80 %) » →
// ROUGE (2, dans les deux sens). Rétabli → vert.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const EVALUER = lire('js/parcours-evaluer.js');
const ASSISTANCE = lire('js/assistance.js');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md');
const CONSIGNE_13 = lire('plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md');
const CARTOUCHE = lire('plans de travail/materiel-evaluer/cartouche-strategies-de-lecture.txt');
const AUTOEVALUATION = lire('plans de travail/materiel-evaluer/grille-autoevaluation-strategies-de-lecture.txt');

// Le fichier, chargé hors du navigateur : ce qu'il enregistre au panneau et ce qu'il expose aux bancs.
const definitions = {};
const fenetre = {
    Assistance: { enregistrer: (def) => { definitions[def.id] = def; }, parcours: () => [], suivantDe: () => null }
};
new Function('window', lire('js/parcours-classe.js'))(fenetre);
new Function('window', EVALUER)(fenetre);
const DEF = definitions.evaluer;
const M = fenetre.ParcoursEvaluer.materiel;
const T = fenetre.ParcoursEvaluer.textes;
const aPlat = (x) => String(x).replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();

describe('1. le matériel de l’exemple', () => {
    const blocs13 = [...CONSIGNE_13.matchAll(/```(text|json)\n([\s\S]*?)\n```/g)].map((b) => b[2]);

    it('la grille s’appelle « Grille générale à 4 critères » ; sa description et ses critères n’ont pas changé (consigne du 13 nov.)', () => {
        expect(M.grille.nom).toBe('Grille générale à 4 critères');
        expect(CONSIGNE).toContain('« Grille générale à 4 critères » (au lieu de « G4H Sans français »)');
        expect(CONSIGNE_13).toContain('(description : « ' + M.grille.description + ' »)');
        const rangees = blocs13[0].split('\n').map((l) => l.split(' | '));
        expect(M.grille.criteres.map((c) => c.map((x) => x.replace(/ %/, ' %')))).toEqual(rangees);
        M.grille.criteres.forEach((c) => expect(c[2]).toMatch(/^\d+ %$/));
        expect(fenetre.ParcoursEvaluer.tableauDeLaGrille().split('\n')).toEqual(
            [[M.grille.nom, M.grille.description].join('\t')].concat(M.grille.criteres.map((r) => r.join('\t'))));
        // Nulle part dans le code, l'ancien nom.
        expect(EVALUER.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('G4H');
    });

    it('les vingt commentaires sont le fichier de Grégoire du 18 nov., tels quels (le niveau 0 dit « L’évaluation n’est pas possible. »)', () => {
        expect(M.commentaires).toBe(CARTOUCHE.replace(/\n+$/, ''));
        expect(M.commentaires.match(/^\*\*[^*]+ \((0|I|D|M|E)\)\*\* : /gm)).toHaveLength(20);
        expect(M.commentaires.match(/\(0\)\*\* : L'évaluation n'est pas possible\.$/gm)).toHaveLength(4);
        // Le fichier de matériel est celui de la consigne, octet pour octet.
        expect(CONSIGNE).toContain('----- DÉBUT DU FICHIER -----\n' + CARTOUCHE.replace(/\n+$/, '') + '\n----- FIN DU FICHIER -----');
    });

    it('la grille d’autoévaluation : le fichier sans sa première ligne (son titre), dans un bloc libre « Grille d’autoévaluation »', () => {
        expect(CONSIGNE).toContain('----- DÉBUT DU FICHIER -----\n' + AUTOEVALUATION.replace(/\n+$/, '') + '\n----- FIN DU FICHIER -----');
        const [titre, ...reste] = AUTOEVALUATION.replace(/\n+$/, '').split('\n');
        expect(titre).toBe("Stratégies de lecture : grille d'autoévaluation");
        // SUPPOSITION nommée au rapport : la ligne vide qui suit le titre part avec lui.
        expect(M.production.autoevaluation.contenu).toBe(reste.join('\n').replace(/^\n+/, ''));
        expect(M.production.autoevaluation.titre).toBe("Grille d'autoévaluation");
    });

    it('la production : titre, type, objectif et consignes inchangés ; la cartouche porte son nom ; l’échéance, le mardi 9 sept. 2025', () => {
        const artefact = JSON.parse(blocs13[1]);
        for (const champ of ['titre', 'type', 'objectif', 'detailTache']) expect(M.production[champ], champ).toBe(artefact[champ]);
        expect(M.production.description).toBe('Appliquer des stratégies de lecture variées (Deux-Rives)');
        expect(M.cartouche).toBe(M.production.description);
        expect(M.production.echeance).toBe('2025-09-09');
        expect(new Date(2025, 8, 9).getDay()).toBe(2);
    });

    it('ce que lit le modèle de « Recevoir » : les niveaux M, D, D, D, Yack Amical, l’échelle du pack, le mot, la pratique', () => {
        expect(M.niveaux).toEqual([['Structure', 'M'], ['Rigueur', 'D'], ['Plausibilité', 'D'], ['Nuance', 'D']]);
        expect(M.etudiantEvalue).toEqual({ da: '9900007', nom: 'Yack Amical' });
        expect(M.echelle).toBe('IDME et niv 0');
        expect(lire('js/pack-demo-10.js')).toContain('"nom": "' + M.echelle + '"');
        expect(M.mot).toBe('Bon départ !');
        expect(M.pratique).toEqual({ id: 'STD-n-meilleurs', nom: 'N meilleures évaluations' });
        // Le modèle de « Recevoir » trouve la grille par le nom que ce matériel lui donne, jamais en dur.
        expect(lire('js/parcours-recevoir-modele.js')).toContain('window.ParcoursEvaluer.materiel.grille.nom');
    });
});

// ---------- La section D, lue dans la consigne ----------

/** Les bulles de la section D : { titre, lignes } ; une ligne par phrase dite, sans « – », sans « ** », sans les guillemets d'une confirmation. */
function bullesDeLaConsigne() {
    const d = tranche(CONSIGNE, 'D. LES TEXTES DES BULLES', 'E. LE MATÉRIEL DE GRÉGOIRE');
    return d.split(/\n### Bulle \d+ · /).slice(1).map((bloc) => {
        const [tete, ...corps] = bloc.split('\n');
        const titre = /^« (.+) » · \d+ sur 10$/.exec(tete)[1];
        const lignes = [];
        corps.map((l) => l.trim()).filter(Boolean).forEach((l) => {
            if (/^Une fois .*la bulle (devient|avance)/.test(l) || l.startsWith('Trois boutons de même poids')) return;
            l = l.replace(/^– /, '').replace(/^\(en petit, gris\) /, '').replace(/^\(entre deux filets, en gras\) /, '');
            const [geste, confirmation] = l.split('** → ');
            lignes.push(geste.replace(/\*\*/g, ''));
            if (confirmation) lignes.push(confirmation.replace(/^« /, '').replace(/ »$/, ''));
        });
        return { titre, lignes: lignes.map(aPlat) };
    });
}

/** Toutes les chaînes de `TEXTES` (sauf les PROPOSÉES), à plat. */
function textesDuCode() {
    const proposes = [T.refus, T.choisirLeGroupe, T.rangeesAEtiqueter].map(aPlat);
    const out = [];
    (function parcourir(v) {
        if (typeof v === 'string') { if (!proposes.includes(aPlat(v))) out.push(aPlat(v)); return; }
        if (Array.isArray(v)) { v.forEach(parcourir); return; }
        if (v && typeof v === 'object') Object.values(v).forEach(parcourir);
    })(T);
    return out;
}

/** Ce que le moteur écrit lui-même, et qu'il lit dans la page (le lieu) : la consigne le donne en entier. */
const DU_MOTEUR = [
    'Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.',
    'Chaque parcours a son objectif. C\'est toi qui choisis la suite',
    'Pour revoir une étape, touche « 10 sur 10 »'
].map(aPlat);
const MENU = { 1: ['Conception', 'Pratiques'], 5: ['Conception', 'Mon matériel'], 6: ['Conception', 'Cartouches'], 7: ['Conception', 'Productions'], 9: ['Évaluation', 'Liste'], 10: ['Suivi', 'Groupe'] };

describe('2. les textes des dix bulles : ceux de la section D, mot pour mot', () => {
    const bulles = bullesDeLaConsigne();
    const code = textesDuCode();

    it('dix bulles dans la consigne', () => {
        expect(bulles).toHaveLength(10);
    });

    it('chaque ligne de la consigne est dans le code (le lieu : sa suite ; ce qu’écrit le moteur : dans le moteur)', () => {
        const moteur = lire('js/parcours-moteur.js');
        const manquantes = [];
        bulles.forEach((b, i) => b.lignes.forEach((l) => {
            if (code.includes(l)) return;
            const menu = MENU[i + 1];
            if (menu && l.startsWith(aPlat('Tu es dans « ' + menu[0] + ' », à l\'onglet « ' + menu[1] + ' »'))) {
                const suite = aPlat(T['etape' + (i + 1)].lieuSuite);
                if (l.endsWith(suite)) return;
            }
            if (DU_MOTEUR.includes(l)) return;
            if (l === aPlat(T.objectif) || l === aPlat(T.objectifAtteint)) return;
            manquantes.push('bulle ' + (i + 1) + ' : ' + l);
        }));
        expect(manquantes).toEqual([]);
        // Les phrases que pose le moteur sont bien les siennes.
        expect(moteur).toContain("var PHRASE_DE_LA_POIGNEE = 'Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.';");
        expect(moteur).toContain("var PHRASE_DE_LA_SUITE = 'Chaque parcours a son objectif. C\\'est toi qui choisis la suite.';");
    });

    it('chaque texte du code est dans la consigne (rien d’ajouté, sauf les lignes PROPOSÉES)', () => {
        const toutes = bulles.reduce((a, b) => a.concat(b.lignes), []);
        const consigneAPlat = aPlat(CONSIGNE);
        const enTrop = code.filter((t) => {
            if (toutes.includes(t)) return false;
            // Ailleurs dans la consigne : les confirmations de « Rigueur » (C.3), le nom du bouton (dans sa ligne).
            if (consigneAPlat.includes(t)) return false;
            if (t.startsWith(':')) return !toutes.some((l) => l.endsWith(t));   // une suite de lieu
            return true;
        });
        // Les titres sont jugés au test suivant ; l'objectif, avec la fin.
        const titres = bulles.map((b) => aPlat(b.titre));
        expect(enTrop.filter((t) => !titres.includes(t) && t !== aPlat(T.objectif) && t !== aPlat(T.objectifAtteint))).toEqual([]);
    });

    it('l’objectif : dit par la première bulle, atteint à la dernière, une seule écriture', () => {
        expect(bulles[0].lignes[0]).toBe(aPlat(T.objectif));
        expect(bulles[9].lignes).toContain(aPlat(T.objectifAtteint));
        expect(EVALUER.match(/de la pratique de notation à la rétroaction/g)).toHaveLength(1);
    });
});

describe('3. dix étapes, dans l’ordre de la consigne', () => {
    const etapes = fenetre.ParcoursEvaluer.etapesModele();

    it('dix étapes, sous les titres de la consigne ; le panneau le sait', () => {
        expect(etapes.map((e) => e.titre)).toEqual(bullesDeLaConsigne().map((b) => b.titre));
        expect(DEF.totalModele).toBe(10);
    });

    it('disparus : le détour par « Holistique », les bulles d’ouverture, le retour en arrière pour la cartouche', () => {
        const bloc = tranche(EVALUER, 'function construireLesEtapesDuModele() {', 'var defDuModele = null;');
        expect(bloc).not.toMatch(/holistique|Pourquoi étiqueter|Tu apprends aussi|Ta grille est créée|choisis cette cartouche/i);
        expect(EVALUER).not.toMatch(/typeAChanger|grilleEnPoints|TEXTES_M|MOTS_M|pourLeModele|enTroisTemps/);
    });

    it('la fin : trois suites de même poids, sans ligne de consigne ; « Pour revoir une étape » vient du moteur', () => {
        const suites = fenetre.ParcoursClasse.suitesDuModele('evaluer', () => {});
        expect(suites.some((b) => b.primaire)).toBe(false);
        expect(EVALUER).toContain('boutons: function () { return C().suitesDuModele(ID, terminerModele); },');
        expect(etapes[9].sansSortie).toBe(true);
    });

    it('« Nous faisons » (la Pratique guidée) ne bouge pas : neuf étapes, ses textes validés', () => {
        expect(fenetre.ParcoursEvaluer.etapes()).toHaveLength(9);
        expect(DEF.total).toBe(9);
        expect(EVALUER).toContain('var TEXTE_1 = "Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà');
        expect(tranche(EVALUER, 'var ETAPES = [', 'var DEF = ')).not.toMatch(/MATERIEL|TEXTES\./);
    });
});

describe('4. le confinement : rien hors de la démo, et « Remplir » par les outils communs', () => {
    const bloc = tranche(EVALUER, '// LE MODÈLE (« Je regarde ») : refait le 18 nov. 2026', 'window.Assistance.enregistrer({');

    it('ce qu’il retient reste en mémoire : `lireCtx` et `majCtx` ne touchent pas aux préférences pendant le modèle', () => {
        expect(tranche(EVALUER, 'function lireCtx() {', 'function majCtx')).toMatch(/if \(enModele\) return ctxModele;\s+var v = typeof obtenirPreference/);
        expect(tranche(EVALUER, 'function majCtx(maj) {', '// ---------- Les données, lues')).toMatch(/if \(enModele\) \{ ctxModele = Object\.assign\(\{\}, ctxModele, maj\); return ctxModele; \}\s+var ctx/);
    });

    it('il n’écrit ni préférence ni donnée, et aucun champ directement (`poser`, `choisir`, derrière la garde de la démo)', () => {
        expect(bloc).not.toMatch(/definirPreference|db\.set|setSync|localStorage|\.value\s*=[^=]|\.checked\s*=[^=]|selectedIndex\s*=/);
        expect(bloc).toContain('action: function () { C().remplir(gestes); }');
    });

    it('la grille tenue pour jugée par niveaux : un drapeau du modèle, qui n’entre pas au brouillon ; aucune échelle n’est créée', () => {
        const brouillon = tranche(lire('js/materiel-dissection-lecture.js'), 'D.brouillon = function (etat) {', '};');
        expect(brouillon).not.toContain('echelleExistante');
        expect(lire('js/materiel-assistant.js')).toContain('if (m.echelleExistante) return { echelle: null, grille: construireGrille(m, ctx, nomGrille, null) };');
        expect(bloc).toContain('d.tenirPourNiveaux({');
    });

    it('le panneau refuse le modèle sans le deuxième groupe, et le fichier le déclare', () => {
        const bouton = tranche(ASSISTANCE, 'function creerBoutonModele(def, o) {', 'function creerTemps');
        expect(bouton).toMatch(/var raison = typeof def\.refusModele === 'function' \? def\.refusModele\(\) : null;/);
        expect(typeof DEF.refusModele).toBe('function');
        expect(DEF.prealable).toBe('classe');
    });
});
