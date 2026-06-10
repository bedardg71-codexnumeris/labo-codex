import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #329 Voûte Phase 1 · lot F — sentinelles de la signature ECDSA (Défense F, D2).
// Couvre : canonicalisation déterministe, payload de signature (package entier,
// bloc signature neutralisé), aller-retour signer/vérifier, rejet d'un contenu
// altéré (critère 16 du plan), rejet d'une clé étrangère, et VECTEURS FIXES
// committés (générés le 10 juin 2026 avec le module réel — toute dérive de la
// canonicalisation ou du format casse ces tests, c'est leur rôle : un .lcz
// signé aujourd'hui doit rester vérifiable demain).
// Le stockage de l'identité (base IndexedDB dédiée `labo-codex-identite`)
// n'est pas testable en environnement node : couvert par _testSignatureF()
// au terrain (Safari) — tests 1, 2 et 8.

let sig;

beforeAll(() => {
    const w = chargerScript('js/signature.js');
    sig = w.signaturePartage;
});

function paquetMinimal() {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0',
            licence_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            dateExport: '2026-06-10T14:00:00.000Z',
            auteur: { nom: 'Vecteur de test lot F' },
            item_principal: { type: 'echelle', id: 'VEC_ECH_1' },
            chaineAttribution: [],
            signature: null,
            clePublique: null,
            algorithme: null
        },
        entites: {
            grilles: [],
            echelles: [{
                id: 'VEC_ECH_1',
                nom: 'Échelle vecteur — accents éàç',
                niveaux: [{ code: 'A', nom: 'Atteint' }, { code: 'NA', nom: 'Non atteint' }]
            }],
            cartouches: [], productions: [], pratiques: []
        },
        references: [],
        medias: []
    };
}

// ---------------------------------------------------------------------------
// Vecteurs fixes (10 juin 2026). La clé privée correspondante a été générée
// extractible, utilisée une fois, puis JETÉE : seuls la clé publique, le
// payload et la signature sont conservés. Ne JAMAIS régénérer ces valeurs
// sans comprendre pourquoi le test casse — c'est le gel du format qui parle.
// ---------------------------------------------------------------------------
const VECTEUR = {
    clePubliqueB64: 'eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6IlN6SDBuV21NT0NxR2toeldKWENNWklwazNmRGRvMFo0WExWbGxRTlRybmsiLCJ5Ijoid3I1TzFSczJqSTVQbzRUM2NjNjJVemlYRlh3YVNvR3I4Y1Y5MVVweTFvNCIsImNydiI6IlAtMjU2In0=',
    signatureB64: 'ttITOAj50vv+/lQ4OsKKoYLaX89Rv9HStdZX0vMUh/y7C7cmrolGADHdSHshQHx74EFL/r6tseJOzU4xL3rZCg==',
    payload: '{"entites":{"cartouches":[],"echelles":[{"id":"VEC_ECH_1","niveaux":[{"code":"A","nom":"Atteint"},{"code":"NA","nom":"Non atteint"}],"nom":"Échelle vecteur — accents éàç"}],"grilles":[],"pratiques":[],"productions":[]},"format":"labo-codex-partage-v1","manifest":{"algorithme":null,"auteur":{"nom":"Vecteur de test lot F"},"chaineAttribution":[],"clePublique":null,"dateExport":"2026-06-10T14:00:00.000Z","item_principal":{"id":"VEC_ECH_1","type":"echelle"},"licence":"CC BY-NC-SA 4.0","licence_url":"https://creativecommons.org/licenses/by-nc-sa/4.0/","signature":null},"medias":[],"references":[]}'
};

function paquetSigneVecteur() {
    const pkg = paquetMinimal();
    pkg.manifest.signature = VECTEUR.signatureB64;
    pkg.manifest.clePublique = VECTEUR.clePubliqueB64;
    pkg.manifest.algorithme = 'ECDSA-P256-SHA-256';
    return pkg;
}

async function paireJetable() {
    return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
}

