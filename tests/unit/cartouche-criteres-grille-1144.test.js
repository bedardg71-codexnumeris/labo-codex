import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

// #1144 (23 oct. 2026) — LA CARTOUCHE QUI REMPLAÇAIT LES CRITÈRES DE LA GRILLE.
//
// Vécu par Grégoire (Annoter › Évaluer) : une grille de cinq critères, une cartouche rangée
// sous elle avec quatre critères aux ids d'une AUTRE grille. L'écran montrait quatre critères,
// chacun « (? %) », sans Français écrit : `cartoucheSelectionnee` rendait `cartouche.criteres`.
//
// A. L'écran : les critères sont ceux de la grille ; la cartouche ne fournit que ses
//    commentaires, par id ; la ligne nomme le critère qu'elle ne couvre pas.
// B. La correspondance partagée (`cartoucheCorrespondance.remapper`) : id, puis nom ; clés de
//    commentaires reconnues par préfixe ; ce qui ne trouve rien est rendu, jamais jeté.
// C. Le stock (`CartouchesDecalees`) : la mesure n'écrit rien ; la réparation n'écrit que ce
//    qu'elle a listé, et refuse sans codex à jour.
// Noms et ids fictifs.

const NOMS = ['Structure', 'Rigueur', 'Plausibilité', 'Nuance'];
// Ids AVEC souligné, comme `genererIdUnique('CR_')` : une clé découpée au premier « _ » rendrait « CR ».
const critere = (prefixe, nom, i, extra) => ({ id: `CR_${prefixe}${i}`, nom, ...extra });
const G5 = {
    id: 'G_CINQ', nom: 'Grille fictive à cinq critères',
    criteres: [
        ...NOMS.map((n, i) => critere('cinq', n, i, { ponderation: 20 })),
        { id: 'CR_francais', nom: 'Français écrit', ponderation: 20 }
    ]
};
const G4 = { id: 'G_QUATRE', nom: 'Grille fictive à quatre critères', criteres: NOMS.map((n, i) => critere('quatre', n, i, { ponderation: 25 })) };

/** La cartouche décalée : rangée sous G5, critères et commentaires aux ids de G4. */
function cartoucheDecalee() {
    const commentaires = {};
    G4.criteres.forEach(c => { commentaires[`${c.id}_M`] = `Commentaire M de ${c.nom}`; commentaires[`${c.id}_I`] = ''; });
    return {
        id: 'CART_decalee', nom: 'Cartouche fictive décalée', grilleId: G5.id,
        criteres: G4.criteres.map(c => ({ id: c.id, nom: c.nom })),
        niveaux: [{ code: 'I', nom: 'Incomplet' }, { code: 'M', nom: 'Maîtrise' }],
        commentaires
    };
}

const correspondance = () => chargerScript('js/cartouche-correspondance.js', {}).cartoucheCorrespondance;

/* ============================================================ A. l'écran */

function ecran(grille, cartouche) {
    const dom = new JSDOM(`<!doctype html><body>
        <select id="selectCartoucheEval"><option value="${cartouche.id}" selected>c</option></select>
        <select id="remiseProduction1"><option value="remis" selected>remis</option></select>
        <select id="selectEchelle1"></select>
        <div id="listeCriteresGrille1"></div></body>`);
    const document = dom.window.document;
    const store = {
        a2032_grillesTemplates: [grille],
        [`a2032_cartouches_${grille.id}`]: [cartouche]
    };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d), get: async () => null, setSync() {}, set: async () => {} };
    const win = chargerScript('js/cartouche-correspondance.js', {});
    const evaluationEnCours = { grilleId: grille.id, echelleId: '', criteres: {} };
    chargerScript('js/evaluation-chargement.js', {
        db, document, cle: (k) => 'a2032_' + k,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        formaterPourcentage: (n) => (typeof n === 'number' ? `${n} %` : ''),
        ESPACE_INSECABLE: ' ',
        evaluationEnCours, calculerNote() {}, genererRetroaction() {},
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} }
    }, win);
    win.cartoucheSelectionnee();
    const zone = document.getElementById('listeCriteresGrille1');
    return {
        noms: [...zone.querySelectorAll('.eval-critere-header strong')].map(e => e.textContent),
        ponderations: [...zone.querySelectorAll('.eval-critere-header small')].map(e => e.textContent),
        selects: [...zone.querySelectorAll('select.eval-select-niveau')].map(e => e.id),
        avis: (document.getElementById('avisCriteresNonCouverts') || {}).textContent || null
    };
}

