import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #329 Voûte Phase 1 · lot P1 — sentinelles du format labo-codex-partage-v1.
// Couvre les 14 critères de la spec PLAN2-PHASE1-SPEC.md §6 (amendement du
// plan PLAN-VOUTE-PHASES-1-8.md : sentinelles Vitest au lieu des seuls tests
// console) + les garanties propres aux modules (projection fermée, entrée
// non mutée, règle 14 de SKILL_Securite_donnees §9.4).
// Modèle de dépendances réel : grille → cartouches (PAS grille → échelle,
// exemple périmé de la spec d'avril).

function grilleFixture() {
    return {
        id: 'GR_TEST', nom: 'Grille de test',
        criteres: [{ id: 'C1', nom: 'Structure', ponderation: 20, description: 'desc' }],
        dateCreation: '2026-06-01T00:00:00Z',
        dansBibliotheque: true,
        metadata_cc: { auteur_original: 'Test P1', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
    };
}

function cartoucheFixture(id) {
    return {
        id: id, grilleId: 'GR_TEST', nom: 'Cartouche ' + id,
        criteres: [{ id: 'C1', nom: 'Structure' }],
        niveaux: [{ code: 'I', nom: 'Incomplet' }],
        commentaires: { C1_I: 'À retravailler.' },
        verrouille: false
    };
}

function fauxDb(donnees) {
    return {
        getSync(cle, defaut) {
            return cle in donnees ? donnees[cle] : (defaut !== undefined ? defaut : null);
        }
    };
}

function pkgFixture() {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0',
            dateExport: '2026-06-10T12:00:00Z',
            auteur: { nom: 'Test P1' },
            item_principal: { type: 'grille', id: 'GR_TEST' },
            chaineAttribution: [],
            signature: null, clePublique: null, algorithme: null
        },
        entites: { grilles: [grilleFixture()] },
        references: [],
        medias: []
    };
}

let win;
let db;
beforeAll(() => {
    db = fauxDb({
        grillesTemplates: [grilleFixture()],
        cartouches_GR_TEST: [cartoucheFixture('CART1'), cartoucheFixture('CART2')]
    });
    win = chargerScript('js/partage-schemas.js');
    chargerScript('js/partage-validation.js', { db }, win);
    chargerScript('js/partage-format.js', { db }, win);
});

describe('#329 P1 · partage-schemas — constantes du format', () => {
    it('expose le format, les 5 types et les schémas fermés', () => {
        expect(win.partageSchemas.FORMAT).toBe('labo-codex-partage-v1');
        expect(win.partageSchemas.TYPES_ENTITES).toEqual(['grille', 'echelle', 'cartouche', 'production', 'pratique']);
        for (const type of win.partageSchemas.TYPES_ENTITES) {
            expect(win.partageSchemas.SCHEMA_ENTITE[type]).toBeTruthy();
        }
    });

    it('le manifeste porte le bloc signature dès la v1 (D2, anti-dette de format)', () => {
        const champs = win.partageSchemas.SCHEMA_MANIFESTE.champs;
        expect(champs.signature).toBeTruthy();
        expect(champs.clePublique).toBeTruthy();
        expect(champs.algorithme).toBeTruthy();
    });
});

