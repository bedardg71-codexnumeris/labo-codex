import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — LE COMPARATEUR DÉCRIT « PAR STANDARDS » (famille « cibles », code interne CIB), 21 nov. 2026.
// Rapport : plans de travail/RAPPORT-2026-11-21-comparateur-par-standards.md.
//
// Avant : `ConstructionAttributs` n'avait aucune branche « cibles ». La pratique tombait dans les branches par
// défaut, écrites pour l'ancienne famille « standards » (devenue SEL), et sa colonne disait « Sélection
// d'artefacts », « Non couvert (la note se rapporte à des instruments) », « La reprise prend la place de la copie
// d'origine dans la note », et « — » pour ce à quoi la note se rapporte.
//
// BREAK-TEST (joué le 21 nov. 2026) : ce fichier, lancé sur le module et le comparateur d'`origin/main` (16360f43c),
// rend 31 essais rouges sur 37. Les six qui restent verts sont des invariants que le lot ne devait pas changer
// (six paramètres, agentivité, nom de l'échelle, faits sans famille, les quatre familles d'avant, module pur).
// [B] marque les essais écrits pour rougir sur le code d'avant ; ils rougissent tous.
// Noms et contenus fictifs.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sansCommentaires = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

// Le vrai formateur de pourcentage (« 55 % », espace insécable), pas une doublure.
const np = chargerScript('js/note-pourcentage.js');
const { formaterPourcentage, formaterNombre } = np;
const win = chargerScript('js/pratiques/construction-attributs.js', { formaterPourcentage, formaterNombre });
const { extraire, PARAMETRES, NON_DECRIT } = win.ConstructionAttributs;
const CLES = PARAMETRES.map(p => p.cle);

const val = (r, axe) => (r.attributs.find(a => a.axe === axe) || {}).valeur;
const param = (r, axe) => (r.attributs.find(a => a.axe === axe) || {}).parametre;
const axes = (r) => r.attributs.map(a => a.axe);

const CINQ = [['0', 'Données insuffisantes', 0], ['1', 'En apprentissage', 25], ['2', 'Ça y est presque', 50],
    ['3', 'Acquis', 75], ['4', 'Avancé', 100]].map(([code, nom, valeurCalcul]) => ({ code, nom, valeurCalcul }));
const ECHELLE = { type: 'niveaux', echelle_id: 'ECH_F', echelle_nom: 'Échelle fictive', niveaux: CINQ };
const CIBLES = [
    { id: 'a', etiquette: 'Analyser', poids: 1, terminale: false, criteres: [] },
    { id: 'b', etiquette: 'Structurer', poids: 1, terminale: false, criteres: [] },
    { id: 'c', etiquette: 'Dissertation', poids: 2, terminale: true, criteres: [] }
];
/** Une config RÉSOLUE de « Par standards », telle que `construireConfigComplete` la rend. */
const config = (configuration = {}, echelle = ECHELLE) => ({
    id: 'cib-f', nom: 'Par standards fictive', type: 'cibles', echelle, calcul_note: { methode: 'niveaux_par_cible' },
    configuration: Object.assign({ type: 'cibles', ensembleCiblesId: 'ENSC_F', echelleId: 'ECH_F', niveauSansDonnee: '0' }, configuration)
});
const DS = (actif, seuil = 60, plafond = 55) => ({ actif, seuil, plafond });

// Les valeurs que la colonne empruntait à l'ancienne famille « standards » (SEL) et à ses voisines.
const EMPRUNTS = [/Sélection d'artefacts/, /artefact/i, /instruments/i, /prend la place de la copie/, /Portfolio/,
    /retenu\(s\)/, /obligatoire non remise/];

