import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #575 (lot 4 du plan SOLO) — L'ORDRE DES NIVEAUX SE DÉRIVE DE
// L'ÉCHELLE. Il ne s'écrit plus dans le code, et il ne se devine pas.
//
// CE QUI EXISTAIT AVANT — deux tables IDME, dans deux modules, en ordres
// opposés, sur des chemins tous les deux RENDUS à l'écran :
//
//   · `liste-evaluations.js` — `{ I:1, D:2, M:3, E:4, '-':5 }`, tri de la
//     colonne « Niveau » (en-tête cliquable, `index.html`
//     `data-param="niveauIDME"`). Hors IDME, `?? 5` rendait le MÊME rang à
//     toutes les lignes : cliquer sur l'en-tête ne triait rien, en silence.
//   · `evaluation-retroaction.js` — `{ E:4, M:3, D:2, I:1 }` et
//     `{ E:'Étendu', … }`, bilan de rétroaction remis à l'élève. Hors IDME, le
//     libellé était VIDE et le rang valait 0 pour tout le monde : la ligne
//     « Progrès : X → Y » ne pouvait jamais s'afficher.
//
// ⮕ LE GESTE : un seul lecteur, `niveauxOrdonnesDeLEchelle` /
// `niveauDuCodeDansEchelle` (`profil-etudiant-calculs.js`), qui résout par le
// chemin unique de #542 lot 3 et classe par la BORNE INFÉRIEURE des plages.
//
// ⚠ CE QUE CETTE SENTINELLE NE COUVRE PAS, ET C'EST VOULU : les huit
// comparaisons littérales `=== 'I'/'D'` (défis) et `=== 'M'/'E'` (maîtrisés)
// qui restent dans `evaluation-retroaction.js`. L'ORDRE se dérive d'une
// échelle ; « faible » et « maîtrisé », non — c'est #555, la marque de
// maîtrise. Un test qui les verrouillerait ici figerait le mauvais objet.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// ⚠ Les commentaires sont RETIRÉS avant toute assertion de source : ceux du
// correctif CITENT les tables retirées (« _ORDRE_NIV_BILAN = { E:4, … } »),
// et une assertion qui les lit est satisfaite par sa propre documentation.
// C'est le défaut tautologique de `feedback-assertion-statique-filtrer-commentaires`.
function sansCommentaires(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
        .join('\n');
}

const listeEvaluations = readFileSync(path.join(racine, 'js/liste-evaluations.js'), 'utf8');
const retroaction = readFileSync(path.join(racine, 'js/evaluation-retroaction.js'), 'utf8');
const indexHtml = readFileSync(path.join(racine, 'index.html'), 'utf8');

// Une échelle qui n'a RIEN d'IDME : cinq niveaux (l'IDME en a quatre), des
// codes étrangers, et — le point du banc — SAISIE DANS LE DÉSORDRE. C'est ce
// désordre qui distingue « je lis l'échelle » de « je lis l'ordre de saisie ».
const ECHELLE_JAUNE = {
    id: 'ECH_JAUNE',
    nom: 'Cotation par paliers',
    // #555 lot 2 — P1 et P2 sont des priorités, P3 est signalé, P4 est acquis.
    // (P0 « Suspendu » reste sous tout : c'est le jugement suspendu.)
    seuilSuffisance: 'P3',
    seuilMaitrise: 'P4',
    niveaux: [
        { code: 'P3', nom: 'Palier 3', min: 70, max: 84, valeurCalcul: 78 },
        { code: 'P1', nom: 'Palier 1', min: 0, max: 49, valeurCalcul: 30 },
        { code: 'P4', nom: 'Palier 4', min: 85, max: 100, valeurCalcul: 92 },
        { code: 'P0', nom: 'Suspendu', min: 0, max: 0, valeurCalcul: 0 },
        { code: 'P2', nom: 'Palier 2', min: 50, max: 69, valeurCalcul: 60 }
    ]
};

// Une SECONDE échelle, pour prouver qu'on ne compare pas deux rangs qui ne
// viennent pas du même barème.
const ECHELLE_BLEUE = {
    id: 'ECH_BLEUE',
    nom: 'Cotation A-B-C',
    niveaux: [
        { code: 'A', nom: 'Amorce', min: 0, max: 59, valeurCalcul: 40 },
        { code: 'B', nom: 'Bien', min: 60, max: 79, valeurCalcul: 70 },
        { code: 'C', nom: 'Confirmé', min: 80, max: 100, valeurCalcul: 90 }
    ]
};

