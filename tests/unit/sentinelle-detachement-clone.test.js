import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// ═══════════════════════════════════════════════════════════════════════════
// DÉTACHER UN BLOC DE SA FAMILLE DE CLONES (16 août 2026, demande de Grégoire)
//
// La distinction copie / clone livrée le même jour ne vaut que pour les gestes
// À VENIR. Les blocs dupliqués avant — avec un ⌥ qui rendait un clone sans le
// dire — restent liés, et Grégoire a choisi de NE PAS les convertir en masse.
// Sans porte de sortie, ce choix l'enfermait.
//
// ⚠ L'invariant qui compte le plus ici n'est pas « le lien est rompu », c'est
// « RIEN D'AUTRE n'a bougé ». Détacher arrête les propagations futures ; il ne
// défait pas les propagations passées et ne touche à aucune donnée.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

let win;
function monter() {
    const store = {};
    win = chargerScript('js/planification-carte.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => k,
        echapperHtml: (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
        requestAnimationFrame: (f) => { f(); return 0; }
    });
    win.cle = (k) => k;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'c1' }), sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    return win.planificationCarte;
}

/**
 * Une famille FABRIQUÉE PAR LE MODULE, pas posée à la main.
 * ⚠ Les clones se résolvent par `_cloneIndex`, un index privé alimenté à la
 * création. Une famille écrite directement dans la Map n'y est pas : le cas
 * testerait le montage, pas le détachement. On passe donc par `chargerCarte`,
 * le chemin d'un import réel — c'est lui qui reconstruit l'index.
 */
function familleDEssai(api, extra) {
    win.planificationDonnees.chargerCarte = () => ({
        compteur: 3, compteurLiens: 0, liens: [],
        noeuds: [
            { id: 'orig', type: 'activite', titre: 'Original', x: 0, y: 0, parent: null,
              enfants: [], metadata: { duree: 30 }, cloneSourceId: null },
            { id: 'c1', type: 'activite', titre: 'Original', x: 60, y: 60, parent: null,
              enfants: [], metadata: { duree: 30 }, cloneSourceId: 'orig' },
            { id: 'c2', type: 'activite', titre: 'Original', x: 120, y: 120, parent: null,
              enfants: [], metadata: { duree: 30 }, cloneSourceId: 'orig' }
        ].concat(extra || [])
    });
    api.chargerCarte('c1');
    // Le chargeur PRÉFIXE les ids.
    return { orig: 'planif-orig', c1: 'planif-c1', c2: 'planif-c2' };
}