describe('« Par standards » au comparateur · chaque ligne de la colonne', () => {
    const r = extraire(config(), { cibles: CIBLES, doubleSeuil: DS(false) });

    it('la famille est « cibles », et les six paramètres portent chacun au moins une ligne', () => {
        expect(r.famille).toBe('cibles');
        const vus = new Set(r.attributs.map(a => a.parametre));
        expect(CLES.filter(c => !vus.has(c))).toEqual([]);
        const rangs = r.attributs.map(a => CLES.indexOf(a.parametre));
        expect(rangs).toEqual([...rangs].sort((x, y) => x - y));
    });

    it('[B] la liste exacte des lignes, dans l\'ordre', () => {
        expect(axes(r)).toEqual(['ciblesComptees', 'alignementCibles', 'reprises', 'agentivite', 'objetNote', 'echelle',
            'temporaliteNote', 'granulariteEvaluation', 'niveauSansDonnee', 'granulariteCours', 'ponderation', 'calculNote',
            'doubleSeuil', 'notesFinalisees']);
    });

    it('[B] OBJET · les cibles comptées, tirées de l\'ensemble', () => {
        expect(val(r, 'ciblesComptees')).toBe('3 cibles, dont 1 terminale');
        expect(param(r, 'ciblesComptees')).toBe('objet');
    });

    it('[B] OBJET · l\'alignement sur des cibles est couvert (c\'était « non couvert, instruments »)', () => {
        expect(val(r, 'alignementCibles')).toBe('Couvert (la note se rapporte aux cibles)');
    });

    it('[B] RÉVISABILITÉ · le meilleur niveau démontré est retenu (c\'était « la reprise prend la place »)', () => {
        expect(val(r, 'reprises')).toBe('Le meilleur niveau démontré est retenu pour chaque cible ; une reprise ne le fait jamais baisser');
    });

    it('AGENTIVITÉ · non couvert par l\'application, comme pour toute famille', () => {
        expect(val(r, 'agentivite')).toMatch(/Non couvert/);
    });

    it('[B] COMMUNICATION · la note se rapporte aux cibles (c\'était « — »)', () => {
        expect(val(r, 'objetNote')).toBe('Cibles d\'apprentissage');
    });

    it('COMMUNICATION · l\'échelle de la pratique, par son nom, et la temporalité (réglage global)', () => {
        expect(val(r, 'echelle')).toBe('Échelle fictive (5 niveaux)');
        expect(val(r, 'temporaliteNote')).toMatch(/Réglage global/);
    });

    it('[B] GRANULARITÉ · les niveaux de l\'échelle, et le niveau « sans donnée » par son nom', () => {
        expect(val(r, 'granulariteEvaluation')).toBe('5 niveaux');
        expect(val(r, 'niveauSansDonnee')).toBe('Données insuffisantes');
        expect(val(r, 'granulariteCours')).toMatch(/Non couvert/);
    });

    it('[B] DÉTERMINATION · la pondération vient des poids des cibles (c\'était « Égale », sans les lire)', () => {
        expect(val(r, 'ponderation')).toBe('Inégale entre les cibles (poids de 1 à 2)');
        const egaux = CIBLES.map(c => Object.assign({}, c, { poids: 1.5 }));
        expect(val(extraire(config(), { cibles: egaux }), 'ponderation')).toBe('Égale entre les cibles');
    });

    it('[B] DÉTERMINATION · le calcul, le double seuil éteint, les notes non finalisées', () => {
        expect(val(r, 'calculNote')).toBe('Moyenne pondérée des valeurs des niveaux retenus');
        expect(val(r, 'doubleSeuil')).toBe('Éteint');
        expect(val(r, 'notesFinalisees')).toBe('Non : pas de note tant qu\'une cible est sans donnée');
    });

    it('[B] aucune ligne empruntée : ni productions comptées, ni sélection, ni composantes, ni « mode note finale »', () => {
        ['nbProductions', 'methodeSelection', 'composantes', 'notesFinales', 'forfaits', 'seuilAcceptabilite']
            .forEach(axe => expect(axes(r)).not.toContain(axe));
    });

    it('[B] aucune valeur de la colonne ne vient de l\'ancienne famille « standards »', () => {
        r.attributs.forEach(a => EMPRUNTS.forEach(re => expect(a.valeur, a.axe).not.toMatch(re)));
        expect(r.attributs.every(a => a.valeur !== '—' && a.valeur.length > 0)).toBe(true);
    });
});

