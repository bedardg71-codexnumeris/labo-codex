import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// ⚠ DESTINATIONS MIGRÉES PAR S5/#623 LE 31 AOÛT 2026. Les copies de cartouches
// atterrissaient sous la clé NUE ; `js/partage-section.js` route désormais ses
// écritures par `cle(...)`, et le stub de ce fichier rend `h2026_` + k (l.48).
// DÉRIVÉE du stub, jamais recopiée.
const DEST = (id) => 'h2026_cartouches_' + id;


// #329 Voûte Phase 1 · lot P4 — sentinelles de la section « Partagés ».
// Couvre la DUPLICATION vers les documents de l'utilisateur (par type, avec
// dépendances : grille → cartouches, production → grille → cartouches,
// cartouche → sa grille entière) et les deux invariants :
//  1. les collections partage_* ne sont JAMAIS modifiées par une duplication
//     (lecture seule par construction) ;
//  2. la copie suit les conventions des dupliquer* existants (id neuf,
//     auteur actif, dansBibliotheque, metadata_cc retiré, inspireDe conservé).
// Le rendu de la section dans les 5 modales est couvert en Playwright.

function fauxDb() {
    const donnees = {};
    return {
        _donnees: donnees,
        getSync(k, defaut = null) {
            return Object.prototype.hasOwnProperty.call(donnees, k)
                ? JSON.parse(JSON.stringify(donnees[k]))
                : defaut;
        },
        setSync(k, v) {
            donnees[k] = JSON.parse(JSON.stringify(v));
        }
    };
}

let db;
let w;
let compteurIds;
let dernierConfirm;
let reponseConfirm;
let appelsExport;

