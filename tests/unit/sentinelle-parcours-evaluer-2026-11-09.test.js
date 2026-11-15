// =======================================================================
// LE TROISIÈME PARCOURS (9 NOV. 2026) : LES MOTS D'« ÉVALUER UNE PREMIÈRE PRODUCTION »
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-3-evaluer.md.
//   1. Les neuf bulles sont celles que Grégoire a validées le 8 nov. (7 h 37 à 8 h 08, revues de 13 h 51 à
//      14 h 20), avec les SIX CORRECTIONS du 9 nov. (9 h 27 à 9 h 30, relayées par Cowork) : chaque texte du
//      parcours, LU À L'EXÉCUTION, est égal au texte de la consigne auquel on applique ces corrections. Chaque
//      correction doit trouver dans la consigne la phrase qu'elle remplace : la consigne et le code sont tous
//      deux confrontés.
//   2. La bulle du choix, la phrase du panneau sans classe, les titres « n sur 9 », « Plus tard » partout sauf
//      la dernière, « Continuer » (7) et « Terminer » (9).
//   3. La ligne du panneau et la phrase de l'étape 2 validées par Grégoire le 9 nov. (13 h 37 à 13 h 42, en Cowork,
//      sur les questions du rapport) ; « Partir de zéro » remplace « Taper ma grille à la main ».
// Break-test (9 nov.) : « la moyenne de tes travaux » changé en « la somme de tes travaux » dans
// js/parcours-evaluer.js → ROUGE (étape 5), rétabli → vert.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-3-evaluer.md');

/** Le texte d'une étape dans la consigne : de « Texte : « » à « » Avance », « » Bouton » ou « » Pas de bulle ». */
function texteDeLaConsigne(n) {
    const ligne = CONSIGNE.split('\n').find((l) => l.startsWith(`Étape ${n}, «`));
    const m = ligne && ligne.match(/Texte : « (.*?) » (?:Avance|Bouton|Pas de bulle)/);
    return m ? m[1] : null;
}

function titreDeLaConsigne(n) {
    const ligne = CONSIGNE.split('\n').find((l) => l.startsWith(`Étape ${n}, «`));
    const m = ligne && ligne.match(/^Étape \d, « (.*?) »\./);
    return m ? m[1] : null;
}

// LES SIX CORRECTIONS DU 9 NOV., telles que relayées : [étape, phrase de la consigne, phrase validée].
// `null` : le texte entier est remplacé (étape 9).
const CORRECTIONS = [
    // Le 11 nov., 8 h 38 (second essai sur l'iPad) : la longueur de la dissection, dite d'avance.
    [1, "C'est ainsi qu'elle pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute.",
        "C'est ainsi qu'elle pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute. C'est souvent long, parce que chaque grille est construite à sa façon et que l'application ne peut pas deviner le rôle de chaque partie. Mais tu ne le fais qu'une fois : ta grille servira ensuite à chaque copie que tu évalueras avec elle."],
    // Le 14 nov. (essai novice, lot 4a) : « partie » remplace « morceau » dans tous les textes de l'étiquetage.
    [1, 'ce que veut dire chaque morceau (un critère, un niveau, des points)', 'ce que veut dire chaque partie (un critère, un niveau, des points)'],
    // (La phrase « … le rôle de chaque partie. » vient de la correction du 11 nov., plus bas : elle y est écrite ainsi.)
    // Le 11 nov., 8 h 58 (relais du 12 nov., point 6) : « Composer ma grille » remplace « Partir de zéro ».
    [1, 'Pas de grille sous la main ? Touche « Partir de zéro ».', 'Pas de grille sous la main ? Touche « Composer ma grille ».'],
    // Le 9 nov., 13 h 37 (question 2 du rapport) : l'échelle associée avec la grille.
    [2, 'Puis associe-lui la grille que tu viens de créer.',
        'Puis associe-lui la grille que tu viens de créer, et son échelle si elle en a une.'],
    [3, 'À son échéance, ce que tes étudiant·es ont remis compte dans leur complétion, et tes évaluations, dans leur performance.',
        'Dès ta première évaluation, ce que tes étudiant·es ont remis compte dans leur complétion, et tes évaluations, dans leur performance.'],
    [4, "la note se calcule à mesure, et une rétroaction s'écrit sous tes yeux, tirée de ta grille. Tu y mettras bientôt tes propres mots.",
        "la note se calcule à mesure, et une rétroaction s'écrit sous tes yeux : chaque critère de ta grille, avec ce que tu lui attribues. Tu y mettras bientôt tes propres mots."],
    [5, "Touche « Partir d'un modèle » et choisis le tien : « Modèle sommatif » si la note du cours est la somme de tes travaux selon leur pondération.",
        "Touche « + Nouvelle pratique », puis « Partir d'un modèle », et choisis le tien : « Modèle sommatif » si la note du cours est la moyenne de tes travaux selon leur pondération."],
    [6, "Sans pratique appliquée, l'application ne sait pas comment tu construis ta note : elle attend trois productions évaluées, le minimum pour dire si un·e étudiant·e progresse.",
        "Sans pratique appliquée, l'application ne sait pas comment tu construis ta note : elle n'en calcule aucune."],
    [7, "La complétion, elle, suit la remise : une production importée compte comme remise à son échéance ; sans fichier, c'est ton évaluation qui confirme la remise.",
        "La complétion, elle, suit la remise : dès ta première évaluation, chaque production importée pour ce travail compte comme remise ; sans fichier, c'est ton évaluation qui confirme la remise."],
    // Le 9 nov., 15 h 55 (question 1 du rapport du quatrième parcours) : la cartouche nommée dans la fiche de la production.
    [8, "Tes étudiant·es reçoivent un commentaire cohérent d'une évaluation à l'autre, et tu n'as plus à le réécrire chaque fois.",
        "Tes étudiant·es reçoivent un commentaire cohérent d'une évaluation à l'autre, et tu n'as plus à le réécrire chaque fois. Puis, dans la fiche de ta production, choisis cette cartouche : elle s'y appliquera à chaque évaluation."],
    [9, null,
        "Reviens à ta première évaluation : touche « Actions › Consulter », puis « Déverrouiller ». Choisis ta cartouche : la rétroaction se réécrit avec tes phrases. Relis-la comme ton étudiant·e la lira, dans sa synthèse de rétroaction. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ». Puis verrouille. Désormais, chaque production que tu évalueras recevra sa rétroaction de la même façon."]
];

