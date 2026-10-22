/**
 * #674 · LA NOTE DIT SUR QUOI ELLE PORTE — énoncé 5 d'OBJECTIF-COHORTE-1.md
 *
 * « Aucune note remise ne repose sur une pondération incomplète sans le dire. Un critère
 * laissé sans niveau ne peut pas disparaître en silence et faire monter la note. »
 *
 * ⚠ LE DÉFAUT NE BAISSE PAS LA NOTE, IL LA MONTE. `calculerNote()` sautait tout critère
 * sans niveau : il quittait le numérateur ET `ponderationTotal`, et la division finale
 * renormalisait les pondérations restantes à 100 %. Mesuré sous WebKit le 1er septembre
 * 2026, grille 50/30/20 : les trois critères renseignés rendent 84,0 % (M) ; le critère
 * à 20 % sans niveau rend 95,0 % (E). Onze points et un niveau de plus, sans un mot.
 *
 * DEUX MÉCANISMES, LE MÊME SILENCE :
 *   1. critère par critère — un niveau non choisi (le témoin 84 → 95 ci-dessus) ;
 *   2. tout d'un coup — l'échelle est choisie mais aucun niveau n'a de `valeurCalcul`
 *      (la forme des huit échelles disciplinaires retirées le 1er septembre, dont les
 *      copies restent chez qui les avait adoptées) : tous les critères sortent du total,
 *      `ponderationTotal` tombe à 0, l'écran rend « 0.0 % » comme un résultat.
 *
 * ⮕ CE FICHIER REPRODUIT D'ABORD, sur le chemin réel : `js/evaluation-calcul.js` est
 * chargé dans le bac à sable et `calculerNote()` est appelée telle quelle. Les cas B et C
 * étaient ROUGES avant le correctif (95,0 % et 0,0 % en silence), et c'est ce rouge qui
 * a été montré avant de toucher au code.
 *
 * LA FORME DU CORRECTIF (tranchée par Grégoire le 1er septembre, pas d'état de flux) :
 * ce qui manque n'est pas un état, c'est une PORTÉE. `calculerNote()` publie
 * `window.porteeCalculeeCourante` à côté de `window.noteCalculeeCourante` ; l'écran
 * retient la conclusion (« -- ») et NOMME ce qui manque ; la note calculée reste la
 * source (#572) et voyage en base avec `ponderationCouverte`.
 *
 * ⚠ TARIR N'EST PAS RÉPARER : rien ici ne lit ni n'écrit une donnée réelle. Les
 * évaluations déjà en base gardent leur note ; la portée se recalcule pour elles
 * (`porteeDepuisEvaluation`, cas E).
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function classList() {
    const s = new Set();
    return {
        add(c) { s.add(c); }, remove(c) { s.delete(c); },
        contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; }
    };
}

function elementDom(init) {
    return Object.assign({
        value: '', textContent: '', style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, setAttribute() {}, addEventListener() {}
    }, init || {});
}

// Miroir de la règle unique de `js/echelles.js` (#525/#527) : une valeur ponctuelle
// ou `null`, jamais un chiffre inventé. Le repli milieu-de-plage est retiré depuis #527.
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

const GRILLE_50_30_20 = {
    id: 'G1', nom: 'Grille témoin 50/30/20',
    criteres: [
        { id: 'c1', nom: 'Contenu', ponderation: 50 },
        { id: 'c2', nom: 'Organisation', ponderation: 30 },
        { id: 'c3', nom: 'Langue', ponderation: 20 }
    ]
};

// Échelle à valeurs ponctuelles : E=95, M=82, D=65, I=40.
const ECHELLE_PONCTUELLE = {
    id: 'E1', nom: 'IDME témoin',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
        { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
    ]
};

// La forme EXACTE des huit échelles disciplinaires : `valeur:` et jamais `valeurCalcul:`.
const ECHELLE_MUETTE = {
    id: 'E_MUETTE', nom: 'Chimie organique (copie muette)',
    niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82 }
    ]
};

/** Monte le bac à sable : la grille, l'échelle, les niveaux choisis, et l'écran capturé. */
function monter({ grille = GRILLE_50_30_20, echelle = ECHELLE_PONCTUELLE, niveaux = {} }) {
    const ecran = {
        noteProduction1: elementDom(),
        niveauProduction1: elementDom(),
        criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: (() => { const c = classList(); c.add('u-hide'); return c; })() }),
        selectEchelle1: elementDom({ value: echelle.id })
    };
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const ec = { grilleId: grille.id, echelleId: echelle.id, criteres: Object.assign({}, niveaux), donneesAlgorithmiques: {} };
    const base = {
        test_grillesTemplates: [grille],
        test_echellesTemplates: [echelle],
        test_pratiquesConfigurables: []
    };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-calcul.js', {
        document,
        evaluationEnCours: ec,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d) },
        cle: (k) => 'test_' + k,
        valeurNumeriqueDuNiveau
    }, win);
    return { win, ecran, ec };
}

