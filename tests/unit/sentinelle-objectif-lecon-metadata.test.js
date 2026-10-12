import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { suitDansLaFonction } from './_helpers/tranche.js';

// F1 (exercice d'alignement 601-101, 6 août 2026) — L'objectif de leçon était
// introuvable : il vivait dans `planification_seances` (clé NUE partagée entre
// tous les trimestres ET la démo, dictionnaire PLAT par id de leçon alors que
// ces ids ne sont uniques que PAR CARTE — #367 / rouge D1 de l'audit du 5 août),
// et n'était visible que dans une vue qui MASQUE la carte. Le badge 🎯 qui
// aurait pu le signaler n'apparaissait QUE si un objectif existait déjà : pour
// découvrir la fonction, il fallait s'en être déjà servi.
//
// Correctif : l'objectif vit désormais sur le nœud (`metadata.objectif`), donc
// dans `planification_mindmap` — clé propre du module, namespacée par trimestre,
// qui suit les clones, copies et imports inter-trimestre.
//
// Cette sentinelle verrouille :
//   A. le comportement de la migration (fonctionnel, sur la VRAIE fonction) ;
//   B. les invariants de rendu et de routage (source, couplage DOM assumé).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceCss = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');

// --- Sandbox ------------------------------------------------------------
let store;
let cartesSauvees;
let indexCourant;

function monterModule({ index = { active: 'carte_1' }, sauvegardeLance = false } = {}) {
    store = {};
    cartesSauvees = [];
    indexCourant = index;

    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };

    const planificationDonnees = {
        getIndex: () => indexCourant,
        sauvegarderCarte: (id, donnees) => {
            if (sauvegardeLance) throw new Error('échec de persistance simulé');
            cartesSauvees.push({ id, donnees });
        },
        chargerCarte: () => null
    };

    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        // Globaux du projet dont le rendu a besoin : definirObjectifsLecon
        // re-rend, donc traverse reconstruireDOM().
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    // Le module namespace ses clés via `window.cle(...)` : le sandbox doit le
    // porter sur le faux window, pas seulement comme global.
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = planificationDonnees;
    return win.planificationCarte;
}

function poserLecon(api, id, metadata = {}) {
    api.etat.noeuds.set(id, { id, type: 'lecon', titre: 'Leçon', metadata, enfants: [], parent: null });
}

// =======================================================================
// A. MIGRATION — comportement réel
// =======================================================================
describe('F1 · migration des objectifs vers metadata.objectif', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('bascule un objectif de l’ancienne clé vers le nœud, en LISTE', () => {
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Repérer les marqueurs de relation' }
        };

        const migres = api.migrerObjectifsVersMetadata();

        expect(migres).toBe(1);
        const objs = api.etat.noeuds.get('planif-n1').metadata.objectifs;
        expect(objs).toHaveLength(1);
        expect(objs[0].texte).toBe('Repérer les marqueurs de relation');
        // Porteur d'un id : c'est ce qui rendra les liens possibles sans migration.
        expect(objs[0].id).toBeTruthy();
    });

    it('bascule aussi le format intermédiaire (chaîne unique metadata.objectif)', () => {
        poserLecon(api, 'planif-n1', { objectif: 'Analyser un texte littéraire' });

        expect(api.migrerObjectifsVersMetadata()).toBe(1);

        const meta = api.etat.noeuds.get('planif-n1').metadata;
        expect(meta.objectifs).toHaveLength(1);
        expect(meta.objectifs[0].texte).toBe('Analyser un texte littéraire');
        // Zéro-dette : l'ancien champ ne survit pas à la migration.
        expect(meta.objectif).toBeUndefined();
    });

    it('retire l’ancienne source après migration (une seule vérité)', () => {
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Objectif A', notes: 'garder ces notes' }
        };

        api.migrerObjectifsVersMetadata();

        const seances = store['a2026_planification_seances'];
        expect(seances['carte_1::planif-n1'].objectifPersonnalise).toBeUndefined();
        // Les notes NE sont PAS touchées : seul l'objectif migre vers le nœud.
        // ⮕ Clé COMPOSITE depuis #367 (7 août 2026) : `<carteId>::<leconId>`.
        // Le dictionnaire plat aliassait les notes entre cartes d'un même
        // trimestre, les ids de leçon n'étant uniques que par carte.
        expect(seances['carte_1::planif-n1'].notes).toBe('garder ces notes');
    });

    it('est idempotente : ne réécrit pas des objectifs déjà portés par le nœud', () => {
        poserLecon(api, 'planif-n1', { objectifs: [{ id: 'obj_x', texte: 'Objectif déjà migré' }] });
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Vieille valeur' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        const objs = api.etat.noeuds.get('planif-n1').metadata.objectifs;
        expect(objs).toHaveLength(1);
        expect(objs[0].texte).toBe('Objectif déjà migré');
        expect(objs[0].id).toBe('obj_x');
    });

    it('ignore les objectifs vides et les nœuds qui ne sont pas des leçons', () => {
        poserLecon(api, 'planif-vide');
        api.etat.noeuds.set('planif-act', {
            id: 'planif-act', type: 'activite', metadata: {}, enfants: [], parent: null
        });
        store['a2026_planification_seances'] = {
            'planif-vide': { objectifPersonnalise: '   ' },
            'planif-act': { objectifPersonnalise: 'ne devrait pas migrer' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(api.etat.noeuds.get('planif-vide').metadata.objectifs).toBeUndefined();
        expect(api.etat.noeuds.get('planif-act').metadata.objectifs).toBeUndefined();
    });

    it('ne purge JAMAIS l’ancienne source si la sauvegarde échoue', () => {
        api = monterModule({ sauvegardeLance: true });
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Objectif à ne pas perdre' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(store['a2026_planification_seances']['carte_1::planif-n1'].objectifPersonnalise)
            .toBe('Objectif à ne pas perdre');
    });

    it('ne migre rien s’il n’y a pas de carte active (sauvegarder() serait un no-op silencieux)', () => {
        api = monterModule({ index: null });
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Objectif à ne pas perdre' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        // La garde protège contre la perte sèche : rien muté, rien purgé.
        expect(api.etat.noeuds.get('planif-n1').metadata.objectifs).toBeUndefined();
        expect(store['a2026_planification_seances']['carte_1::planif-n1'].objectifPersonnalise)
            .toBe('Objectif à ne pas perdre');
    });
});