describe('#1144 A — l\'écran rend les critères de la grille, pas ceux de la cartouche', () => {
    it('cinq critères, pondérations lisibles, aucun « (? %) », et la ligne qui nomme les non couverts', () => {
        const r = ecran(G5, cartoucheDecalee());
        expect(r.noms).toEqual([...NOMS, 'Français écrit']);
        expect(r.ponderations).toEqual(Array(5).fill('(20 %)'));
        expect(r.ponderations.join(' ')).not.toContain('?');
        expect(r.selects).toEqual(G5.criteres.map(c => `eval_${c.id}`));   // évaluables, aux ids de la grille
        // Les ids de la cartouche (ceux de G4) ne la couvrent pas : les cinq sont nommés.
        expect(r.avis).toBe('La cartouche n’a pas de commentaires pour « Structure », « Rigueur », « Plausibilité », « Nuance », « Français écrit ». Ces critères s’évaluent quand même.');
    });

    it('une cartouche rattachée : la ligne ne nomme que Français écrit, au singulier', () => {
        const c = cartoucheDecalee();
        c.criteres = G5.criteres.slice(0, 4).map(x => ({ id: x.id, nom: x.nom }));
        const r = ecran(G5, c);
        expect(r.noms).toEqual([...NOMS, 'Français écrit']);
        expect(r.avis).toBe('La cartouche n’a pas de commentaires pour « Français écrit ». Ce critère s’évalue quand même.');
    });

    it('une cartouche qui couvre toute la grille : aucune ligne', () => {
        const c = cartoucheDecalee();
        c.criteres = G5.criteres.map(x => ({ id: x.id, nom: x.nom }));
        expect(ecran(G5, c).avis).toBeNull();
    });
});

/* ============================================ B. la correspondance partagée */

describe('#1144 B — cartoucheCorrespondance.remapper', () => {
    it('par nom quand l\'id manque, les clés reconnues par préfixe (id à souligné), jamais découpées', () => {
        const r = correspondance().remapper(cartoucheDecalee(), G5.criteres);
        expect(r.criteres).toEqual(G5.criteres.slice(0, 4).map(c => ({ id: c.id, nom: c.nom })));
        expect(r.commentaires).toEqual(Object.fromEntries(G5.criteres.slice(0, 4).flatMap(c => [[`${c.id}_M`, `Commentaire M de ${c.nom}`], [`${c.id}_I`, '']])));
        expect(r.nonRattaches).toEqual([]);
        expect(r.collisions).toEqual([]);
    });

    it('par id d\'abord : un critère de même id garde son id même si un autre porte son nom', () => {
        const cible = [{ id: 'CR_a', nom: 'Autre nom' }, { id: 'CR_b', nom: 'Nom' }];
        const r = correspondance().remapper({ criteres: [{ id: 'CR_a', nom: 'Nom' }], commentaires: { CR_a_M: 'x' } }, cible);
        expect(r.criteres).toEqual([{ id: 'CR_a', nom: 'Autre nom' }]);
        expect(r.commentaires).toEqual({ CR_a_M: 'x' });
    });

    it('le préfixe le plus long gagne (un id qui en préfixe un autre)', () => {
        const src = { criteres: [{ id: 'CR_1', nom: 'Un' }, { id: 'CR_1_2', nom: 'Deux' }], commentaires: { CR_1_2_M: 'deux', CR_1_M: 'un' } };
        const r = correspondance().remapper(src, [{ id: 'N1', nom: 'Un' }, { id: 'N2', nom: 'Deux' }]);
        expect(r.commentaires).toEqual({ N2_M: 'deux', N1_M: 'un' });
    });

    it('ce qui ne trouve aucun critère est RENDU avec ses commentaires, et compté', () => {
        const src = { criteres: [{ id: 'CR_x', nom: 'Introuvable' }], commentaires: { CR_x_M: 'gardé', CR_x_I: '', CR_orphelin_M: 'sans critère' } };
        const r = correspondance().remapper(src, G5.criteres);
        expect(r.criteres).toEqual([]);
        expect(r.nonRattaches).toEqual([{ id: 'CR_x', nom: 'Introuvable', commentaires: { CR_x_M: 'gardé', CR_x_I: '' } }]);
        expect(r.perdus).toEqual({ Introuvable: 1 });
        expect(r.commentaires).toEqual({ CR_orphelin_M: 'sans critère' });
        expect(r.sansCritere).toBe(1);
    });

    it('deux critères qui visent le même critère cible : la collision est rendue', () => {
        const src = { criteres: [{ id: 'CR_p', nom: 'Nuance' }, { id: 'CR_q', nom: 'Nuance' }], commentaires: {} };
        expect(correspondance().remapper(src, G5.criteres).collisions).toEqual(['CR_cinq3']);
    });
});