function texteValide(n) {
    let t = texteDeLaConsigne(n);
    for (const [k, avant, apres] of CORRECTIONS.filter((c) => c[0] === n)) {
        if (avant === null) { t = apres; continue; }
        if (!t.includes(avant)) throw new Error(`étape ${k} : la consigne ne porte pas « ${avant} »`);
        t = t.replace(avant, apres);
    }
    return t;
}

/** Le parcours chargé tel quel, avec un panneau et un moteur de banc : ce qu'il enregistre, ses étapes. */
function charger() {
    const enregistres = [];
    const win = {
        Assistance: { enregistrer: (d) => enregistres.push(d), definirEtat() {}, etatDe: () => ({ etat: 'a-faire', etape: 0 }) },
        ParcoursMoteur: { visible: () => false, premierVisible: () => null, actif: () => false, etapeCourante: () => null }
    };
    chargerScript('js/parcours-evaluer.js', { document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { classList: { toggle() {} } } } }, win);
    return { def: enregistres[0], api: win.ParcoursEvaluer };
}

describe('« Évaluer une première production » : les neuf bulles, mot pour mot (consigne + corrections du 9 nov.)', () => {
    const { def, api } = charger();
    const etapes = api.etapes();

    it('le panneau : le titre, la ligne validée le 9 nov. (13 h 37), neuf étapes, troisième et dernier', () => {
        expect(def.id).toBe('evaluer');
        expect(def.titre).toBe('Évaluer une première production');
        expect(CONSIGNE).toContain('« Évaluer une première production » s\'ajoute au panneau « Assistance », troisième et dernier');
        expect(def.total).toBe(9);
        expect(etapes).toHaveLength(9);
        expect(def.ligne).toBe('De ta grille à ta première rétroaction, réécrite avec tes mots.');
    });

    it('chaque correction trouve, dans la consigne, la phrase qu’elle remplace', () => {
        for (const [n, avant] of CORRECTIONS) {
            if (avant !== null) expect(texteDeLaConsigne(n), `étape ${n}`).toContain(avant);
        }
    });

    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('étape %i : le titre et le texte validés', (n) => {
        expect(etapes[n - 1].titre).toBe(titreDeLaConsigne(n));
        expect(etapes[n - 1].texte).toBe(texteValide(n));
    });

    it('la bulle du choix est celle de la consigne', () => {
        const m = CONSIGNE.match(/^Bulle du choix[^\n]*?: « (Ta grille porte.*) »$/m);
        expect(api.texteDuChoix).toBe(m[1]);
    });

    it('la phrase du panneau, sans classe, est celle que Grégoire a validée (8 nov., 14 h 20)', () => {
        const m = CONSIGNE.match(/Texte validé par Grégoire \(8 nov\., 14 h 20\) : « (.*) »$/m);
        expect(api.refus()).toBe(m[1]);
        expect(api.refus()).toBe('Commence par « Mettre ta classe en place » : il faut une classe pour évaluer une production.');
    });

    it('« Plus tard » sur chaque bulle sauf la dernière ; « Continuer » à la 7, « Terminer » à la 9', () => {
        expect(def.lancer).toBeTypeOf('function');
        expect(etapes.slice(0, 8).every((e) => !e.sansSortie)).toBe(true);
        expect(etapes[8].sansSortie).toBe(true);
        expect(etapes[6].boutons.map((b) => b.libelle)).toEqual(['Continuer']);
        expect(etapes[8].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        // 14 nov. 2026 (essai novice, règle 5 : « la bulle guide, la page agit ») : devant sa grille, l'étape 1 ne porte
        // plus aucun bouton (« Prendre une grille déjà créée » et les trois de l'exemple sont partis).
        expect(etapes.filter((e) => e.boutons).length).toBe(2);
        expect(etapes[0].boutons).toBeFalsy();
        const source = lire('js/parcours-evaluer.js');
        expect(source).not.toMatch(/libelle:\s*["'](?:Prendre une grille déjà créée|Voir le travail complet|Faire l'exercice soi-même|Passer à ma grille)/);
        expect(lire('js/parcours-evaluer.js')).toContain("lienSortie: 'Plus tard'");
    });

    // ESSAI NOVICE DU 14 NOV. 2026, LOT 4 (b à e) — les bulles en lignes de l'étape 1, contre
    // plans de travail/CONSIGNE-2026-11-14-essai-novice.md : la ligne ENTIÈRE, pas un morceau d'elle.
    describe('étape 1 · les bulles en lignes du 14 nov. 2026 (ouverture, accueil, devant l’exemple)', () => {
        const source = lire('js/parcours-evaluer.js');
        const LOT_4 = tranche(lire('plans de travail/CONSIGNE-2026-11-14-essai-novice.md'), '## Lot 4 :', '## Lot 5 :');
        const lignesDeLaConsigne = LOT_4.split('\n').map((l) => l.replace(/^\s*-\s+/, '').trim());
        const bloc = tranche(source, 'var LIGNES_1 = {', 'function texteEtape1()');
        const facons = Object.fromEntries([...bloc.matchAll(/\n {8}(?:'([\w-]+)'|(\w+)): \[\n([\s\S]*?)\n {8}\]/g)]
            .map((m) => [m[1] || m[2], [...m[3].matchAll(/(?:texte:\s*|note\(|consigne\()"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1])]));
        // Ce que la session a écrit, faute de mots dans la consigne (à valider par Grégoire).
        const ECRITS = ['Colle ici la grille que tu utilises déjà (copie le tableau entier, depuis Word ou Pages)',
            'Pas de grille sous la main ? Ces deux boutons ouvrent un exemple', 'Colle ta grille, ou touche un des deux boutons'];

        it('cinq façons en lignes : pourquoi, apprends, accueil, exemple-haut, exemple-bas', () => {
            expect(Object.keys(facons)).toEqual(['pourquoi', 'apprends', 'accueil', 'exemple-haut', 'exemple-bas']);
            expect(Object.values(facons).map((l) => l.length)).toEqual([2, 2, 3, 3, 3]);
        });

        it.each(['pourquoi', 'apprends', 'exemple-haut', 'exemple-bas'])('« %s » : chaque ligne est une ligne de la consigne', (facon) => {
            for (const t of facons[facon]) expect(lignesDeLaConsigne, t).toContain(t);
        });

        it('l’accueil : trois lignes écrites par la session, nommées ici, absentes de la consigne', () => {
            expect(facons.accueil).toEqual(ECRITS);
            for (const t of ECRITS) expect(lignesDeLaConsigne).not.toContain(t);
        });

        it('les titres : « Pourquoi étiqueter », « Tu apprends aussi », « L’exemple étiqueté », « La grille, comprise par l’application »', () => {
            for (const t of ['Pourquoi étiqueter', 'Tu apprends aussi', "L'exemple étiqueté", "La grille, comprise par l'application"]) {
                expect(tranche(source, 'var TITRES_1 = {', 'var LIGNES_1 = {'), t).toContain(t);
                expect(LOT_4, t).toContain(t);
            }
        });

        it('les deux boutons de la page portent les noms validés ; « partie », « section », « groupe de critères »', () => {
            const index = lire('index.html');
            expect(index).toContain('data-param="complet">Voir un exemple de grille étiquetée</button>');
            expect(index).toContain('data-param="exercice">Étiqueter l’exemple moi-même</button>');
            const lecture = lire('js/materiel-dissection-lecture.js');
            expect(lecture).toContain("nom: 'Sous-total', aide: 'Le total d’un groupe de critères'");
            expect(lecture).toContain("rangeeSection('SECTION A : COMPRÉHENSION')");
            expect(lecture).toContain('/^SECTION /.test(');
            expect(lire('js/materiel-dissection.js')).toContain("choixNiveaux: 'des niveaux de performance'");
        });

        it('la page ne dit qu’une fois que l’exemple ne s’enregistre pas', () => {
            const textes = tranche(lire('js/materiel-dissection.js'), 'var TEXTES_EXEMPLE = {', '};');
            expect(textes).not.toContain('Il ne s’enregistre pas');
            expect((textes.match(/il ne devient pas une de tes grilles/g) || []).length).toBe(1);
        });
    });

    it('« Composer ma grille » remplace « Partir de zéro » (11 nov., 8 h 58), qui remplaçait « Taper ma grille à la main » (8 nov.)', () => {
        const index = lire('index.html');
        expect(index).toContain('data-tooltip="materiel-taper-main">Composer ma grille</button>');
        expect(index).not.toContain('Partir de zéro');
        expect(index).not.toContain('Taper ma grille à la main');
        expect(lire('js/accompagnement-contenu-hover.js')).not.toContain('Taper ma grille');
    });
});