// =======================================================================
// B. LECTURE — l'objectif se lit sur le nœud
// =======================================================================
describe('F1 · lecture des objectifs sur le nœud', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    const troisObjectifs = {
        metadata: { objectifs: [
            { id: 'o1', texte: 'Appliquer des techniques d’annotation' },
            { id: 'o2', texte: 'Identifier des émotions et des thèmes' },
            { id: 'o3', texte: 'Formuler une hypothèse' }
        ] }
    };

    it('rend la liste complète des objectifs', () => {
        expect(api.objectifsDeLecon(troisObjectifs)).toHaveLength(3);
    });

    it('rend toujours un tableau, jamais undefined', () => {
        expect(api.objectifsDeLecon({ metadata: {} })).toEqual([]);
        expect(api.objectifsDeLecon({})).toEqual([]);
        expect(api.objectifsDeLecon(null)).toEqual([]);
    });

    it('ignore les entrées malformées plutôt que de les laisser casser le rendu', () => {
        const abime = { metadata: { objectifs: [{ id: 'o1', texte: 'Valide' }, null, { id: 'o2' }] } };
        expect(api.objectifsDeLecon(abime)).toHaveLength(1);
    });

    it('objectifDeLecon rend le PREMIER objectif (repli une-ligne)', () => {
        expect(api.objectifDeLecon(troisObjectifs)).toBe('Appliquer des techniques d’annotation');
        expect(api.objectifDeLecon({ metadata: {} })).toBe('');
    });
});