function charger() {
    db = fauxDb();
    compteurIds = 0;
    reponseConfirm = true;
    dernierConfirm = '';
    w = chargerScript('js/partage-section.js', {
        db,
        genererIdUnique: (prefixe) => prefixe + 'NEUF_' + (++compteurIds),
        getCleProductions: () => 'h2026_productions',
        alert: () => {},
        confirm: (texte) => { dernierConfirm = texte; return reponseConfirm; }
    });
    w.cle = (k) => 'h2026_' + k;
    w.BibliothequeUI = {
        obtenirAuteurActif: () => 'Grégoire',
        formaterTitre: (n) => n,
        renderCarteDisponible: (opts) => '[carte:' + opts.nom + ':' + opts.boutonPrincipal.label + ']'
            + '[menu:' + (opts.actionsMenu || []).map(a => a.label + '→' + a.action).join(',') + ']'
    };
    // Registre des packages importés : le vrai module (partage-import.js) est
    // chargé à part dans les tests de suppression, pour vérifier que la
    // suppression à l'unité met le registre à jour au lieu de le laisser mentir.
    //
    // partageExport est stubbé : ce qui compte ici n'est pas qu'un .lcz sorte
    // (couvert ailleurs), c'est CE QU'ON LUI PASSE — les lecteurs de la source
    // partagée et la chaîne d'attribution.
    appelsExport = [];
    w.partageExport = {
        exporterEntite: (entite, type, options) => {
            appelsExport.push({ entite, type, options });
            return Promise.resolve(true);
        }
    };
    w.trustTofu = {
        normaliserNomAuteur: (n) => String(n || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase()
    };
    return w;
}

/**
 * Charge `partage-import.js` sur LE MÊME faux window et le même `db`, pour
 * que `partageSection.supprimerDuPartage` trouve `partageImport.oublierEntites`
 * comme dans l'application.
 */
function chargerRegistreReel() {
    chargerScript('js/partage-import.js', {
        db,
        crypto: { randomUUID: () => 'aaaaaaaa-0000-0000-0000-000000000000' },
        JSZip: function () {}
    }, w);
    return w.partageImport;
}

function poserPartages() {
    db.setSync('partage_grilles', [{
        id: 'PARTAGE_abc_GR_X', nom: 'Grille partagée',
        criteres: [{ id: 'C1', nom: 'Structure' }],
        metadata_cc: { auteur_original: 'Marie', licence: 'CC BY-NC-SA 4.0' },
        inspireDe: { nom: 'Grille partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'GR_X' }
    }]);
    db.setSync('partage_cartouches', [{
        id: 'PARTAGE_abc_CART_1', grilleId: 'PARTAGE_abc_GR_X', nom: 'Cartouche liée',
        inspireDe: { nom: 'Cartouche liée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'CART_1' }
    }]);
    db.setSync('partage_productions', [{
        id: 'PARTAGE_abc_PROD_1', titre: 'Dissertation', grilleId: 'PARTAGE_abc_GR_X',
        inspireDe: { nom: 'Dissertation', auteur: 'Marie', date: '2026-06-10', idOriginal: 'PROD_1' }
    }]);
    db.setSync('partage_echelles', [{
        id: 'PARTAGE_abc_ECH_1', nom: 'Échelle partagée', niveaux: [{ code: 'M', nom: 'Maîtrisé' }],
        inspireDe: { nom: 'Échelle partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'ECH_1' }
    }]);
    db.setSync('partage_pratiques', [{
        id: 'PARTAGE_abc_PR_1', nom: 'STD partagée', configuration: {},
        inspireDe: { nom: 'STD partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'PR_1' }
    }]);
}

function instantanePartages() {
    return JSON.stringify(['partage_grilles', 'partage_cartouches', 'partage_productions',
        'partage_echelles', 'partage_pratiques'].map(k => db.getSync(k, [])));
}

beforeEach(() => {
    charger();
    poserPartages();
});

describe('lot P4 · sentinelle exports', () => {
    it('expose l\'API attendue sur window.partageSection', () => {
        // ↻ #1156 : `genererSectionHTML` retirée, `rangeesDeuxColonnes` la remplace.
        ['rangeesDeuxColonnes', 'dupliquer', 'dupliquerVersMesDocuments',
            'consequencesSuppression', 'supprimerDuPartage', 'supprimer',
            'exporterPourPartager', 'chaineAttributionPour'].forEach(nom => {
            expect(w.partageSection[nom], nom).toBeTypeOf('function');
        });
    });
});

describe('lot P4 · duplication grille (avec cartouches)', () => {
    it('copie la grille dans cle(grillesTemplates) avec les conventions de duplication', () => {
        const avant = instantanePartages();
        const r = w.partageSection.dupliquerVersMesDocuments('grille', 'PARTAGE_abc_GR_X');

        const grilles = db.getSync('h2026_grillesTemplates', []);
        expect(grilles).toHaveLength(1);
        const copie = grilles[0];
        expect(copie.id).toBe('GRILLE_NEUF_1');
        expect(copie.auteur).toBe('Grégoire');
        expect(copie.dansBibliotheque).toBe(true);
        expect(copie.metadata_cc).toBeUndefined();
        // La trace de provenance (D7) est CONSERVÉE — c'est l'attribution CC.
        expect(copie.inspireDe).toEqual({
            nom: 'Grille partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'GR_X'
        });
        expect(r.idNouveau).toBe('GRILLE_NEUF_1');
        expect(r.libelle).toContain('1 cartouche');

        // Invariant : les partagés sont intacts (lecture seule).
        expect(instantanePartages()).toBe(avant);
    });

    it('duplique les cartouches partagées de la grille dans cartouches_{nouvelId}, grilleId remappé', () => {
        w.partageSection.dupliquerVersMesDocuments('grille', 'PARTAGE_abc_GR_X');
        const cartouches = db.getSync(DEST('GRILLE_NEUF_1'), []);
        expect(cartouches).toHaveLength(1);
        expect(cartouches[0].id).toMatch(/^CART_NEUF_/);
        expect(cartouches[0].grilleId).toBe('GRILLE_NEUF_1');
        expect(cartouches[0].inspireDe.idOriginal).toBe('CART_1');
    });
});

describe('lot P4 · duplication cartouche → sa grille entière', () => {
    it('duplique la grille parente avec toutes ses cartouches', () => {
        const r = w.partageSection.dupliquerVersMesDocuments('cartouche', 'PARTAGE_abc_CART_1');
        expect(r).not.toBeNull();
        expect(db.getSync('h2026_grillesTemplates', [])).toHaveLength(1);
        expect(db.getSync(DEST(r.idNouveau), [])).toHaveLength(1);
    });

    it('cartouche orpheline (grille parente absente des partagés) → null, rien d\'écrit', () => {
        db.setSync('partage_grilles', []);
        const r = w.partageSection.dupliquerVersMesDocuments('cartouche', 'PARTAGE_abc_CART_1');
        expect(r).toBeNull();
        expect(db.getSync('h2026_grillesTemplates', [])).toHaveLength(0);
    });
});

describe('lot P4 · duplication production (avec sa grille partagée)', () => {
    it('copie la production + sa grille + les cartouches, grilleId remappé', () => {
        const r = w.partageSection.dupliquerVersMesDocuments('production', 'PARTAGE_abc_PROD_1');
        const productions = db.getSync('h2026_productions', []);
        const grilles = db.getSync('h2026_grillesTemplates', []);
        expect(productions).toHaveLength(1);
        expect(grilles).toHaveLength(1);
        expect(productions[0].grilleId).toBe(grilles[0].id);
        expect(db.getSync(DEST(grilles[0].id), [])).toHaveLength(1);
        expect(r.libelle).toContain('avec sa grille');
    });

    it('grilleId partagé introuvable → référence vidée (jamais de pointeur vers partage_*)', () => {
        db.setSync('partage_grilles', []);
        w.partageSection.dupliquerVersMesDocuments('production', 'PARTAGE_abc_PROD_1');
        const productions = db.getSync('h2026_productions', []);
        expect(productions[0].grilleId).toBe('');
    });
});

describe('lot P4 · duplication échelle et pratique', () => {
    it('échelle → cle(echellesTemplates) ; pratique → cle(pratiquesConfigurables)', () => {
        w.partageSection.dupliquerVersMesDocuments('echelle', 'PARTAGE_abc_ECH_1');
        w.partageSection.dupliquerVersMesDocuments('pratique', 'PARTAGE_abc_PR_1');
        expect(db.getSync('h2026_echellesTemplates', [])).toHaveLength(1);
        expect(db.getSync('h2026_pratiquesConfigurables', [])).toHaveLength(1);
    });

    it('id introuvable → null, aucun effet', () => {
        const avant = instantanePartages();
        expect(w.partageSection.dupliquerVersMesDocuments('echelle', 'FANTOME')).toBeNull();
        expect(db.getSync('h2026_echellesTemplates', [])).toHaveLength(0);
        expect(instantanePartages()).toBe(avant);
    });
});

describe('lot P4 · rendu de la section', () => {
    // ↻ #1156 (25 oct. 2026) : `genererSectionHTML` (la section en cartes de `creerModal`) est retirée ; les cinq
    // fenêtres sont en deux colonnes et lisent `rangeesDeuxColonnes` (mêmes mots, mêmes gestes, en données).
    // BREAK-TEST (25 oct.) : « Dupliquer vers mes documents » → « Dupliquer » dans `rangeesDeuxColonnes` → ROUGE.
    it('rien quand aucun item partagé du type (la section n\'apparaît pas)', () => {
        db.setSync('partage_grilles', []);
        expect(w.partageSection.rangeesDeuxColonnes('grille')).toBeNull();
    });

    it('rend le titre de section + une rangée par item, passage Dupliquer', () => {
        const section = w.partageSection.rangeesDeuxColonnes('grille');
        expect(section.titre).toBe('Partagés par des collègues');
        expect(section.rangees.map(r => [r.nom, r.passage.label, r.passage.action]))
            .toContainEqual(['Grille partagée', 'Dupliquer vers mes documents', 'partageSection.dupliquer']);
    });

    it('cartouche : passage « Dupliquer avec sa grille »', () => {
        const section = w.partageSection.rangeesDeuxColonnes('cartouche');
        expect(section.rangees.length).toBeGreaterThan(0);
        section.rangees.forEach(r => expect(r.passage.label).toBe('Dupliquer avec sa grille'));
    });
});


/* ===================================================================
   SUPPRESSION D'UN ITEM PARTAGÉ (25 août 2026)

   « Je voudrais pouvoir supprimer les cartouches partagées. Il n'y a pas de
   menu pour le faire, comme dans les autres cartes. »

   Ce que ces sentinelles tiennent :
     1. le menu ⋮ EXISTE sur les cartes partagées des cinq bibliothèques ;
     2. supprimer retire la copie importée — et RIEN d'autre : ni les
        documents de l'utilisateur, ni les autres partagés ;
     3. supprimer une grille emporte SES cartouches partagées (sinon elles
        restent à l'écran avec un bouton « Dupliquer » qui échoue) et
        laisse les productions, dont la duplication sait déjà se rattraper ;
     4. le registre des packages importés cesse d'annoncer ce qui n'est
        plus là — c'est lui qui alimente Réglages › Données.
   =================================================================== */

describe('suppression · le menu ⋮ est rendu sur toutes les bibliothèques', () => {
    it('chaque type propose « Supprimer » → partageSection.supprimer', () => {
        ['grille', 'echelle', 'cartouche', 'production', 'pratique'].forEach(type => {
            // ↻ #1156 (25 oct. 2026) : `genererSectionHTML` (la section en cartes de `creerModal`) est retirée ; les cinq
            // fenêtres sont en deux colonnes et lisent `rangeesDeuxColonnes` (mêmes mots, mêmes gestes, en données).
            const section = w.partageSection.rangeesDeuxColonnes(type);
            expect(section && section.rangees.length, type).toBeGreaterThan(0);
            // Le menu a gagné « Exporter pour partager » le 25 août (décision 3.2) :
            // on tient la PRÉSENCE de l'entrée, pas la composition entière du menu
            // — celle-ci est verrouillée par la sentinelle de ré-export plus bas.
            section.rangees.forEach(r => expect(r.menu.map(g => g.label + '→' + g.action), type)
                .toContain('Supprimer→partageSection.supprimer'));
        });
    });
});

describe('suppression · portée', () => {
    it('cartouche : retirée de partage_cartouches, sa grille et le reste intacts', () => {
        const r = w.partageSection.supprimerDuPartage('cartouche', 'PARTAGE_abc_CART_1');
        expect(r.nom).toBe('Cartouche liée');
        expect(db.getSync('partage_cartouches', [])).toHaveLength(0);
        expect(db.getSync('partage_grilles', [])).toHaveLength(1);
        expect(db.getSync('partage_echelles', [])).toHaveLength(1);
        expect(db.getSync('partage_productions', [])).toHaveLength(1);
        expect(db.getSync('partage_pratiques', [])).toHaveLength(1);
    });

    it('échelle et pratique : suppression directe, sans dépendants', () => {
        expect(w.partageSection.supprimerDuPartage('echelle', 'PARTAGE_abc_ECH_1')).not.toBeNull();
        expect(w.partageSection.supprimerDuPartage('pratique', 'PARTAGE_abc_PR_1')).not.toBeNull();
        expect(db.getSync('partage_echelles', [])).toHaveLength(0);
        expect(db.getSync('partage_pratiques', [])).toHaveLength(0);
        expect(db.getSync('partage_grilles', [])).toHaveLength(1);
        expect(db.getSync('partage_cartouches', [])).toHaveLength(1);
    });

    it('grille : emporte SES cartouches partagées, laisse les productions', () => {
        const r = w.partageSection.supprimerDuPartage('grille', 'PARTAGE_abc_GR_X');
        expect(r.nbCartouches).toBe(1);
        expect(db.getSync('partage_grilles', [])).toHaveLength(0);
        expect(db.getSync('partage_cartouches', [])).toHaveLength(0);
        expect(db.getSync('partage_productions', [])).toHaveLength(1);
    });

    it('grille : ne touche QUE ses propres cartouches', () => {
        db.setSync('partage_cartouches', db.getSync('partage_cartouches', []).concat([
            { id: 'PARTAGE_abc_CART_2', grilleId: 'PARTAGE_abc_GR_AUTRE', nom: 'Cartouche d\'une autre grille' }
        ]));
        w.partageSection.supprimerDuPartage('grille', 'PARTAGE_abc_GR_X');
        const restantes = db.getSync('partage_cartouches', []);
        expect(restantes).toHaveLength(1);
        expect(restantes[0].id).toBe('PARTAGE_abc_CART_2');
    });

    it('les documents de l\'utilisateur ne sont jamais touchés', () => {
        db.setSync('h2026_grillesTemplates', [{ id: 'GRILLE_A_MOI', nom: 'Ma grille' }]); // security-ok: littéral de test, aucune source externe
        db.setSync(DEST('GRILLE_A_MOI'), [{ id: 'CART_A_MOI', grilleId: 'GRILLE_A_MOI' }]); // security-ok: littéral de test, aucune source externe
        w.partageSection.supprimerDuPartage('grille', 'PARTAGE_abc_GR_X');
        expect(db.getSync('h2026_grillesTemplates', [])).toHaveLength(1);
        // ⚠ Migré bien qu'il PASSAIT déjà : posée sous la clé nue, cette cartouche
        // vivait dans une case que le code ne lit plus. « Intouchée » n'y prouvait
        // donc plus rien — l'assertion était devenue vraie par construction.
        expect(db.getSync(DEST('GRILLE_A_MOI'), [])).toHaveLength(1);
    });

    it('id introuvable → null, aucune écriture', () => {
        const avant = instantanePartages();
        expect(w.partageSection.supprimerDuPartage('grille', 'FANTOME')).toBeNull();
        expect(instantanePartages()).toBe(avant);
    });
});

describe('suppression · consequencesSuppression (avant toute écriture)', () => {
    it('nomme les cartouches et les productions d\'une grille sans rien écrire', () => {
        const avant = instantanePartages();
        const c = w.partageSection.consequencesSuppression('grille', 'PARTAGE_abc_GR_X');
        expect(c.cartouches.map(x => x.id)).toEqual(['PARTAGE_abc_CART_1']);
        expect(c.productions.map(x => x.id)).toEqual(['PARTAGE_abc_PROD_1']);
        expect(instantanePartages()).toBe(avant);
    });

    it('une cartouche n\'a pas de dépendants', () => {
        const c = w.partageSection.consequencesSuppression('cartouche', 'PARTAGE_abc_CART_1');
        expect(c.cartouches).toHaveLength(0);
        expect(c.productions).toHaveLength(0);
    });
});

describe('suppression · handler (confirmation)', () => {
    it('confirmation refusée → rien n\'est supprimé', () => {
        reponseConfirm = false;
        const avant = instantanePartages();
        w.partageSection.supprimer('cartouche', 'PARTAGE_abc_CART_1');
        expect(instantanePartages()).toBe(avant);
    });

    it('la confirmation NOMME les cartouches emportées et les productions touchées', () => {
        reponseConfirm = false;
        w.partageSection.supprimer('grille', 'PARTAGE_abc_GR_X');
        expect(dernierConfirm).toContain('Grille partagée');
        expect(dernierConfirm).toContain('Cartouche liée');
        expect(dernierConfirm).toContain('1 production');
        expect(dernierConfirm).toContain('réimporter le fichier .lcz');
    });

    it('confirmation acceptée → suppression effectuée', () => {
        reponseConfirm = true;
        w.partageSection.supprimer('cartouche', 'PARTAGE_abc_CART_1');
        expect(db.getSync('partage_cartouches', [])).toHaveLength(0);
    });
});

describe('suppression · le registre cesse d\'annoncer ce qui n\'est plus là', () => {
    function poserRegistre() {
        db.setSync('partage_packagesImportes', [{
            idImport: 'IMP_abc',
            dateImport: '2026-06-10T12:00:00.000Z',
            auteur: { nom: 'Marie' },
            auteurNormalise: 'marie',
            itemPrincipal: { type: 'grille', idOriginal: 'GR_X', idNouveau: 'PARTAGE_abc_GR_X', nom: 'Grille partagée' },
            nbParType: { grille: 1, cartouche: 1, production: 1, echelle: 1, pratique: 1 },
            idsIntegres: {
                grille: ['PARTAGE_abc_GR_X'],
                cartouche: ['PARTAGE_abc_CART_1'],
                production: ['PARTAGE_abc_PROD_1'],
                echelle: ['PARTAGE_abc_ECH_1'],
                pratique: ['PARTAGE_abc_PR_1']
            }
        }]);
    }

    it('supprimer une échelle décrémente son décompte dans le registre', () => {
        chargerRegistreReel();
        poserRegistre();
        w.partageSection.supprimerDuPartage('echelle', 'PARTAGE_abc_ECH_1');
        const entree = db.getSync('partage_packagesImportes', [])[0];
        expect(entree.idsIntegres.echelle).toEqual([]);
        expect(entree.nbParType.echelle).toBeUndefined();
        expect(entree.nbParType.grille).toBe(1);
    });

    it('supprimer la grille retire aussi ses cartouches DU REGISTRE', () => {
        chargerRegistreReel();
        poserRegistre();
        w.partageSection.supprimerDuPartage('grille', 'PARTAGE_abc_GR_X');
        const entree = db.getSync('partage_packagesImportes', [])[0];
        expect(entree.idsIntegres.grille).toEqual([]);
        expect(entree.idsIntegres.cartouche).toEqual([]);
        expect(entree.nbParType.production).toBe(1);
    });

    it('un package vidé item par item disparaît du registre', () => {
        chargerRegistreReel();
        poserRegistre();
        ['grille', 'production', 'echelle', 'pratique'].forEach(type => {
            const id = db.getSync('partage_' + (type === 'echelle' ? 'echelles' : type + 's'), [])[0];
            if (id) w.partageSection.supprimerDuPartage(type, id.id);
        });
        expect(db.getSync('partage_packagesImportes', [])).toHaveLength(0);
    });

    it('oublierEntites : un ID absent ne casse rien, ne compte rien, n\'écrit rien', () => {
        const registre = chargerRegistreReel();
        poserRegistre();
        // Une entrée déjà vide (cas limite) doit survivre à un appel qui
        // n'oublie rien : sans la garde `if (oublies)`, le filtre de fin la
        // supprimerait au passage — une écriture non demandée.
        db.setSync('partage_packagesImportes', db.getSync('partage_packagesImportes', []).concat([
            { idImport: 'IMP_vide', auteur: { nom: 'Vide' }, nbParType: {}, idsIntegres: { grille: [] },
              itemPrincipal: { type: 'grille', nom: 'Rien' } }
        ]));
        const avant = JSON.stringify(db.getSync('partage_packagesImportes', []));
        expect(registre.oublierEntites({ grille: ['PARTAGE_zzz_INCONNU'] })).toBe(0);
        expect(JSON.stringify(db.getSync('partage_packagesImportes', []))).toBe(avant);
    });

    it('sans registre chargé, la suppression fonctionne quand même', () => {
        expect(w.partageImport).toBeUndefined();
        expect(w.partageSection.supprimerDuPartage('pratique', 'PARTAGE_abc_PR_1')).not.toBeNull();
        expect(db.getSync('partage_pratiques', [])).toHaveLength(0);
    });
});

/* ===================================================================
   RÉ-EXPORT D'UN ITEM PARTAGÉ — décision 3.2 de la porte #490

   « Faut-il aussi pouvoir "Exporter pour partager" un item partagé ? »
   Verdict de Grégoire : oui.

   Ce que ces sentinelles tiennent, dans l'ordre du risque :
     1. L'ATTRIBUTION. Un item importé n'a pas de `metadata_cc` — sa
        provenance vit dans `inspireDe`. Mesuré au navigateur avant
        d'écrire : la chaîne sortait VIDE, avec le seul nom de qui exporte.
        Ré-émettre le travail d'un collègue ainsi est une faute de licence.
     2. LA SOURCE DES DÉPENDANCES. Les cartouches partagées vivent dans une
        collection PLATE, pas sous `cartouches_{grilleId}` : sans lecteurs
        injectés, le package partirait AMPUTÉ, en silence.
     3. Le menu ⋮ propose l'entrée, avant « Supprimer ».
   =================================================================== */

describe('ré-export · le menu ⋮ propose « Exporter pour partager »', () => {
    it('l\'entrée existe dans les cinq bibliothèques, avant « Supprimer »', () => {
        ['grille', 'echelle', 'cartouche', 'production', 'pratique'].forEach(type => {
            // ↻ #1156 (25 oct. 2026) : `genererSectionHTML` (la section en cartes de `creerModal`) est retirée ; les cinq
            // fenêtres sont en deux colonnes et lisent `rangeesDeuxColonnes` (mêmes mots, mêmes gestes, en données).
            const section = w.partageSection.rangeesDeuxColonnes(type);
            expect(section && section.rangees.length, type).toBeGreaterThan(0);
            section.rangees.forEach(r => expect(r.menu.map(g => g.label + '→' + g.action), type).toEqual([
                'Exporter pour partager→partageSection.exporterPourPartager', 'Supprimer→partageSection.supprimer']));
        });
    });
});

describe('ré-export · la source des dépendances est le namespace partagé', () => {
    it('passe des lecteurs qui trouvent les cartouches de la collection PLATE', async () => {
        await w.partageSection.exporterPourPartager('grille', 'PARTAGE_abc_GR_X');
        expect(appelsExport).toHaveLength(1);
        const { entite, type, options } = appelsExport[0];
        expect(type).toBe('grille');
        expect(entite.id).toBe('PARTAGE_abc_GR_X');
        // C'est CE lecteur qui empêche le package de partir amputé.
        expect(options.lecteurs.cartouchesDeGrille('PARTAGE_abc_GR_X').map(c => c.id))
            .toEqual(['PARTAGE_abc_CART_1']);
        expect(options.lecteurs.grilleParId('PARTAGE_abc_GR_X').nom).toBe('Grille partagée');
    });

    it('les lecteurs ne débordent pas sur une autre grille', async () => {
        await w.partageSection.exporterPourPartager('grille', 'PARTAGE_abc_GR_X');
        const { options } = appelsExport[0];
        expect(options.lecteurs.cartouchesDeGrille('PARTAGE_abc_GR_AUTRE')).toEqual([]);
        expect(options.lecteurs.grilleParId('PARTAGE_abc_GR_AUTRE')).toBeNull();
    });

    it('id introuvable → aucun export tenté', async () => {
        await w.partageSection.exporterPourPartager('grille', 'FANTOME');
        expect(appelsExport).toHaveLength(0);
    });
});

describe('ré-export · l\'attribution d\'origine part avec le fichier', () => {
    it('un item d\'un collègue : sa provenance devient un maillon', () => {
        const item = db.getSync('partage_grilles', [])[0];
        const chaine = w.partageSection.chaineAttributionPour(item, 'Grégoire Bédard');
        expect(chaine).toEqual([
            { niveau: 0, auteur: 'Marie', nomItem: 'Grille partagée' }
        ]);
    });

    it('la chaîne du package REÇU est conservée, le maillon vient après', () => {
        chargerRegistreReel();
        db.setSync('partage_packagesImportes', [{
            idImport: 'IMP_abc', auteur: { nom: 'Marie' },
            chaineAttribution: [{ niveau: 0, auteur: 'Autrice première', nomItem: 'Ancêtre' }],
            nbParType: { grille: 1 }, idsIntegres: { grille: ['PARTAGE_abc_GR_X'] },
            itemPrincipal: { type: 'grille', nom: 'Grille partagée' }
        }]);
        const item = db.getSync('partage_grilles', [])[0];
        const chaine = w.partageSection.chaineAttributionPour(item, 'Grégoire Bédard');
        expect(chaine.map(m => m.auteur)).toEqual(['Autrice première', 'Marie']);
    });

    it('un auteur déjà nommé dans la chaîne reçue n\'est pas ajouté deux fois', () => {
        chargerRegistreReel();
        db.setSync('partage_packagesImportes', [{
            idImport: 'IMP_abc', auteur: { nom: 'Marie' },
            chaineAttribution: [{ niveau: 0, auteur: 'MARIE', nomItem: 'Grille partagée' }],
            nbParType: { grille: 1 }, idsIntegres: { grille: ['PARTAGE_abc_GR_X'] },
            itemPrincipal: { type: 'grille', nom: 'Grille partagée' }
        }]);
        const item = db.getSync('partage_grilles', [])[0];
        expect(w.partageSection.chaineAttributionPour(item, 'Grégoire')).toHaveLength(1);
    });

    it('MON propre matériel réimporté : aucun maillon — le manifeste me nomme déjà', () => {
        // Le cas réel de Grégoire : ses partagés portent « par Grégoire Bédard ».
        const item = JSON.parse(JSON.stringify(db.getSync('partage_grilles', [])[0]));
        item.inspireDe.auteur = 'Grégoire  BÉDARD';   // casse et espaces différentes
        db.setSync('partage_grilles', [item]);
        expect(w.partageSection.chaineAttributionPour(item, 'grégoire bédard')).toEqual([]);
    });

    it('sans trace de provenance, on n\'invente aucun maillon', () => {
        const item = JSON.parse(JSON.stringify(db.getSync('partage_grilles', [])[0]));
        delete item.inspireDe;
        expect(w.partageSection.chaineAttributionPour(item, 'Grégoire')).toEqual([]);
    });

    it('l\'export reçoit la chaîne, pas seulement l\'entité', async () => {
        await w.partageSection.exporterPourPartager('cartouche', 'PARTAGE_abc_CART_1');
        expect(appelsExport[0].options.chaineAttribution)
            .toEqual([{ niveau: 0, auteur: 'Marie', nomItem: 'Cartouche liée' }]);
    });
});
