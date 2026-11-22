import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { sectionDeLaConsigne } from './_helpers/fin-des-parcours-2026-11-20.js';
import { retoucherLignes22 } from './_helpers/parcours-apres-par-standards-2026-11-22.js';

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
// Depuis le 22 nov. 2026 (plans de travail/CONSIGNE-2026-11-22-parcours-apres-par-standards.md, A1 à A4), quatre lignes
// de la consigne du 18 sont lues retouchées par celle du 22 (tests/unit/_helpers/parcours-apres-par-standards-2026-11-22.js).

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
    Assistance: { enregistrer: (def) => { definitions[def.id] = def; }, parcours: () => [], suivantDe: () => null, suiteDe: () => null }
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

// LES RETOUCHES DU 20 NOV. 2026 (essai de Grégoire sur l'iPad ; plans de travail/CONSIGNE-2026-11-20-essai-parcours.md,
// sections C et A4) : les lignes de la consigne du 18 nov. qu'elles changent, une à une. `dans` : où la consigne du
// 20 nov. porte le mot neuf (la section, et le passage qu'on y relit).
const RETOUCHES_20_NOV = [
    // A4 : « juger » devient « évaluer ».
    { avant: "Celle de l'exemple se juge par niveaux", apres: "Celle de l'exemple s'évalue par niveaux", dans: ['A4.', '« juger » devient « évaluer »'] },
    { avant: "un aspect de la production que tu regardes pour la juger.", apres: "un aspect de la production que tu regardes pour l'évaluer.", dans: ['A4.', '« juger » devient « évaluer »'] },
    { avant: 'chaque critère se jugera avec ceux de ton échelle', apres: "chaque critère s'évaluera avec ceux de ton échelle", dans: ['A4.', '« juger » devient « évaluer »'] },
    { avant: "c'est la cartouche qui t'aide à juger", apres: "c'est la cartouche qui t'aide à évaluer", dans: ['A4.', '« elle t\'aide à évaluer »'] },
    // C1.
    { avant: "l'application doit savoir ce que chaque partie veut dire.", apres: "l'application doit savoir ce que chaque partie signifie et à quoi elle sert.",
      dans: ['C1.', '« ce que chaque partie veut dire » devient « ce que chaque partie signifie et à quoi elle sert »'] },
    // C2 : les explications de la première forme de la bulle 6, réécrites (trois lignes en deviennent quatre).
    { avant: "Une cartouche, ce sont les commentaires que tu écrirais dans la marge, préparés d'avance : un par critère et par niveau",
      apres: ["Une cartouche, ce sont les commentaires que tu écrirais dans la marge, préparés d'avance",
          "Elle croise deux choses que tu as déjà : ta grille, qui lui donne ses rangées (un critère par rangée), et l'échelle « IDME et niv 0 », choisie avec ta pratique, qui lui donne ses colonnes (un niveau par colonne). À chaque rencontre, une case : le commentaire que lira l'étudiant·e dont la production atteint ce niveau pour ce critère"],
      dans: ['C2.', null] },
    { avant: "Tu l'écris une fois. Ensuite, elle t'aide à juger, et chaque évaluation compose la rétroaction de l'étudiant·e avec tes phrases",
      apres: "Tu l'écris une fois. Ensuite, elle t'aide à évaluer et chaque évaluation compose la rétroaction de l'étudiant·e avec tes phrases", dans: ['C2.', null] },
    // C3.
    { avant: "Une production, c'est tout ce que tu demandes de faire, formatif ou certificatif : un plan de rédaction, un exposé oral, un laboratoire, une mesure sur le terrain",
      apres: "Une production, c'est ce que fait un·e étudiant·e lors d'une activité d'apprentissage. Ce peut être un ensemble de tâches (écrire un texte, faire une prise de sang) ou une performance (une entrevue, un geste, une chorégraphie). Elle peut être formative ou certificative",
      dans: ['C3.', null] },
    { avant: "C'est ça : de l'examen au stage, chaque type est une production.", apres: "C'est ça : chaque type nomme une sorte de production, de l'examen au stage.", dans: ['C3.', null] },
    // C4.
    { avant: "Tu es plus bas dans sa fiche, aux consignes : ce que tes étudiant·es doivent savoir pour réussir.",
      apres: "Tu es plus bas dans la fiche de la production, dans la section réservée à la description des consignes. C'est ici que tu décris les tâches à travers lesquelles tes étudiant·es vont faire leur apprentissage.",
      dans: ['C4.', null] }
];

