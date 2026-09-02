import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #329 Voûte Phase 1 · lot T — sentinelles de la confiance TOFU (D3 variante B).
// Couvre les 3 états (nouveau / verifiee / cle_changee) + indeterminable, la
// normalisation du nom (NFC, casse, espaces — un nom connu ne doit pas être
// contournable par variation typographique), la persistance du registre
// `clesConnues` (clé GLOBALE, jamais namespacée) et le remplacement de clé
// qui exige un choix explicite (critère 19 du plan).
// La modale bloquante (DOM) est couverte au terrain par _demoAlerteCleChangee()
// et le sera en Playwright avec le flux d'import (P3).

function fauxDb() {
    const donnees = new Map();
    return {
        _donnees: donnees,
        getSync(k, defaut = null) { return donnees.has(k) ? donnees.get(k) : defaut; },
        setSync(k, v) { donnees.set(k, JSON.parse(JSON.stringify(v))); }
    };
}

function paquet(nom, cle) {
    return { manifest: { auteur: { nom }, clePublique: cle, signature: 'sig', algorithme: 'ECDSA-P256-SHA-256' } };
}

let db;
let tofu;

beforeEach(() => {
    db = fauxDb();
    tofu = chargerScript('js/trust-tofu.js', { db }).trustTofu;
});

describe('lot T · sentinelle exports', () => {
    it('expose l\'API attendue sur window.trustTofu', () => {
        ['verifierConfianceTOFU', 'memoriserContact', 'listerAuteursConnus',
            'oublierAuteur', 'normaliserNomAuteur', 'demanderDecisionCleChangee'].forEach(nom => {
            expect(tofu[nom], nom).toBeTypeOf('function');
        });
        expect(tofu.TEXTES_CONFIANCE.cle_changee).toContain('{nom}');
        expect(tofu.TEXTES_CONFIANCE.nouveau).toContain('premier contact');
    });
});

describe('lot T · les 3 états (+ indeterminable)', () => {
    it('auteur jamais vu → nouveau (lecture seule : rien n\'est mémorisé)', () => {
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('nouveau');
        // La vérification ne mémorise PAS : un second appel redit « nouveau ».
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('nouveau');
        expect(tofu.listerAuteursConnus()).toHaveLength(0);
    });

    it('après mémorisation, même clé → verifiee avec la fiche', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        const v = tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A'));
        expect(v.statut).toBe('verifiee');
        expect(v.fiche).toMatchObject({ nom: 'Marie', clePubliqueB64: 'CLE_A', nbImports: 1 });
    });

    it('auteur connu, AUTRE clé → cle_changee avec fiche connue ET clé présentée', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        const v = tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_B'));
        expect(v.statut).toBe('cle_changee');
        expect(v.fiche.clePubliqueB64).toBe('CLE_A');
        expect(v.clePresentee).toBe('CLE_B');
    });

    it('package sans auteur ou sans clé → indeterminable (jamais d\'exception)', () => {
        expect(tofu.verifierConfianceTOFU({}).statut).toBe('indeterminable');
        expect(tofu.verifierConfianceTOFU({ manifest: { auteur: { nom: 'X' }, clePublique: null } }).statut).toBe('indeterminable');
        expect(tofu.verifierConfianceTOFU({ manifest: { auteur: {}, clePublique: 'CLE' } }).statut).toBe('indeterminable');
    });
});

describe('lot T · normalisation du nom (anti-contournement)', () => {
    it('casse et espaces différents → même fiche', () => {
        tofu.memoriserContact(paquet('Anne-Amélie Rousseau', 'CLE_A'));
        expect(tofu.verifierConfianceTOFU(paquet('  anne-amélie   ROUSSEAU ', 'CLE_A')).statut).toBe('verifiee');
        expect(tofu.verifierConfianceTOFU(paquet('  anne-amélie   ROUSSEAU ', 'CLE_B')).statut).toBe('cle_changee');
    });

    it('NFD (macOS) et NFC → même fiche', () => {
        tofu.memoriserContact(paquet('Amélie'.normalize('NFC'), 'CLE_A'));
        expect(tofu.verifierConfianceTOFU(paquet('Amélie'.normalize('NFD'), 'CLE_A')).statut).toBe('verifiee');
    });

    it('deux auteurs réellement différents restent distincts', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        expect(tofu.verifierConfianceTOFU(paquet('Mario', 'CLE_B')).statut).toBe('nouveau');
    });
});

describe('lot T · mémorisation et remplacement de clé', () => {
    it('imports répétés même clé → nbImports incrémente, premierContact stable', () => {
        const f1 = tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        const f2 = tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        expect(f2.nbImports).toBe(2);
        expect(f2.premierContact).toBe(f1.premierContact);
    });

    it('clé différente SANS choix explicite → Error, registre intact (critère 19)', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        expect(() => tofu.memoriserContact(paquet('Marie', 'CLE_B'))).toThrow(/remplacement refusé/);
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('verifiee');
    });

    it('remplacerCle: true → nouvelle clé active, ancienne tracée', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        const fiche = tofu.memoriserContact(paquet('Marie', 'CLE_B'), { remplacerCle: true });
        expect(fiche.clePubliqueB64).toBe('CLE_B');
        expect(fiche.anciennesCles).toHaveLength(1);
        expect(fiche.anciennesCles[0].clePubliqueB64).toBe('CLE_A');
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_B')).statut).toBe('verifiee');
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('cle_changee');
    });

    it('package sans identité → memoriserContact lance (pas d\'écriture aveugle)', () => {
        expect(() => tofu.memoriserContact({})).toThrow(/mémorisation impossible/);
    });
});

describe('lot T · persistance du registre (clé globale clesConnues)', () => {
    it('le registre survit à un rechargement du module (même db)', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        const tofu2 = chargerScript('js/trust-tofu.js', { db }).trustTofu;
        expect(tofu2.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('verifiee');
    });

    it('écrit sous la clé GLOBALE clesConnues, structure versionnée', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        const brut = db.getSync('clesConnues');
        expect(brut.version).toBe(1);
        expect(Object.keys(brut.auteurs)).toEqual(['marie']);
        expect(brut.auteurs.marie.signaturesWoT).toEqual([]); // structure WoT prévue (D3)
    });

    it('registre corrompu en storage → reparts d\'un registre vide sans planter', () => {
        db.setSync('clesConnues', 'pas-un-objet');
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('nouveau');
    });

    it('oublierAuteur retire la fiche → redevient nouveau', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        expect(tofu.oublierAuteur('  MARIE ')).toBe(true);
        expect(tofu.oublierAuteur('Marie')).toBe(false);
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('nouveau');
    });

    it('listerAuteursConnus retourne des clones (mutation sans effet)', () => {
        tofu.memoriserContact(paquet('Marie', 'CLE_A'));
        tofu.listerAuteursConnus()[0].clePubliqueB64 = 'CLE_PIRATE';
        expect(tofu.verifierConfianceTOFU(paquet('Marie', 'CLE_A')).statut).toBe('verifiee');
    });
});
