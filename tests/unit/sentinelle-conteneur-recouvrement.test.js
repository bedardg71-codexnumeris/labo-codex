import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// Frictions F6/F7 (terrain 601-101, 6 août 2026) :
//
// F6 — une activité « posée sur » une leçon restait ORPHELINE si le curseur
// relâchait quelques pixels hors du bord : seule la position du curseur
// décidait de l'adoption (`trouverConteneurPour`). Le bloc chevauchait la
// leçon visuellement, la leçon ne s'ajustait pas, et rien ne signalait qu'il
// était dehors. Correctif : filet de RECOUVREMENT — un bloc majoritairement
// (> 50 %) sur un conteneur qui accepte son type lui appartient.
//
// F7 — impossible de déménager une activité d'une leçon à une autre en un
// geste : le drag d'un enfant déplaçait tout le groupe, et le mode individuel
// (double-clic) savait détacher mais pas ré-attacher. Correctifs : dépôt
// direct dans un autre conteneur (CAS B) + ⌘+glisser pour saisir un bloc seul
// (⌘+clic immobile reste la multi-sélection — départagé au mouvement).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

// --- Sandbox avec DOM factice mesurable --------------------------------
let elements;

function monterModule() {
    elements = {};
    const db = {
        getSync: (k, d) => d,
        setSync: () => {},
        get: async (k, d) => d,
        set: async () => {}
    };
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} }),
        body: {}
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, x, y, w, h, parent = null, enfants = []) {
    api.etat.noeuds.set(id, { id, type, titre: id, x, y, parent, enfants, metadata: {}, cloneSourceId: null });
    elements[id] = { offsetWidth: w, offsetHeight: h, style: {} };
}

describe('F6 · trouverConteneurParRecouvrement', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('un bloc majoritairement SUR une leçon lui appartient, curseur ou pas', () => {
        poser(api, 'planif-lec', 'lecon', 100, 100, 300, 400);
        // Activité 140×50 dont 60 % de la largeur est dans la leçon.
        poser(api, 'planif-act', 'activite', 100 + 300 - 84, 200, 140, 50);

        expect(api.trouverConteneurParRecouvrement('planif-act', 'activite')).toBe('planif-lec');
    });

    it('à 50 % ou moins, le bloc reste libre (géométrie ambiguë = pas de décision)', () => {
        poser(api, 'planif-lec', 'lecon', 100, 100, 300, 400);
        // Exactement la moitié de la largeur dedans (70 sur 140).
        poser(api, 'planif-act', 'activite', 100 + 300 - 70, 200, 140, 50);

        expect(api.trouverConteneurParRecouvrement('planif-act', 'activite')).toBeNull();
    });

    it('choisit le PLUS PETIT conteneur recouvert (la leçon, pas sa séquence)', () => {
        poser(api, 'planif-seq', 'sequence', 0, 0, 800, 900, null, ['planif-lec']);
        poser(api, 'planif-lec', 'lecon', 100, 100, 300, 400, 'planif-seq');
        poser(api, 'planif-act', 'activite', 150, 200, 140, 50);

        expect(api.trouverConteneurParRecouvrement('planif-act', 'activite')).toBe('planif-lec');
    });

    it('respecte peutContenir : une activité ne rejoint jamais une séquence', () => {
        poser(api, 'planif-seq', 'sequence', 0, 0, 800, 900);
        poser(api, 'planif-act', 'activite', 150, 200, 140, 50);

        // La séquence recouvre l'activité à 100 %, mais n'accepte pas ce type.
        expect(api.trouverConteneurParRecouvrement('planif-act', 'activite')).toBeNull();
    });

    it('jamais dans son propre descendant (voie A : séquence sur sa sous-séquence)', () => {
        poser(api, 'planif-parent', 'sequence', 0, 0, 800, 900, null, ['planif-enfant']);
        poser(api, 'planif-enfant', 'sequence', 50, 50, 700, 800, 'planif-parent');

        expect(api.trouverConteneurParRecouvrement('planif-parent', 'sequence')).toBeNull();
    });

    it('voie A : une séquence majoritairement sur une autre la rejoint', () => {
        poser(api, 'planif-grande', 'sequence', 0, 0, 900, 900);
        poser(api, 'planif-petite', 'sequence', 100, 100, 300, 200);

        expect(api.trouverConteneurParRecouvrement('planif-petite', 'sequence')).toBe('planif-grande');
    });
});

