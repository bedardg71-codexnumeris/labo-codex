import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { globauxIdentiteNaturelle } from './_helpers/identite-naturelle.js';

// =======================================================================
// SENTINELLE CT-15 — LES DOUBLONS DU CADRE NE SE CRÉENT PLUS EN SILENCE
// =======================================================================
//
// L'audit du 20 août 2026 a mesuré trois créations silencieuses, chacune
// confirmée par deux passes concordantes avec le code cité :
//
//   · `sauvegarderGroupeCoursV2` poussait sans jamais regarder le triplet
//     (trimestre, cours, groupe). Or le nom du GC est ENGENDRÉ à partir de ce
//     triplet : deux jumeaux portent le même libellé dans tous les menus, et
//     les présences comme les évaluations se répartissent entre eux au hasard
//     du clic — un demi-groupe dans chacun, sans erreur nulle part ;
//   · `sauvegarderEnseignantV2` ne vérifiait aucun courriel, alors que la
//     migration du vieux `profilEnseignant`, trente lignes plus haut DANS LE
//     MÊME FICHIER, vérifie, elle ;
//   · `creerCours` créait sans rien vérifier : l'invariant #455 n'était
//     défendu qu'au formulaire et à l'import.
//
// ET TROIS NORMALISATIONS POUR LA MÊME QUESTION. Le formulaire de cours
// comparait `trim().toUpperCase()` ; l'import comparait `===` BRUT ;
// l'entité ne comparait rien. Conséquence mesurable : « 601-101-mq » importé
// à côté d'un « 601-101-MQ » existant n'était pas vu comme un doublon —
// refusé à la main, accepté par fichier. Trois réponses possibles à « est-ce
// le même cours ? », c'est zéro source de vérité.
//
// CE QUI EST VERROUILLÉ ICI :
//   A. la clé naturelle est insensible à la casse et aux espaces ;
//   B. l'identité du cours est le CODE SEUL (#455) — ni session, ni année,
//      ni trimestre ;
//   C. l'identité de l'enseignant est le COURRIEL, jamais le nom (#450
//      transposé : on ne bloque pas sur un nom) ;
//   D. le triplet du GC exclut horaire et enseignant — ce sont eux qui
//      rendent deux jumeaux légitimes, les inclure désarmerait la garde ;
//   E. `exclureId` : une fiche ne se voit pas elle-même en édition ;
//   F. `creerCours` REFUSE un code déjà pris, et n'accepte que sur
//      `doublonAssume` — le geste reste possible, jamais silencieux ;
//   G. l'édition d'un cours est gardée elle aussi ;
//   H. les trois formulaires portent bien leur garde (présence du code).
//
// BREAK-TESTS (faits le 23 août 2026, §4 du rituel /fin-de-session) — voir le
// détail au-dessus de chaque bloc.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function source(relatif) {
    return readFileSync(path.join(racineProjet, relatif), 'utf-8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
}

let N;
beforeEach(() => { N = globauxIdentiteNaturelle(); });

/* ------------------------------------------------------------------ */
/* A-E — la clé naturelle                                              */
/* BREAK-TEST : retirer `.toUpperCase()` de `cleNaturelle` → A rougit.  */
/* ------------------------------------------------------------------ */

