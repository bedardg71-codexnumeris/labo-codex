// =======================================================================
// LES MOTS DE « METTRE TA CLASSE EN PLACE » — RÉVISÉS LE 14 NOV. 2026 (ESSAI NOVICE, LOT 3)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-14-essai-novice.md, lot 3 et règles 2 à 6.
//   1. Les huit bulles sont en LIGNES, une par geste. Chaque titre et chaque ligne se trouve TEL QUEL
//      dans la consigne du 14 nov. (les étapes 1 et 7 validées par Grégoire mot pour mot, les autres
//      proposées par Cowork). Un mot changé dans le code, et ce banc rougit.
//   2. Ce que la session a dû ÉCRIRE ou RETOUCHER est nommé ici, une ligne à la fois (`ECRITS`) : la
//      liste ne peut pas grandir sans se voir dans le diff.
//   3. La forme (règle 2) : pas de paragraphe, la consigne en dernière ligne de la liste, le document
//      à avoir sous la main nommé d'abord ; les mots de la règle 6.
//   4. « Plus tard », le lien discret de chaque bulle sauf la dernière ; « Terminer ».
//   5. Le lancement provisoire de la partie 1 est parti (zéro dette).
// Les bulles du 8 nov. (un paragraphe par étape, confronté à CONSIGNE-LOT-2026-11-08) sont remplacées.
// Break-test (14 nov.) : « la fin des cours réguliers » changé en « la fin des cours » dans
// js/parcours-classe.js → ROUGE, rétabli → vert.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-2026-11-14-essai-novice.md');
const LOT_3 = tranche(CONSIGNE, '## Lot 3 :', '## Lot 4 :');
const CLASSE = lire('js/parcours-classe.js');
const BULLES = tranche(CLASSE, 'var LIGNES_7 = [', 'var DEF = ');