describe('#329 P1 · construirePackage (spec §6 tests 1-2)', () => {
    it('1 · package construit depuis une grille → validé', () => {
        const pkg = win.partageFormat.construirePackage(grilleFixture(), {
            type: 'grille', identiteAuteur: 'Test P1'
        });
        const r = win.partageValidation.validerPackage(pkg);
        expect(r.erreurs).toEqual([]);
        expect(r.valide).toBe(true);
        expect(r.preview.nomItemPrincipal).toBe('Grille de test');
    });

    it('2 · inclureDependances — les cartouches de la grille sont incluses avec leurs références', () => {
        const pkg = win.partageFormat.construirePackage(grilleFixture(), {
            type: 'grille', inclureDependances: true, identiteAuteur: 'Test P1'
        });
        expect(pkg.entites.cartouches.map(c => c.id)).toEqual(['CART1', 'CART2']);
        expect(pkg.references).toHaveLength(2);
        expect(pkg.references[0]).toEqual({
            depuis: { type: 'cartouche', id: 'CART1' },
            vers: { type: 'grille', id: 'GR_TEST' },
            nature: 'utilise'
        });
        expect(win.partageValidation.validerPackage(pkg).valide).toBe(true);
    });

    it('2b · production → sa grille + les cartouches de celle-ci', () => {
        const prod = { id: 'PROD1', titre: 'Analyse', grilleId: 'GR_TEST', ponderation: 20 };
        const pkg = win.partageFormat.construirePackage(prod, { type: 'production', identiteAuteur: 'Test P1' });
        expect(pkg.entites.grilles.map(g => g.id)).toEqual(['GR_TEST']);
        expect(pkg.entites.cartouches).toHaveLength(2);
        expect(win.partageValidation.validerPackage(pkg).valide).toBe(true);
    });

    it('la projection retire les champs hors schéma (auteur, flags, locaux, _internes)', () => {
        const grille = grilleFixture();
        grille.auteur = 'Quelqu\'un';
        grille.isDemo = true;
        grille._etatInterne = { x: 1 };
        grille.champInconnu = 'résidu';
        const pkg = win.partageFormat.construirePackage(grille, { type: 'grille', identiteAuteur: 'T' });
        const projete = pkg.entites.grilles[0];
        expect(projete.auteur).toBeUndefined();
        expect(projete.isDemo).toBeUndefined();
        expect(projete._etatInterne).toBeUndefined();
        expect(projete.champInconnu).toBeUndefined();
        expect(projete.nom).toBe('Grille de test');
    });

    it('options.type est requis (les entités internes ne portent pas leur type)', () => {
        expect(() => win.partageFormat.construirePackage(grilleFixture(), {})).toThrow(/type/);
    });
});