describe('CT-15 · la clé naturelle', () => {

    it('A · casse et espaces ne font pas l\'identité', () => {
        expect(N.cleNaturelle('  601-101-mq ')).toBe('601-101-MQ');
        expect(N.cleNaturelle('Jean   Dupont')).toBe('JEAN DUPONT');
        expect(N.cleNaturelle('')).toBe('');
        expect(N.cleNaturelle(null)).toBe('');
        expect(N.cleNaturelle(undefined)).toBe('');
        // Un zéro n'est pas rien : `0` est un numéro de groupe possible.
        expect(N.cleNaturelle(0)).toBe('0');
    });

    it('B · l\'identité du cours est le CODE seul — ni session, ni année (#455)', () => {
        const hiver = { codeCours: '601-101-MQ', session: 'H', annee: 2026, trimestreId: 'h2026' };
        const automne = { codeCours: '601-101-mq', session: 'A', annee: 2026, trimestreId: 'a2026' };

        expect(N.cleNaturelleCours(hiver)).toBe(N.cleNaturelleCours(automne));
        expect(N.cleNaturelleCours({ codeCours: '601-102-MQ' }))
            .not.toBe(N.cleNaturelleCours(hiver));

        // Les fiches legacy portent le code sous trois noms de champ selon
        // leur génération : les rater ferait passer une legacy au travers.
        expect(N.cleNaturelleCours({ sigle: '601-101-MQ' })).toBe('601-101-MQ');
        expect(N.cleNaturelleCours({ code: '601-101-MQ' })).toBe('601-101-MQ');

        // Sans code, aucune identité — donc aucun verdict de doublon.
        expect(N.cleNaturelleCours({ nomCours: 'Sans code' })).toBeNull();
        expect(N.cleNaturelleCours(null)).toBeNull();
    });

    it('C · l\'identité de l\'enseignant est le COURRIEL, jamais le nom (#450)', () => {
        const a = { prenom: 'Jean', nom: 'Tremblay', courriel: 'j.tremblay@cegep.qc.ca' };
        const b = { prenom: 'Jeanne', nom: 'Tremblay', courriel: 'J.Tremblay@Cegep.QC.CA' };
        const homonyme = { prenom: 'Jean', nom: 'Tremblay', courriel: 'autre@cegep.qc.ca' };

        expect(N.cleNaturelleEnseignant(a)).toBe(N.cleNaturelleEnseignant(b));
        // LE cas-témoin : même nom, même prénom, courriels différents →
        // deux personnes. Bloquer là-dessus casserait des données réelles.
        expect(N.cleNaturelleEnseignant(homonyme)).not.toBe(N.cleNaturelleEnseignant(a));
        expect(N.cleNaturelleEnseignant({ prenom: 'X', nom: 'Y' })).toBeNull();
    });

    it('D · le triplet du GC exclut horaire et enseignant (co-enseignement légitime)', () => {
        const base = { trimestreId: 'a2026', coursId: 'COURS_1', groupeNum: '3' };

        expect(N.cleNaturelleGroupeCours({ ...base, enseignantId: 'ENS_1', horaireId: 'H_1' }))
            .toBe(N.cleNaturelleGroupeCours({ ...base, enseignantId: 'ENS_2', horaireId: 'H_2' }));

        expect(N.cleNaturelleGroupeCours({ ...base, groupeNum: '4' }))
            .not.toBe(N.cleNaturelleGroupeCours(base));
        expect(N.cleNaturelleGroupeCours({ ...base, trimestreId: 'h2026' }))
            .not.toBe(N.cleNaturelleGroupeCours(base));

        // Triplet incomplet = rien à comparer : mieux vaut laisser passer que
        // refuser sur une comparaison de `null` avec `null`.
        expect(N.cleNaturelleGroupeCours({ trimestreId: 'a2026', coursId: 'COURS_1' })).toBeNull();
    });

    it('E · `exclureId` : une fiche ne se voit pas elle-même en édition', () => {
        const liste = [
            { id: 'COURS_A', codeCours: '601-101-MQ' },
            { id: 'COURS_B', codeCours: '601-102-MQ' }
        ];

        // Sans `exclureId`, réenregistrer COURS_A sans toucher son code le
        // ferait rougir contre lui-même — la garde crierait au doublon à
        // chaque sauvegarde, et on la désactiverait dans la semaine.
        expect(N.trouverDoublonNaturel(liste, liste[0], N.cleNaturelleCours,
            { exclureId: 'COURS_A' })).toBeNull();

        // Mais donner à COURS_B le code de COURS_A reste un doublon.
        expect(N.trouverDoublonNaturel(liste, { codeCours: '601-101-MQ' },
            N.cleNaturelleCours, { exclureId: 'COURS_B' })).toBe(liste[0]);

        // Une identité indéterminable n'autorise aucun verdict.
        expect(N.trouverDoublonNaturel(liste, { nomCours: 'X' }, N.cleNaturelleCours)).toBeNull();
        expect(N.trouverDoublonNaturel(null, liste[0], N.cleNaturelleCours)).toBeNull();
    });
});

