import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #576 — LE BILAN LIT L'ÉVALUATION ENREGISTRÉE QUAND LA GRILLE
// D'ORIGINE A DISPARU.
//
// CE QUI SE PASSAIT, sur les données réelles d'H2026 de Grégoire (porte terrain
// 2.6 du 28 août 2026, captures des artefacts 8 et 10) : quand la grille n'est
// plus dans `grillesTemplates`, `_chargerGrilleDefBilan` rend `null`,
// `_collecterCriteresBilan` rendait `[]`, et TOUT le bilan personnalisé
// disparaissait en cascade — `defis` vide, `tousMaitrises` faux (il exige
// `criteres.length > 0`), `_rendreForceBilan` sans matière. L'écran affichait
// « Présentement, il faut se concentrer sur : » puis RIEN, et sautait aux jetons.
//
// ⮕ Le défaut n'était pas une absence de donnée : l'évaluation ENREGISTRÉE porte
// ses critères AVEC leur nom, et le panneau d'à côté les lisait déjà — sous la
// bannière « Grille d'origine introuvable dans les modèles actuels — affichage
// depuis les données sauvegardées ». Le bilan n'avait jamais eu ce repli.
//
// ⚠ CE QUE CETTE SENTINELLE VERROUILLE AUSSI, et qui est facile à casser sans
// s'en rendre compte : le bilan ne doit porter AUCUNE note technique. Son
// `textContent` est copié tel quel dans ce qui est remis à l'élève
// (`copierToutRetroaction`, section « === BILAN === »).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const retroaction = readFileSync(path.join(racine, 'js/evaluation-retroaction.js'), 'utf8');

// L'échelle de Grégoire, telle que ses captures la montrent : « IDME et niv 0 ».
const ECHELLE = {
    id: 'ECH_IDME_NIV0_RESTAUREE',
    nom: 'IDME et niv 0 (restaurée)',
    // #555 lot 2 — les deux repères que Grégoire a posés le 28 août. Sans eux,
    // `zoneDuNiveau` rend `null` et le bilan ne conclut plus rien.
    seuilSuffisance: 'D',
    seuilMaitrise: 'M',
    niveaux: [
        { code: '0', nom: 'Non recevable', min: 0, max: 0, valeurCalcul: 0 },
        { code: 'I', nom: 'Incomplet ou insuffisant', min: 1, max: 64, valeurCalcul: 50 },
        { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 70 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 80 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92 }
    ]
};

// L'évaluation ENREGISTRÉE de l'artefact 8 (capture du 28 août) : la grille
// `GR_DISPARUE` n'existe plus, mais les noms des critères ont survécu ici.
const EVAL_ENREGISTREE = {
    id: 'EVAL_A8',
    etudiantDA: 'DA256',
    productionId: 'PROD_A8',
    grilleId: 'GR_DISPARUE',
    echelleId: ECHELLE.id,
    dateEvaluation: '2026-04-10',
    productionNom: 'Artefact 8',
    criteres: [
        { critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'M' },
        { critereId: 'c2', critereNom: 'Rigueur', niveauSelectionne: 'M' },
        { critereId: 'c3', critereNom: 'Plausibilité', niveauSelectionne: 'D' },
        { critereId: 'c4', critereNom: 'Nuance', niveauSelectionne: 'D' }
    ]
};

// Ce que le formulaire a sous les yeux : les mêmes critères, par identifiant.
const EN_COURS = {
    etudiantDA: 'DA256',
    productionId: 'PROD_A8',
    grilleId: 'GR_DISPARUE',
    echelleId: ECHELLE.id,
    idModification: 'EVAL_A8',
    // ⚠ « I », pas « D », depuis #555 lot 2 — ET C'EST ICI QUE ÇA COMPTE.
    // Le bilan lit les niveaux du FORMULAIRE en cours (`ec.criteres`), pas ceux
    // de l'évaluation enregistrée : c'est justement ce que vérifie le cas
    // « prend le niveau du FORMULAIRE ». Avec les repères de Grégoire (suffisant
    // à partir de D), un critère en « D » n'est plus une PRIORITÉ mais un
    // SIGNALÉ, et il sort de « présentement, il faut se concentrer sur ».
    // Ce banc porte sur le NOMMAGE des critères quand la grille a disparu, pas
    // sur leur zone : « I » garde son objet intact.
    criteres: { c1: 'M', c2: 'M', c3: 'I', c4: 'I' }
};

function faireElements() {
    const boite = () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {}, toggle: () => {} } });
    return {
        contenuRetroBilan: boite(),
        vueRetroGenerale: boite(),
        vueRetroSpecifique: boite(),
        vueRetroBilan: boite(),
        niveauProduction1: { textContent: 'D' }
    };
}

