import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #575 (lot 4 du plan SOLO) — badges d'artefacts et barres de
// critères : l'échelle n'est plus devinée, et la couleur ne vient plus d'IDME.
//
// CE QUI EXISTAIT AVANT, aux deux endroits (constats §3 n° 4 et n° 5 de l'audit
// du 27 août 2026) :
//
//   · `echelles.find(e => e.active) || echelles[0]` — « l'échelle active, sinon
//     la PREMIÈRE ». Chaque évaluation porte pourtant la sienne.
//   · un repli IDME quand cette échelle manquait : quatre couleurs derrière
//     `note >= 85 / 75 / 65` pour les badges, une table
//     `I 0-64 / D 65-74 / M 75-84 / E 85-100` complète pour le dégradé et la
//     légende des barres.
//   · la couleur de l'échelle — donnée UTILISATEUR — posée BRUTE dans un
//     attribut `style` (§5.5 : `echapperHtml` neutralise l'évasion d'attribut,
//     pas l'injection CSS).
//
// ⮕ Les badges lisent la couleur du CODE DÉJÀ ENREGISTRÉ, dans SON échelle
// (`couleurDuNiveau`) : ils ne re-situent plus la note, ce qui pouvait
// contredire le code affiché dans le même badge. Les barres lisent l'échelle
// COMMUNE des évaluations de l'élève, et se passent de dégradé quand il n'y en a
// pas. Les deux passent par `couleurCssSure`, extraite de la fermeture locale où
// elle était enfermée.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const sansCommentaires = (src) => src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');

const ECHELLE_WXYZ = {
    id: 'ECH_WXYZ',
    niveaux: [
        { code: 'W', nom: 'Amorce',    min: 0,  max: 49,  couleur: '#101010' },
        { code: 'X', nom: 'En chemin', min: 50, max: 69,  couleur: '#202020' },
        { code: 'Y', nom: 'Consolidé', min: 70, max: 89,  couleur: '#abc' },
        { code: 'Z', nom: 'Transféré', min: 90, max: 100 }
    ]
};

function chargerHelpers(echelleRendue) {
    return chargerScript('js/profil-etudiant-helpers.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirPreference: () => null,
        obtenirDonneesSelonMode: () => [],
        obtenirEchelleResolue: () => echelleRendue
    });
}

describe('#575 · la couleur d\'un badge vient du code enregistré, dans SON échelle', () => {

    it('le code trouve sa couleur, quelle que soit la lettre', () => {
        const win = chargerHelpers(ECHELLE_WXYZ);
        expect(win.couleurDuNiveau('W', 'ECH_WXYZ')).toBe('#101010');
        expect(win.couleurDuNiveau('X', 'ECH_WXYZ')).toBe('#202020');
    });

    it('une couleur `#abc` est développée, pas rejetée', () => {
        // Le suffixe alpha `${couleur}22` du badge produirait sinon du CSS invalide.
        const win = chargerHelpers(ECHELLE_WXYZ);
        expect(win.couleurDuNiveau('Y', 'ECH_WXYZ')).toBe('#aabbcc');
    });

    it('un niveau sans couleur saisie prend le neutre, pas une couleur IDME', () => {
        const win = chargerHelpers(ECHELLE_WXYZ);
        expect(win.couleurDuNiveau('Z', 'ECH_WXYZ')).toBe('#999999');
    });

    it('échelle non résolue ⇒ neutre, jamais un repli sur la note', () => {
        // Avant : `note >= 85` → bleu, `>= 75` → vert… Les bornes de Grégoire
        // décidaient de la couleur d'un badge chez tout le monde.
        const win = chargerHelpers(null);
        expect(win.couleurDuNiveau('M', 'ECH_DISPARUE')).toBe('#999999');
    });

    it('une couleur qui tente d\'injecter du CSS est neutralisée', () => {
        // §5.5 de l'audit : ce filtre existait, mais enfermé dans une fermeture
        // locale — les badges, eux, posaient la valeur brute dans `style`.
        const win = chargerHelpers({ id: 'E', niveaux: [
            { code: 'A', couleur: 'red; background: url(https://exemple.invalid/pixel)' },
            { code: 'B', couleur: 'var(--vert-succes)' },
            { code: 'C', couleur: 'expression(alert(1))' }
        ] });
        expect(win.couleurDuNiveau('A', 'E')).toBe('#999999');
        expect(win.couleurDuNiveau('B', 'E')).toBe('#999999');
        expect(win.couleurDuNiveau('C', 'E')).toBe('#999999');
    });

    it('la casse du code ne fait pas échouer la correspondance', () => {
        const win = chargerHelpers(ECHELLE_WXYZ);
        expect(win.couleurDuNiveau('w', 'ECH_WXYZ')).toBe('#101010');
    });
});