describe('#674 · calculerNote — la note dit sur quoi elle porte', () => {
    it('A · témoin — les trois critères renseignés : 84,0 % (M), et PAS UN MOT DE PLUS', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'E', c2: 'E', c3: 'I' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('84\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('M');
        expect(win.noteCalculeeCourante).toBe(84);
        // Un correctif qui avertit tout le monde n'avertit personne.
        expect(ecran.porteeNote1.textContent).toBe('');
        expect(ecran.porteeNote1.classList.contains('u-hide')).toBe(true);
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 100, ponderationGrille: 100, incomplete: false, criteresHorsNote: [] });
    });

    it('B · mécanisme 1 — le critère à 20 % perd son niveau : plus jamais « 95.0 % » en silence', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'E', c2: 'E', c3: '' } });
        win.calculerNote();
        // L'écran retient la conclusion…
        expect(ecran.noteProduction1.textContent).toBe('--');
        expect(ecran.niveauProduction1.textContent).toBe('--');
        // …et NOMME ce qui manque, avec son poids.
        expect(ecran.porteeNote1.classList.contains('u-hide')).toBe(false);
        expect(ecran.porteeNote1.textContent).toContain('Langue');
        expect(ecran.porteeNote1.textContent).toContain('20\u00A0%');
        // La portée est publiée à côté de la note calculée.
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 80, ponderationGrille: 100, incomplete: true });
        expect(win.porteeCalculeeCourante.criteresHorsNote).toEqual([
            { critereId: 'c3', nom: 'Langue', ponderation: 20, motif: 'sans-niveau', niveau: '' }
        ]);
        // #572 : la valeur calculée reste la source — elle voyage avec sa portée (95 sur 80 %),
        // ce n'est plus un 95 qui se fait passer pour une note sur 100.
        expect(win.noteCalculeeCourante).toBe(95);
    });

    it('C · mécanisme 2 — l\'échelle est là mais muette (valeur: sans valeurCalcul:) : plus jamais « 0.0 % » comme un résultat', () => {
        const grille = { id: 'G2', nom: 'Grille 40/60', criteres: [
            { id: 'k1', nom: 'Démarche', ponderation: 40 },
            { id: 'k2', nom: 'Résultat', ponderation: 60 }
        ] };
        const { win, ecran } = monter({ grille, echelle: ECHELLE_MUETTE, niveaux: { k1: 'M', k2: 'M' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('--');
        expect(ecran.niveauProduction1.textContent).toBe('--');
        expect(ecran.porteeNote1.classList.contains('u-hide')).toBe(false);
        expect(ecran.porteeNote1.textContent).toContain('Démarche');
        expect(ecran.porteeNote1.textContent).toContain('Résultat');
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 0, ponderationGrille: 100, incomplete: true });
        expect(win.porteeCalculeeCourante.criteresHorsNote.map((c) => c.motif)).toEqual(['niveau-sans-valeur', 'niveau-sans-valeur']);
        expect(win.porteeCalculeeCourante.criteresHorsNote.map((c) => c.niveau)).toEqual(['M', 'M']);
    });

    it('D · témoin — rien n\'est commencé : ce n\'est pas une pondération incomplète, c\'est une évaluation vide', () => {
        const { win, ecran } = monter({ niveaux: {} });
        win.calculerNote();
        // Le zéro d'une évaluation jamais commencée est VISIBLE et ne renormalise rien :
        // le refus vaut pour ce qui est commencé (sinon un jeton de délai seul serait bloqué).
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 0, incomplete: false, commencee: false });
        expect(win.porteeCalculeeCourante.criteresHorsNote).toHaveLength(3);
        expect(ecran.porteeNote1.classList.contains('u-hide')).toBe(true);
    });

    it('B bis · le témoin bouge avec la donnée : donner son niveau au critère manquant ramène 84,0 %', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'E', c2: 'E', c3: '' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('--');
        ec.criteres.c3 = 'I';
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('84\u00A0%');
        expect(ecran.porteeNote1.classList.contains('u-hide')).toBe(true);
        expect(win.porteeCalculeeCourante.incomplete).toBe(false);
    });
});

