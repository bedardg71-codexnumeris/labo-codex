/**
 * « APPORTER MON MATÉRIEL », LOT 2 — l'assistant et la création.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-2.md (« Les bancs »),
 * avec la décision de Grégoire du 17 oct. : la note retenue de chaque niveau est DEMANDÉE
 * (la consigne supposait un repli sur le milieu de plage, retiré par #527).
 *
 * ⚰ 19 oct. 2026 : l'assistant en sept étapes est RETIRÉ (CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md).
 * Partis avec lui : E (ses étapes), R (« Ramener à 100 % »), K (« À classer »), S.a (ses écrans), et le
 * geste « Ajouter un niveau » de N. Ce qui reste éprouve la logique commune (`calculs`, `construire`,
 * `materielCreation.creer`, la confirmation), sur les modèles qu'il produisait, figés avant son retrait.
 *
 * Ce que ce banc verrouille :
 *   V — VÉRIFICATIONS : ce qui bloque la création (dont un passage en attente), ce qui avertit
 *       seulement (chevauchement, trou, total ≠ 100).
 *   N — #1091 : au plus 20 niveaux ; au-delà, la création est refusée.
 *   B — CONSTRUIRE : plages contiguës, note retenue SAISIE (jamais le milieu), descripteurs liés
 *       à l'échelle créée, cartouche seulement pour des rétroactions.
 *   W — ÉCRIRE : trois objets NEUFS ; aucun objet existant touché ; un échec ne laisse rien de
 *       partiel ; refus sans trimestre actif ou en trimestre clos.
 *   S — SÉCURITÉ : la confirmation échappe le nom de la grille.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { fige } from './_helpers/modeles-assistant-figes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

function vraiEchapperHtml() {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, fenetreDom.document, console, stockage, stockage);
}

/** Un faux `db` qui se comporte comme le vrai pour `modifier` : lire, muter, écrire (copies JSON). */
const db = {
    store: new Map(),
    echouerSur: null,
    reset(initial) { this.store = new Map(Object.entries(JSON.parse(JSON.stringify(initial || {})))); this.echouerSur = null; },
    getSync(k, d) { return this.store.has(k) ? JSON.parse(JSON.stringify(this.store.get(k))) : d; },
    async get(k, d) { return this.getSync(k, d); },
    async set(k, v) {
        if (this.echouerSur && this.echouerSur(k, v)) throw new Error('écriture refusée (banc)');
        this.store.set(k, JSON.parse(JSON.stringify(v)));
    },
    async modifier(k, mutateur, d) {
        const r = await mutateur(await this.get(k, d));
        if (r === undefined) return undefined;
        await this.set(k, r);
        return r;
    }
};

let w, A, C, materiel;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', {});   // `plagesContigues`, que `construire` appelle
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db }, w);
    A = w.materielAssistant; C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
});
beforeEach(() => {
    w.cle = (k) => 'a2032_' + k;
    w.estTrimestreArchive = () => false;
    db.reset({});
});