describe('F6/F7 · invariants statiques des gestes', () => {
    it('le drop de palette a le filet de recouvrement (dans le setTimeout, élément rendu)', () => {
        const drop = sourceCarte.slice(
            sourceCarte.indexOf("zoneTravail.addEventListener('drop'"),
            sourceCarte.indexOf("// Sélection par rectangle")
        );
        expect(drop).toMatch(/setTimeout\(function\(\) \{[\s\S]*?trouverConteneurParRecouvrement\(newId, type\)/);
    });

    it('le drag d’un nœud libre (CAS D) a le filet de recouvrement au relâchement', () => {
        const casD = sourceCarte.slice(sourceCarte.indexOf('// CAS D'), sourceCarte.indexOf('// Double-clic: mode individuel'));
        expect(casD).toMatch(/survolConteneurD = trouverConteneurParRecouvrement\(id, donnees\.type\)/);
    });

    // === INVERSION DU MODÈLE (décision Grégoire, 6 août 2026) ===
    // Saisir une FEUILLE la déplace SEULE ; saisir le CADRE d'un conteneur
    // déplace le groupe. Plus de rituel : ni double-clic « mode individuel »,
    // ni ⌘+glisser. C'est le geste de Keynote/Figma/Miro.

    it('INVERSION : une feuille avec parent se saisit SEULE, sans rituel', () => {
        const casB = tranche(sourceCarte, '// CAS B', '// CAS C');
        // La garde est « feuille avec parent » — aucun mode requis.
        expect(casB).toMatch(/if \(donnees\.parent && !estConteneur\) \{/);
        // Elle DÉMÉNAGE vers le conteneur du relâchement (pas seulement détacher).
        expect(casB).toMatch(/rattacherAuConteneur\(id, cibleB\)/);
        // Feedback de survol pendant le drag, parent courant jamais surligné.
        expect(casB).toMatch(/candidatB !== parentId\) \? candidatB : null/);
        // Le détachement plein-dehors survit.
        expect(casB).toMatch(/detacherDuConteneur\(id\)/);
    });

    it('INVERSION : l’escalade au groupe racine (ex-CAS A) est RETIRÉE', () => {
        expect(sourceCarte).not.toMatch(/CAS A: Enfant en mode normal/);
        expect(sourceCarte).not.toMatch(/trouverConteneurRacine/);
        // Le concept de « mode individuel » est mort avec elle.
        expect(sourceCarte).not.toMatch(/modeIndividuel/);
        expect(sourceCarte).not.toMatch(/planif-mode-individuel/);
    });

    it('⌘+clic est redevenu la multi-sélection immédiate (⌘+glisser retiré)', () => {
        const meta = tranche(sourceCarte, 'if (e.metaKey || e.ctrlKey) {', 'if (e.altKey) {');
        expect(meta).toMatch(/toggleMultiSelection\(id\);\s*\n\s*return;/);
        expect(meta).not.toMatch(/surMoveMeta|basculeDrag/);
    });

    it('voie A : le drag d’un conteneur accepte une séquence comme cible', () => {
        expect(sourceCarte).toMatch(/peutEtreEnfant = donnees\.type === 'lecon' \|\| donnees\.type === 'sequence'/);
    });

    it('le parent reste FIGÉ pendant le drag d’un enfant (pas de zone qui poursuit)', () => {
        // Bug terrain (6 août soir) : mettreAJourZoneConteneur appelé à chaque
        // mousemove — avec un enfant unique, la zone recalculée SUIT le bloc
        // 1:1, « la leçon vient toujours avec », impossible d'en sortir.
        // Reproduit au glisser incrémental (25 pas de 30 px), invisible au
        // bond unique des sondes précédentes.
        const casB = tranche(sourceCarte, '// CAS B', '// CAS C');
        const onMoveB = tranche(casB, 'function onMoveB', 'function onUpB');
        expect(onMoveB).not.toMatch(/mettreAJourZoneConteneur/);

        const casC = tranche(sourceCarte, '// CAS C', '// CAS D');
        const onMoveC = tranche(casC, 'function onMoveC', 'function onUpC');
        expect(onMoveC).not.toMatch(/mettreAJourZoneConteneur/);

        // La zone se réajuste AU RELÂCHEMENT : CAS B via reLayoutAvecAnimation,
        // CAS C via mettreAJourZoneConteneur quand le bloc reste dans son parent.
        const onUpC = casC.slice(casC.indexOf('function onUpC'));
        expect(onUpC).toMatch(/else if \(donnees\.parent\) \{[\s\S]*?mettreAJourZoneConteneur\(donnees\.parent\)/);
        const onUpB = casB.slice(casB.indexOf('function onUpB'));
        expect(onUpB).toMatch(/reLayoutAvecAnimation\(donnees\.parent\)/);
    });

    it('le nouveau modèle est documenté dans la liste des raccourcis', () => {
        // Le panneau Raccourcis est devenu le bas du menu « Vue » (8 oct. 2026) :
        // sa liste vient de RACCOURCIS_CARTE, la source unique, dans le module.
        expect(sourceIndex).not.toMatch(/⌘\+Glisser/);
        expect(sourceCarte).not.toMatch(/⌘\+Glisser/);
        const liste = tranche(sourceCarte, 'var RACCOURCIS_CARTE = [', '];');
        // Mots validés par Grégoire le 8 oct. 2026, 19 h 05.
        expect(liste).toContain('Déplacer un bloc ; par le cadre d’une leçon ou d’une séquence, tout le groupe suit');
    });

    it('l’inspecteur offre « Dans la leçon » — le chemin SANS geste (iPad)', () => {
        // Gabarit du sélecteur : gardé par peutContenir('lecon', type), titres
        // échappés (règle innerHTML), déplacement par les portes uniques.
        const bloc = tranche(sourceCarte, "if (peutContenir('lecon', donnees.type)) {", "if (donnees.type === 'sequence') {");
        expect(bloc.length).toBeGreaterThan(100);
        expect(bloc).toMatch(/id="planif-panneau-deplacer"/);
        expect(bloc).toMatch(/echapperHtml\(lc2\.titre \|\| 'Sans titre'\)/);
    });

    it('le listener du sélecteur est posé APRÈS la dernière écriture innerHTML du panneau', () => {
        // Régression réelle (sonde Chromium, 6 août) : posé dans le bloc de
        // gabarit, le listener mourait au `extra.innerHTML +=` suivant (bloc
        // niveau cognitif des activités) — le sélecteur s'affichait mais ne
        // faisait RIEN. L'attache doit vivre en FIN de ouvrirPanneau, après
        // le bouton Supprimer (dernier point fixe du panneau).
        const finPanneau = sourceCarte.slice(
            sourceCarte.indexOf("document.getElementById('planif-btn-supprimer').onclick"),
            sourceCarte.indexOf('etat.panneauOuvert = true;')
        );
        expect(finPanneau).toMatch(/querySelector\('#planif-panneau-deplacer'\)/);
        expect(finPanneau).toMatch(/rattacherAuConteneur\(id, cibleDep\)/);
        expect(finPanneau).toMatch(/detacherDuConteneur\(id\)/);
        expect(finPanneau).toMatch(/enregistrerPourUndo\(\)/);
        // Et le gabarit, lui, n'attache RIEN (il serait perdu).
        const blocGabarit = tranche(sourceCarte, "if (peutContenir('lecon', donnees.type)) {", "if (donnees.type === 'sequence') {");
        expect(blocGabarit).not.toMatch(/addEventListener/);
    });
});
