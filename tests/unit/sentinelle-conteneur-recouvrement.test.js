import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

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

    it('CAS B : le mode individuel DÉMÉNAGE vers un autre conteneur (pas seulement détacher)', () => {
        const casB = sourceCarte.slice(sourceCarte.indexOf('// CAS B'), sourceCarte.indexOf('// CAS C'));
        expect(casB).toMatch(/rattacherAuConteneur\(id, cibleB\)/);
        // Feedback de survol pendant le drag, parent courant jamais surligné.
        expect(casB).toMatch(/candidatB !== parentId\) \? candidatB : null/);
        // Le détachement plein-dehors survit.
        expect(casB).toMatch(/detacherDuConteneur\(id\)/);
    });

    it('voie A : les drags de conteneurs acceptent les séquences comme cibles', () => {
        expect(sourceCarte).toMatch(/peutEtreEnfant = donnees\.type === 'lecon' \|\| donnees\.type === 'sequence'/);
        expect(sourceCarte).toMatch(/peutDropRacine = racine\.type === 'lecon' \|\| racine\.type === 'sequence'/);
    });

    it('⌘+glisser saisit le bloc seul ; ⌘+clic immobile garde la multi-sélection', () => {
        const meta = sourceCarte.slice(sourceCarte.indexOf('if (e.metaKey || e.ctrlKey) {'), sourceCarte.indexOf('if (e.altKey) {'));
        // Départagé au mouvement (seuil), pas au clic.
        expect(meta).toMatch(/< 4\) return;/);
        expect(meta).toMatch(/etat\.modeIndividuel = id;/);
        expect(meta).toMatch(/if \(!basculeDrag\) toggleMultiSelection\(id\);/);
        // Plus de bascule immédiate au mousedown.
        expect(meta).not.toMatch(/^\s*toggleMultiSelection\(id\);\s*\n\s*return;/m);
    });

    it('le geste est documenté dans le panneau Raccourcis', () => {
        expect(sourceIndex).toMatch(/⌘\+Glisser<\/kbd><\/td><td>Sortir un bloc de son conteneur/);
    });

    it('l’inspecteur offre « Dans la leçon » — le chemin SANS geste (iPad)', () => {
        // Gabarit du sélecteur : gardé par peutContenir('lecon', type), titres
        // échappés (règle innerHTML), déplacement par les portes uniques.
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf("if (peutContenir('lecon', donnees.type)) {"),
            sourceCarte.indexOf("if (donnees.type === 'sequence') {")
        );
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
        const blocGabarit = sourceCarte.slice(
            sourceCarte.indexOf("if (peutContenir('lecon', donnees.type)) {"),
            sourceCarte.indexOf("if (donnees.type === 'sequence') {")
        );
        expect(blocGabarit).not.toMatch(/addEventListener/);
    });
});
