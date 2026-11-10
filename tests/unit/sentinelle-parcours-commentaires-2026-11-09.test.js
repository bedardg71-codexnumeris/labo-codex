// =======================================================================
// LE HUITIÈME PARCOURS, « AUTOMATISER TES COMMENTAIRES » — 9 NOVEMBRE 2026 : LES MOTS
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md.
//   1. Les onze bulles (et la variante sans fichier de l'étape 10) sont celles que Grégoire a
//      validées une à une le 8 nov. (17 h 13 à 17 h 38) : chaque titre, texte et geste se trouve
//      TEL QUEL dans la consigne. Un mot changé dans le code, et ce banc rougit.
//   2. Le panneau : le titre, la ligne et le refus sans production avec sa grille, mot pour mot.
//   3. Les boutons des bulles : « Continuer », « Rien à importer », « Terminer » ; « Plus tard »
//      comme lien de sortie, comme les autres parcours chez soi.
// La lecture de la consigne passe par les marqueurs « Étape n, « titre » », « Texte : « … » » et
// « Geste : « … » » : un texte du code qui n'y est pas tel quel n'a pas été validé.
//   4. Les corrections du 9 nov. (9 h 41 à 9 h 46, relais de Cowork) : les phrases que Grégoire a
//      validées ce jour-là remplacent, ou s'ajoutent à, celles de la consigne. Chaque correction porte
//      l'ancien bout (qui doit se trouver tel quel dans la consigne) et le nouveau (exigé tel quel dans
//      le code). La consigne corrigée est la référence des blocs 1 et 2.
// Break-test (9 nov., corrections) : « (0 pour le code 10) » retiré de l'étape 9 dans
// js/parcours-commentaires.js → ROUGE (bloc 1 et bloc 4) ; rétabli → vert.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE_DU_8 = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md');
const PARCOURS = lire('js/parcours-commentaires.js');

// Validées par Grégoire le 9 nov. 2026, 9 h 41 à 9 h 46, mot pour mot (relais de Cowork).
const CORRECTIONS_9_NOV = [
    { etape: '6', avant: '« Revenir au modèle » remet la phrase de départ. Ta grille est nouvelle ?',
        apres: '« Revenir au modèle » remet la phrase de départ. Si le nom de ton critère contient « français », ces phrases partent du modèle « Français écrit » : choisis « Générique » au menu « Modèle des phrases » pour que tes noms y paraissent. Ta grille est nouvelle ?' },
    { etape: '7', avant: 'choisis la grille que tu viens de régler. Garde',
        apres: "choisis la grille que tu viens de régler. Choisis une production que tu n'as pas encore évaluée : une production déjà évaluée garde la grille de ses évaluations. Garde" },
    { etape: '8', avant: "En haut, choisis bien la production à laquelle tu viens d'associer ta grille : elle s'applique à tout le lot.",
        apres: "Une fois tes fichiers déposés, choisis bien, dans l'Inspecteur, la production à laquelle tu viens d'associer ta grille : elle s'applique à tout le lot." },
    { etape: '9', avant: 'Sur un clavier, la touche de son numéro le choisit aussi.',
        apres: 'Sur un clavier, la touche de son numéro le choisit aussi (0 pour le code 10).' },
    { etape: '9, geste', avant: 'Pose tes codes, puis touche « Actions › Évaluer », en haut de la production.',
        apres: 'Pose tes codes, puis touche « Annoter ▾ », en haut de la production, et choisis « Évaluer ».' },
    { etape: '10', avant: 'sans ce nombre, la note ne se calcule pas.',
        apres: 'sans ce nombre, la note ne se calcule pas, sauf avec une pénalité fixe.' },
    { etape: '10', avant: 'dans « Spécifique », ses trois codes les plus fréquents, avec leur observation ; dans « Bilan », le code qui revient le plus.',
        apres: 'dans « Spécifique », ses trois codes les plus fréquents, avec leur observation ; et son PDF nommera, sous « Points récurrents », le code qui revient le plus.' },
    { etape: '10 (les deux variantes)', avant: 'Relis-la comme ton étudiant·e la lira, retouche au besoin, puis touche le cadenas « Verrouiller », en haut de « Paramètres ».',
        apres: 'Relis-la comme ton étudiant·e la lira. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ». Puis touche le cadenas « Verrouiller », en haut de « Paramètres ».' },
    { etape: '10, sans fichier', avant: 'Dans « Évaluation », ton critère algorithmique attend deux nombres',
        apres: 'Dans le panneau « Critères », ton critère algorithmique attend deux nombres' },
    { etape: '10, sans fichier', avant: 'Ouvre ensuite la palette « Rétroaction » : sous ton critère,',
        apres: 'Regarde ensuite la rétroaction, à côté : sous ton critère,' },
    { etape: '11', avant: "Pour un prochain critère, Conception › Mon matériel colle d'un coup une liste de codes tirée d'un tableur.",
        apres: "Pour un prochain critère, crée-le dans Grilles : tant qu'il n'a aucun code, Conception › Mon matériel y colle d'un coup une liste tirée d'un tableur." }
];
const CONSIGNE = CORRECTIONS_9_NOV.reduce((c, k) => c.split(k.avant).join(k.apres), CONSIGNE_DU_8);

