import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// NETTOYAGE DES REPÈRES DE SEMAINE DANS LES TITRES (7 août 2026).
//
// Tant que la semaine n'avait pas de logement visible, Grégoire l'écrivait dans
// ses titres : « Sem. 11 – «Kanatuut» : … ». Depuis le sélecteur (1.51.0) le
// repère est redondant. Mais c'est SA donnée, pas notre rendu.
//
// ⚠ CE QUE CETTE SENTINELLE VERROUILLE EN PRIORITÉ, ce n'est pas que le
// nettoyage marche — c'est qu'il REFUSE de nettoyer dans les cas ambigus :
//  • le titre CONTREDIT la semaine posée → seul l'enseignant sait laquelle fait
//    foi ; nous n'en choisissons aucune ;
//  • retirer le repère ne laisserait rien de signifiant (« Sem. 1 séance 2 »
//    deviendrait « séance 2 », qui ne nomme rien) ;
//  • le repère de SÉANCE n'est jamais retiré : la séance n'a pas encore de
//    logement dans le modèle, et retirer un repère qui compense un concept
//    manquant ferait perdre l'information.
//
// C'est la réciproque de la règle du 6 août : la migration d'ancrage a refusé
// de LIRE la semaine dans les titres parce qu'interpréter produit des ancrages
// faux indiscernables de vrais. On ne réécrit donc pas les titres depuis un
// champ sans que l'enseignant tranche.

let store;

function monterModule() {
    store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {},
        createElement: fauxElement, createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, titre, metadata = {}, enfants = []) {
    api.etat.noeuds.set(id, { id, type, titre, x: 0, y: 0, parent: null, enfants, metadata, cloneSourceId: null });
    return api.etat.noeuds.get(id);
}

let api;
beforeEach(() => { api = monterModule(); });

describe('Repères · la détection', () => {
    it('reconnaît les formes réelles des titres de Grégoire', () => {
        const cas = [
            ['Sem. 3 - Les postures de lecture', 3, 'Les postures de lecture'],
            ['Sem. 11 – «Kanatuut» : Enseignement réciproque', 11, '«Kanatuut» : Enseignement réciproque'],
            ['Sem. 15 - Analyse finale', 15, 'Analyse finale'],
            ['Semaine 2 : Introduction', 2, 'Introduction'],
            ['sem 7 Retour sur l’examen', 7, 'Retour sur l’examen']
        ];
        cas.forEach(([titre, sem, reste], i) => {
            const n = poser(api, 'n' + i, 'lecon', titre, { semaine: sem });
            const a = api.analyserRepereTitre(n);
            expect(a, titre).toBeTruthy();
            expect(a.semaineTitre).toBe(sem);
            expect(a.titreNettoye).toBe(reste);
        });
    });

    it('ne voit pas de repère là où il n’y en a pas', () => {
        ['Les postures de lecture', 'Séminaire 3', 'Sémantique 4', ''].forEach((titre, i) => {
            const n = poser(api, 'x' + i, 'lecon', titre, { semaine: 1 });
            expect(api.analyserRepereTitre(n), titre).toBe(null);
        });
    });

    it('ignore les nœuds qui ne sont ni leçon ni séquence', () => {
        const n = poser(api, 'a1', 'activite', 'Sem. 3 - Atelier');
        expect(api.analyserRepereTitre(n)).toBe(null);
    });
});

describe('Repères · les cas SÛRS', () => {
    it('« pret » quand le titre CONCORDE avec la semaine posée', () => {
        const n = poser(api, 'l1', 'lecon', 'Sem. 3 - Les postures', { semaine: 3 });
        const a = api.analyserRepereTitre(n);
        expect(a.categorie).toBe('pret');
        expect(a.titreNettoye).toBe('Les postures');
    });

    it('« ancrable » quand la leçon n’est PAS posée', () => {
        const n = poser(api, 'l1', 'lecon', 'Sem. 3 - Les postures', {});
        expect(api.analyserRepereTitre(n).categorie).toBe('ancrable');
    });

    it('une SÉQUENCE se juge sur son étendue dérivée, jamais sur un champ à elle', () => {
        poser(api, 'l1', 'lecon', 'A', { semaine: 4 });
        const seq = poser(api, 's1', 'sequence', 'Sem. 4 - Bloc lecture', {}, ['l1']);
        api.etat.noeuds.get('l1').parent = 's1';

        const a = api.analyserRepereTitre(seq);
        expect(a.semaineAncree).toBe(4);
        expect(a.categorie).toBe('pret');
        expect(seq.metadata.semaine).toBeUndefined();
    });
});