/* ================================================================ C. le stock */

function stock({ codexAJour = true, trimestre = 'a2026' } = {}) {
    const rangee = cartoucheDecalee();
    const intacte = { id: 'CART_intacte', nom: 'Cartouche fictive intacte', grilleId: G5.id, criteres: G5.criteres.map(c => ({ id: c.id, nom: c.nom })), commentaires: { CR_cinq0_M: 'ok' } };
    const store = {
        a2026_grillesTemplates: [G5, G4],
        a2026_cartouches_G_CINQ: [rangee, intacte],
        a2026_cartouches_G_QUATRE: [],
        a2026_cartouches_G_ABSENTE: [rangee]   // clé orpheline : hors lot
    };
    const ecritures = [];
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d) };
    const win = chargerScript('js/cartouche-correspondance.js', {});
    win.obtenirTrimestreId = () => trimestre;   // lus sur `window`, comme dans l'application
    win.Codex = { estAJour: () => codexAJour };
    chargerScript('js/cartouches-decalees.js', {
        db, cle: (k) => 'a2026_' + k,
        modifierEtAnnoncer: async (cle, mutateur) => {
            const valeur = await mutateur(JSON.parse(JSON.stringify(store[cle] || [])));
            if (valeur === undefined) return undefined;
            store[cle] = valeur;
            ecritures.push(cle);
            return valeur;
        }
    }, win);
    return { store, ecritures, C: win.CartouchesDecalees };
}