describe('#329 P1 · validerPackage — 6 niveaux (spec §6 tests 3-14)', () => {
    const v = (p) => win.partageValidation.validerPackage(p);
    const codes = (r) => r.erreurs.map(e => e.code);

    it('3 · rejette un objet vide', () => {
        const r = v({});
        expect(r.valide).toBe(false);
        expect(codes(r)).toContain('FORMAT_INVALIDE');
    });

    it('4 · rejette un format différent', () => {
        const p = pkgFixture(); p.format = 'autre-format';
        expect(codes(v(p))).toContain('FORMAT_INVALIDE');
    });

    it('5 · rejette un manifest sans auteur.nom', () => {
        const p = pkgFixture(); delete p.manifest.auteur.nom;
        expect(codes(v(p))).toContain('MANIFEST_INVALIDE');
    });

    it('6 · rejette auteur.nom « Demo Labo Codex » (USURPATION_DEMO)', () => {
        const p = pkgFixture(); p.manifest.auteur.nom = 'Demo Labo Codex';
        expect(codes(v(p))).toContain('USURPATION_DEMO');
    });

    it('6b · rejette un ID d\'entité préfixé demo-', () => {
        const p = pkgFixture();
        p.entites.pratiques = [{ id: 'demo-std-litt', nom: 'P', configuration: {} }];
        expect(codes(v(p))).toContain('USURPATION_DEMO');
    });

    it('7 · rejette une grille avec champ inconnu (schéma fermé)', () => {
        const p = pkgFixture(); p.entites.grilles[0].champMystere = 'x';
        const r = v(p);
        expect(codes(r)).toContain('ENTITE_INVALIDE');
        expect(r.erreurs[0].champ).toContain('champMystere');
    });

    it('7b · rejette le champ auteur au niveau d\'une entité (porté par le manifeste)', () => {
        const p = pkgFixture(); p.entites.grilles[0].auteur = 'X';
        expect(codes(v(p))).toContain('ENTITE_INVALIDE');
    });

    it('7c · rejette une clé préfixée _ dans la configuration libre d\'une pratique', () => {
        const p = pkgFixture();
        p.entites.pratiques = [{ id: 'P1', nom: 'P', configuration: { _interne: 1 } }];
        expect(codes(v(p))).toContain('ENTITE_INVALIDE');
    });

    it('8 · rejette une référence orpheline', () => {
        const p = pkgFixture();
        p.references = [{ depuis: { type: 'grille', id: 'GR_TEST' }, vers: { type: 'echelle', id: 'FANTOME' }, nature: 'utilise' }];
        expect(codes(v(p))).toContain('REFERENCE_ORPHELINE');
    });

    it('9 · détecte une référence circulaire (A → A)', () => {
        const p = pkgFixture();
        p.references = [{ depuis: { type: 'grille', id: 'GR_TEST' }, vers: { type: 'grille', id: 'GR_TEST' }, nature: 'derive_de' }];
        expect(codes(v(p))).toContain('REFERENCE_CIRCULAIRE');
    });

    it('10 · retire silencieusement isDemo/estDemo (pas de rejet)', () => {
        const p = pkgFixture();
        p.entites.grilles[0].isDemo = true;
        p.entites.grilles[0].estDemo = true;
        const r = v(p);
        expect(r.valide).toBe(true);
        expect(r.packageNettoye.entites.grilles[0].isDemo).toBeUndefined();
        expect(r.packageNettoye.entites.grilles[0].estDemo).toBeUndefined();
    });

    it('11 · échappe le HTML bénin sans rejeter (niveau 5)', () => {
        const p = pkgFixture(); p.entites.grilles[0].nom = 'Grille <em>riche</em>';
        const r = v(p);
        expect(r.valide).toBe(true);
        expect(r.packageNettoye.entites.grilles[0].nom).not.toContain('<');
        expect(r.packageNettoye.entites.grilles[0].nom).toContain('Grille');
    });

    it('11b · rejette un pattern dangereux — règle 14 SKILL_Securite_donnees §9.4', () => {
        for (const charge of ['x<script>alert(1)</script>', 'javascript:alert(1)', 'a onerror=alert(1)', 'data:text/html;base64,x']) {
            const p = pkgFixture();
            p.entites.grilles[0].criteres[0].description = charge;
            const r = v(p);
            expect(r.valide).toBe(false);
            expect(codes(r)).toContain('CONTENU_DANGEREUX');
        }
    });

    it('12 · préserve une chaîne d\'attribution multi-niveaux dans preview', () => {
        const p = pkgFixture();
        p.manifest.chaineAttribution = [
            { niveau: 0, auteur: 'Auteur originel', nomItem: 'Grille mère' },
            { niveau: 1, auteur: 'Forkeur', nomItem: 'Grille fille' }
        ];
        const r = v(p);
        expect(r.valide).toBe(true);
        expect(r.preview.chaineAttribution).toHaveLength(2);
        expect(r.preview.chaineAttribution[1].auteur).toBe('Forkeur');
    });

    it('13 · rejette une grille de plus de 50 critères', () => {
        const p = pkgFixture();
        p.entites.grilles[0].criteres = Array.from({ length: 51 }, (_, i) => ({ id: 'C' + i, nom: 'c' }));
        expect(v(p).valide).toBe(false);
    });

    it('14 · rejette un nom de plus de 200 caractères', () => {
        const p = pkgFixture();
        p.entites.grilles[0].nom = 'x'.repeat(201);
        expect(v(p).valide).toBe(false);
    });

    it('medias non vides rejetés en Phase 1 (gérés en Phase 2)', () => {
        const p = pkgFixture(); p.medias = [{ nom: 'image.png' }];
        expect(codes(v(p))).toContain('MEDIAS_NON_SUPPORTES');
    });

    it('algorithme de signature inconnu rejeté (seul ECDSA-P256-SHA-256 admis)', () => {
        const p = pkgFixture(); p.manifest.algorithme = 'RSA';
        expect(v(p).valide).toBe(false);
    });

    it('l\'objet d\'entrée n\'est JAMAIS modifié (sanitisation sur clone)', () => {
        const p = pkgFixture();
        p.entites.grilles[0].isDemo = true;
        p.entites.grilles[0].nom = 'Grille <em>riche</em>';
        const avant = JSON.stringify(p);
        v(p);
        expect(JSON.stringify(p)).toBe(avant);
    });
});

describe('#329 P1 · _testPartagePhase1 — harnais console terrain', () => {
    it('les 14 scénarios console passent (retourne true)', () => {
        expect(win._testPartagePhase1()).toBe(true);
    });
});