/** Les chaînes d'un champ (titre, libelle) dans un bloc, guillemets simples ou doubles. */
function chaines(source, champ) {
    const re = new RegExp('(?<![\\w.])' + champ + ":\\s*(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')", 'g');
    return [...source.matchAll(re)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'"));
}

/** Les textes des lignes : `texte: "…"`, `note("…")`, `consigne("…")`, dans l'ordre du fichier. */
function lignes(source) {
    const re = /(?:(?<![\w.])texte:\s*|\bnote\(\s*(?:absenceNotee\(\) \? )?|\bconsigne\(\s*|\n\s+: )"((?:[^"\\]|\\.)*)"/g;
    return [...source.matchAll(re)].map((m) => m[1].replace(/\\'/g, "'"));
}

// Ce que la session du 14 nov. a écrit ou retouché, faute de texte dans la consigne (à valider par Grégoire).
const ECRITS = [
    // La variante d'avant la première séance, « dans la même forme » ; « cours » y devient « séance » (règle 6).
    "Ta première séance n'a pas encore eu lieu.",
    "Reviens après l'avoir donnée : le parcours reprendra ici, avec ta première saisie de présences",
    "En attendant, tu peux préparer tes outils dans « Conception »",
    "Touche « D'accord »",
    // La consigne de la dernière bulle : deux suites offertes à égalité (lot 2e, règle 7).
    'Touche « Parcours suivant », ou « Terminer »'
];

describe('« Mettre ta classe en place » : les huit bulles, mot pour mot', () => {
    const titres = chaines(BULLES, 'titre');
    const toutes = lignes(BULLES);

    it('huit titres, ceux de la consigne ; « Prendre les présences » remplace « Ton premier cours »', () => {
        expect(titres).toEqual(['Ton trimestre', 'Ton cours', 'Ton profil', 'Ta classe', 'Ton horaire', 'Ton groupe-cours',
            'Prendre les présences', "Ta classe d'un coup d'œil"]);
        titres.forEach((t, i) => expect(LOT_3).toContain(`**${i + 1}. ${t} (`));
    });

    it('le compte des lignes : rien n\'échappe à la lecture de ce banc', () => {
        // Étape 7 : 4 + 4 (ses deux bulles) ; puis 8, 6, 4, 7, 5, 7 ; étape 8 : 7 (ses deux fins comptées).
        expect(toutes).toHaveLength(52);
        expect((BULLES.match(/\b(?:note|consigne)\(|(?<![\w.])texte:/g) || []).length).toBe(51);   // la seconde fin de l'étape 8 n'a pas son appel à elle
    });

    // La ligne ENTIÈRE, pas un morceau d'elle : seule sur sa ligne dans la consigne (après son tiret), à la fin d'une
    // ligne (« Tu es dans… ». Reviens-y avant chaque séance.), ou entre guillemets (les deux fins de l'étape 8). Un
    // texte tronqué (« la fin des cours », pour « la fin des cours réguliers ») ne passe pas : break-test du 14 nov.
    const LIGNES_DE_LA_CONSIGNE = LOT_3.split('\n').map((l) => l.replace(/^\s*-\s+/, '').trim());
    const dansLaConsigne = (t) => LIGNES_DE_LA_CONSIGNE.some((l) => l === t || l.endsWith('. ' + t) || l.includes('« ' + t + ' »'));

    it.each(toutes.filter((t) => !ECRITS.includes(t)).map((t) => [t]))('« %s » est une ligne de la consigne', (texte) => {
        expect(dansLaConsigne(texte), texte).toBe(true);
    });

    it('ce que la session a écrit est dans le code, et nulle part dans la consigne (sinon, le retirer de cette liste)', () => {
        for (const t of ECRITS) {
            expect(toutes, t).toContain(t);
            expect(dansLaConsigne(t), t).toBe(false);
        }
    });

    it('la forme : aucune bulle ne porte de paragraphe ni de ligne de geste à part', () => {
        expect(BULLES).not.toMatch(/(?<![\w.])geste:\s*["']/);
        expect(BULLES).not.toMatch(/(?<![\w.])texte:\s*["'][^"']{260,}/);
        expect(chaines(BULLES, 'titre')).toHaveLength(8);
        expect((BULLES.match(/lignes: function \(\)/g) || []).length).toBe(8);
    });

    it('la consigne est la DERNIÈRE ligne de la liste de chaque bulle (une note peut la suivre, hors de la liste)', () => {
        const blocs = BULLES.split(/\n {8}\{\n/).slice(1);
        expect(blocs).toHaveLength(8);
        blocs.forEach((bloc, i) => {
            if (i === 6) return;   // l'étape 7 lit ses deux constantes, vérifiées plus bas
            const corps = tranche(bloc, 'lignes: function () {', '];');
            expect(corps, 'étape ' + (i + 1)).toContain('consigne(');
            // Ce qui suit la dernière consigne : des notes seulement, jamais une ligne de la liste.
            const apres = corps.split('consigne(').pop().split('\n').slice(1).join('\n');
            expect(apres, 'étape ' + (i + 1) + ' : rien qu\'une note après la consigne').not.toMatch(/\{ texte:/);
        });
        for (const nom of ['LIGNES_7', 'LIGNES_7_AVANT']) {
            const corps = tranche(CLASSE, 'var ' + nom + ' = [', '];');
            expect(corps.trim().split('\n').pop().trim().startsWith('consigne(')).toBe(true);
        }
    });

    it('le document à avoir sous la main est la première ligne des étapes 1, 2, 4 et 5 (règle 3)', () => {
        const blocs = BULLES.split(/\n {8}\{\n/).slice(1);
        [[0, 'le calendrier scolaire de ton collège'], [1, 'ton plan de cours'], [3, 'la liste de ton groupe'], [4, 'ton horaire']].forEach(([i, doc]) => {
            const premiere = blocs[i].split('return [')[1].split('\n')[1];
            expect(premiere.trim().startsWith('note("Aie sous la main ' + doc), 'étape ' + (i + 1) + ' : ' + premiere).toBe(true);
        });
    });

    it('les mots (règle 6) : « institution », « séance », ni « établissement », ni « morceau », ni « pastille »', () => {
        const dits = toutes.join(' ');
        expect(dits).toContain('ton institution');
        expect(dits).not.toMatch(/établissement|morceau|pastille/i);
        expect(dits).not.toMatch(/premier cours|cours déjà donné|ce cours a eu lieu/);
    });

    it('les étapes où la page change le déclarent : 1 (le Cadre), 7 (la saisie), 8 (le Suivi)', () => {
        const blocs = BULLES.split(/\n {8}\{\n/).slice(1);
        expect(blocs.map((b) => /\n {12}lieu: true,/.test(b))).toEqual([true, false, false, false, false, false, true, true]);
    });

    it('étape 7, avant la première séance : « D\'accord » ; étape 8 : « Terminer », et rien d\'autre', () => {
        expect(chaines(tranche(CLASSE, 'var BOUTONS_7_AVANT', 'var ETAPES = ['), 'libelle')).toEqual(["D'accord"]);
        expect(chaines(tranche(CLASSE, 'var ETAPES = [', 'var DEF = '), 'libelle')).toEqual(['Terminer']);
    });

    it('« Plus tard » sur chaque bulle sauf la dernière', () => {
        expect(CLASSE).toContain("lienSortie: 'Plus tard'");
        const derniere = tranche(CLASSE, "titre: \"Ta classe d'un coup d'œil\"", 'var DEF = ');
        expect(derniere).toContain('sansSortie: true');
    });

    it('la ligne du panneau', () => {
        const ligne = "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil.";
        expect(CLASSE).toContain(ligne);
        expect(lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md')).toContain(`« ${ligne.replace(/\.$/, '')}`);
    });

    it('étape 6 : le parcours ne choisit rien à la place du novice dans les quatre listes (décision de Grégoire, 14 nov.)', () => {
        // Le banc WebKit (parcours-2-ma-classe, étape 6) mesure que les quatre listes s'ouvrent à « — Choisir — ».
        const etape6 = tranche(BULLES, "titre: 'Ton groupe-cours'", "titre: 'Prendre les présences'");
        expect(etape6).not.toMatch(/\.value\s*=|selectedIndex/);
        expect(etape6).toContain("avant: function () { return ouvrirBloc('groupe-cours'); }");
    });
});

describe('le lancement provisoire de la partie 1 est parti', () => {
    it('« Commencer » (carte enseignant de l’accueil) lance le parcours, il n’ouvre plus Cadre › Trimestre lui-même', () => {
        const accueil = tranche(lire('js/accueil.js'), 'function commencerParLeTrimestre()', '\n}\n');
        expect(accueil).toContain("p.id === 'classe'");
        expect(accueil).toContain('classe.lancer()');
        expect(accueil).not.toContain('naviguerAccueilCarte');
        expect(accueil).not.toContain('ouvrirAccordeonDeLEtape');
    });

    it('parcours-classe.js ne passe plus par commencerParLeTrimestre ; plus d’export d’ouvrirAccordeonDeLEtape', () => {
        expect(CLASSE).not.toContain('commencerParLeTrimestre()');
        expect(CLASSE).not.toMatch(/PARTIE 1 SEULEMENT|lancement provisoire/);
        expect(lire('js/trimestre-v2.js')).not.toContain('window.ouvrirAccordeonDeLEtape');
    });

    it('le parcours se repère sur la frise du Cadre, une seule source (etapesDuCadre)', () => {
        const t = lire('js/trimestre-v2.js');
        expect(t).toContain('ChaineEtapes.dessiner(barre, etapesDuCadre(),');
        expect(t).toContain('window.etapesDuCadre = etapesDuCadre;');
        expect(CLASSE).toContain('window.etapesDuCadre()');
    });
});