/** Les chaînes d'un champ dans un bloc (TEXTES pour les bulles, ETAPES pour les boutons), guillemets simples ou doubles. */
function chaines(source, champ, debut = 'var TEXTES = {', fin = 'var ETAPES = {') {
    const bloc = tranche(source, debut, fin);
    const re = new RegExp(champ + ":\\s*(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')", 'g');
    return [...bloc.matchAll(re)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"'));
}

describe('« Automatiser tes commentaires » : les bulles, mot pour mot', () => {
    const titres = chaines(PARCOURS, 'titre');
    const textes = chaines(PARCOURS, 'texte');
    const gestes = chaines(PARCOURS, 'geste');

    it('douze bulles (les onze étapes et la variante sans fichier de l’étape 10), douze textes ; onze gestes (l’étape 11 n’en a pas)', () => {
        expect(titres).toHaveLength(12);
        expect(textes).toHaveLength(12);
        expect(gestes).toHaveLength(11);
    });

    it('les titres sont ceux de la consigne, dans l’ordre des onze étapes (la variante reprend celui de l’étape 10)', () => {
        const attendus = titres.map((t) => t);
        const ordre = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11];
        ordre.forEach((n, i) => {
            expect(CONSIGNE, 'étape ' + n).toContain(`Étape ${n}, « ${attendus[i]} »`);
        });
    });

    it.each(textes.map((t, i) => [i + 1, t]))('bulle %i : le texte est celui de la consigne', (n, texte) => {
        expect(CONSIGNE).toContain(`Texte : « ${texte} »`);
    });

    it.each(gestes.map((g) => [g]))('le geste « %s » est celui de la consigne', (geste) => {
        expect(CONSIGNE).toContain(`Geste : « ${geste} »`);
    });

    it('chaque bulle a le texte ET le geste de SON étape (un geste déplacé d’une étape à l’autre rougit)', () => {
        const bloc = tranche(PARCOURS, 'var TEXTES = {', 'var ETAPES = {');
        const champ = (corps, nom) => {
            const m = corps.match(new RegExp(nom + ':\\s*"((?:[^"\\\\]|\\\\.)*)"'));
            return m ? m[1].replace(/\\"/g, '"') : null;
        };
        const entrees = [...bloc.matchAll(/(\w+): \{([\s\S]*?)\n {8}\}/g)].map((m) => ({ cle: m[1], corps: m[2] }));
        expect(entrees.map((e) => e.cle)).toEqual(['grille', 'compte', 'codes', 'note', 'cas', 'lit', 'production', 'productions', 'poser', 'retro', 'retroSans', 'loin']);
        const lignes = CONSIGNE.split('\n').filter((l) => /^Étape \d+/.test(l));
        expect(lignes).toHaveLength(12);
        entrees.forEach((e, i) => {
            const ligne = lignes[i];
            expect(ligne, e.cle + ' : le texte').toContain(`Texte : « ${champ(e.corps, 'texte')} »`);
            const geste = champ(e.corps, 'geste');
            if (geste) expect(ligne, e.cle + ' : le geste').toContain(`Geste : « ${geste} »`);
            else expect(ligne, e.cle + ' : pas de geste').not.toContain('Geste : «');
        });
    });

    it('chaque texte et chaque geste de la consigne est posé : rien n’est oublié', () => {
        const textesConsigne = [...CONSIGNE.matchAll(/Texte : « (.*?) » Geste :|Texte : « (.*?) » Bouton/g)].map((m) => m[1] ?? m[2]);
        expect(textesConsigne).toHaveLength(12);
        expect([...textes].sort()).toEqual([...textesConsigne].sort());
    });

    it('les boutons des bulles : « Continuer » (étapes 3 à 6), « Rien à importer » (étape 8), « Terminer » (étape 11)', () => {
        expect(chaines(PARCOURS, 'libelle', 'var ETAPES = {', 'var DEF = ').sort()).toEqual(['Continuer', 'Continuer', 'Continuer', 'Continuer', 'Rien à importer', 'Terminer'].sort());
        expect(CONSIGNE).toContain('« Rien à importer » est un bouton de la bulle');
        expect(CONSIGNE).toContain('Bouton « Terminer »');
    });

    it('le lien de sortie : « Plus tard », comme les autres parcours chez soi', () => {
        expect(PARCOURS).toContain("lienSortie: 'Plus tard'");
    });
});

describe('le panneau : titre, ligne et refus, mot pour mot', () => {
    it('le titre et la ligne', () => {
        expect(PARCOURS).toContain("titre: 'Automatiser tes commentaires'");
        const ligne = "De ta grille à une rétroaction qui s'écrit seule, à partir de ce que tu relèves et comptes dans chaque production.";
        expect(PARCOURS).toContain(ligne);
        expect(CONSIGNE).toContain(`Ligne : « ${ligne} »`);
    });

    it('le refus sans production avec sa grille', () => {
        const refus = 'Commence par « Évaluer une première production » : il te faut une production et sa grille pour automatiser tes commentaires.';
        expect(PARCOURS).toContain(refus);
        expect(CONSIGNE).toContain(`le panneau dit : « ${refus} »`);
    });

    it('le parcours s’inscrit après « Mettre ta classe en place » dans index.html (le huitième, quand les autres viendront)', () => {
        const index = lire('index.html');
        const classe = index.indexOf('js/parcours-classe.js');
        const huitieme = index.indexOf('js/parcours-commentaires.js');
        expect(classe).toBeGreaterThan(-1);
        expect(huitieme).toBeGreaterThan(classe);
    });
});

describe('les corrections du 9 nov. : chaque ancien bout était dans la consigne, chaque phrase validée est dans le code', () => {
    it.each(CORRECTIONS_9_NOV.map((k) => [k.etape, k]))('étape %s', (etape, k) => {
        expect(CONSIGNE_DU_8, 'l’ancien bout se lit dans la consigne du 8').toContain(k.avant);
        expect(PARCOURS, 'la phrase validée le 9 est posée').toContain(k.apres);
        expect(PARCOURS, 'l’ancien bout n’est plus posé').not.toContain(k.avant);
    });
});