// ⚠⚠ CODES JUMEAUX, PLAGES DIFFÉRENTES. Sans elle, le test « aucun progrès
// entre deux échelles » passait pour la MAUVAISE raison : le code de
// l'évaluation précédente était simplement introuvable dans l'échelle courante,
// et la garde « même échelle » ne servait à rien. Ici « P1 » existe des deux
// côtés, à deux rangs différents : seule la garde empêche de les comparer.
const ECHELLE_JUMELLE = {
    id: 'ECH_JUMELLE',
    nom: 'Paliers d\'un autre cours',
    niveaux: [
        { code: 'P1', nom: 'Premier', min: 0, max: 59, valeurCalcul: 40 },
        { code: 'P2', nom: 'Second', min: 60, max: 100, valeurCalcul: 80 }
    ]
};

// Une échelle qui emploie les codes « I », « M » et « E » — c'est permis — mais
// avec les NOMS de l'utilisateur et ses propres plages. C'est le banc qui
// distingue « je lis l'échelle » de « je connais IDME par cœur ».
const ECHELLE_MIXTE = {
    id: 'ECH_MIXTE',
    nom: 'Codes familiers, noms propres',
    // #555 lot 2 — I est une priorité, M un signalé, E un acquis.
    seuilSuffisance: 'M',
    seuilMaitrise: 'E',
    niveaux: [
        { code: 'I', nom: 'Fragile', min: 0, max: 59, valeurCalcul: 40 },
        { code: 'M', nom: 'En bonne voie', min: 60, max: 84, valeurCalcul: 75 },
        { code: 'E', nom: 'Solide', min: 85, max: 100, valeurCalcul: 95 }
    ]
};

function chargerCalculs(echelles) {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? echelles : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null,
        obtenirTypePratiqueActive: () => 'standards'
    });
}