describe('lot F · sentinelle exports', () => {
    it('expose l\'API attendue sur window.signaturePartage', () => {
        ['canonicaliser', 'construirePayloadSignature', 'signerChaine', 'verifierChaine',
            'exporterClePubliqueB64', 'importerClePubliqueB64', 'signerPackage',
            'verifierSignaturePackage', 'obtenirIdentite', 'creerIdentite',
            'obtenirOuCreerIdentite'].forEach(nom => {
            expect(sig[nom], nom).toBeTypeOf('function');
        });
    });
});

describe('lot F · canonicalisation', () => {
    it('est insensible à l\'ordre d\'insertion des clés, à tous les niveaux', () => {
        const a = { b: 1, a: { d: [1, 2], c: 'x' } };
        const b = { a: { c: 'x', d: [1, 2] }, b: 1 };
        expect(sig.canonicaliser(a)).toBe(sig.canonicaliser(b));
    });

    it('préserve l\'ordre des tableaux (lui est significatif)', () => {
        expect(sig.canonicaliser([1, 2])).not.toBe(sig.canonicaliser([2, 1]));
    });

    it('reste du JSON valide qui re-parse vers la même structure', () => {
        const pkg = paquetMinimal();
        expect(JSON.parse(sig.canonicaliser(pkg))).toEqual(pkg);
    });

    it('ignore les valeurs undefined comme JSON.stringify', () => {
        expect(sig.canonicaliser({ a: 1, b: undefined })).toBe('{"a":1}');
    });
});

describe('lot F · payload de signature', () => {
    it('couvre le package ENTIER, bloc signature neutralisé', () => {
        const payload = sig.construirePayloadSignature(paquetMinimal());
        expect(payload).toContain('VEC_ECH_1');                       // entités couvertes
        expect(payload).toContain('"signature":null');                 // bloc neutralisé
        expect(payload).toContain('"clePublique":null');
    });

    it('donne le MÊME payload pour un package signé et non signé (vérifiabilité)', () => {
        expect(sig.construirePayloadSignature(paquetSigneVecteur()))
            .toBe(sig.construirePayloadSignature(paquetMinimal()));
    });

    it('correspond exactement au vecteur fixe committé (gel du format)', () => {
        expect(sig.construirePayloadSignature(paquetMinimal())).toBe(VECTEUR.payload);
    });

    it('refuse un package sans manifeste', () => {
        expect(() => sig.construirePayloadSignature({ entites: {} })).toThrow(/manifeste/);
    });
});

describe('lot F · vecteurs fixes (clé publique seule, clé privée jetée)', () => {
    it('la signature du vecteur se vérifie avec la clé publique committée', async () => {
        const cle = await sig.importerClePubliqueB64(VECTEUR.clePubliqueB64);
        await expect(sig.verifierChaine(cle, VECTEUR.payload, VECTEUR.signatureB64)).resolves.toBe(true);
    });

    it('verifierSignaturePackage accepte le package signé du vecteur', async () => {
        const v = await sig.verifierSignaturePackage(paquetSigneVecteur());
        expect(v).toMatchObject({ valide: true, code: 'SIGNATURE_VALIDE' });
    });

    it('un octet altéré dans une ENTITÉ → SIGNATURE_INVALIDE (critère 16 étendu)', async () => {
        const pkg = paquetSigneVecteur();
        pkg.entites.echelles[0].nom = 'Échelle vecteur — accents éàÇ';
        const v = await sig.verifierSignaturePackage(pkg);
        expect(v).toMatchObject({ valide: false, code: 'SIGNATURE_INVALIDE' });
    });

    it('un octet altéré dans le MANIFESTE → SIGNATURE_INVALIDE (critère 16)', async () => {
        const pkg = paquetSigneVecteur();
        pkg.manifest.auteur.nom = 'Vecteur de test lot f';
        const v = await sig.verifierSignaturePackage(pkg);
        expect(v).toMatchObject({ valide: false, code: 'SIGNATURE_INVALIDE' });
    });
});