describe('« Par standards » au comparateur · les réglages changent la colonne', () => {
    it('[B] le double seuil allumé dit son plafond et son seuil, lus au moteur', () => {
        const r = extraire(config({ doubleSeuil: { actif: true } }), { cibles: CIBLES, doubleSeuil: DS(true, 60, 55) });
        expect(val(r, 'doubleSeuil')).toBe('Note plafonnée à 55\u00a0% si la moyenne des cibles terminales est sous 60\u00a0%');
        const autre = extraire(config(), { cibles: CIBLES, doubleSeuil: DS(true, 50, 45.5) });
        expect(val(autre, 'doubleSeuil')).toBe('Note plafonnée à 45,5\u00a0% si la moyenne des cibles terminales est sous 50\u00a0%');
    });

    it('[B] allumé sans cible terminale : il ne s\'allume pas, et la colonne le dit', () => {
        const sans = CIBLES.map(c => Object.assign({}, c, { terminale: false }));
        const r = extraire(config(), { cibles: sans, doubleSeuil: DS(true) });
        expect(val(r, 'doubleSeuil')).toBe('Allumé, sans effet : aucune cible terminale');
        expect(val(r, 'ciblesComptees')).toBe('3 cibles, aucune terminale');
    });

    it('sans la lecture du moteur, le double seuil se lit dans la config, sans chiffre inventé', () => {
        expect(val(extraire(config({ doubleSeuil: { actif: true } }), { cibles: CIBLES }), 'doubleSeuil')).toBe('Allumé');
        expect(val(extraire(config({ doubleSeuil: { actif: true, seuil: 60, plafond: 55 } }), { cibles: CIBLES }), 'doubleSeuil'))
            .toMatch(/^Note plafonnée à 55/);
        expect(val(extraire(config(), { cibles: CIBLES }), 'doubleSeuil')).toBe('Éteint');
    });

    it('[B] notes finalisées : une cible sans donnée compte pour 0 %', () => {
        const r = extraire(config({ notesFinales: true }), { cibles: CIBLES });
        expect(val(r, 'notesFinalisees')).toBe('Oui : une cible sans donnée compte pour 0\u00a0%');
    });

    it('[B] le niveau « sans donnée » : aucun désigné, ou désigné mais sorti de l\'échelle', () => {
        expect(val(extraire(config({ niveauSansDonnee: '' }), { cibles: CIBLES }), 'niveauSansDonnee')).toBe('Aucun niveau désigné');
        expect(val(extraire(config({ niveauSansDonnee: 'Z' }), { cibles: CIBLES }), 'niveauSansDonnee'))
            .toBe('Le niveau désigné n\'est plus dans l\'échelle');
    });

    it('une seule cible, au singulier', () => {
        expect(val(extraire(config(), { cibles: [CIBLES[2]] }), 'ciblesComptees')).toBe('1 cible, dont 1 terminale');
    });
});

describe('« Par standards » au comparateur · ce qui manque se dit', () => {
    it('[B] ensemble introuvable (aucun contexte, ou `cibles: null`) : la colonne le dit, sans exception', () => {
        [undefined, {}, { cibles: null }].forEach(contexte => {
            const r = extraire(config(), contexte);
            expect(val(r, 'ciblesComptees')).toBe('Cibles introuvables dans ce trimestre');
            expect(val(r, 'ponderation')).toBe('Cibles introuvables dans ce trimestre');
        });
    });

    it('[B] ensemble vide : « Aucune cible »', () => {
        const r = extraire(config(), { cibles: [] });
        expect(val(r, 'ciblesComptees')).toBe('Aucune cible');
        expect(val(r, 'ponderation')).toBe('Aucune cible');
    });

    it('[B] un poids nul ou illisible se dit, au lieu d\'un « Égale »', () => {
        const casse = [CIBLES[0], Object.assign({}, CIBLES[1], { poids: NaN })];
        expect(val(extraire(config(), { cibles: casse }), 'ponderation')).toBe('Au moins une cible n\'a pas de poids plus grand que zéro');
        const nul = [CIBLES[0], Object.assign({}, CIBLES[1], { poids: 0 })];
        expect(val(extraire(config(), { cibles: nul }), 'ponderation')).toBe('Au moins une cible n\'a pas de poids plus grand que zéro');
    });

    it('[B] échelle introuvable (la marque de `construireConfigComplete`) : trois lignes le disent', () => {
        const r = extraire(config({}, { type: 'niveaux', echelle_id: 'ECH_F', introuvable: true, niveaux: [] }), { cibles: CIBLES });
        expect(val(r, 'echelle')).toBe('Échelle introuvable dans ce trimestre');
        expect(val(r, 'granulariteEvaluation')).toBe('Échelle introuvable dans ce trimestre');
        expect(val(r, 'niveauSansDonnee')).toBe('Échelle introuvable dans ce trimestre');
    });
});