/** Les lignes de la consigne du 18 nov., telles que celle du 20 nov. les laisse ; chaque retouche doit trouver sa ligne. */
function retoucher20(lignes) {
    let sortie = lignes.slice();
    const servies = new Set();
    RETOUCHES_20_NOV.forEach((r, k) => {
        const neuves = [].concat(r.apres).map(aPlat);
        sortie = sortie.reduce((acc, l) => {
            if (!l.includes(aPlat(r.avant))) return acc.concat([l]);
            servies.add(k);
            return acc.concat(l === aPlat(r.avant) ? neuves : [l.replace(aPlat(r.avant), neuves[0])]);
        }, []);
        // Le mot neuf est dans la consigne du 20 nov. (sans le point final d'une ligne de liste).
        const section = aPlat(sectionDeLaConsigne(r.dans[0]));
        if (r.dans[1]) expect(section, r.dans[0]).toContain(aPlat(r.dans[1]));
        else neuves.forEach((n) => expect(section, r.dans[0] + ' : ' + n.slice(0, 40)).toContain(n.replace(/\.$/, '')));
    });
    expect([...servies].sort((a, b) => a - b), 'chaque retouche du 20 nov. trouve sa ligne dans la consigne du 18').toEqual(RETOUCHES_20_NOV.map((r, k) => k));
    return sortie;
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
    // Les lignes de la consigne du 18 nov., retouchées par celle du 20 (une seule passe, pour toutes les bulles).
    (() => {
        const marques = bulles.map((b) => b.lignes.length);
        const retouchees20 = retoucher20(bulles.reduce((a, b) => a.concat(b.lignes.map((l, k) => ({ l, b })).map((x) => x.l)), []));
        // Puis les quatre phrases du 22 nov. (« Par standards » devenu « Par sélection de productions », consigne du
        // 22 nov., A1 à A4) : lues dans cette consigne, chacune doit trouver sa ligne.
        const r22 = retoucherLignes22(retouchees20, ['A1.', 'A2.', 'A3.', 'A4.'], aPlat);
        expect(r22.servies, 'chaque retouche du 22 nov. trouve sa ligne dans la consigne du 18').toEqual(['A1.', 'A2.', 'A3.', 'A4.']);
        const toutes = r22.lignes;
        // (C2 ajoute une ligne à la bulle 6 : on redécoupe d'après ce compte.)
        let i = 0;
        bulles.forEach((b, k) => { const n = marques[k] + (k === 5 ? 1 : 0); b.lignes = toutes.slice(i, i + n); i += n; });
        expect(i).toBe(toutes.length);
    })();
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
            // La confirmation de « Rigueur » (C.3 de la consigne du 18), avec le mot de A4 (20 nov.).
            if (consigneAPlat.includes(t.replace("pour l'évaluer.", 'pour la juger.'))) return false;
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
        // Une écriture par temps (« Je regarde » : expliquer ; « Nous faisons », 20 nov. 2026 : évaluer), hors commentaires.
        const code = EVALUER.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(code.match(/de la pratique de notation à la rétroaction/g)).toHaveLength(2);
        expect(code.match(/d'expliquer comment une production s'évalue dans l'application, de la pratique de notation à la rétroaction/g)).toHaveLength(1);
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

    it('« Nous faisons » (la Pratique guidée) a ses dix bulles à elle depuis le 20 nov. 2026 : elle ne lit ni le matériel ni les textes du modèle', () => {
        // Ses mots sont jugés par tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js, contre la consigne du 20 nov.
        expect(fenetre.ParcoursEvaluer.etapes()).toHaveLength(10);
        expect(DEF.total).toBe(10);
        expect(EVALUER).not.toContain('var TEXTE_1 = ');
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