const exemple = () => fige('lot 2 · l’exemple lu');
const exempleComplet = () => fige('lot 2 · l’exemple complété');
const retroactions = () => fige('lot 2 · rétroactions');
const ctx = (extra) => Object.assign({ id: (p) => p + 'x' + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' }, extra || {});

describe('V — ce qui bloque, ce qui avertit', () => {
    it('V.a l’exemple tel que lu ne se crée pas : plages, notes retenues et passage manquent', () => {
        expect(A.calculs(exemple()).manquants).toEqual([
            'la plage de notes de 4 niveaux', 'la note retenue de 4 niveaux', 'un passage à classer ou à écarter'
        ]);
        expect(A.calculs(exempleComplet()).manquants).toEqual([]);
    });

    it('V.b un passage en attente bloque la création, et lui seul', () => {
        const enAttente = fige('lot 2 · un passage en attente');
        expect(A.calculs(enAttente).manquants).toEqual(['un passage à classer ou à écarter']);
    });

    it('V.c chevauchement et trou avertissent au conditionnel, sans bloquer', () => {
        const chevauche = exempleComplet();
        chevauche.niveaux[1].max.valeur = '90';
        const c1 = A.calculs(chevauche);
        expect(c1.avertPlages).toContain('se chevauchent');
        expect(c1.avertPlages).toContain('pourrait');
        expect(c1.manquants).toEqual([]);
        const trou = exempleComplet();
        trou.niveaux[1].max.valeur = '80';
        expect(A.calculs(trou).avertPlages).toContain('un trou');
        expect(A.calculs(exempleComplet()).avertPlages).toBe('');   // 65-74, 75-84 : contiguës, aucun avertissement
    });

    it('V.d un total ≠ 100 avertit sans bloquer ; une pondération non entière bloque (lue en entier par l’application)', () => {
        const m = exempleComplet();
        m.criteres[0].ponderation.valeur = '50';
        const c = A.calculs(m);
        expect(c.total).toBe(110);
        expect(c.avertPond).toBe(true);
        expect(c.peutRamener).toBe(true);
        expect(c.manquants).toEqual([]);
        m.criteres[0].ponderation.valeur = '12,5';
        expect(A.calculs(m).manquants).toEqual(['une pondération en nombre entier de 0 à 100 pour un critère']);
    });

    it('V.e un nom de grille déjà pris dans le trimestre bloque', () => {
        expect(A.calculs(exempleComplet(), { nomsGrilles: ['exposé oral : grille d’évaluation'] }).manquants[0])
            .toContain('existe déjà dans ce trimestre');
    });

    it('V.f une note retenue hors de sa plage avertit sans bloquer', () => {
        const m = exempleComplet();
        m.niveaux[0].note.valeur = '60';
        const c = A.calculs(m);
        expect(c.avertNotes).toContain('hors de sa plage');
        expect(c.manquants).toEqual([]);
    });
});

describe('N — #1091 : au plus 20 niveaux', () => {
    it('N.a au-delà de 20 niveaux, la création est refusée et le dit', () => {
        const m = fige('lot 2 · vingt niveaux');   // le geste « Ajouter un niveau » s'arrêtait à 20 (retiré avec l'assistant)
        expect(m.niveaux).toHaveLength(20);
        expect(A.calculs(m).manquants).not.toContain('au plus 20 niveaux (ta grille en a 20)');
        const trop = JSON.parse(JSON.stringify(m));
        trop.niveaux.push(JSON.parse(JSON.stringify(trop.niveaux[0])));
        expect(A.calculs(trop).manquants).toContain('au plus 20 niveaux (ta grille en a 21)');
    });
});

describe('B — construire les trois objets', () => {
    it('B.a des plages saisies en entiers s’enregistrent contiguës (max = min suivant − 0,01)', () => {
        const { echelle } = A.construire(exempleComplet(), ctx());
        expect(echelle.niveaux.map(n => [n.min, n.max])).toEqual([[85, 100], [75, 84.99], [65, 74.99], [0, 64.99]]);
    });

    it('B.b la note retenue est celle SAISIE, jamais le milieu de la plage', () => {
        const { echelle } = A.construire(exempleComplet(), ctx());
        expect(echelle.niveaux.map(n => n.valeurCalcul)).toEqual([92, 80, 70, 50]);   // milieux : 92,5 · 79,995 · 69,995 · 32,495
        expect(echelle.niveaux.map(n => Object.keys(n).sort())).toEqual(
            echelle.niveaux.map(() => ['code', 'couleur', 'description', 'max', 'min', 'nom', 'valeurCalcul']));
        expect(echelle.niveaux.map(n => n.couleur)).toEqual(['#27ae60', '#3498db', '#f39c12', '#e74c3c']);
    });

    it('B.c des descripteurs : liés à l’échelle créée, par code de niveau, sans cartouche', () => {
        const m = exempleComplet();
        m.criteres[2].cases[3] = { valeur: '', etat: 'vide' };
        const o = A.construire(m, ctx());
        expect(o.cartouche).toBeNull();
        expect(o.grille.criteres[0].descripteurs).toEqual({
            echelleId: o.echelle.id,
            parNiveau: { E: m.criteres[0].cases[0].valeur, S: m.criteres[0].cases[1].valeur, A: m.criteres[0].cases[2].valeur, I: m.criteres[0].cases[3].valeur }
        });
        expect(Object.keys(o.grille.criteres[2].descripteurs.parNiveau)).toEqual(['E', 'S', 'A']);   // case vide : rien
        expect(o.grille.criteres.map(c => c.ponderation)).toEqual([40, 30, 30]);
        expect(o.grille.criteres.every(c => c.type === 'holistique')).toBe(true);
    });

    it('B.d des rétroactions : une cartouche liée à la grille et à l’échelle, et une grille sans descripteurs', () => {
        const m = retroactions();
        const o = A.construire(m, ctx());
        expect(o.grille.criteres.some(c => c.descripteurs)).toBe(false);
        expect(o.cartouche).toMatchObject({ grilleId: o.grille.id, echelleId: o.echelle.id });
        const cr = o.grille.criteres[1].id;
        expect(o.cartouche.commentaires[cr + '_S']).toBe(m.criteres[1].cases[1].valeur);
        expect(Object.keys(o.cartouche.commentaires)).toHaveLength(12);
        expect(o.cartouche.niveaux).toEqual([{ code: 'E', nom: 'Excellent' }, { code: 'S', nom: 'Satisfaisant' }, { code: 'A', nom: 'À améliorer' }, { code: 'I', nom: 'Insuffisant' }]);
    });

    it('B.e des rétroactions sans aucun texte : pas de cartouche vide', () => {
        const m = retroactions();
        m.criteres.forEach(c => c.cases.forEach(d => { d.valeur = ''; }));
        expect(A.construire(m, ctx()).cartouche).toBeNull();
    });

    it('B.f l’échelle prend un nom libre ; les identifiants viennent du générateur', () => {
        const o = A.construire(exempleComplet(), ctx({ nomsEchelles: ['Échelle – Exposé oral : grille d’évaluation'] }));
        expect(o.echelle.nom).toBe('Échelle – Exposé oral : grille d’évaluation (2)');
        expect(o.echelle.id).toMatch(/^ECH_x\d+$/);
        expect(o.grille.id).toMatch(/^GRILLE_x\d+$/);
        expect(o.grille.criteres.every(c => /^CR_x\d+$/.test(c.id))).toBe(true);
    });
});

describe('W — écrire : trois objets neufs, rien d’autre', () => {
    const EXISTANTS = {
        a2032_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille de départ', criteres: [{ id: 'CR_A', nom: 'A', ponderation: 100 }] }],
        a2032_echellesTemplates: [{ id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)', niveaux: [{ code: 'I', min: 0, max: 64.99, valeurCalcul: 32 }] }],
        a2032_cartouches_GRILLE_GENERIQUE: [{ id: 'CART_GENERIQUE', grilleId: 'GRILLE_GENERIQUE', commentaires: { CR_A_I: 'x' } }],
        h2026_grillesTemplates: [{ id: 'GRILLE_H', nom: 'Une grille d’un autre trimestre' }]
    };

    it('W.a « Créer » ajoute l’échelle, la grille et la cartouche au trimestre actif ; aucun objet existant ne change', async () => {
        db.reset(EXISTANTS);
        const r = await C.creer(retroactions());
        expect(r.erreur).toBeUndefined();
        const grilles = db.getSync('a2032_grillesTemplates');
        const echelles = db.getSync('a2032_echellesTemplates');
        expect(grilles).toHaveLength(2);
        expect(echelles).toHaveLength(2);
        expect(grilles[0]).toEqual(EXISTANTS.a2032_grillesTemplates[0]);
        expect(echelles[0]).toEqual(EXISTANTS.a2032_echellesTemplates[0]);
        expect(db.getSync('a2032_cartouches_GRILLE_GENERIQUE')).toEqual(EXISTANTS.a2032_cartouches_GRILLE_GENERIQUE);
        expect(db.getSync('h2026_grillesTemplates')).toEqual(EXISTANTS.h2026_grillesTemplates);
        expect(db.getSync('a2032_cartouches_' + grilles[1].id)).toEqual([r.objets.cartouche]);
        expect(r.resume).toMatchObject({ nom: 'Exposé oral : grille d’évaluation', nbC: 3, retro: true, descr: false });
        expect([...db.store.keys()].sort()).toEqual([...Object.keys(EXISTANTS), 'a2032_cartouches_' + grilles[1].id].sort());
    });

    it('W.b aucun trimestre actif : refus clair, rien n’est écrit', async () => {
        w.cle = (k) => k;   // ce que fait `cle()` avant que le trimestre actif soit connu (#358)
        const r = await C.creer(exempleComplet());
        expect(r.erreur).toBe(C.MESSAGES.sansTrimestre);
        expect(db.store.size).toBe(0);
    });

    it('W.c trimestre clos : refus clair, avec le mot « clos » (pas « archivé »), rien n’est écrit', async () => {
        w.estTrimestreArchive = () => true;   // lit un trimestre CLOS, malgré son nom
        const erreur = (await C.creer(exempleComplet())).erreur;
        expect(erreur).toBe(C.MESSAGES.clos);
        expect(erreur).toContain('est clos');
        expect(erreur).not.toMatch(/archiv/i);   // « archivé » = déposé hors du navigateur (vocabulaire de Grégoire)
        expect(db.store.size).toBe(0);
    });

    it('W.d la grille ne s’écrit pas : l’échelle déjà écrite est retirée, les objets existants restent', async () => {
        db.reset(EXISTANTS);
        db.echouerSur = (k) => k === 'a2032_grillesTemplates';
        const r = await C.creer(exempleComplet());
        expect(r.erreur).toBe(C.MESSAGES.echec);
        db.echouerSur = null;
        expect(db.getSync('a2032_echellesTemplates')).toEqual(EXISTANTS.a2032_echellesTemplates);
        expect(db.getSync('a2032_grillesTemplates')).toEqual(EXISTANTS.a2032_grillesTemplates);
    });

    it('W.e la cartouche ne s’écrit pas : la grille et l’échelle sont retirées', async () => {
        db.reset(EXISTANTS);
        db.echouerSur = (k) => k.indexOf('a2032_cartouches_GRILLE_') === 0 && k !== 'a2032_cartouches_GRILLE_GENERIQUE';
        const r = await C.creer(retroactions());
        expect(r.erreur).toBe(C.MESSAGES.echec);
        expect(db.getSync('a2032_echellesTemplates')).toEqual(EXISTANTS.a2032_echellesTemplates);
        expect(db.getSync('a2032_grillesTemplates')).toEqual(EXISTANTS.a2032_grillesTemplates);
    });

    it('W.f un retrait qui échoue lui aussi est DIT, avec le nom de ce qui pourrait rester', async () => {
        db.reset(EXISTANTS);
        db.echouerSur = (k, v) => k === 'a2032_grillesTemplates' || (k === 'a2032_echellesTemplates' && v.length === 1);
        const r = await C.creer(exempleComplet());
        expect(r.erreur).toContain(C.MESSAGES.echecPartiel);
        expect(r.erreur).toContain('« Échelle – Exposé oral : grille d’évaluation »');
    });

    it('W.g un identifiant déjà pris n’écrase rien : l’écriture est refusée', async () => {
        db.reset({ a2032_echellesTemplates: [{ id: 'ECH_pris', nom: 'À moi' }] });
        await expect(C.ajouter('a2032_echellesTemplates', { id: 'ECH_pris', nom: 'Neuve' })).rejects.toThrow('déjà pris');
        expect(db.getSync('a2032_echellesTemplates')).toEqual([{ id: 'ECH_pris', nom: 'À moi' }]);
    });
});

describe('S — la confirmation échappe tout texte', () => {
    const PIEGE = '"><img src=x onerror=alert(1)>';

    it('S.b la confirmation échappe le nom de la grille', () => {
        const html = materiel.confirmationHtml({ nom: PIEGE, nbC: 1, retro: false, descr: false, niveaux: [PIEGE] });
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });
});