describe('la garde · une famille inconnue ne reçoit plus les valeurs d\'une voisine', () => {
    const INCONNUES = [['une famille à venir', { type: 'competences' }], ['aucun type', {}], ['type nul', { type: null }],
        ['rien', undefined]];

    it.each(INCONNUES)('[B] %s : « non décrit », et rien d\'emprunté', (_, cfg) => {
        const r = extraire(cfg);
        ['nbProductions', 'alignementCibles', 'reprises', 'objetNote', 'ponderation'].forEach(axe => {
            expect(val(r, axe), axe).toBe(NON_DECRIT);
        });
        r.attributs.forEach(a => EMPRUNTS.concat([/^Égale$/, /^Non$/]).forEach(re => expect(a.valeur, a.axe).not.toMatch(re)));
        ['methodeSelection', 'composantes', 'notesFinales'].forEach(axe => expect(axes(r)).not.toContain(axe));
    });

    it.each(INCONNUES)('%s : les six paramètres restent, aucune valeur vide', (_, cfg) => {
        const r = extraire(cfg);
        const vus = new Set(r.attributs.map(a => a.parametre));
        expect(CLES.filter(c => !vus.has(c))).toEqual([]);
        expect(r.attributs.every(a => typeof a.valeur === 'string' && a.valeur.length > 0 && a.valeur !== '—')).toBe(true);
    });

    it('une famille inconnue garde les faits qui ne dépendent d\'aucune famille : son échelle, les « non couvert »', () => {
        const r = extraire({ type: 'competences', echelle: ECHELLE });
        expect(val(r, 'echelle')).toBe('Échelle fictive (5 niveaux)');
        expect(val(r, 'granulariteEvaluation')).toBe('5 niveaux');
        expect(val(r, 'agentivite')).toMatch(/Non couvert/);
        expect(val(r, 'granulariteCours')).toMatch(/Non couvert/);
    });

    it('« non décrit » ne juge pas la pratique : c\'est le comparateur qui ne sait pas', () => {
        expect(NON_DECRIT).toMatch(/comparateur/);
    });

    it('les quatre familles d\'avant ne changent pas (un témoin par famille)', () => {
        expect(val(extraire({ type: 'standards' }), 'nbProductions')).toBe('Sélection d\'artefacts');
        expect(val(extraire({ type: 'standards' }), 'objetNote')).toBe('Artefacts (instruments d\'évaluation)');
        expect(val(extraire({ type: 'sommative' }), 'nbProductions')).toBe('Toutes les évaluations comptent');
        expect(val(extraire({ type: 'specifications' }), 'granulariteEvaluation')).toBe('Binaire par travail (acceptable ou non)');
        expect(val(extraire({ type: 'denotation' }), 'reprises')).toBe('s.o.');
    });
});

describe('le comparateur fournit les cibles à l\'extracteur, qui reste pur', () => {
    const CODE_COMPARATEUR = sansCommentaires(readFileSync(path.join(RACINE, 'js/comparateur-pratiques.js'), 'utf8'));
    const CODE_MODULE = sansCommentaires(readFileSync(path.join(RACINE, 'js/pratiques/construction-attributs.js'), 'utf8'));

    it('[B] le comparateur lit l\'ensemble par son propriétaire et le double seuil par le moteur, puis les passe', () => {
        expect(CODE_COMPARATEUR).toMatch(/EC\.lireParId\(conf\.ensembleCiblesId\)/);
        expect(CODE_COMPARATEUR).toMatch(/EC\.normaliserCibles\(/);
        expect(CODE_COMPARATEUR).toMatch(/NC\.lireDoubleSeuil\(conf\)/);
        expect(CODE_COMPARATEUR).toMatch(/ConstructionAttributs\.extraire\(_configPourExtraction\(c\.id\), _contexteExtraction\(c\.id\)\)/);
    });

    it('l\'extracteur ne lit ni le stockage, ni le DOM, ni les modules des cibles', () => {
        expect(CODE_MODULE).not.toMatch(/\bdb\.|localStorage|document\.|EnsemblesCibles|NoteCibles|InscriptionsCibles/);
    });

    it('la fonction de contexte ne répond que pour la famille « cibles », et n\'écrit rien', () => {
        const corps = (CODE_COMPARATEUR.match(/function _contexteExtraction\(id\) \{[\s\S]*?\n    \}\n/) || [''])[0];
        expect(corps.length).toBeGreaterThan(100);
        expect(corps).toMatch(/!== 'cibles'\) return undefined/);
        expect(corps).not.toMatch(/setSync|modifier|enregistrer|sauvegarder/);
    });
});