describe('#1144 C — CartouchesDecalees', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    it('la mesure liste la seule cartouche décalée et n\'écrit rien', async () => {
        const s = stock();
        const avant = JSON.stringify(s.store);
        const r = await s.C.verifier();
        expect(r.examinees).toBe(2);
        expect(r.decalees.map(l => l.cartoucheId)).toEqual(['CART_decalee']);
        expect(r.decalees[0].proposition).toBe(true);
        expect(r.decalees[0].rattaches).toEqual(NOMS.map(n => `${n} → ${n}`));
        expect(r.decalees[0].nonCouverts).toEqual(['Français écrit']);
        expect(s.ecritures).toEqual([]);
        expect(JSON.stringify(s.store)).toBe(avant);
    });

    it('la réparation rattache par le nom ; l\'autre cartouche et la clé orpheline restent intactes', async () => {
        const s = stock();
        const intacteAvant = JSON.stringify(s.store.a2026_cartouches_G_CINQ[1]);
        const orphelineAvant = JSON.stringify(s.store.a2026_cartouches_G_ABSENTE);
        const r = await s.C.verifier({ reparer: true });
        expect(r.ecrites.map(e => e.cartouche)).toEqual(['Cartouche fictive décalée']);
        expect(s.ecritures).toEqual(['a2026_cartouches_G_CINQ']);
        const reparee = s.store.a2026_cartouches_G_CINQ[0];
        expect(reparee.criteres).toEqual(G5.criteres.slice(0, 4).map(c => ({ id: c.id, nom: c.nom })));
        expect(reparee.commentaires.CR_cinq0_M).toBe('Commentaire M de Structure');
        expect(Object.keys(reparee.commentaires)).toHaveLength(8);   // rien de jeté
        expect(reparee.niveaux).toEqual(cartoucheDecalee().niveaux);
        expect(JSON.stringify(s.store.a2026_cartouches_G_CINQ[1])).toBe(intacteAvant);
        expect(JSON.stringify(s.store.a2026_cartouches_G_ABSENTE)).toBe(orphelineAvant);
        // Une seconde mesure ne la liste plus.
        expect((await s.C.verifier()).decalees).toEqual([]);
    });

    it('un critère sans correspondance reste dans la cartouche avec ses commentaires', async () => {
        const s = stock();
        s.store.a2026_cartouches_G_CINQ[0].criteres.push({ id: 'CR_perdu', nom: 'Critère disparu' });
        s.store.a2026_cartouches_G_CINQ[0].commentaires.CR_perdu_M = 'à garder';
        const r = await s.C.verifier({ reparer: true });
        expect(r.decalees[0].nonRattaches).toEqual(['Critère disparu (1 commentaire(s), gardés)']);
        expect(r.ecrites).toHaveLength(1);   // réparée, pas laissée telle quelle
        const reparee = s.store.a2026_cartouches_G_CINQ[0];
        expect(reparee.criteres.map(c => c.id)).toEqual([...G5.criteres.slice(0, 4).map(c => c.id), 'CR_perdu']);
        expect(reparee.criteres.at(-1)).toEqual({ id: 'CR_perdu', nom: 'Critère disparu' });
        expect(reparee.commentaires.CR_perdu_M).toBe('à garder');
    });

    it('deux critères qui visent le même critère de la grille : listée sans proposition, rien d\'écrit', async () => {
        const s = stock();
        s.store.a2026_cartouches_G_CINQ[0].criteres.push({ id: 'CR_double', nom: 'Nuance' });
        s.store.a2026_cartouches_G_CINQ[0].commentaires.CR_double_E = 'second Nuance';   // un autre niveau : aucune clé ne s'écrase, seule la collision retient
        const r = await s.C.verifier({ reparer: true });
        expect(r.decalees[0].proposition).toBe(false);
        expect(r.decalees[0].pourquoi).toBe('deux critères de la cartouche visent le même critère de la grille');
        expect(r.ecrites).toEqual([]);
        expect(s.ecritures).toEqual([]);
    });

    it('un rattachement qui écraserait un commentaire déjà là : listée sans proposition', async () => {
        const s = stock();
        // Une clé orpheline aux ids de la grille, qu'aucun critère de la cartouche ne revendique.
        s.store.a2026_cartouches_G_CINQ[0].commentaires.CR_cinq0_M = 'déjà là';
        const r = await s.C.verifier({ reparer: true });
        expect(r.decalees[0].proposition).toBe(false);
        expect(r.decalees[0].pourquoi).toBe('le rattachement écraserait un commentaire');
        expect(s.ecritures).toEqual([]);
    });

    it('sans codex à jour, la réparation est refusée et rien n\'est écrit', async () => {
        const s = stock({ codexAJour: false });
        expect(await s.C.verifier({ reparer: true })).toBeNull();
        expect(s.ecritures).toEqual([]);
    });

    it('H2026 est refusé, même pour la mesure', async () => {
        const s = stock({ trimestre: 'h2026' });
        expect(await s.C.verifier()).toBeNull();
    });
});