/* ------------------------------------------------------------------ */
/* F-G — la garde au POINT D'ÉCRITURE                                  */
/* BREAK-TEST : retirer le bloc `if (dejaLa && !doublonAssume)` de      */
/* `creerCours` → F rougit (le second cours entre en silence).          */
/* ------------------------------------------------------------------ */

describe('CT-15 · `creerCours` garde au point d\'écriture (#455)', () => {

    function chargerEntite(magasin) {
        const donnees = { cours: magasin };
        const win = chargerScript('js/entites/cours-entite.js', {
            db: {
                get: async (k) => donnees[k],
                set: async (k, v) => { donnees[k] = v; }
            },
            genererIdUnique: (p) => (p || '') + 'NEUF',
            ...globauxIdentiteNaturelle()
        });
        return { win, donnees };
    }

    const EXISTANT = { id: 'COURS_A', codeCours: '601-101-MQ', nomCours: 'Écriture' };

    it('F · un code déjà pris est REFUSÉ, et rien n\'est écrit', async () => {
        const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { win, donnees } = chargerEntite([{ ...EXISTANT }]);

        // Même à la casse près : c'est le trou de l'import (`===` brut).
        const refus = await win.CoursEntite.creer({ codeCours: '  601-101-mq ' });

        expect(refus).toBeNull();
        expect(donnees.cours).toHaveLength(1);
        expect(avertir).toHaveBeenCalled();
        avertir.mockRestore();
    });

    it('F · le geste reste POSSIBLE quand l\'utilisateur a confirmé', async () => {
        const { win, donnees } = chargerEntite([{ ...EXISTANT }]);

        const cree = await win.CoursEntite.creer(
            { codeCours: '601-101-MQ' }, { doublonAssume: true });

        expect(cree).not.toBeNull();
        expect(donnees.cours).toHaveLength(2);
    });

    it('F · un code neuf passe toujours (la garde ne mord pas le légitime)', async () => {
        const { win, donnees } = chargerEntite([{ ...EXISTANT }]);

        const cree = await win.CoursEntite.creer({ codeCours: '601-102-MQ' });

        expect(cree).not.toBeNull();
        expect(cree.codeCours).toBe('601-102-MQ');
        expect(donnees.cours).toHaveLength(2);
    });

    it('G · l\'ÉDITION est gardée aussi : renommer vers un code pris est refusé', async () => {
        const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { win, donnees } = chargerEntite([
            { ...EXISTANT },
            { id: 'COURS_B', codeCours: '601-102-MQ', nomCours: 'Littérature' }
        ]);

        const refus = await win.CoursEntite.mettreAJour('COURS_B', { codeCours: '601-101-mq' });

        expect(refus).toBeNull();
        expect(donnees.cours[1].codeCours).toBe('601-102-MQ');   // inchangé
        expect(avertir).toHaveBeenCalled();
        avertir.mockRestore();
    });

    it('G · réenregistrer une fiche sans toucher son code passe (elle ne se voit pas elle-même)', async () => {
        const { win } = chargerEntite([{ ...EXISTANT }]);

        const maj = await win.CoursEntite.mettreAJour(
            'COURS_A', { codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' });

        expect(maj).not.toBeNull();
        expect(maj.nomCours).toBe('Écriture et littérature');
    });

    it('G · la recherche par code répond comme la garde (même normalisation)', async () => {
        const { win } = chargerEntite([{ ...EXISTANT }]);

        // Sans cette cohérence, un code serait refusé comme doublon puis
        // introuvable à la recherche — l'utilisateur en conclurait à un bug.
        expect(await win.CoursEntite.obtenirParCode(' 601-101-mq ')).toMatchObject({ id: 'COURS_A' });
        expect(await win.CoursEntite.obtenirParCode('')).toBeNull();
    });
});

/* ------------------------------------------------------------------ */
/* H — les trois formulaires portent leur garde                        */
/* BREAK-TEST : retirer le bloc `if (jumeau)` de                       */
/* `sauvegarderGroupeCoursV2` → H rougit en nommant le fichier.        */
/* ------------------------------------------------------------------ */

describe('CT-15 · les trois formulaires du cadre portent leur garde', () => {

    /** Corps d'une fonction, ancré en colonne 0 (leçon du 10 août 2026). */
    function corpsDe(relatif, nom) {
        const m = source(relatif).match(
            new RegExp('^(?:async )?function ' + nom + '[\\s\\S]*?\\n\\}', 'm'));
        expect(m, `${nom} introuvable dans ${relatif}`).not.toBeNull();
        return m[0];
    }

    it('H · le groupe-cours garde le triplet, à l\'ajout ET à l\'édition', () => {
        const corps = corpsDe('js/trimestre-v2-groupes-cours.js', 'sauvegarderGroupeCoursV2');

        expect(corps).toMatch(/cleNaturelleGroupeCours/);
        expect(corps).toMatch(/confirm\(/);
        expect(corps).toMatch(/exclureId:\s*groupeCoursEnEditionId/);
        // La garde doit précéder l'écriture, sinon elle n'empêche rien.
        expect(corps.indexOf('cleNaturelleGroupeCours'))
            .toBeLessThan(corps.indexOf('groupesCours.push('));
    });

    it('H · l\'enseignant garde le courriel, à la création ET à l\'édition', () => {
        // ↻ Lot E2 (28 sept. 2026) : la création (« Créer le profil ») et la modification
        // (champ par champ) ont chacune leur écrivain ; la garde vit dans UN helper, appelé
        // par les deux AVANT d'écrire.
        const garde = corpsDe('js/trimestre-v2-enseignants.js', '_confirmerCourrielPartage');
        expect(garde).toMatch(/cleNaturelleEnseignant/);
        expect(garde).toMatch(/confirm\(/);
        expect(garde).toMatch(/exclureId/);

        const creation = corpsDe('js/trimestre-v2-enseignants.js', 'creerProfilEnseignantV2');
        expect(creation.indexOf('_confirmerCourrielPartage'))
            .toBeGreaterThan(-1);
        expect(creation.indexOf('_confirmerCourrielPartage'))
            .toBeLessThan(creation.indexOf('enseignants.push('));

        const edition = corpsDe('js/trimestre-v2-enseignants.js', 'sauvegarderChampEnseignantV2');
        expect(edition).toMatch(/_confirmerCourrielPartage\(enseignants, profil\.courriel, enBase\.id\)/);
        expect(edition.indexOf('_confirmerCourrielPartage'))
            .toBeLessThan(edition.indexOf('sauvegarderDonneesSelonMode('));
    });

    it('H · la migration du vieux profil compare avec la MÊME clé', () => {
        // Sinon la migration réinjecterait un profil que la création refuse :
        // « X@Exemple.com » et « x@exemple.com » sont le même courriel.
        const corps = corpsDe('js/trimestre-v2-enseignants.js', 'chargerProfilEnseignantV2');

        expect(corps).toMatch(/cleNaturelleEnseignant/);
        expect(corps).not.toMatch(/e\.courriel\s*===\s*profilAncien\.courriel/);
    });

    it('H · plus AUCUNE seconde définition de l\'identité d\'un cours', () => {
        // Le mode d'échec d'origine : trois normalisations concurrentes.
        // `_tupleCoursNaturel` était la copie locale de `trimestre-v2-cours.js`.
        for (const f of ['js/trimestre-v2-cours.js', 'js/cours.js', 'js/entites/cours-entite.js']) {
            expect(source(f), `${f} redéfinit l'identité d'un cours en local`)
                .not.toMatch(/function\s+_tupleCoursNaturel/);
        }
    });

    it('H · le module de clé naturelle est bien chargé par index.html', () => {
        // Leçon du 10 août : un garde sur un nom absent n'échoue pas, il
        // absorbe. Ici il ferait pire — une ReferenceError à chaque
        // enregistrement de cours, d'enseignant ou de groupe-cours.
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf-8');
        expect(html).toMatch(/<script src="js\/identite-naturelle\.js\?v=/);

        // Et AVANT ses trois consommateurs : l'ordre des <script> décide.
        const rang = (f) => html.indexOf('js/' + f);
        for (const consommateur of ['trimestre-v2-enseignants.js', 'trimestre-v2-groupes-cours.js',
            'entites/cours-entite.js', 'cours.js']) {
            expect(rang('identite-naturelle.js'),
                `identite-naturelle.js doit être chargé avant ${consommateur}`)
                .toBeLessThan(rang(consommateur));
        }
    });
});