describe('#674 · porteeDepuisEvaluation — la portée se recalcule sur ce qui est déjà en base (rétroactif)', () => {
    function charger() {
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, win);
        return win;
    }

    // ↻ #705 (19 sept. 2026) — un critère que l'évaluation ne porte pas peut avoir été AJOUTÉ DEPUIS.
    // Le défaut de #674 reste vu là où la date le prouve : l'identifiant du critère porte sa naissance.
    const NE = (ms, n) => 'CR_' + ms + '_' + n + '_aabbccddeeff';
    const grilleDatee = (msLangue) => ({ id: 'G1', criteres: [
        { id: NE(1750000000000, 1), nom: 'Contenu', ponderation: 50 }, { id: NE(1750000000000, 2), nom: 'Organisation', ponderation: 30 },
        { id: NE(msLangue, 3), nom: 'Langue', ponderation: 20 } ] });
    const evalDatee = { grilleId: 'G1', echelleId: 'E1', noteFinale: 95, dateEvaluation: '2026-08-25T14:00:00.000Z', criteres: [
        { critereId: NE(1750000000000, 1), critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
        { critereId: NE(1750000000000, 2), critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 }
    ] };

    it('E · une évaluation d\'avant ce lot (sans ponderationCouverte) dont un critère NÉ AVANT ELLE manque est vue incomplète', () => {
        const win = charger();
        const p = win.porteeDepuisEvaluation(evalDatee, grilleDatee(1750000000000), ECHELLE_PONCTUELLE.niveaux);
        expect(p).toMatchObject({ ponderationCouverte: 80, ponderationGrille: 100, incomplete: true, commencee: true });
        expect(p.criteresHorsNote).toEqual([{ critereId: NE(1750000000000, 3), nom: 'Langue', ponderation: 20, motif: 'sans-niveau', niveau: '' }]);
        expect(p.criteresNonCouverts).toEqual([]);
    });

    it('E · #705 — le même critère NÉ APRÈS l\'évaluation (1er sept. 2026) est un ajout : elle conclut sur 80 sur 80, et il est rendu à part', () => {
        const win = charger();
        const apres = new Date('2026-09-01T12:00:00.000Z').getTime();
        const p = win.porteeDepuisEvaluation(evalDatee, grilleDatee(apres), ECHELLE_PONCTUELLE.niveaux);
        expect(p).toMatchObject({ ponderationCouverte: 80, ponderationGrille: 80, incomplete: false, commencee: true });
        expect(p.criteresHorsNote).toEqual([]);
        expect(p.criteresNonCouverts).toEqual([{ critereId: NE(apres, 3), nom: 'Langue', ponderation: 20 }]);
    });

    // ↻ RELECTURE CROISÉE DE COWORK (19 sept. 2026, sur ff9b6f63) — la date qui tranche était
    // max(dateEvaluation, dateModification). Or retoucher la rétroaction depuis le modal de Travaux
    // (`sauvegarderRetroactionDepuisModal`) pose `dateModification` SANS écrire un seul critère : une
    // évaluation du 5, un critère né le 20, une retouche de texte le 22 → le critère passait « né avant »
    // et le PDF refusait de conclure. Le symptôme de #705 lui-même, rouvert par un geste sans rapport.
    it('E · #705 — une RETOUCHE DE RÉTROACTION postérieure à l\'ajout du critère ne déplace pas la date qui tranche : le PDF conclut toujours', () => {
        const win = charger();
        const le = (j) => new Date('2026-09-' + j + 'T12:00:00.000Z').getTime();
        const grille = { id: 'G1', criteres: [{ id: NE(le('01'), 1), nom: 'A', ponderation: 40 }, { id: NE(le('01'), 2), nom: 'B', ponderation: 40 }, { id: NE(le('20'), 3), nom: 'D', ponderation: 20 }] };
        const evaluation = (extra) => Object.assign({ grilleId: 'G1', noteFinale: 95, dateEvaluation: '2026-09-05T14:00:00.000Z', verrouillee: true, criteres: [
            { critereId: NE(le('01'), 1), critereNom: 'A', niveauSelectionne: 'E', ponderation: 40 }, { critereId: NE(le('01'), 2), critereNom: 'B', niveauSelectionne: 'E', ponderation: 40 } ] }, extra);
        const lire = (e) => { const p = win.porteeDepuisEvaluation(e, grille, ECHELLE_PONCTUELLE.niveaux); return { incomplete: p.incomplete, ajoutes: p.criteresNonCouverts.map((c) => c.nom) }; };
        expect(lire(evaluation({}))).toEqual({ incomplete: false, ajoutes: ['D'] });
        expect(lire(evaluation({ dateModification: '2026-09-22T09:00:00.000Z' }))).toEqual({ incomplete: false, ajoutes: ['D'] });
        expect(lire(evaluation({ dateModification: '2026-09-22T09:00:00.000Z', ponderationCouverte: 80 }))).toEqual({ incomplete: false, ajoutes: ['D'] });
    });

    it('E · #705 — l\'ANCIEN format d\'identifiant (« CR1759243428715 », tout A2025) porte sa date aussi : né le 30 sept. 2025, sauté le 4 oct. → incomplète', () => {
        const win = charger();
        const grille = { id: 'G1', criteres: [{ id: 'CR1759243306842', nom: 'Structure', ponderation: 80 }, { id: 'CR1759243428715', nom: 'Français écrit', ponderation: 20 }] };
        const evaluation = { grilleId: 'G1', noteFinale: 70, dateEvaluation: '2025-10-04T22:48:53.781Z', verrouillee: true,
            criteres: [{ critereId: 'CR1759243306842', critereNom: 'Structure', niveauSelectionne: 'E', ponderation: 80 }] };
        const p = win.porteeDepuisEvaluation(evaluation, grille, ECHELLE_PONCTUELLE.niveaux);
        expect(p).toMatchObject({ incomplete: true, ponderationGrille: 100, criteresNonCouverts: [] });
        expect(p.criteresHorsNote.map((c) => c.nom)).toEqual(['Français écrit']);
    });

    it('E · #705 — quand la date ne dit rien (identifiants « c1 »), la règle arrêtée s\'applique : l\'absent est présumé ajouté depuis — sauf pour un brouillon qui déclare sa portée', () => {
        const win = charger();
        const criteres = [
            { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', ponderation: 50 },
            { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', ponderation: 30 }
        ];
        const presume = win.porteeDepuisEvaluation({ grilleId: 'G1', noteFinale: 95, criteres }, GRILLE_50_30_20, ECHELLE_PONCTUELLE.niveaux);
        expect(presume).toMatchObject({ incomplete: false, ponderationGrille: 80 });
        expect(presume.criteresNonCouverts.map((c) => c.critereId)).toEqual(['c3']);
        const brouillon = win.porteeDepuisEvaluation({ grilleId: 'G1', noteFinale: 95, ponderationCouverte: 80, verrouillee: false, criteres }, GRILLE_50_30_20, ECHELLE_PONCTUELLE.niveaux);
        expect(brouillon).toMatchObject({ incomplete: true, ponderationGrille: 100, criteresNonCouverts: [] });
        expect(brouillon.criteresHorsNote.map((c) => c.critereId + ':' + c.motif)).toEqual(['c3:sans-niveau']);
    });

    it('E bis · la copie muette déjà en base : tous les niveaux sont là, aucun ne vaut — incomplète, motif nommé', () => {
        const win = charger();
        const grille = { id: 'G2', criteres: [{ id: 'k1', nom: 'Démarche', ponderation: 40 }, { id: 'k2', nom: 'Résultat', ponderation: 60 }] };
        const evaluation = { grilleId: 'G2', noteFinale: 0, criteres: [
            { critereId: 'k1', niveauSelectionne: 'M', ponderation: 40 },
            { critereId: 'k2', niveauSelectionne: 'M', ponderation: 60 }
        ] };
        const p = win.porteeDepuisEvaluation(evaluation, grille, ECHELLE_MUETTE.niveaux);
        expect(p).toMatchObject({ ponderationCouverte: 0, incomplete: true, commencee: true });
        expect(p.criteresHorsNote.map((c) => c.motif)).toEqual(['niveau-sans-valeur', 'niveau-sans-valeur']);
    });

    it('E ter · la déclaration écrite en base fait foi pour le NOMBRE quand elle existe', () => {
        const win = charger();
        const evaluation = { grilleId: 'G1', noteFinale: 84, ponderationCouverte: 100, criteres: [
            { critereId: 'c1', niveauSelectionne: 'E', ponderation: 50 },
            { critereId: 'c2', niveauSelectionne: 'E', ponderation: 30 },
            { critereId: 'c3', niveauSelectionne: 'I', ponderation: 20 }
        ] };
        const p = win.porteeDepuisEvaluation(evaluation, GRILLE_50_30_20, ECHELLE_PONCTUELLE.niveaux);
        expect(p).toMatchObject({ ponderationCouverte: 100, incomplete: false });
        expect(p.criteresHorsNote).toEqual([]);
    });

    it('E quater · témoin — une évaluation complète d\'avant ce lot reste complète : rien à dire', () => {
        const win = charger();
        const evaluation = { grilleId: 'G1', noteFinale: 84, criteres: [
            { critereId: 'c1', niveauSelectionne: 'E', ponderation: 50 },
            { critereId: 'c2', niveauSelectionne: 'E', ponderation: 30 },
            { critereId: 'c3', niveauSelectionne: 'I', ponderation: 20 }
        ] };
        const p = win.porteeDepuisEvaluation(evaluation, GRILLE_50_30_20, ECHELLE_PONCTUELLE.niveaux);
        expect(p).toMatchObject({ ponderationCouverte: 100, incomplete: false, commencee: true });
    });

    it('E quinque · un critère algorithmique compte par son pourcentage exact même si l\'échelle est muette', () => {
        const win = charger();
        const grille = { id: 'G3', criteres: [{ id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' }, { id: 'c1', nom: 'Contenu', ponderation: 80 }] };
        const evaluation = { grilleId: 'G3', noteFinale: 70, criteres: [
            { critereId: 'a1', niveauSelectionne: 'M', ponderation: 20 },
            { critereId: 'c1', niveauSelectionne: 'M', ponderation: 80 }
        ], donneesAlgorithmiques: { a1: { pourcentage: 61.5, erreurs: 4, mots: 500 } } };
        const p = win.porteeDepuisEvaluation(evaluation, grille, ECHELLE_MUETTE.niveaux);
        expect(p.ponderationCouverte).toBe(20);
        expect(p.criteresHorsNote.map((c) => c.critereId)).toEqual(['c1']);
    });
});