describe('Repères · CE QU’ON REFUSE DE TOUCHER', () => {
    it('« conflit » quand le titre contredit la semaine posée', () => {
        const n = poser(api, 'l1', 'lecon', 'Sem. 3 - Les postures', { semaine: 8 });
        const a = api.analyserRepereTitre(n);
        expect(a.categorie).toBe('conflit');
        expect(a.semaineTitre).toBe(3);
        expect(a.semaineAncree).toBe(8);
    });

    it('un conflit N’EST PAS nettoyable, même si on le demande', () => {
        poser(api, 'l1', 'lecon', 'Sem. 3 - Les postures', { semaine: 8 });
        expect(api.retirerRepereTitre('l1', true)).toBe(false);
        expect(api.etat.noeuds.get('l1').titre).toBe('Sem. 3 - Les postures');
        expect(api.etat.noeuds.get('l1').metadata.semaine).toBe(8);
    });

    it('« vide » quand il ne resterait rien — le titre ne doit jamais se vider', () => {
        const n = poser(api, 'l1', 'lecon', 'Sem. 9 -', { semaine: 9 });
        expect(api.analyserRepereTitre(n).categorie).toBe('vide');
        expect(api.retirerRepereTitre('l1', false)).toBe(false);
        expect(api.etat.noeuds.get('l1').titre).toBe('Sem. 9 -');
    });

    it('« Sem. 1 séance 2 » ne devient PAS « séance 2 » — ça ne nomme rien', () => {
        // Le cas exact de la ligne 1 du planificateur de Grégoire.
        const n = poser(api, 'l1', 'lecon', 'Sem. 1 séance 2', { semaine: 1 });
        const a = api.analyserRepereTitre(n);
        expect(a.categorie).toBe('vide');
        expect(a.aRepereSeance).toBe(true);
        expect(api.retirerRepereTitre('l1', false)).toBe(false);
    });

    it('le repère de SÉANCE survit au nettoyage quand le titre garde du sens', () => {
        // Ici « Analyse » nomme la leçon : le retrait est légitime, mais le
        // repère de séance RESTE — il compense un concept qui n'existe pas
        // encore dans le modèle.
        const n = poser(api, 'l1', 'lecon', 'Sem. 2 - Analyse (séance 1)', { semaine: 2 });
        const a = api.analyserRepereTitre(n);
        expect(a.categorie).toBe('pret');
        expect(a.aRepereSeance).toBe(true);

        api.retirerRepereTitre('l1', false);
        expect(api.etat.noeuds.get('l1').titre).toBe('Analyse (séance 1)');
    });
});

describe('Repères · l’application', () => {
    it('retirer un repère « pret » ne touche PAS la semaine posée', () => {
        poser(api, 'l1', 'lecon', 'Sem. 3 - Les postures', { semaine: 3 });

        expect(api.retirerRepereTitre('l1', false)).toBe(true);
        expect(api.etat.noeuds.get('l1').titre).toBe('Les postures');
        expect(api.etat.noeuds.get('l1').metadata.semaine).toBe(3);
    });

    it('« ancrable » avec confirmation : la semaine est posée ET le titre nettoyé', () => {
        poser(api, 'l1', 'lecon', 'Sem. 6 - Révision', {});

        expect(api.retirerRepereTitre('l1', true)).toBe(true);
        expect(api.etat.noeuds.get('l1').metadata.semaine).toBe(6);
        expect(api.etat.noeuds.get('l1').titre).toBe('Révision');
    });

    it('« ancrable » SANS confirmation : le titre est nettoyé, rien n’est ancré', () => {
        // L'ancrage est une DÉDUCTION depuis le texte : il ne se produit que si
        // l'enseignant l'a explicitement demandé.
        poser(api, 'l1', 'lecon', 'Sem. 6 - Révision', {});

        expect(api.retirerRepereTitre('l1', false)).toBe(true);
        expect(api.etat.noeuds.get('l1').titre).toBe('Révision');
        expect(api.etat.noeuds.get('l1').metadata.semaine).toBeUndefined();
    });

    it('appliquer deux fois ne fait rien la seconde — le repère a disparu', () => {
        poser(api, 'l1', 'lecon', 'Sem. 3 - Les postures', { semaine: 3 });
        expect(api.retirerRepereTitre('l1', false)).toBe(true);
        expect(api.retirerRepereTitre('l1', false)).toBe(false);
        expect(api.etat.noeuds.get('l1').titre).toBe('Les postures');
    });
});

describe('Repères · l’inventaire', () => {
    it('trie la carte entière par catégorie, sans rien perdre', () => {
        poser(api, 'l1', 'lecon', 'Sem. 3 - Postures', { semaine: 3 });      // pret
        poser(api, 'l2', 'lecon', 'Sem. 6 - Révision', {});                   // ancrable
        poser(api, 'l3', 'lecon', 'Sem. 3 - Décalée', { semaine: 8 });        // conflit
        poser(api, 'l4', 'lecon', 'Sem. 1 séance 2', { semaine: 1 });         // vide
        poser(api, 'l5', 'lecon', 'Sans repère', { semaine: 2 });             // ignorée

        const inv = api.inventaireReperesTitres();

        expect(inv.pret.map((a) => a.id)).toEqual(['l1']);
        expect(inv.ancrable.map((a) => a.id)).toEqual(['l2']);
        expect(inv.conflit.map((a) => a.id)).toEqual(['l3']);
        expect(inv.vide.map((a) => a.id)).toEqual(['l4']);
    });

    it('l’inventaire est en LECTURE PURE — il ne nettoie rien au passage', () => {
        poser(api, 'l1', 'lecon', 'Sem. 3 - Postures', { semaine: 3 });
        const avant = JSON.stringify(store);

        api.inventaireReperesTitres();

        expect(api.etat.noeuds.get('l1').titre).toBe('Sem. 3 - Postures');
        expect(JSON.stringify(store)).toBe(avant);
    });
});