function chargerBilan({ grilles, evaluations, evaluationEnCours, elements }) {
    const calculs = chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? [ECHELLE] : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null,
        obtenirTypePratiqueActive: () => 'standards'
    });

    const fauxDocument = {
        addEventListener: () => {}, removeEventListener: () => {},
        querySelector: () => null, querySelectorAll: () => [],
        getElementById: (id) => elements[id] || null,
        createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} } }),
        body: { addEventListener: () => {}, appendChild: () => {}, setAttribute: () => {}, getAttribute: () => null, style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} } },
        documentElement: { addEventListener: () => {} }
    };

    // #581 — le bilan lit ses phrases dans le registre d'énoncés. On charge le
    // VRAI registre dans le sandbox AVANT le module testé, et on l'enchaîne par
    // le 3e paramètre : un stub testerait des phrases inventées pour le banc.
    const wEnonces581 = chargerScript('js/evaluation-enonces.js');
    // #940 — le bilan lit sa règle (ligne d'un critère, récurrences, historique) dans le vrai module.
    chargerScript('js/synthese-retroaction-data.js', {}, wEnonces581);
    const w = chargerScript('js/evaluation-retroaction.js', {
        document: fauxDocument,
        db: {
            getSync: (k, d) => {
                if (String(k).indexOf('echellesTemplates') !== -1) return [ECHELLE];
                if (String(k).indexOf('grillesTemplates') !== -1) return grilles;
                return d !== undefined ? d : null;
            },
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? evaluations : []),
        echapperHtml: (t) => (t == null ? '' : String(t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue,
        zoneDuNiveau: calculs.zoneDuNiveau,
        echellesComparables: calculs.echellesComparables
    }, wEnonces581);
    w.evaluationEnCours = evaluationEnCours;
    return w;
}

describe('#576 — le bilan survit à la disparition de la grille d\'origine', () => {

    it('nomme les critères depuis l\'évaluation enregistrée quand la grille a disparu', () => {
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [],                       // la grille GR_DISPARUE n'est plus là
            evaluations: [EVAL_ENREGISTREE],
            evaluationEnCours: EN_COURS,
            elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;

        // Les deux défis (Plausibilité D, Nuance D) sont nommés…
        expect(rendu).toContain('Plausibilité');
        expect(rendu).toContain('Nuance');
        // …avec le nom que l'échelle donne au niveau, pas un libellé du code.
        expect(rendu).toContain('Incomplet ou insuffisant');
        // …et la force (Structure ou Rigueur, tous deux M) apparaît.
        expect(rendu).toContain('Ta force :');
        expect(rendu).toContain('Maîtrisé');
    });

    it('ne dit plus « rien » : le titre n\'est plus suivi du vide', () => {
        // C'est le symptôme exact de la capture du 28 août.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [], evaluations: [EVAL_ENREGISTREE], evaluationEnCours: EN_COURS, elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        const titre = 'Présentement, il faut se concentrer sur :</h5>';
        const apresTitre = rendu.slice(rendu.indexOf(titre) + titre.length);
        // Après le titre, il y a autre chose que le bloc des jetons.
        expect(apresTitre.indexOf('<p>')).toBeGreaterThanOrEqual(0);
        expect(apresTitre.slice(0, apresTitre.indexOf('Jetons utilisés'))).toContain('Plausibilité');
    });

    it('préfère la GRILLE quand elle est là — le repli ne prend pas sa place', () => {
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [{
                id: 'GR_DISPARUE',
                criteres: [
                    { id: 'c3', nom: 'Plausibilité (libellé de la grille)', description: 'la cohérence logique' }
                ]
            }],
            evaluations: [EVAL_ENREGISTREE],
            evaluationEnCours: EN_COURS,
            elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        expect(rendu).toContain('Plausibilité (libellé de la grille)');
        // La description de la grille est employée à la place du nom seul.
        expect(rendu).toContain('la cohérence logique');
    });

    it('replie aussi quand la grille EXISTE mais qu\'aucun identifiant ne correspond', () => {
        // Critères recréés : la grille est là, ses ids ne sont plus ceux de
        // l'évaluation. Même symptôme, donc même remède.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [{ id: 'GR_DISPARUE', criteres: [{ id: 'zz9', nom: 'Critère recréé' }] }],
            evaluations: [EVAL_ENREGISTREE],
            evaluationEnCours: EN_COURS,
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Plausibilité');
    });

    it('prend le niveau du FORMULAIRE, pas celui qui est enregistré', () => {
        // L'enseignant·e vient de faire passer Nuance de D à M sans enregistrer.
        // Le bilan doit refléter l'écran, sinon il ment sur ce qu'il montre.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [],
            evaluations: [EVAL_ENREGISTREE],
            evaluationEnCours: Object.assign({}, EN_COURS, { criteres: { c1: 'M', c2: 'M', c3: 'M', c4: 'M' } }),
            elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        // Tous à M : plus aucun défi, et le message « tous maîtrisés » apparaît.
        expect(rendu).toContain('Tous les critères sont maîtrisés');
        expect(rendu).not.toContain('Ta force :');
    });

    it('le dit à l\'élève quand il n\'y a vraiment aucun critère, au lieu de se taire', () => {
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [],
            evaluations: [],                                    // rien d'enregistré non plus
            evaluationEnCours: Object.assign({}, EN_COURS, { idModification: null, criteres: {} }),
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Aucun critère n\'est encore évalué');
    });

    it('n\'écrit AUCUNE note technique dans le bilan — il part chez l\'élève', () => {
        // `copierToutRetroaction` copie le textContent de ce bloc sous
        // « === BILAN === ». Un message d'anomalie partirait avec.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [], evaluations: [EVAL_ENREGISTREE], evaluationEnCours: EN_COURS, elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        expect(rendu).not.toMatch(/introuvable/i);
        expect(rendu).not.toMatch(/grille/i);
        expect(rendu).not.toMatch(/données sauvegardées/i);
        expect(rendu).not.toMatch(/erreur|anomalie|#576/i);
    });

    it('le nom d\'un critère enregistré est échappé — il vient de l\'utilisateur', () => {
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [],
            evaluations: [Object.assign({}, EVAL_ENREGISTREE, {
                criteres: [{ critereId: 'c3', critereNom: '<img src=x onerror=alert(1)>', niveauSelectionne: 'D' }]
            })],
            evaluationEnCours: Object.assign({}, EN_COURS, { criteres: { c3: 'I' } }),
            elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        expect(rendu).not.toContain('<img src=x');
        expect(rendu).toContain('&lt;img src=x');
    });

    it('se rabat sur le couple élève + production quand l\'identifiant de modification manque', () => {
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [],
            evaluations: [EVAL_ENREGISTREE],
            evaluationEnCours: Object.assign({}, EN_COURS, { idModification: null }),
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Plausibilité');
    });

    it('écarte une évaluation remplacée par une reprise', () => {
        // Même règle que partout ailleurs dans ce module : une remplacée porte
        // l'état d'AVANT la reprise.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [],
            evaluations: [Object.assign({}, EVAL_ENREGISTREE, { remplaceeParId: 'EVAL_A8_BIS' })],
            evaluationEnCours: Object.assign({}, EN_COURS, { idModification: null }),
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Aucun critère n\'est encore évalué');
    });

    it('n\'écrit le nom du critère qu\'UNE fois quand il n\'y a pas de description', () => {
        // Le repli ne fournit aucune description : la ligne retombait sur le
        // nom, puis le répétait entre parenthèses — « Plausibilité
        // (Plausibilité Incomplet ou insuffisant) ». Vu en RENDANT le bilan, pas en le
        // testant : les assertions cherchaient la présence des mots, pas leur
        // nombre. Ce texte part chez l'élève ; il doit se lire.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [], evaluations: [EVAL_ENREGISTREE], evaluationEnCours: EN_COURS, elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        expect(rendu).not.toContain('Plausibilité (Plausibilité');
        expect(rendu).toContain('Plausibilité (Incomplet ou insuffisant)');
        // Le nom n'apparaît qu'une fois dans sa ligne.
        const ligne = rendu.split('<p>').find((b) => b.indexOf('Plausibilité') >= 0) || '';
        expect(ligne.split('Plausibilité').length - 1).toBe(1);
    });

    it('garde la description de la GRILLE en tête quand elle existe', () => {
        // #940 — le chemin normal : « Critère (Niveau) : définition », la définition telle qu'écrite.
        const elements = faireElements();
        const w = chargerBilan({
            grilles: [{ id: 'GR_DISPARUE', criteres: [{ id: 'c3', nom: 'Plausibilité', description: 'La cohérence logique' }] }],
            evaluations: [EVAL_ENREGISTREE],
            // « I » : ce cas veut un critère PRIORITAIRE pour vérifier le format
            // « Critère (Niveau) : définition » (#940). Voir la note sur `EN_COURS`.
            evaluationEnCours: Object.assign({}, EN_COURS, { criteres: { c3: 'I' } }),
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Plausibilité (Incomplet ou insuffisant) : La cohérence logique');
    });

    it('le repli est branché sur le chemin vivant, pas seulement défini', () => {
        const code = retroaction
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');
        expect(code).toMatch(/_collecterCriteresBilan\(grilleDef,\s*ec,\s*evalEnregistree\)/);
        expect(code).toMatch(/_chargerEvaluationEnregistreeBilan\(ec\)/);
    });
});
