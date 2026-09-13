import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// =======================================================================
// SENTINELLE #445 — le tracé de lien vers un objectif, et la légende
// =======================================================================
//
// Terrain du 10 août 2026 : Grégoire a tenté de relier une activité à un
// objectif EN TRAÇANT UN LIEN, et n'a rien obtenu. Ce n'était pas un bug —
// #403 a tranché que ce lien se déclare par cases à cocher, et le tracé
// n'existait tout simplement pas comme canal. Mais le canevas enseigne le
// tracé partout ailleurs : le geste sera retenté, et un geste sans effet ET
// SANS MESSAGE est indiscernable d'une panne.
//
// Second volet : les pastilles `!` / `⚠` / `✓` ne disaient leur sens que
// dans un attribut `title` — une infobulle au SURVOL, donc inexistante sur
// iPad, où toute la carte se manipule depuis #444.
//
// Ce qui est verrouillé ici :
//   A. déposer sur une ligne d'objectif COCHE la case, par la porte unique
//      `definirObjectifsServis` (pas un second système d'écriture) ;
//   B. le dépôt AJOUTE, il ne bascule pas — un second dépôt ne décoche pas ;
//   C. les refus sont DITS, jamais silencieux (type non servant, bloc d'une
//      autre leçon) — c'est tout l'objet de l'item ;
//   D. la ligne d'accueil (objectif pas encore créé) rend la main au chemin
//      normal au lieu d'inventer un message ;
//   E. le dépôt n'écrit jamais un id que la lecture filtrerait ensuite ;
//   F. la légende porte les TROIS états avec leurs symboles ;
//   G. la légende du guide et celle de l'Inspecteur viennent de la MÊME
//      fonction — deux surfaces qui divergent, c'est le défaut #443.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

let api;

