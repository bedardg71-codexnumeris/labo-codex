import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #555 LOT 2 — LE BILAN À L'ÉCRAN LIT LES REPÈRES, PAS LES LETTRES.
//
// `evaluation-retroaction.js` testait les codes EN TOUTES LETTRES à sept
// endroits (dix-huit comparaisons). `zoneDuNiveau` les remplace toutes.
//
// ⚠⚠ CE FICHIER EXISTE PARCE QUE LE BREAK-TEST L'A EXIGÉ. Après le branchement,
// SEPT mutations sur dix restaient VERTES : les bancs #575 et #576 couvrent
// l'ORDRE et le NOMMAGE, pas les zones. Un module peut être entièrement
// rebranché sans qu'une seule sentinelle s'en aperçoive.
//
// ⚠ LA COHÉRENCE AVEC LE PDF EST OBLIGATOIRE, pas souhaitable :
// `copierToutRetroaction` copie le `textContent` de ce bilan sous
// « === BILAN === » dans ce qui est remis à l'élève. Les règles éprouvées ici
// sont les mêmes que celles de `sentinelle-575-b10-ordre-synthese-pdf`.

/* ------------------------------------------------------------------ harnais */

// Les lettres de Grégoire dans un AUTRE ordre : « E » (Émergent) est le plus
// faible, « I » (Intégré) le plus fort. Une table en dur et une lecture de
// repères donnent ici des réponses OPPOSÉES.
const RENVERSEE = {
    id: 'ECH_RENV', nom: 'Émergent → Intégré',
    seuilSuffisance: 'D', seuilMaitrise: 'I',
    niveaux: [
        { code: 'E', nom: 'Émergent',  min: 0,  max: 59,  valeurCalcul: 40 },
        { code: 'M', nom: 'Mobilisé',  min: 60, max: 74,  valeurCalcul: 67 },
        { code: 'D', nom: 'Développé', min: 75, max: 84,  valeurCalcul: 80 },
        { code: 'I', nom: 'Intégré',   min: 85, max: 100, valeurCalcul: 95 }
    ]
};

// Mêmes codes, repères différents : le seul montage qui distingue « lu dans son
// échelle » de « lu dans l'échelle courante ».
const INDULGENTE = {
    id: 'ECH_INDULGENTE', nom: 'Acquis dès X', seuilMaitrise: 'X',
    niveaux: [
        { code: 'W', nom: 'Amorce', min: 0, max: 49, valeurCalcul: 30 },
        { code: 'X', nom: 'Milieu', min: 50, max: 79, valeurCalcul: 65 },
        { code: 'Y', nom: 'Haut', min: 80, max: 100, valeurCalcul: 90 }
    ]
};
const EXIGEANTE = {
    id: 'ECH_EXIGEANTE', nom: 'Acquis dès Y', seuilMaitrise: 'Y',
    niveaux: INDULGENTE.niveaux
};
const SANS_REPERES = {
    id: 'ECH_MUETTE', nom: 'Sans repères',
    niveaux: INDULGENTE.niveaux
};

const GRILLE = {
    id: 'GR1',
    criteres: [
        { id: 'c1', nom: 'Démarche', description: '' },
        { id: 'c2', nom: 'Calculs', description: '' }
    ]
};

function faireElements(niveauCourant) {
    const boite = () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {}, toggle: () => {} } });
    return {
        contenuRetroBilan: boite(), contenuRetroSpecifique: boite(),
        // ⚠ `vueRetroGenerale` EST OBLIGATOIRE : `basculerVueRetroaction` sort
        // immédiatement si l'une des trois vues manque. Sans elle, le rendu
        // restait VIDE et deux cas passaient par vacuité — un `not.toContain`
        // est satisfait par une chaîne vide. Trouvé en écrivant ce fichier.
        vueRetroGenerale: boite(), vueRetroSpecifique: boite(), vueRetroBilan: boite(),
        niveauProduction1: { textContent: niveauCourant || '' }
    };
}

function chargerCalculs(echelles) {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? echelles : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
}