describe('Détacher un clone de sa famille', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('détacher UN clone ne libère que lui', () => {
        const ID = familleDEssai(api);
        expect(api.detacherDeLaFamille([ID.c1])).toBe(1);
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId).toBeNull();
        // L'autre clone reste dans la famille.
        expect(api.etat.noeuds.get(ID.c2).cloneSourceId).toBe(ID.orig);
    });

    it('⚠⚠ le bloc détaché CESSE de suivre son original — c’est tout l’objet', () => {
        const ID = familleDEssai(api);
        api.detacherDeLaFamille([ID.c1]);
        api.definirTypeNoeud(ID.orig, 'soutien');
        expect(api.etat.noeuds.get(ID.c1).type, 'le détaché a suivi malgré tout').toBe('activite');
        // …et celui qui est resté, lui, suit toujours.
        expect(api.etat.noeuds.get(ID.c2).type).toBe('soutien');
    });

    it('⚠ RIEN D’AUTRE ne bouge — détacher n’est pas défaire', () => {
        // Détacher arrête les propagations FUTURES ; il ne rend pas au bloc un
        // état d'avant. Ce qu'il avait reçu, il le garde.
        const ID = familleDEssai(api);
        const avant = JSON.parse(JSON.stringify(api.etat.noeuds.get(ID.c1)));
        api.detacherDeLaFamille([ID.c1]);
        const apres = api.etat.noeuds.get(ID.c1);
        expect(apres.titre).toBe(avant.titre);
        expect(apres.type).toBe(avant.type);
        expect(apres.metadata).toEqual(avant.metadata);
        expect(apres.x).toBe(avant.x);
        expect(apres.y).toBe(avant.y);
        expect(apres.parent).toBe(avant.parent);
        // Seul `cloneSourceId` a changé.
        expect(avant.cloneSourceId).toBe(ID.orig);
        expect(apres.cloneSourceId).toBeNull();
    });

    it('⚠⚠ détacher l’ORIGINAL dissout la famille ENTIÈRE', () => {
        // Un original ne peut pas « partir » en laissant ses clones pointer vers
        // lui : ou il reste, ou la famille n'existe plus. Prétendre le détacher
        // seul laisserait des clones visant un id qui n'est plus une source —
        // un état que rien dans le module ne sait lire.
        const ID = familleDEssai(api);
        expect(api.detacherDeLaFamille([ID.orig])).toBe(2);
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId).toBeNull();
        expect(api.etat.noeuds.get(ID.c2).cloneSourceId).toBeNull();
        // Plus aucune propagation nulle part.
        api.definirTypeNoeud(ID.orig, 'revision');
        expect(api.etat.noeuds.get(ID.c1).type).toBe('activite');
        expect(api.etat.noeuds.get(ID.c2).type).toBe('activite');
    });

    it('rend 0 sur un bloc sans famille, et n’écrit rien', () => {
        const ID = familleDEssai(api, [
            { id: 'seul', type: 'expose', titre: 'Seul', x: 300, y: 300, parent: null,
              enfants: [], metadata: {}, cloneSourceId: null }
        ]);
        expect(api.detacherDeLaFamille(['planif-seul'])).toBe(0);
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId, 'une famille voisine a été touchée')
            .toBe(ID.orig);
    });

    it('rend 0 sur une sélection vide ou inconnue', () => {
        familleDEssai(api);
        expect(api.detacherDeLaFamille([])).toBe(0);
        expect(api.detacherDeLaFamille(null)).toBe(0);
        expect(api.detacherDeLaFamille(['inexistant'])).toBe(0);
    });

    it('⚠ le résultat ne dépend PAS de l’ordre de la sélection', () => {
        // L'original ET un de ses clones sélectionnés ensemble : dissoudre la
        // famille en la parcourant ferait dépendre le compte de l'ordre.
        const a = monter(); const IDa = familleDEssai(a);
        const nA = a.detacherDeLaFamille([IDa.orig, IDa.c1]);
        const b = monter(); const IDb = familleDEssai(b);
        const nB = b.detacherDeLaFamille([IDb.c1, IDb.orig]);
        expect(nA).toBe(nB);
        expect(nA).toBe(2);
    });

    it('⚠ l’index inverse est PURGÉ, pas seulement le champ', () => {
        // Si `_cloneIndex` gardait l'entrée, `trouverClones` continuerait de
        // rendre le bloc détaché et la propagation le rattraperait — le champ
        // dirait « libre » et le comportement dirait le contraire.
        const ID = familleDEssai(api);
        api.detacherDeLaFamille([ID.c1]);
        const famille = api.trouverClones ? api.trouverClones(ID.orig).map(n => n.id) : null;
        if (famille) expect(famille).not.toContain(ID.c1);
        // Preuve par le comportement, qui vaut mieux que par l'index :
        api.definirTypeNoeud(ID.orig, 'soutien');
        expect(api.etat.noeuds.get(ID.c1).type).toBe('activite');
    });

    it('l’annulation est enregistrée AVANT l’écriture, et seulement s’il y a matière', () => {
        const corps = source.slice(source.indexOf('function detacherDeLaFamille'),
            source.indexOf('* Dupliquer TOUTE la multi-sélection'));
        // Le garde de vacuité précède l'empilement : détacher « rien » ne doit
        // pas consommer un cran d'annulation.
        expect(corps.indexOf('if (aDetacher.size === 0) return 0;'))
            .toBeLessThan(corps.indexOf('enregistrerPourUndo()'));
        expect(corps.indexOf('enregistrerPourUndo()')).toBeGreaterThan(-1);
    });

    it('le geste existe dans le menu Actions, et il dit qu’il porte sur la sélection', () => {
        expect(html).toMatch(/id="planif-btn-detacher-clone"/);
        expect(source).toMatch(/planif-btn-detacher-clone/);
        // ⚠ Sans retour visible, un clic qui ne trouve rien à détacher passerait
        // pour une panne. Les deux issues muettes sont DITES.
        expect(source).toMatch(/Sélectionne d’abord un bloc marqué/);
        expect(source).toMatch(/Rien à détacher/);
    });
});