// On teste `appliquerObjectifs` (mutation + persistance) plutôt que la porte
// publique `definirObjectifsLecon`, qui enchaîne un re-rendu : la logique
// métier est dans la première, le DOM n'ajoute rien à vérifier ici. Le fait que
// la frappe ne re-rende PAS est verrouillé au bloc C.
describe('F1 · écriture des objectifs (pluriel)', () => {
    let api, lecon;
    const definir = (textes) => api.appliquerObjectifs(lecon, textes);
    beforeEach(() => {
        api = monterModule();
        poserLecon(api, 'planif-n1');
        lecon = api.etat.noeuds.get('planif-n1');
    });

    it('enregistre plusieurs objectifs d’un coup', () => {
        definir(['Appliquer', 'Identifier', 'Formuler']);
        expect(api.etat.noeuds.get('planif-n1').metadata.objectifs).toHaveLength(3);
    });

    it('écarte les lignes vides sans décaler les autres', () => {
        definir(['Premier', '   ', 'Second', '']);
        const objs = api.etat.noeuds.get('planif-n1').metadata.objectifs;
        expect(objs.map(o => o.texte)).toEqual(['Premier', 'Second']);
    });

    it('CONSERVE l’id d’un objectif dont on corrige la formulation', () => {
        // Décisif : un lien qui vise cet objectif doit survivre à une retouche.
        definir(['Formulation initiale', 'Deuxième']);
        const avant = api.etat.noeuds.get('planif-n1').metadata.objectifs.map(o => o.id);

        definir(['Formulation corrigée', 'Deuxième']);
        const apres = api.etat.noeuds.get('planif-n1').metadata.objectifs.map(o => o.id);

        expect(apres).toEqual(avant);
    });

    it('donne des identifiants distincts à chaque objectif', () => {
        definir(['A', 'B', 'C']);
        const ids = api.etat.noeuds.get('planif-n1').metadata.objectifs.map(o => o.id);
        expect(new Set(ids).size).toBe(3);
    });

    it('vider la liste retire la métadonnée au lieu de laisser un tableau vide', () => {
        definir(['A']);
        definir([]);
        expect(api.etat.noeuds.get('planif-n1').metadata.objectifs).toBeUndefined();
    });
});