function monterModule() {
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const db = {
        getSync: (k, d) => (d !== undefined ? d : null),
        setSync: () => {}, get: async (k, d) => d, set: async () => {}
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            execCommand: () => true,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    api = win.planificationCarte;
    return api;
}

function poserNoeud(id, type, extra) {
    const n = Object.assign({
        id, type, titre: 'Bloc', x: 0, y: 0,
        parent: null, enfants: [], metadata: {}, cloneSourceId: null
    }, extra || {});
    api.etat.noeuds.set(id, n);
    return n;
}

/** Ce que `elementFromPoint(...).closest('.planif-noeud-objectif-ligne')` rend. */
function ligneObjectif(leconId, objectifId) {
    return {
        querySelector(sel) {
            if (sel !== '.planif-noeud-objectif[data-obj-id]') return null;
            if (!objectifId) return null;          // ligne d'accueil
            return { getAttribute: (a) => (a === 'data-obj-id' ? objectifId : null) };
        },
        closest(sel) {
            return sel === '.planif-noeud' ? { id: leconId } : null;
        }
    };
}

/** Leçon à deux objectifs + une activité dedans — la scène du terrain. */
function scene() {
    const lecon = poserNoeud('lecon_1', 'lecon', {
        enfants: ['act_1'],
        metadata: { objectifs: [
            { id: 'OBJ_A', texte: 'Analyser un poème' },
            { id: 'OBJ_B', texte: 'Rédiger une introduction' }
        ] }
    });
    const act = poserNoeud('act_1', 'activite', { parent: 'lecon_1' });
    return { lecon, act };
}

beforeEach(() => { monterModule(); });

describe('#445 · A/B — déposer un lien sur un objectif coche la case', () => {

    it('A · le dépôt écrit l’objectif dans les « objectifs servis » du bloc source', () => {
        const { act } = scene();

        const traite = api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', 'OBJ_A'));

        expect(traite).toBe(true);
        expect(api.objectifsServisPar(act)).toEqual(['OBJ_A']);
    });

    it('A2 · l’état de l’objectif change vraiment (la pastille a de quoi virer)', () => {
        const { lecon } = scene();
        expect(api.evaluerObjectif(lecon, 'OBJ_A').etat).toBe('invitation');

        api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', 'OBJ_A'));

        // Servi mais non vérifié : aucune évaluation dans la leçon.
        expect(api.evaluerObjectif(lecon, 'OBJ_A').etat).toBe('servi');
    });

    it('B · un second dépôt n’efface pas — il ajoute, il ne bascule pas', () => {
        const { act } = scene();
        api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', 'OBJ_A'));
        api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', 'OBJ_A'));

        expect(api.objectifsServisPar(act)).toEqual(['OBJ_A']);
    });

    it('B2 · deux objectifs différents s’accumulent (le premier n’est pas remplacé)', () => {
        const { act } = scene();
        api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', 'OBJ_A'));
        api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', 'OBJ_B'));

        expect(api.objectifsServisPar(act).sort()).toEqual(['OBJ_A', 'OBJ_B']);
    });
});

describe('#445 · C/D/E — les refus sont dits, jamais muets', () => {

    it('C · un bloc d’un TYPE non servant est refusé, et le dépôt est traité (message)', () => {
        scene();
        poserNoeud('conn_1', 'connaissance', { parent: 'lecon_1' });

        const traite = api.deposerLienSurObjectif('conn_1', ligneObjectif('lecon_1', 'OBJ_A'));

        // `true` = « j'ai traité ce dépôt » : le menu de lien ne s'ouvre pas
        // derrière, et l'utilisateur a reçu une explication.
        expect(traite).toBe(true);
        expect(api.objectifsServisPar(api.etat.noeuds.get('conn_1'))).toEqual([]);
    });

    it('C2 · un bloc d’une AUTRE leçon est refusé — sans écrire un id mort', () => {
        scene();
        poserNoeud('lecon_2', 'lecon', {
            enfants: ['act_2'],
            metadata: { objectifs: [{ id: 'OBJ_Z', texte: 'Autre' }] }
        });
        const autre = poserNoeud('act_2', 'activite', { parent: 'lecon_2' });

        const traite = api.deposerLienSurObjectif('act_2', ligneObjectif('lecon_1', 'OBJ_A'));

        expect(traite).toBe(true);
        // E · le point qui compte : rien n'a été écrit. `objectifsServisPar`
        // filtre à la leçon parente — un id étranger produirait une case
        // cochée que la lecture écarterait, donc un mensonge silencieux.
        expect(api.objectifsServisPar(autre)).toEqual([]);
        expect(autre.metadata.objectifsServis).toBeUndefined();
    });

    it('D · la ligne d’accueil rend la main au chemin normal (pas de faux message)', () => {
        scene();

        // Pas de data-obj-id : l'objectif n'existe pas encore.
        const traite = api.deposerLienSurObjectif('act_1', ligneObjectif('lecon_1', null));

        expect(traite).toBe(false);
    });

    it('D2 · un bloc source inconnu rend la main plutôt que d’inventer une erreur', () => {
        scene();
        expect(api.deposerLienSurObjectif('fantome', ligneObjectif('lecon_1', 'OBJ_A'))).toBe(false);
    });
});

describe('#445 · H — l’ordre d’interception au dépôt (cliquet de source)', () => {

    // ⚠ CE CAS EST UN CLIQUET DE SOURCE, ET C'EST DIT. La ligne d'objectif vit
    // DANS le bloc leçon : si `closest('.planif-noeud')` était consulté en
    // premier, le dépôt retomberait dans le menu de lien et le geste
    // redeviendrait muet. Cet ordre se vérifierait idéalement au navigateur —
    // mais le canevas d'Alignement ne se révèle pas en headless (section
    // conditionnée), donc `getBoundingClientRect` y rend 0×0 et
    // `elementFromPoint` ne peut rien viser. Le reste de #445 EST vérifié au
    // navigateur (écriture, bascule de pastille, toast, légende de
    // l'Inspecteur) ; cet ordre-ci ne l'est pas, et vaut donc ce que vaut un
    // cliquet : il détecte l'inversion, il ne prouve pas le rendu.

    /** Le corps de `onUp` dans `demarrerLien`, COMMENTAIRES RETIRÉS. */
    function corpsOnUp() {
        const debut = sourceCarte.indexOf('    function onUp(e2) {');
        expect(debut).toBeGreaterThan(-1);
        const fin = sourceCarte.indexOf('\n    }', debut);
        // Le piège de la sous-chaîne a mordu quatre fois le 10 août : un
        // commentaire cite forcément le code qu'il explique, donc la sonde le
        // trouverait AVANT le code et mesurerait l'ordre à l'envers.
        return sourceCarte.slice(debut, fin).replace(/\/\/[^\n]*/g, '');
    }

    it('la ligne d’objectif est consultée AVANT le nœud qui la contient', () => {
        const corps = corpsOnUp();
        const iLigne = corps.indexOf(".closest('.planif-noeud-objectif-ligne')");
        const iNoeud = corps.indexOf(".closest('.planif-noeud')");
        expect(iLigne).toBeGreaterThan(-1);
        expect(iNoeud).toBeGreaterThan(-1);
        expect(iLigne).toBeLessThan(iNoeud);
    });

    it('un dépôt traité SORT — il ne retombe pas dans le menu de lien', () => {
        const corps = corpsOnUp();
        const iAppel = corps.indexOf('deposerLienSurObjectif(');
        const iRetour = corps.indexOf('return;', iAppel);
        const iMenu = corps.indexOf('afficherMenuLien(');
        expect(iAppel).toBeGreaterThan(-1);
        expect(iRetour).toBeGreaterThan(iAppel);
        expect(iRetour).toBeLessThan(iMenu);
    });
});

describe('#445 · F/G — la légende des pastilles est découvrable', () => {

    it('F · elle porte les trois états avec leurs symboles', () => {
        monterModule();
        const html = api.legendePastillesObjectifHTML();

        for (const etat of ['invitation', 'servi', 'verifie']) {
            expect(html).toContain('planif-obj-pastille--' + etat);
            expect(html).toContain(api.SYMBOLES_PASTILLE_OBJECTIF[etat]);
        }
        expect(api.LEGENDE_PASTILLES_OBJECTIF).toHaveLength(3);
        for (const e of api.LEGENDE_PASTILLES_OBJECTIF) {
            expect(html).toContain(e.libelle);
        }
    });

    it('G · le guide ET l’Inspecteur appellent la MÊME fonction (source unique)', () => {
        // Le sens des trois symboles vit à un seul endroit. Deux surfaces qui
        // le réécrivent chacune de leur côté finissent par diverger — c'est
        // exactement le défaut que #443 a mis au jour ailleurs dans l'app.
        //
        // ⚠ PREMIER JET RESTÉ VERT AU BREAK-TEST, et la faute était dans CE
        // test : il comptait les lignes contenant `legendePastillesObjectifHTML()`
        // avec un seuil « ≥ 2 » — or la LIGNE DE DÉCLARATION en fait partie.
        // Retirer l'appel de l'Inspecteur laissait donc déclaration + guide = 2,
        // et l'assertion passait sur du code amputé. On compte désormais les
        // appels SEULS, et on exige le compte EXACT.
        const sansCommentaires = sourceCarte
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/[^\n]*/g, '');
        const toutes = sansCommentaires.match(/legendePastillesObjectifHTML\(\)/g) || [];
        const declarations = sansCommentaires.match(/function legendePastillesObjectifHTML\(\)/g) || [];
        expect(declarations.length).toBe(1);
        expect(toutes.length - declarations.length).toBe(2);   // guide + Inspecteur

        // Et chacune des deux surfaces est nommément là.
        expect(sansCommentaires).toContain("'<label>Pastilles des objectifs</label>' +\n            legendePastillesObjectifHTML()");
        expect(sansCommentaires).toContain('legendePastillesObjectifHTML() +');

        // Personne ne réécrit les libellés à la main ailleurs.
        for (const e of api.LEGENDE_PASTILLES_OBJECTIF) {
            const occurrences = sourceCarte.split(e.libelle).length - 1;
            expect(occurrences, `« ${e.libelle} » ne doit être écrit qu'une fois`).toBe(1);
        }
    });

    it('G2 · la légende a son CSS, et sa pastille ne ment pas sur son curseur', () => {
        // La pastille du canevas porte `cursor: help` (une infobulle l'attend).
        // Celle de la légende ne survole rien : le même curseur y promettrait
        // une aide qui n'existe pas.
        expect(css).toMatch(/^\.planif-legende-pastilles\s*\{/m);
        expect(css).toMatch(/\.planif-legende-pastille-ligne \.planif-obj-pastille\s*\{[^}]*cursor:\s*default/);
        // Aucune couleur en dur : la palette passe par les variables.
        const bloc = tranche(css, '.planif-legende-pastilles {', '/* === #403 — « Objectifs servis »');
        expect(bloc).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    });
});