describe('#575 · les tables IDME et les échelles devinées ne reviennent pas', () => {

    it('les badges d\'artefacts n\'ont plus de repli IDME', () => {
        const code = sansCommentaires(lire('js/profil-etudiant-sections-affichage.js'));
        expect(code).not.toMatch(/#2196F3/);   // les quatre couleurs du repli
        expect(code).not.toMatch(/#ffc107/);
        expect(code).not.toMatch(/#ff9800/);
    });

    it('CONSTAT MESURÉ, PAS CORRIGÉ : il reste UN site qui devine l\'échelle', () => {
        // ⮕ Trouvé PAR cette sentinelle, le 27 août 2026 : le graphique de
        // progression (`genererGraphiqueProgression`) lit encore
        // `echelles.find(e => e.active) || echelles[0]` pour décrire ses zones
        // colorées, et annonce « Zones colorées basées sur l'échelle IDME par
        // défaut » quand il n'en trouve pas. Ni le plan SOLO ni l'audit du
        // 27 août ne l'avaient relevé. Il est inscrit au backlog sous #575.
        //
        // Ce test verrouille l'état connu : UNE occurrence, pas deux. Il rougit
        // si on en ajoute — et il rougit aussi le jour où on la corrige, ce qui
        // est le signal attendu.
        const code = sansCommentaires(lire('js/profil-etudiant-sections-affichage.js'));
        const restants = (code.match(/echelles\.find\(e => e\.active\)/g) || []).length;
        expect(restants).toBe(1);
        // (Le littéral porte une apostrophe échappée dans la source : on ancre
        // sur la partie stable de la phrase.)
        expect(code).toContain('Zones colorées basées sur l');
        expect(code).toContain('IDME par défaut');
    });

    it('l\'artefact transporte l\'échelle de son évaluation', () => {
        const code = sansCommentaires(lire('js/profil-etudiant-sections-affichage.js'));
        expect(code).toContain('echelleId: evaluation?.echelleId');
        expect(code).toContain('couleurDuNiveau(art.niveau, art.echelleId)');
    });

    it('les DEUX blocs de barres lisent l\'échelle des évaluations, par le MÊME calcul', () => {
        // ⚠ Il y avait DEUX exemplaires de ce calcul, à deux lignes près —
        // `_genererBarresSRPNF` (diagnostics) et `_obtenirNiveauxEtGradientSRPNF`
        // (affichage). L'audit du 27 août n'avait relevé que le premier ; le
        // second peint le bloc « Forces et défis ». C'est cette sentinelle qui a
        // trouvé le second, en rougissant sur `nom: 'Incomplet'`.
        for (const fichier of ['js/profil-etudiant-diagnostics.js',
                               'js/profil-etudiant-sections-affichage.js']) {
            const code = sansCommentaires(lire(fichier));
            expect(code).toContain('niveauxEtGradientDesEvaluations(da)');
            // ⚠ La table IDME se reconnaît à un niveau COMPLET — code, nom ET
            // plage. Chercher « Incomplet » seul rougirait sur la catégorie de
            // tampons « Incertain / Incomplet / Inexact » de `diagnostics.js`,
            // qui n'a rien à voir : une garde qui crie sur du code sain finit
            // par être désarmée.
            expect(code).not.toMatch(/code: 'I', nom: '[^']*', min: 0, max: 64/);
            expect(code).not.toMatch(/code: 'M', nom: 'Maîtrisé', min: 75/);
            expect(code).not.toMatch(/code: 'E', nom: 'Étendu', min: 85, max: 100/);
            // Et plus aucun calcul de dégradé recopié sur place.
            expect(code).not.toMatch(/gradientStops/);
        }
        // `_obtenirNiveauxEtGradientSRPNF` n'existe plus du tout.
        expect(sansCommentaires(lire('js/profil-etudiant-sections-affichage.js')))
            .not.toMatch(/_obtenirNiveauxEtGradientSRPNF/);
    });

    it('sans échelle résolue : fond neutre et cause au survol, jamais un dégradé par défaut', () => {
        const win = chargerScript('js/profil-etudiant-helpers.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            obtenirPreference: () => null,
            obtenirDonneesSelonMode: () => [],
            obtenirEchelleResolue: () => null,
            // `obtenirEchelleCommuneDesEvaluations` vit dans
            // `profil-etudiant-calculs.js` : ici on la stubbe sur sa forme de
            // retour documentée `{ echelle, raison, message }`, celle que tout le
            // dépistage emploie depuis #542.
            obtenirEchelleCommuneDesEvaluations: () => ({
                echelle: null, raison: 'echelles-divergentes',
                message: 'Les évaluations de cet élève désignent des échelles différentes.'
            })
        });
        const sansEchelle = win.niveauxEtGradientDesEvaluations('111');
        expect(sansEchelle.niveaux).toEqual([]);
        expect(sansEchelle.gradientCSS).not.toMatch(/linear-gradient/);
        expect(sansEchelle.message).toBeTruthy();
    });

    it('le dégradé suit l\'ordre des PLAGES, pas l\'ordre de saisie', () => {
        // Rien n'oblige l'utilisateur à saisir ses niveaux dans l'ordre, et un
        // ordre de saisie n'est pas un ordre de mérite.
        const win = chargerScript('js/profil-etudiant-helpers.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            obtenirPreference: () => null,
            obtenirDonneesSelonMode: () => [],
            obtenirEchelleResolue: () => null,
            obtenirEchelleCommuneDesEvaluations: () => ({ raison: null, message: '', echelle: { id: 'E1', niveaux: [
                { code: 'Z', nom: 'haut', min: 90, max: 100, couleur: '#333333' },
                { code: 'W', nom: 'bas',  min: 0,  max: 89,  couleur: '#111111' }
            ] } })
        });
        const lu = win.niveauxEtGradientDesEvaluations('111');
        expect(lu.niveaux.map(n => n.code)).toEqual(['W', 'Z']);
        expect(lu.gradientCSS.indexOf('#111111')).toBeLessThan(lu.gradientCSS.indexOf('#333333'));
    });

    it('le filtre de couleur est partagé, plus enfermé dans une fermeture', () => {
        const helpers = sansCommentaires(lire('js/profil-etudiant-helpers.js'));
        expect(helpers).toContain('function couleurCssSure');
        expect(helpers).toContain('window.couleurCssSure');
        // Les deux consommateurs le prennent au lieu d'en écrire une copie.
        expect(sansCommentaires(lire('js/profil-etudiant-sections-affichage.js')))
            .toContain('const couleurSure = couleurCssSure;');
        // `diagnostics.js` ne filtre plus lui-même : il prend le dégradé déjà
        // construit — donc déjà filtré — par le helper partagé.
        expect(sansCommentaires(lire('js/profil-etudiant-helpers.js')))
            .toContain('couleur: couleurCssSure(n.couleur)');
    });
});