// =======================================================================
// C. RENDU ET ROUTAGE — invariants de source (couplage DOM assumé)
// =======================================================================
describe('F1 · invariants de rendu et de routage', () => {
    // ⚠ QUATRE ASSERTIONS DE CE BLOC RETARGETÉES LE 9 AOÛT 2026 (#437).
    // Le rendu d'un nœud était construit à trois endroits dont deux
    // incomplets ; il a été fondu en `contenuNoeudHTML`, et le balisage des
    // objectifs vit désormais dans `objectifsLeconHTML` /
    // `commandesObjectifHTML`. Les invariants ci-dessous n'ont pas changé —
    // seule la FORME de source qu'ils lisaient a bougé, et chacun a été
    // vérifié au rendu réel avant d'être réécrit ici.
    //
    // ⮕ Ces quatre-là sont doublés par des assertions COMPORTEMENTALES dans
    // `sentinelle-carte-rendu-unique-437.test.js` (§H), qui rendent un nœud
    // au lieu de relire la source. C'est la leçon du jour : une assertion de
    // source dit où le code est écrit, jamais ce qu'il produit — elle a
    // survécu sans broncher aux quatre en-têtes rendues incomplètes.
    it('le badge 🎯 est rendu pour TOUTE leçon, pas seulement celles qui ont un objectif', () => {
        // Cause racine de F1 : l'ancien badge était conditionné à la présence
        // d'un objectif, donc la fonction ne se découvrait jamais.
        expect(source).toMatch(/function badgeObjectifHTML\(n\) \{\s*\n\s*if \(n\.type !== 'lecon'\) return '';/);
        expect(source).toMatch(/'<span class="planif-badge-objectif'/);
        expect(source).toContain('planif-badge-objectif--vide');
    });

    it('le badge 🎯 VIDE reste VISIBLE — F1 ne revient pas par le style (#151)', () => {
        // 8 août 2026, terrain Grégoire : « il n'y a pas d'émoji 🎯 ». Le badge
        // ÉTAIT rendu — mais `--vide` le passait en grayscale(1) + opacity .45
        // sur 12 px : introuvable, confirmé par capture (prod, mode clair).
        // F1 avait été corrigée au RENDU (test ci-dessus, resté vert) et était
        // revenue par le STYLE. Cette assertion couvre le second chemin :
        // l'état « aucun objectif » a le droit d'être discret, jamais estompé.
        //
        // ▣ 15 AOÛT 2026 — L'INVARIANT EST RÉÉCRIT, PAS AFFAIBLI. Grégoire veut
        // le signal CHROMATIQUE (gris vide / couleur dès un objectif) : la
        // désaturation redevient donc légitime. Ce qui reste interdit, c'est ce
        // qui avait RÉELLEMENT causé #151 — l'effacement. L'ancienne assertion
        // verrouillait le REMÈDE de l'époque (« pas de grayscale ») au lieu du
        // MAL qu'il traitait (« le badge vide doit rester trouvable »), et
        // aurait donc bloqué une décision produit légitime en prétendant
        // protéger l'utilisateur.
        const blocVide = sourceCss.match(/\.planif-badge-objectif--vide\s*\{[^}]*\}/);
        expect(blocVide, 'la règle .planif-badge-objectif--vide a disparu').toBeTruthy();

        // 1. Jamais estompé — la cause mesurée de #151, sur TOUS les blocs de
        //    l'état vide (l'état de base comme le survol).
        const tousBlocsVide = sourceCss.match(/\.planif-badge-objectif--vide[^{]*\{[^}]*\}/g) || [];
        expect(tousBlocsVide.length).toBeGreaterThan(0);
        tousBlocsVide.forEach(function (b) {
            const op = b.match(/opacity:\s*([\d.]+)/);
            if (op) expect(parseFloat(op[1]), b).toBeGreaterThanOrEqual(0.7);
        });

        // 2. Le repère de couleur SURVIT à la désaturation. `filter` s'applique
        //    à l'élément entier : posé sur le badge, il grise aussi le liséré
        //    pointillé — le seul indice coloré qui rend l'affordance trouvable
        //    quand il y a zéro objectif. Il doit donc viser le glyphe SEUL.
        expect(blocVide[0], 'la désaturation ne doit pas être posée sur le badge lui-même')
            .not.toMatch(/grayscale/);
        expect(blocVide[0], 'le liséré qui rend le badge vide trouvable a disparu')
            .toMatch(/outline:\s*[^;]*dashed/);

        // 3. Et le gris demandé est bien là, sur le glyphe.
        const blocGlyphe = sourceCss.match(
            /\.planif-badge-objectif--vide\s+\.planif-badge-objectif__glyphe\s*\{[^}]*\}/);
        expect(blocGlyphe, 'la règle de désaturation du glyphe a disparu').toBeTruthy();
        expect(blocGlyphe[0]).toMatch(/grayscale/);
    });

    it('le badge 🎯 offre 44 px de cible tactile SANS grossir l’en-tête', () => {
        // Règle du projet (CLAUDE.md) : cibles tactiles >= 44 px sur iPad. Le
        // badge n'en offrait que 24 — et le commentaire CSS affirmait « 44px »
        // au-dessus d'un `min-height: 24px`, donc la règle était violée par un
        // code qui se déclarait conforme. Mesuré au navigateur : 24 x 24.
        //
        // L'en-tête ne fait que 37 px de haut : 44 px ne peuvent PAS y tenir.
        // La cible est donc portée par un ::after hors flux — grossir la boîte
        // elle-même aurait allongé tous les blocs de la carte, un effet de bord
        // que personne n'a demandé.
        const base = sourceCss.match(/\.planif-badge-objectif\s*\{[^}]*\}/);
        const apres = sourceCss.match(/\.planif-badge-objectif::after\s*\{[^}]*\}/);
        expect(base, 'règle de base du badge introuvable').toBeTruthy();
        expect(apres, 'la cible tactile ::after a disparu').toBeTruthy();

        const px = (bloc, prop) => {
            const m = bloc.match(new RegExp(prop + ':\\s*(-?[\\d.]+)px'));
            return m ? parseFloat(m[1]) : null;
        };
        const boiteL = px(base[0], 'min-width');
        const boiteH = px(base[0], 'min-height');

        // 1. La cible atteint bien 44 px sur les DEUX axes.
        expect(boiteL + -px(apres[0], 'left') + -px(apres[0], 'right'),
            'cible tactile horizontale').toBeGreaterThanOrEqual(44);
        expect(boiteH + -px(apres[0], 'top') + -px(apres[0], 'bottom'),
            'cible tactile verticale').toBeGreaterThanOrEqual(44);

        // 2. Elle ne pèse RIEN sur la mise en page : hors flux, donc pas un item
        //    du flex parent. Sans `absolute`, le ::after deviendrait un item et
        //    l'en-tête grandirait — exactement ce qu'on évite.
        expect(apres[0]).toMatch(/position:\s*absolute/);

        // 3. ⚠ ET LE BADGE DOIT ÊTRE POSITIONNÉ. Sans `position: relative`, les
        //    décalages se résolvent contre le premier ancêtre positionné — le
        //    bloc entier, qui est en `absolute` sur le canevas. La zone tactile
        //    atterrirait alors à un tout autre endroit, en silence : rien ne
        //    casse, rien ne se voit, et le badge redevient intouchable.
        expect(base[0], 'le badge doit être positionné pour ancrer sa cible tactile')
            .toMatch(/position:\s*relative/);

        // 4. Le débord GAUCHE ne dépasse pas le gap de l'en-tête, sinon la cible
        //    recouvre le <select> du rang de séance et lui vole ses clics. Lié
        //    au gap réel : si l'en-tête se resserre, la sentinelle le dira.
        const entete = sourceCss.match(/\.planif-noeud-entete\s*\{[^}]*\}/);
        const gap = px(entete[0], 'gap');
        expect(gap, 'gap de l’en-tête introuvable').toBeTruthy();
        expect(-px(apres[0], 'left'),
            'le débord gauche mange le contrôle voisin').toBeLessThanOrEqual(gap);
    });

    it('le badge 🎯 enveloppe son emoji — sans quoi le gris ne vise RIEN', () => {
        // Couplage RENDU ↔ STYLE, et il est silencieux dans les deux sens :
        // retirer le `<span>` intérieur laisse la règle CSS valide mais sans
        // cible, donc le badge vide repasse en couleur sans qu'aucune
        // assertion de style ne bronche. Vérifié sur le HTML PRODUIT, pas sur
        // la source : c'est ce que voit le navigateur.
        const api = monterModule();
        poserLecon(api, 'planif-n1');
        const htmlVide = api.contenuNoeudHTML(api.etat.noeuds.get('planif-n1'));
        expect(htmlVide).toContain('planif-badge-objectif--vide');
        expect(htmlVide).toMatch(/<span class="planif-badge-objectif__glyphe">🎯<\/span>/);

        // Et l'emoji n'est PAS un enfant direct du badge : s'il l'était, il
        // échapperait à la désaturation.
        expect(htmlVide).not.toMatch(/aria-expanded="[^"]*"[^>]*>🎯/);
    });

    it('ne réintroduit pas l’ancien badge conditionné aux données de séances', () => {
        expect(source).not.toMatch(/_seancesDOM\[n\.id\]\.objectifPersonnalise/);
        expect(source).not.toContain('var _seancesDOM');
    });

    // ▣ 7 AOÛT (soir) — la « vue leçon » est SUPPRIMÉE, et avec elle ce champ.
    // Il ne se contentait pas d'être redondant avec la carte : il LISAIT
    // `metadata.objectifs` (la liste) et RÉÉCRIVAIT `metadata.objectif` (la
    // chaîne, format mort depuis la migration). Ce qu'on y saisissait n'était
    // donc plus jamais relu. L'assertion change de cible : au lieu de vérifier
    // où ce champ écrivait, on verrouille que PLUS PERSONNE n'écrit dans le
    // champ mort — hors la migration, qui l'efface après l'avoir récupéré.
    it('plus aucun code ne réécrit le champ mort `metadata.objectif`', () => {
        // ⚠ Deux pièges dans cette regex, tous deux rencontrés en l'écrivant :
        // `objectif` est un PRÉFIXE de `objectifs` (la liste vivante), et `=`
        // est un préfixe de `===` (les comparaisons du sauvetage). Sans les
        // deux gardes, la sentinelle échouait sur du code parfaitement sain.
        const ecritures = [...source.matchAll(/\.metadata\.objectif(?!s)\s*=(?!=)/g)];
        expect(ecritures.length).toBe(0);
    });

    it('la vue leçon (niveau micro) a bien disparu du module et du DOM', () => {
        expect(source).not.toContain('rendreVueLecon');
        expect(source).not.toContain('planif-vue-lecon');
        expect(indexHtml).not.toContain('planif-vue-lecon');
    });

    it('la migration RÉCUPÈRE ce que ce champ avait avalé avant de le purger', () => {
        // Le sauvetage doit venir AVANT le `continue` qui saute les leçons
        // déjà pourvues d'une liste — sinon il ne s'exécuterait jamais, ce qui
        // est précisément le défaut qui a rendu la perte silencieuse.
        const iSauvetage = source.indexOf("&& typeof n.metadata.objectif === 'string'");
        const iSaut = source.indexOf('if (n.metadata && Array.isArray(n.metadata.objectifs)) {')
        // #158 (10 août 2026) : le saut « déjà au format liste » n'est plus un
        // continue sec — il stampe d'abord les ids manquants. La sonde suit
        // l'OUVERTURE de la branche ; l'invariant d'ordre (sauvetage AVANT le
        // saut) reste vérifié à l'identique.;
        expect(iSauvetage).toBeGreaterThan(-1);
        expect(iSaut).toBeGreaterThan(-1);
        expect(iSauvetage).toBeLessThan(iSaut);
        // Redécoupage sur les sauts de ligne + filtrage des doublons : le champ
        // rendait TOUS les objectifs dans une seule zone.
        expect(source).toMatch(/n\.metadata\.objectif\.split\('\\n'\)/);
        expect(source).toMatch(/filter\(function\(t\) \{ return t !== '' && !connus\[t\]; \}\)/);
    });

    it('la saisie au fil de la frappe ne reconstruit PAS le DOM', () => {
        // Reconstruire à chaque caractère ferait perdre le focus : l'écriture
        // passe par appliquerObjectifs (mutation seule), pas par la porte
        // publique qui re-rend.
        expect(suitDansLaFonction(source, /ligne\.addEventListener\('input'/, /appliquerObjectifs/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('l’en-tête porte le TYPE, et le titre est décalé SOUS les objectifs', () => {
        // Ordre imposé : type → objectifs → titre → contenu.
        expect(source).toMatch(/enTete \+\s*\n\s*objectifsLeconHTML\(n\) \+\s*\n\s*'<div class="planif-noeud-titre"/);
    });

    it('chaque objectif porte ses commandes + et − (les raccourcis ne se voient pas)', () => {
        expect(source).toContain('planif-obj-ajouter');
        expect(source).toContain('planif-obj-retirer');
        // Atteignables au clavier, pas seulement à la souris. Les quatre
        // commandes partagent une fabrique unique depuis #437 : c'est ELLE
        // qui doit poser le contrat clavier, sinon une commande ajoutée plus
        // tard naîtrait inaccessible.
        expect(source).toMatch(/role="button" tabindex="0" aria-label="' \+ libelle \+ '"/);
        expect(source).toMatch(/commandeObjectifHTML\('planif-obj-ajouter'/);
        expect(source).toMatch(/commandeObjectifHTML\('planif-obj-retirer'/);
    });

    it('les boutons n’enclenchent pas le déplacement du bloc', () => {
        expect(suitDansLaFonction(source, /btn\.addEventListener\('pointerdown'/, /stopPropagation/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('la ligne d’accueil porte AUSSI ses commandes + et −', () => {
        // Constaté en terrain le 6 août : la ligne qu'on venait d'ajouter était
        // la seule sans boutons — elle est rendue par une branche distincte.
        const brancheAccueil = source.slice(
            source.indexOf('if (io_ === rangAccueil)'),
            source.indexOf('if (io_ === objs.length) break;')
        );
        expect(brancheAccueil).toContain('data-accueil="1"');
        // Les deux branches appellent la MÊME fabrique de commandes depuis
        // #437 — c'est ce qui rend structurellement impossible qu'une des deux
        // reparte sans ses boutons.
        expect(brancheAccueil).toContain('commandesObjectifHTML(');
        // Ses flèches sont inertes : une ligne pas encore persistée n'a rien
        // à déplacer. Les deux booléens `true` disent exactement cela.
        expect(brancheAccueil).toContain('commandesObjectifHTML(rangRendu, true, true)');
    });

    it('« + » convertit l’index de ligne en index d’objectif', () => {
        // Les boutons portent un rang de LIGNE (accueil vide compris), alors
        // que l'état d'accueil s'exprime en index d'OBJECTIF : sans conversion,
        // un ajout au milieu d'une liste comportant déjà une ligne d'accueil
        // ouvrirait la nouvelle ligne au mauvais endroit.
        expect(source).toMatch(/var rangObjectif = textes\.slice\(0, rang \+ 1\)\.filter/);
        expect(source).toMatch(/_ajoutObjectif = \{ noeudId: id, rang: rangObjectif \}/);
    });

    it('« + » ouvre une ligne d’accueil au lieu de persister un objectif vide', () => {
        // appliquerObjectifs écarte les lignes vides : un objectif vide ne
        // survivrait pas à l'enregistrement. L'état transitoire évite ça.
        // Assertion ancrée sur LE chemin du bouton : la même affectation existe
        // aussi dans le raccourci Entrée, et une assertion globale passerait
        // même si le bouton cessait de la poser (constaté au break-test).
        expect(source).toMatch(
            /classList\.contains\('planif-obj-ajouter'\)[\s\S]{0,500}_ajoutObjectif = \{ noeudId: id, rang: rangObjectif \}/
        );
        expect(source).toContain('data-accueil');
        // Le rendu doit savoir ouvrir cette ligne au bon rang.
        expect(suitDansLaFonction(source, /rangAccueil/, /data-accueil="1"/), "rangAccueil[\\s\\S]{0,600}data-accueil=\"1\"").toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('l’état d’accueil est nettoyé au repli et au changement de carte', () => {
        expect(source).toMatch(/objectifDeplie;\s*\n\s*_ajoutObjectif = null;/);
        expect(suitDansLaFonction(source, /function chargerCarte/, /_ajoutObjectif = null;/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('la hauteur d’en-tête est MESURÉE, plus jamais figée à une constante', () => {
        // LAYOUT_HEADER_H (45 px) n'était juste que pour un en-tête d'une ligne.
        // Avec les objectifs dépliables et les titres sur deux lignes, une
        // hauteur figée faisait chevaucher les activités sur le titre.
        expect(source).toContain('function hauteurEnteteConteneur');
        // Plus AUCUNE affectation directe de la constante à un HEADER_H local.
        expect(source).not.toMatch(/var HEADER_H = LAYOUT_HEADER_H;/);
        // Les trois fonctions de disposition mesurent.
        const appels = source.match(/hauteurEnteteConteneur\(/g) || [];
        expect(appels.length).toBeGreaterThanOrEqual(4); // 1 déclaration + 3 usages
    });

    it('la mesure prend le BAS du dernier élément d’en-tête', () => {
        expect(source).toMatch(/offsetTop \+ e\.offsetHeight \+ LAYOUT_RESPIRATION/);
        // Ordre du DOM : entête → objectifs → titre ; le titre borne le bas.
        expect(source).toMatch(
            /reperes = \['\.planif-noeud-titre', '\.planif-noeud-objectifs', '\.planif-noeud-entete'\]/
        );
    });

    it('la frappe redispose le conteneur (titre ET objectifs), throttlée en rAF', () => {
        expect(suitDansLaFonction(source, /titreEl\.addEventListener\('input', throttleRAF/, /reLayoutConteneur\(id\)/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
        expect(suitDansLaFonction(source, /ligne\.addEventListener\('input', throttleRAF/, /reLayoutConteneur\(id\)/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('le badge n’enclenche pas le déplacement du bloc', () => {
        // Le pointerdown du bloc démarre le drag (#148 — le canevas est passé
        // en Pointer Events, une garde mousedown ne stopperait plus rien) :
        // le badge doit intercepter le MÊME événement que l'entrée écoute.
        expect(suitDansLaFonction(source, /badgeObjectif\.addEventListener\('pointerdown'/, /stopPropagation/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});

// =======================================================================
// D. (ALLÉGÉ, #424 Lot G) — l'Organisateur est parti avec la page « Plan de
// la leçon » ; il ne reste que la porte que la carte expose encore.
// =======================================================================
describe('F1 · la carte expose toujours les portes de l’objectif', () => {
    it('les deux portes restent exposées (générateur d’export, vue leçon future)', () => {
        expect(source).toMatch(/objectifDeLeconParId: objectifDeLeconParId/);
        expect(source).toMatch(/definirObjectifsLecon: definirObjectifsLecon/);
    });
});

// =======================================================================
// E. RETRAIT DES NOTES DE LEÇON (décision Grégoire, 6 août)
// =======================================================================
// Le champ « Notes » de la vue leçon n'avait pas de fonction à ce stade. Il
// n'était PAS inerte pour autant : il participait au cycle export/import
// Markdown de l'Organisateur. Retiré des trois endroits d'un coup — sinon
// l'import aurait continué de peupler une clé que plus rien n'affiche.
describe('F1 · les notes de leçon sont retirées partout', () => {
    const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
    // (Les cas qui lisaient organisateur.js sont partis avec la page, #424
    // Lot G — il reste l'assertion CSS, qui garde le retrait entier.)

    // (L'assertion « la vue leçon n'a plus de champ Notes » est retirée le
    // 7 août : la vue leçon elle-même n'existe plus, l'assertion serait vraie
    // sans rien garder. Son absence est couverte par le test de suppression
    // ci-dessus, qui porte sur le préfixe entier.)

    it('le CSS de la vue leçon est retiré en ENTIER (pas de règle orpheline)', () => {
        expect(css).not.toContain('planif-vue-lecon');
    });

});