function chargerBilan({ echelles, evaluationEnCours, historique = [], elements, grille }) {
    const grilleLue = grille || GRILLE;
    const calculs = chargerCalculs(echelles);
    const fauxDocument = {
        addEventListener: () => {}, removeEventListener: () => {},
        querySelector: () => null, querySelectorAll: () => [],
        getElementById: (id) => elements[id] || null,
        createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {}, classList: { add: () => {}, remove: () => {} } }),
        body: { addEventListener: () => {}, appendChild: () => {}, setAttribute: () => {}, getAttribute: () => null, style: {}, classList: { add: () => {}, remove: () => {} } },
        documentElement: { addEventListener: () => {} }
    };
    // #581 — le bilan lit ses phrases dans le registre d'énoncés. On charge le
    // VRAI registre dans le sandbox AVANT le module testé, et on l'enchaîne par
    // le 3e paramètre : un stub testerait des phrases inventées pour le banc.
    const wEnonces581 = chargerScript('js/evaluation-enonces.js');
    const w = chargerScript('js/evaluation-retroaction.js', {
        document: fauxDocument,
        db: {
            getSync: (k, d) => {
                if (String(k).indexOf('echellesTemplates') !== -1) return echelles;
                if (String(k).indexOf('grillesTemplates') !== -1) return [grilleLue];
                return d !== undefined ? d : null;
            },
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => historique,
        // La VRAIE règle d'échappement du projet : la stubber en identité
        // rendrait le banc aveugle à ce qu'il mesure.
        echapperHtml: (t) => (t == null ? '' : String(t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        zoneDuNiveau: calculs.zoneDuNiveau,
        echellesComparables: calculs.echellesComparables,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue
    }, wEnonces581);
    w.evaluationEnCours = evaluationEnCours;
    return w;
}

const rendu = (w, elements) => { w.basculerVueRetroaction('bilan'); return elements.contenuRetroBilan.innerHTML; };
const evalDe = (echelleId, criteres, extra) =>
    Object.assign({ etudiantDA: 'DA1', grilleId: 'GR1', echelleId, criteres }, extra || {});

describe('#555 lot 2 · le bilan à l\'écran lit les repères de l\'échelle', () => {

    // ── « TA FORCE » ─────────────────────────────────────────────────────────

    it('« ta force » exige un ACQUIS, pas seulement le moins faible', () => {
        // « D » (Développé) est le meilleur des deux, mais il est SIGNALÉ :
        // réel, non durable. L'annoncer comme une force dirait à l'élève qu'il
        // peut s'en détourner.
        const elements = faireElements('D');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'E', c2: 'D' })
        }), elements);
        expect(html).not.toContain('Ta force');
    });

    it('« ta force » s\'affiche quand le meilleur est acquis', () => {
        const elements = faireElements('I');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'E', c2: 'I' })
        }), elements);
        expect(html).toContain('Ta force : Calculs');
        expect(html).toContain('Intégré');
    });

    it('« ta force » se dit AUSSI quand il ne reste que des signalés', () => {
        // ⚠ TROUVÉ PAR UNE SPEC WEBKIT, Vitest restant vert. La condition
        // d'origine exigeait `defis.length > 0` — sans rien à côté, « tous les
        // critères sont maîtrisés » dit déjà tout. Mais depuis les trois zones,
        // un élève peut n'avoir AUCUNE priorité tout en ayant des acquis en
        // développement : sa force disparaissait alors du bilan.
        const elements = faireElements('I');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'D', c2: 'I' })
        }), elements);
        expect(html).toContain('Ta force : Calculs');
        expect(html).toContain('Acquis en développement, à consolider');
    });

    it('la zone intermédiaire s\'affiche AUSSI dans le bilan à l\'écran', () => {
        // ⚠ Le lot 2 l'avait d'abord ajoutée au seul PDF. Or
        // `copierToutRetroaction` copie CE bilan dans ce qui est remis à
        // l'élève : les deux documents doivent dire la même chose du même
        // critère. Sans elle, le titre « Présentement, il faut se concentrer
        // sur » restait suivi du VIDE — le symptôme exact de la porte 2.6.
        const elements = faireElements('D');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'D', c2: 'D' })
        }), elements);
        expect(html).toContain('Acquis en développement, à consolider');
        expect(html).toContain('Démarche');
        expect(html).toContain('Développé');
        // Aucune note technique : ce texte part chez l'élève.
        expect(html).not.toMatch(/introuvable|anomalie|repère/i);
    });

    it('priorités ET signalés cohabitent : les deux sections s\'affichent', () => {
        // ⚠ Cas trouvé par le break-test : neutraliser le rendu des signalés
        // DANS la branche des défis laissait la sentinelle verte, parce que tous
        // les cas n'avaient qu'une des deux zones à la fois. C'est pourtant la
        // situation la plus courante d'un vrai bilan.
        const elements = faireElements('D');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'E', c2: 'D' })
        }), elements);
        expect(html).toContain('Présentement, il faut se concentrer sur');
        expect(html).toContain('Démarche');          // E = priorité
        expect(html).toContain('Acquis en développement, à consolider');
        expect(html).toContain('Calculs');           // D = signalé
    });

    it('le nom d\'un critère SIGNALÉ est échappé lui aussi', () => {
        // Même règle, autre section : les deux listes traversent un `innerHTML`.
        const grilleHostile = {
            id: 'GR1',
            criteres: [{ id: 'c1', nom: '<img src=x onerror=alert(1)>', description: '' }]
        };
        const elements = faireElements('D');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements, grille: grilleHostile,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'D' })
        }), elements);
        expect(html).toContain('Acquis en développement');
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img src=x');
    });

    // ── LES DEUX NATURES DE PROGRÈS ──────────────────────────────────────────

    it('« avant ≠ acquis » : un SIGNALÉ devenu acquis est un progrès', () => {
        // ⚠ Traduire le côté gauche par « = priorité » supprimerait ce cas —
        // sur l'échelle de Grégoire, c'est D → M. Régression commise le 28 août
        // dans le module jumeau, et qui ne doit pas se reproduire ici.
        const elements = faireElements('I');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'I' }),
            historique: [evalDe('ECH_RENV', null, {
                dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: 'D',
                criteres: [{ critereNom: 'Démarche', niveauSelectionne: 'D' }]
            })]
        }), elements);
        expect(html).toContain('Tu as progressé en Démarche');
    });

    it('« priorité → signalé » reçoit SA phrase, pas celle de l\'acquis', () => {
        // Décision de Grégoire, 28 août : le passage le plus difficile est
        // reconnu, sa fragilité aussi. Ses mots.
        const elements = faireElements('D');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'D' }),
            historique: [evalDe('ECH_RENV', null, {
                dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: 'E',
                criteres: [{ critereNom: 'Démarche', niveauSelectionne: 'E' }]
            })]
        }), elements);
        expect(html).toContain('beaux progrès');
        expect(html).toContain('consolider');
        expect(html).not.toContain('Tu as progressé en');
    });

    it('un état antérieur INCONNU n\'est pas « non acquis » : rien n\'est annoncé', () => {
        // Le cas de TOUTE évaluation antérieure à la pose des repères. Sans la
        // garde, `null !== 'acquis'` annoncerait un progrès jamais mesuré.
        const elements = faireElements('Y');
        const html = rendu(chargerBilan({
            echelles: [INDULGENTE, SANS_REPERES], elements,
            evaluationEnCours: evalDe('ECH_INDULGENTE', { c1: 'Y' }),
            historique: [evalDe('ECH_MUETTE', null, {
                dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: 'W',
                criteres: [{ critereNom: 'Démarche', niveauSelectionne: 'W' }]
            })]
        }), elements);
        expect(html).not.toContain('Tu as progressé');
        expect(html).not.toContain('beaux progrès');
    });

    it('l\'état ANTÉRIEUR est lu dans l\'échelle de l\'époque', () => {
        // « X » est acquis sous l'indulgente et ne l'est pas sous l'exigeante.
        // Lire le passé au présent effacerait ce progrès.
        const elements = faireElements('Y');
        const html = rendu(chargerBilan({
            echelles: [INDULGENTE, EXIGEANTE], elements,
            evaluationEnCours: evalDe('ECH_INDULGENTE', { c1: 'Y' }),
            historique: [evalDe('ECH_EXIGEANTE', null, {
                dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: 'X',
                criteres: [{ critereNom: 'Démarche', niveauSelectionne: 'X' }]
            })]
        }), elements);
        expect(html).toContain('Tu as progressé en Démarche');
    });

    it('« maîtrisés depuis plus d\'une production » lit le passé dans SON échelle', () => {
        // ⚠ MONTAGE CHOISI POUR ÊTRE DISTINGUABLE, et il a fallu un break-test
        // pour s'en apercevoir. Avec DEUX échelles au store, lire le passé avec
        // `null` faisait échouer la résolution (elle refuse de deviner entre
        // deux) : la mutation rendait le même résultat que le code juste, et le
        // cas ne prouvait rien. Ici l'échelle du passé est ABSENTE du store —
        // une évaluation qui désigne une échelle disparue, cas ordinaire chez
        // Grégoire — pendant qu'une seule échelle reste résoluble sans
        // désignation. Les deux branches divergent alors.
        const elements = faireElements('X');
        const html = rendu(chargerBilan({
            echelles: [INDULGENTE], elements,
            evaluationEnCours: evalDe('ECH_INDULGENTE', { c1: 'X', c2: 'X' }),
            historique: [evalDe('ECH_DISPARUE', null, {
                dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: 'X',
                criteres: [{ critereNom: 'Démarche', niveauSelectionne: 'X' },
                           { critereNom: 'Calculs', niveauSelectionne: 'X' }]
            })]
        }), elements);
        // L'échelle du passé ne se résout pas : on ne SAIT PAS s'il maîtrisait
        // déjà, donc on ne l'affirme pas.
        expect(html).toContain('Continue sur cette lancée');
        expect(html).not.toContain('depuis plus d');
    });

    // ── LES OBJECTIFS RÉCURRENTS ─────────────────────────────────────────────

    it('« prioritaire depuis 3 productions » lit CHAQUE évaluation dans son échelle', () => {
        // ⚠ Cas ajouté après un break-test resté vert. Sous l'EXIGEANTE, « X »
        // était une priorité ; sous l'INDULGENTE d'aujourd'hui, il serait acquis.
        // Lire l'historique au présent effacerait un objectif réellement
        // récurrent — ou en inventerait un.
        const passe = (id) => evalDe(id, null, {
            dateEvaluation: '2026-04-01', productionNom: 'Labo', niveauFinal: 'X',
            criteres: [{ critereNom: 'Démarche', niveauSelectionne: 'X' }]
        });
        const elements = faireElements('W');
        const html = rendu(chargerBilan({
            echelles: [INDULGENTE, EXIGEANTE], elements,
            evaluationEnCours: evalDe('ECH_INDULGENTE', { c1: 'W' }),
            historique: [passe('ECH_EXIGEANTE'), passe('ECH_EXIGEANTE')]
        }), elements);

        expect(html).toContain('prioritaire depuis 3 productions');
    });

    // ── SÉCURITÉ ─────────────────────────────────────────────────────────────

    it('les noms de critères des deux phrases sont ÉCHAPPÉS', () => {
        // Ils viennent de l'utilisateur et traversent un `innerHTML`. La version
        // d'avant #555 les concaténait bruts — sans conséquence tant que la
        // liste venait de comparaisons de lettres, mais la règle n° 1 du projet
        // ne souffre pas d'exception.
        const grilleHostile = {
            id: 'GR1',
            criteres: [{ id: 'c1', nom: '<img src=x onerror=alert(1)>', description: '' }]
        };
        const elements = faireElements('I');
        const html = rendu(chargerBilan({
            echelles: [RENVERSEE], elements, grille: grilleHostile,
            evaluationEnCours: evalDe('ECH_RENV', { c1: 'I' }),
            historique: [evalDe('ECH_RENV', null, {
                dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: 'E',
                criteres: [{ critereNom: '<img src=x onerror=alert(1)>', niveauSelectionne: 'E' }]
            })]
        }), elements);
        expect(html).toContain('Tu as progressé en');
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img src=x');
    });
});