describe('#575 — le rang et le nom d\'un niveau se lisent dans son échelle', () => {

    // ── 1. LE LECTEUR PARTAGÉ ────────────────────────────────────────────────

    it('classe les niveaux par borne inférieure, PAS par ordre de saisie', () => {
        const w = chargerCalculs([ECHELLE_JAUNE]);
        const ordonnes = w.niveauxOrdonnesDeLEchelle('ECH_JAUNE');

        // L'échelle est saisie P3, P1, P4, P0, P2. Lue par les plages, elle
        // vaut P0(0-0), P1(0-49), P2, P3, P4 — et P0 passe devant P1 parce
        // qu'à borne inférieure ÉGALE, c'est la borne supérieure qui départage.
        // Le banc porte donc ce cas exprès : c'est celui des échelles
        // « IDME et niveau 0 » de Grégoire.
        expect(ordonnes.map((n) => n.code)).toEqual(['P0', 'P1', 'P2', 'P3', 'P4']);
        expect(ordonnes.map((n) => n.rang)).toEqual([1, 2, 3, 4, 5]);
    });

    it('rend le nom que l\'utilisateur a écrit, pas un libellé du code', () => {
        const w = chargerCalculs([ECHELLE_JAUNE]);
        expect(w.niveauDuCodeDansEchelle('P2', 'ECH_JAUNE').nom).toBe('Palier 2');
        expect(w.niveauDuCodeDansEchelle('P0', 'ECH_JAUNE').nom).toBe('Suspendu');
    });

    it('ne connaît AUCUN code hors de l\'échelle — « M » n\'est pas un repère universel', () => {
        const w = chargerCalculs([ECHELLE_JAUNE]);
        expect(w.niveauDuCodeDansEchelle('M', 'ECH_JAUNE')).toBeNull();
        expect(w.niveauDuCodeDansEchelle('E', 'ECH_JAUNE')).toBeNull();
        expect(w.niveauDuCodeDansEchelle('-', 'ECH_JAUNE')).toBeNull();
        expect(w.niveauDuCodeDansEchelle('', 'ECH_JAUNE')).toBeNull();
    });

    it('compare le code sans casse ni espaces, comme la table de conversion', () => {
        const w = chargerCalculs([ECHELLE_JAUNE]);
        expect(w.niveauDuCodeDansEchelle('  p3 ', 'ECH_JAUNE').rang).toBe(4);
    });

    it('écarte un niveau sans borne exploitable — une borne vide n\'est pas un plancher', () => {
        const bancal = {
            id: 'ECH_BANCAL',
            niveaux: [
                { code: 'H', nom: 'Haut', min: 80, max: 100, valeurCalcul: 90 },
                // `Number('')` vaut ZÉRO : sans le filtre, ce niveau capturerait
                // le rang 1 et décalerait tous les autres.
                { code: 'VIDE', nom: 'Sans borne', min: '', max: '', valeurCalcul: 55 },
                { code: 'L', nom: 'Bas', min: 0, max: 79, valeurCalcul: 40 }
            ]
        };
        const w = chargerCalculs([bancal]);
        const ordonnes = w.niveauxOrdonnesDeLEchelle('ECH_BANCAL');

        expect(ordonnes.map((n) => n.code)).toEqual(['L', 'H']);
        expect(w.niveauDuCodeDansEchelle('VIDE', 'ECH_BANCAL')).toBeNull();
    });

    it('ne se rabat PAS sur `valeurCalcul` : la plage et la valeur ponctuelle sont deux conversions inverses', () => {
        // Ce niveau a une valeur ponctuelle parfaitement lisible (55) mais
        // aucune borne. S'en servir pour le classer serait un SECOND chemin,
        // aux résultats parfois différents du premier (§7 bis du skill
        // `pratiques-notation`).
        const w = chargerCalculs([{
            id: 'ECH_PONCTUELLE',
            niveaux: [{ code: 'SEUL', nom: 'Seul', min: null, max: null, valeurCalcul: 55 }]
        }]);
        expect(w.niveauxOrdonnesDeLEchelle('ECH_PONCTUELLE')).toEqual([]);
    });

    it('rend un tableau vide — jamais un ordre par défaut — quand rien ne se résout', () => {
        const w = chargerCalculs([ECHELLE_JAUNE]);
        expect(w.niveauxOrdonnesDeLEchelle('ECH_DISPARUE')).toEqual([]);
        expect(w.niveauDuCodeDansEchelle('P1', 'ECH_DISPARUE')).toBeNull();
    });

    it('ne devine pas l\'échelle quand plusieurs existent et qu\'aucune n\'est désignée', () => {
        // Même refus que `obtenirEchelleResolue(null)` : deux échelles en
        // présence, aucune désignée, donc aucun ordre.
        const w = chargerCalculs([ECHELLE_JAUNE, ECHELLE_BLEUE]);
        expect(w.niveauxOrdonnesDeLEchelle(null)).toEqual([]);
        // Désignée, elle se lit.
        expect(w.niveauxOrdonnesDeLEchelle('ECH_BLEUE').map((n) => n.code)).toEqual(['A', 'B', 'C']);
    });

    // ── 2. LE TRI DE LA COLONNE « NIVEAU » (site rendu) ──────────────────────

    function chargerListe(echelles) {
        const calculs = chargerCalculs(echelles);
        return chargerScript('js/liste-evaluations.js', {
            db: {
                getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? echelles : (d !== undefined ? d : null)),
                get: async () => null, set: async () => {}, setSync: () => {}, removeSync: () => {}, keysSync: () => []
            },
            cle: (k) => 'test_' + k,
            obtenirDonneesSelonMode: () => [],
            echapperHtml: (t) => String(t == null ? '' : t),
            // Le lecteur partagé, tel que l'application le publie sur `window`.
            niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
            niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle
        });
    }

    const ligne = (nom, niveauFinal, echelleId) => ({ nom, niveauFinal, echelleId });

    it('trie la colonne « Niveau » selon l\'échelle de l\'évaluation, hors IDME', () => {
        const w = chargerListe([ECHELLE_JAUNE]);
        const lignes = [
            ligne('quatre', 'P3', 'ECH_JAUNE'),
            ligne('un', 'P0', 'ECH_JAUNE'),
            ligne('cinq', 'P4', 'ECH_JAUNE'),
            ligne('deux', 'P1', 'ECH_JAUNE'),
            ligne('trois', 'P2', 'ECH_JAUNE')
        ];

        const croissant = w._trierLignesParColonne(lignes, { colonne: 'niveauIDME', ordre: 'asc' });
        expect(croissant.map((l) => l.nom)).toEqual(['un', 'deux', 'trois', 'quatre', 'cinq']);

        const decroissant = w._trierLignesParColonne(lignes, { colonne: 'niveauIDME', ordre: 'desc' });
        expect(decroissant.map((l) => l.nom)).toEqual(['cinq', 'quatre', 'trois', 'deux', 'un']);
    });

    it('range en FIN, dans les deux sens, une ligne dont le niveau ne se lit pas', () => {
        // Avant #575, `?? 5` faisait remonter les non-évaluées EN TÊTE au tri
        // décroissant : elles passaient devant les évaluées. Une absence de
        // niveau n'est pas un niveau élevé.
        const w = chargerListe([ECHELLE_JAUNE]);
        const lignes = [
            ligne('sansNiveau', '-', null),
            ligne('haut', 'P4', 'ECH_JAUNE'),
            ligne('bas', 'P1', 'ECH_JAUNE')
        ];

        expect(w._trierLignesParColonne(lignes, { colonne: 'niveauIDME', ordre: 'asc' })
            .map((l) => l.nom)).toEqual(['bas', 'haut', 'sansNiveau']);
        expect(w._trierLignesParColonne(lignes, { colonne: 'niveauIDME', ordre: 'desc' })
            .map((l) => l.nom)).toEqual(['haut', 'bas', 'sansNiveau']);
    });

    it('classe chaque ligne dans SON échelle quand deux barèmes coexistent', () => {
        const w = chargerListe([ECHELLE_JAUNE, ECHELLE_BLEUE]);
        // P4 est le 5e de son échelle, C le 3e de la sienne. Un code étranger
        // à l'échelle désignée (« C » lu dans ECH_JAUNE) n'a aucun rang.
        const lignes = [
            ligne('jauneHaut', 'P4', 'ECH_JAUNE'),
            ligne('bleuBas', 'A', 'ECH_BLEUE'),
            ligne('codeEtranger', 'C', 'ECH_JAUNE')
        ];
        const trie = w._trierLignesParColonne(lignes, { colonne: 'niveauIDME', ordre: 'asc' });
        expect(trie[trie.length - 1].nom).toBe('codeEtranger');
        expect(trie.slice(0, 2).map((l) => l.nom)).toEqual(['bleuBas', 'jauneHaut']);
    });

    it('l\'évaluation transporte son `echelleId` jusqu\'à la ligne du tableau', () => {
        // Sans ce champ, le tri n'a aucune échelle à lire — le correctif serait
        // juste et sans effet.
        const code = sansCommentaires(listeEvaluations);
        expect(code).toMatch(/echelleId:\s*evaluation\.echelleId\s*\|\|\s*null/);
    });

    it('ne garde aucune table IDME ni aucun rang par défaut dans le tri', () => {
        const code = sansCommentaires(listeEvaluations);
        expect(code).not.toMatch(/'I':\s*1/);
        expect(code).not.toMatch(/ordreIDME/);
        expect(code).not.toMatch(/\?\?\s*5/);
    });

    it('le filtre de note codé en dur est retiré, avec sa branche de filtrage', () => {
        // Il peuplait un `<select id="filtre-note-eval">` qui n'a JAMAIS existé
        // dans `index.html` (aucun commit ne le pose) : ni le corriger ni le
        // garder n'avait de sens.
        const code = sansCommentaires(listeEvaluations);
        expect(code).not.toContain('filtre-note-eval');
        expect(code).not.toMatch(/\['I',\s*'D',\s*'M',\s*'E'\]/);
        expect(sansCommentaires(indexHtml)).not.toContain('filtre-note-eval');
    });

    it('l\'en-tête de colonne n\'annonce plus une échelle IDME à l\'utilisateur', () => {
        expect(indexHtml).toContain('data-param="niveauIDME"');
        expect(indexHtml).not.toContain('Niveau de performance IDME');
    });

    // ── 3. LE BILAN DE RÉTROACTION (site remis à l'élève) ────────────────────

    function chargerBilan({ echelles, evaluationEnCours, historique, elements, grille }) {
        const grilleLue = grille || GRILLE;
        const calculs = chargerCalculs(echelles);
        const fauxElements = elements;
        const fauxDocument = {
            addEventListener: () => {}, removeEventListener: () => {},
            querySelector: () => null, querySelectorAll: () => [],
            getElementById: (id) => fauxElements[id] || null,
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
                    if (String(k).indexOf('echellesTemplates') !== -1) return echelles;
                    if (String(k).indexOf('grillesTemplates') !== -1) return [grilleLue];
                    return d !== undefined ? d : null;
                },
                get: async () => null, set: async () => {}, setSync: () => {}
            },
            cle: (k) => 'test_' + k,
            obtenirDonneesSelonMode: () => historique,
            // La VRAIE règle d'échappement du projet (`config.js`), reproduite :
            // la stubber en identité rendrait le test aveugle à ce qu'il mesure.
            echapperHtml: (t) => (t == null ? '' : String(t)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
            niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
            niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
            zoneDuNiveau: calculs.zoneDuNiveau,
            // #575 B10 — la VRAIE garde extraite, pas un stub : une garde
            // simulée rendrait ce fichier vert sans rien prouver.
            echellesComparables: calculs.echellesComparables,
            // ⚠ Le résolveur d'échelle DOIT être injecté : la garde « même
            // échelle » l'appelle. Sans lui, elle se dégrade en « compare
            // toujours » — et le banc mesurait alors le repli, pas la règle.
            obtenirEchelleResolue: calculs.obtenirEchelleResolue
        }, wEnonces581);
        w.evaluationEnCours = evaluationEnCours;
        return w;
    }

    // Une grille dont les critères ne sont PAS ceux de Grégoire.
    const GRILLE = {
        id: 'GR1',
        criteres: [
            { id: 'c1', nom: 'Démarche', description: 'La démarche expérimentale' },
            { id: 'c2', nom: 'Calculs', description: 'La justesse des calculs' }
        ]
    };

    function faireElements() {
        const bilan = { innerHTML: '', classList: { add: () => {}, remove: () => {}, toggle: () => {} } };
        const boite = () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {}, toggle: () => {} } });
        return {
            contenuRetroBilan: bilan,
            vueRetroGenerale: boite(),
            vueRetroSpecifique: boite(),
            vueRetroBilan: boite(),
            niveauProduction1: { textContent: 'P4' }
        };
    }

    it('nomme le niveau d\'un défi avec le nom de l\'échelle, hors IDME', () => {
        const elements = faireElements();
        const w = chargerBilan({
            echelles: [ECHELLE_JAUNE],
            // ⚠ « I » et « D » restent la marque de défi (#555, hors périmètre) :
            // le banc les emploie donc, et mesure ce qui EST dérivé — le NOM.
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE', criteres: { c1: 'I', c2: 'D' } },
            historique: [],
            elements
        });
        // ⮕ CE CAS A CHANGÉ DE NATURE AVEC #555 LOT 2, ET IL EST DEVENU PLUS
        // FORT. Avant, « I » et « D » — absents de `ECHELLE_JAUNE` — passaient
        // quand même pour des défis, faute de libellé mais présents dans la
        // liste. Maintenant `zoneDuNiveau` rend `null` pour un code que
        // l'échelle ne connaît pas : il n'est classé NULLE PART.
        // ⮕ Ce qui est prouvé ici n'est plus « aucun libellé inventé » mais
        // « aucun CLASSEMENT inventé » — et le second contient le premier.
        w.basculerVueRetroaction('bilan');
        const renduEtranger = elements.contenuRetroBilan.innerHTML;
        expect(renduEtranger).not.toContain('Démarche');
        expect(renduEtranger).not.toContain('Incomplet');
        expect(renduEtranger).not.toContain('En développement');
        // #941 lot S3 (C2, 24 sept. 2026) — ATTENTE CHANGÉE, C'EST VOULU : le titre ne s'écrit plus
        // suivi de rien (il partait tel quel dans « Copier tout »). Avant : le titre restait seul.
        expect(renduEtranger).not.toContain('Présentement, il faut se concentrer sur');
    });

    it('annonce le progrès quand l\'élève monte DANS SON échelle — ce que la table IDME interdisait', () => {
        const elements = faireElements();     // niveau courant affiché : P4
        const w = chargerBilan({
            echelles: [ECHELLE_JAUNE],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE', criteres: { c1: 'P4' } },
            historique: [
                { etudiantDA: 'DA1', dateEvaluation: '2026-08-01', niveauFinal: 'P2', echelleId: 'ECH_JAUNE', productionNom: 'Labo 1', criteres: [] }
            ],
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Progrès : P2 → P4');
    });

    it('n\'annonce AUCUN progrès entre deux échelles différentes', () => {
        // Le 3e niveau d'une échelle à cinq et le 3e d'une échelle à trois ne
        // disent pas la même chose : deux rangs qui ne viennent pas du même
        // barème ne se comparent pas.
        const elements = faireElements();
        const w = chargerBilan({
            echelles: [ECHELLE_JAUNE, ECHELLE_JUMELLE],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE', criteres: { c1: 'P4' } },
            historique: [
                // « P1 » EXISTE dans l'échelle courante (rang 2, sous P4) : sans
                // la garde, un progrès serait annoncé entre deux barèmes.
                { etudiantDA: 'DA1', dateEvaluation: '2026-08-01', niveauFinal: 'P1', echelleId: 'ECH_JUMELLE', productionNom: 'Labo 1', criteres: [] }
            ],
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).not.toContain('Progrès');
    });

    it('n\'annonce aucun progrès quand le niveau a BAISSÉ dans la même échelle', () => {
        const elements = faireElements();
        elements.niveauProduction1.textContent = 'P1';
        const w = chargerBilan({
            echelles: [ECHELLE_JAUNE],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE', criteres: { c1: 'P1' } },
            historique: [
                { etudiantDA: 'DA1', dateEvaluation: '2026-08-01', niveauFinal: 'P4', echelleId: 'ECH_JAUNE', productionNom: 'Labo 1', criteres: [] }
            ],
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).not.toContain('Progrès');
    });

    it('nomme la force avec le nom de l\'utilisateur, jamais avec le libellé IDME', () => {
        // Codes « I » et « E » — les mêmes lettres qu'IDME — mais l'échelle les
        // nomme « Fragile » et « Solide ». La table retirée aurait écrit
        // « Étendu », un mot que l'utilisateur n'a jamais saisi.
        const elements = faireElements();
        const w = chargerBilan({
            echelles: [ECHELLE_MIXTE],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_MIXTE', criteres: { c1: 'I', c2: 'E' } },
            historique: [],
            elements
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        expect(rendu).toContain('Ta force : Calculs (Solide)');
        expect(rendu).not.toContain('Étendu');
        // Et le défi porte lui aussi le nom de l'échelle.
        expect(rendu).toContain('Fragile');
        expect(rendu).not.toContain('Incomplet');
    });

    it('échappe le nom d\'un niveau et d\'un critère avant de les poser dans un innerHTML', () => {
        // Le nom d'un niveau est SAISI par l'utilisateur. Les tables retirées
        // ne contenaient que des littéraux du code : les remplacer par des
        // données ouvrait un chemin d'injection qui n'existait pas avant.
        const echelleHostile = {
            id: 'ECH_HOSTILE',
            seuilSuffisance: 'E',
            seuilMaitrise: 'E',
            niveaux: [
                { code: 'I', nom: '<img src=x onerror=alert(1)>', min: 0, max: 59, valeurCalcul: 40 },
                { code: 'E', nom: '<b>Solide</b>', min: 60, max: 100, valeurCalcul: 90 }
            ]
        };
        // Le nom du CRITÈRE vient lui aussi de l'utilisateur, et il traverse
        // le même innerHTML, sur les deux lignes que #575 réécrit.
        const grilleHostile = {
            id: 'GR1',
            criteres: [
                { id: 'c1', nom: '<span>Démarche</span>', description: 'La démarche' },
                { id: 'c2', nom: '<span>Calculs</span>', description: 'Les calculs' }
            ]
        };
        const elements = faireElements();
        const w = chargerBilan({
            echelles: [echelleHostile],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_HOSTILE', criteres: { c1: 'I', c2: 'E' } },
            historique: [],
            elements,
            grille: grilleHostile
        });
        w.basculerVueRetroaction('bilan');
        const rendu = elements.contenuRetroBilan.innerHTML;
        expect(rendu).not.toContain('<img src=x');
        expect(rendu).not.toContain('<b>Solide</b>');
        expect(rendu).toContain('&lt;b&gt;Solide&lt;/b&gt;');
        expect(rendu).not.toContain('<span>Démarche</span>');
        expect(rendu).not.toContain('<span>Calculs</span>');
        expect(rendu).toContain('&lt;span&gt;Calculs&lt;/span&gt;');
    });

    it('compare des ÉCHELLES RÉSOLUES, pas des identifiants — deux ids pour un même barème', () => {
        // Après un import, la MÊME échelle vit sous deux identifiants : le neuf
        // et l'`idOriginal`. `obtenirEchelleResolue` les résout tous les deux.
        // Comparer les ids BRUTS conclut « échelles différentes » et supprime la
        // ligne « Progrès » entre deux évaluations du même barème.
        // ⮕ C'est la règle que `obtenirEchelleCommuneDesEvaluations` applique
        //   déjà depuis le 27 août : la comparaison porte sur l'échelle résolue.
        const importee = Object.assign({}, ECHELLE_JAUNE, { id: 'ECH_JAUNE_IMPORTEE', idOriginal: 'ECH_JAUNE' });
        const elements = faireElements();     // niveau courant affiché : P4
        const w = chargerBilan({
            echelles: [importee],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE_IMPORTEE', criteres: { c1: 'P4' } },
            historique: [
                { etudiantDA: 'DA1', dateEvaluation: '2026-08-01', niveauFinal: 'P2', echelleId: 'ECH_JAUNE', productionNom: 'Labo 1', criteres: [] }
            ],
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Progrès : P2 → P4');
    });

    it('traite une échelle NON DÉSIGNÉE comme une absence, pas comme un barème concurrent', () => {
        // Les évaluations enregistrées avant que l'échelle ne soit consignée ne
        // portent aucun `echelleId`. Refuser de comparer dans ce cas retire la
        // ligne « Progrès » de tout l'historique ancien, pour toujours.
        // ⮕ Même lecture que `obtenirEchelleCommuneDesEvaluations` : « une
        //   échelle introuvable n'est pas une AUTRE échelle, c'est une absence ».
        const elements = faireElements();     // niveau courant affiché : P4
        const w = chargerBilan({
            echelles: [ECHELLE_JAUNE],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE', criteres: { c1: 'P4' } },
            historique: [
                { etudiantDA: 'DA1', dateEvaluation: '2026-08-01', niveauFinal: 'P2', productionNom: 'Labo 1', criteres: [] }
            ],
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Progrès : P2 → P4');
    });

    it('traite de même une échelle DÉSIGNÉE MAIS DISPARUE — le cas H2026', () => {
        // 339 évaluations d'H2026 désignent une échelle qui n'existe plus dans
        // le trimestre (#542). Elle n'est pas un barème concurrent : elle n'est
        // pas là. Le code se lit alors dans l'échelle de l'évaluation courante.
        const elements = faireElements();     // niveau courant affiché : P4
        const w = chargerBilan({
            echelles: [ECHELLE_JAUNE],
            evaluationEnCours: { etudiantDA: 'DA1', grilleId: 'GR1', echelleId: 'ECH_JAUNE', criteres: { c1: 'P4' } },
            historique: [
                { etudiantDA: 'DA1', dateEvaluation: '2026-08-01', niveauFinal: 'P2', echelleId: 'ECH_DISPARUE_1767389426695', productionNom: 'Labo 1', criteres: [] }
            ],
            elements
        });
        w.basculerVueRetroaction('bilan');
        expect(elements.contenuRetroBilan.innerHTML).toContain('Progrès : P2 → P4');
    });

    it('ne garde aucune table IDME dans le module de rétroaction', () => {
        const code = sansCommentaires(retroaction);
        expect(code).not.toMatch(/_NOMS_NIV_BILAN\s*=/);
        expect(code).not.toMatch(/_ORDRE_NIV_BILAN\s*=/);
        expect(code).not.toContain('Étendu');
        expect(code).not.toContain('En développement');
    });

    it('AUCUN code IDME n\'est plus comparé dans ce module — le compte est ZÉRO', () => {
        // ⮕ CE TEST A CHANGÉ DE NATURE LE 28 AOÛT, ET C'ÉTAIT LE SIGNAL VOULU.
        // Il CONSTATAIT 18 comparaisons littérales et annonçait qu'il rougirait
        // le jour où #555 les retirerait. Ce jour est venu : Grégoire a posé ses
        // deux repères, `zoneDuNiveau` a remplacé les lettres.
        //
        // ⚠ Il n'a PAS été « réparé » en changeant le chiffre. Il est devenu un
        // RATCHET : aucune lettre ne revient, dans un sens comme dans l'autre.
        const code = sansCommentaires(retroaction);
        expect(code.match(/[!=]==\s*'[IDME0]'/g)).toBeNull();
        // Et les deux tables d'origine ne reviennent pas non plus.
        expect(code).not.toMatch(/_NOMS_NIV_BILAN|_ORDRE_NIV_BILAN/);
    });
});