describe('lot F · aller-retour signer/vérifier (clés fraîches)', () => {
    it('signe puis vérifie une chaîne quelconque', async () => {
        const paire = await paireJetable();
        const s = await sig.signerChaine(paire.privateKey, 'contenu à signer éç');
        await expect(sig.verifierChaine(paire.publicKey, 'contenu à signer éç', s)).resolves.toBe(true);
        await expect(sig.verifierChaine(paire.publicKey, 'contenu altéré', s)).resolves.toBe(false);
    });

    it('rejette une signature produite par une clé ÉTRANGÈRE (critère 15/U-01)', async () => {
        const pkg = paquetSigneVecteur();
        const etrangere = await paireJetable();
        pkg.manifest.signature = await sig.signerChaine(
            etrangere.privateKey, sig.construirePayloadSignature(pkg));
        // clePublique du manifeste reste celle du vecteur → mismatch attendu.
        const v = await sig.verifierSignaturePackage(pkg);
        expect(v).toMatchObject({ valide: false, code: 'SIGNATURE_INVALIDE' });
    });

    it('la clé publique survit à l\'aller-retour export/import base64', async () => {
        const paire = await paireJetable();
        const b64 = await sig.exporterClePubliqueB64(paire.publicKey);
        const reimportee = await sig.importerClePubliqueB64(b64);
        const s = await sig.signerChaine(paire.privateKey, 'roundtrip');
        await expect(sig.verifierChaine(reimportee, 'roundtrip', s)).resolves.toBe(true);
    });
});

describe('lot F · refus structurés de verifierSignaturePackage', () => {
    it('package non signé → SIGNATURE_ABSENTE (jamais d\'exception)', async () => {
        const v = await sig.verifierSignaturePackage(paquetMinimal());
        expect(v).toMatchObject({ valide: false, code: 'SIGNATURE_ABSENTE' });
    });

    it('signature présente mais clé publique absente → CLE_PUBLIQUE_ABSENTE', async () => {
        const pkg = paquetSigneVecteur();
        pkg.manifest.clePublique = null;
        const v = await sig.verifierSignaturePackage(pkg);
        expect(v).toMatchObject({ valide: false, code: 'CLE_PUBLIQUE_ABSENTE' });
    });

    it('algorithme inattendu → ALGORITHME_INCONNU (pas de négociation d\'algorithme)', async () => {
        const pkg = paquetSigneVecteur();
        pkg.manifest.algorithme = 'RSA-PSS';
        const v = await sig.verifierSignaturePackage(pkg);
        expect(v).toMatchObject({ valide: false, code: 'ALGORITHME_INCONNU' });
    });

    it('clé publique illisible → CLE_PUBLIQUE_INVALIDE', async () => {
        const pkg = paquetSigneVecteur();
        pkg.manifest.clePublique = 'pas-du-base64-jwk!!!';
        const v = await sig.verifierSignaturePackage(pkg);
        expect(v).toMatchObject({ valide: false, code: 'CLE_PUBLIQUE_INVALIDE' });
    });

    it('package sans manifeste → FORMAT_INVALIDE', async () => {
        const v = await sig.verifierSignaturePackage({ entites: {} });
        expect(v).toMatchObject({ valide: false, code: 'FORMAT_INVALIDE' });
    });
});

describe('lot F · câblage construirePackageSigne (partage-format)', () => {
    it('expose construirePackageSigne et rejette proprement sans signature.js', async () => {
        // partage-format chargé SEUL : window.signaturePartage absent.
        const w = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-format.js', {}, w);
        expect(w.partageFormat.construirePackageSigne).toBeTypeOf('function');
        await expect(w.partageFormat.construirePackageSigne(
            { id: 'E1', nom: 'Échelle', niveaux: [] }, { type: 'echelle' }
        )).rejects.toThrow(/signature\.js non chargé/);
    });

    it('rejette en Promise (pas en exception synchrone) si options.type manque', async () => {
        const w = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-format.js', {}, w);
        await expect(w.partageFormat.construirePackageSigne({ id: 'E1' }, {}))
            .rejects.toThrow(/options\.type requis/);
    });
});
