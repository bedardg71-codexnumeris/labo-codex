import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #583 + #680 (25 sept. 2026) — UNE ÉCHELLE PARTAGÉE EMPORTE SES REPÈRES DE MAÎTRISE.
//
// Mesuré en WebKit avant d'écrire (`tests/integration/partage-echelle-reperes-583.spec.js`) :
// l'échelle arrivait chez la destinataire sans `seuilSuffisance`, `seuilMaitrise`,
// `description`, `discipline`, ni `niveaux[].description` / `niveauSOLO`, et le bilan de
// la copie évaluée avec elle n'écrivait rien sous « Présentement ». Le format reste
// `labo-codex-partage-v1` (décision de Grégoire du 25 sept.) : les champs sont ajoutés
// au schéma fermé, comme #667 et #668 avant eux.
//
// Ce que ce banc tient :
//   E — l'émission : les repères et les champs retenus partent.
//   R — la réception : ils arrivent ; un repère orphelin est retiré, et c'est dit.
//   A — l'avant : un paquet sans repères, signé avant ce lot, passe toujours.
//   M — le message : un champ inconnu dit à l'enseignant·e quoi faire.
// (Le registre d'exclusion est gardé par `sentinelle-transport-echelles.test.js`, AE.)

let w;
beforeEach(() => {
    w = chargerScript('js/partage-schemas.js');
    chargerScript('js/partage-format.js', {}, w);
    chargerScript('js/partage-validation.js', {}, w);
});

// Échelle fictive, forme réelle d'une échelle d'éditeur (echelles.js, `niveauxDefaut`).
const ECHELLE = {
    id: 'ECH_583', nom: 'IDME fictive', description: 'Échelle du département', discipline: 'Littérature',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', description: 'Unistructurel', niveauSOLO: 'unistructurel', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
        { code: 'D', nom: 'En développement', description: 'Multistructurel', niveauSOLO: 'multistructurel', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
        { code: 'M', nom: 'Maîtrisé', description: 'Relationnel', niveauSOLO: 'relationnel', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' }
    ],
    seuilSuffisance: 'D', seuilMaitrise: 'M',
    // États LOCAUX de l'émettrice : ne voyagent pas (CHAMPS_ECHELLE_NON_PARTAGES).
    auteur: 'Émettrice fictive', dateImport: '2026-09-01', verrouille: true, idOriginal: 'ECH_SOURCE'
};

function paquet(echelle) {
    return w.partageFormat.construirePackage(echelle, { type: 'echelle', identiteAuteur: 'Émettrice fictive' });
}

describe('#583 · E — l\'émission', () => {
    it('E.a les deux repères partent avec l\'échelle', () => {
        const emise = paquet(ECHELLE).entites.echelles[0];
        expect([emise.seuilSuffisance, emise.seuilMaitrise]).toEqual(['D', 'M']);
    });

    it('E.b les champs retenus de #680 partent, à la racine et sur chaque niveau', () => {
        const emise = paquet(ECHELLE).entites.echelles[0];
        expect(emise.description).toBe('Échelle du département');
        expect(emise.discipline).toBe('Littérature');
        expect(emise.niveaux.map(n => n.description)).toEqual(['Unistructurel', 'Multistructurel', 'Relationnel']);
        expect(emise.niveaux.map(n => n.niveauSOLO)).toEqual(['unistructurel', 'multistructurel', 'relationnel']);
    });

    it('E.c les états locaux de l\'émettrice restent chez elle', () => {
        const emise = paquet(ECHELLE).entites.echelles[0];
        ['auteur', 'dateImport', 'verrouille', 'idOriginal'].forEach(c => expect(emise, c).not.toHaveProperty(c));
    });

    it('E.d une échelle sans repères n\'en fabrique pas à l\'émission', () => {
        const sans = { ...ECHELLE };
        delete sans.seuilSuffisance;
        delete sans.seuilMaitrise;
        const emise = paquet(sans).entites.echelles[0];
        expect(emise).not.toHaveProperty('seuilSuffisance');
        expect(emise).not.toHaveProperty('seuilMaitrise');
    });
});

describe('#583 · R — la réception', () => {
    it('R.a LE CAS QUI PORTE LE SENS : le paquet émis se valide, et les repères arrivent', () => {
        const verdict = w.partageValidation.validerPackage(paquet(ECHELLE));
        expect(verdict.erreurs).toEqual([]);
        const recue = verdict.packageNettoye.entites.echelles[0];
        expect([recue.seuilSuffisance, recue.seuilMaitrise]).toEqual(['D', 'M']);
        expect(recue.niveaux[0].niveauSOLO).toBe('unistructurel');
        expect(verdict.avertissements).toEqual([]);
        expect(verdict.preview.avertissements).toEqual([]);
    });

    it('R.b un repère orphelin est RETIRÉ, le reste de l\'échelle arrive, et la prévisualisation le dit', () => {
        const pkg = paquet(ECHELLE);
        pkg.entites.echelles[0].seuilMaitrise = 'X';
        const verdict = w.partageValidation.validerPackage(pkg);
        expect(verdict.valide).toBe(true);
        const recue = verdict.packageNettoye.entites.echelles[0];
        expect(recue).not.toHaveProperty('seuilMaitrise');
        expect(recue.seuilSuffisance).toBe('D');
        expect(verdict.avertissements).toHaveLength(1);
        expect(verdict.avertissements[0]).toMatchObject({ id: 'ECH_583', champ: 'seuilMaitrise', code: 'X' });
        // Texte validé par Grégoire le 25 sept. 2026, avec les libellés de l'écran.
        expect(verdict.preview.avertissements).toEqual([
            'Échelle « IDME fictive » : le repère « Maîtrisé à partir de » désigne le niveau « X », '
            + 'qui n\'existe pas dans cette échelle. Ce repère n\'est pas importé ; '
            + 'tu pourras le poser dans l\'éditeur d\'échelle.'
        ]);
    });

    it('R.f les libellés de l\'avertissement sont ceux de l\'écran (REPERES_ECHELLE, echelles.js)', () => {
        const source = readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8');
        const debut = source.indexOf('const REPERES_ECHELLE = {');
        expect(debut, 'REPERES_ECHELLE introuvable — le banc a perdu sa cible').toBeGreaterThan(-1);
        const bloc = source.slice(debut, source.indexOf('};', debut));
        const ecran = {};
        for (const [, cle, libelle] of bloc.matchAll(/(\w+):\s*'([^']+)'/g)) ecran[cle] = libelle;
        expect(Object.keys(ecran)).toHaveLength(2);
        expect({ ...w.partageValidation.LIBELLES_REPERES }).toEqual(ecran);
    });

    it('R.c le paquet BRUT n\'est pas touché (c\'est lui que vérifie la signature)', () => {
        const pkg = paquet(ECHELLE);
        pkg.entites.echelles[0].seuilSuffisance = 'Z';
        w.partageValidation.validerPackage(pkg);
        expect(pkg.entites.echelles[0].seuilSuffisance).toBe('Z');
    });

    it('R.d un repère vide se lit « absent » : retiré sans un mot', () => {
        const pkg = paquet(ECHELLE);
        pkg.entites.echelles[0].seuilSuffisance = '';
        const verdict = w.partageValidation.validerPackage(pkg);
        expect(verdict.packageNettoye.entites.echelles[0]).not.toHaveProperty('seuilSuffisance');
        expect(verdict.avertissements).toEqual([]);
    });

    it('R.e les deux repères orphelins donnent deux avertissements', () => {
        const pkg = paquet(ECHELLE);
        pkg.entites.echelles[0].seuilSuffisance = 'Q';
        pkg.entites.echelles[0].seuilMaitrise = 'R';
        const verdict = w.partageValidation.validerPackage(pkg);
        expect(verdict.avertissements.map(a => a.champ)).toEqual(['seuilSuffisance', 'seuilMaitrise']);
    });
});

// Le vecteur figé du lot F (`signature-F.test.js`) : une échelle SANS repères, signée
// le 10 juin 2026 par une clé jetable. C'est « un paquet d'avant ce lot », au bit près.
const VECTEUR = {
    clePubliqueB64: 'eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6IlN6SDBuV21NT0NxR2toeldKWENNWklwazNmRGRvMFo0WExWbGxRTlRybmsiLCJ5Ijoid3I1TzFSczJqSTVQbzRUM2NjNjJVemlYRlh3YVNvR3I4Y1Y5MVVweTFvNCIsImNydiI6IlAtMjU2In0=',
    signatureB64: 'ttITOAj50vv+/lQ4OsKKoYLaX89Rv9HStdZX0vMUh/y7C7cmrolGADHdSHshQHx74EFL/r6tseJOzU4xL3rZCg=='
};

function paquetDeJuin() {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0',
            licence_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            dateExport: '2026-06-10T14:00:00.000Z',
            auteur: { nom: 'Vecteur de test lot F' },
            item_principal: { type: 'echelle', id: 'VEC_ECH_1' },
            chaineAttribution: [],
            signature: VECTEUR.signatureB64,
            clePublique: VECTEUR.clePubliqueB64,
            algorithme: 'ECDSA-P256-SHA-256'
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

describe('#583 · A — un paquet d\'avant ce lot passe toujours', () => {
    it('A.a il se valide avec le schéma élargi, sans avertissement ni repère fabriqué', () => {
        const verdict = w.partageValidation.validerPackage(paquetDeJuin());
        expect(verdict.valide).toBe(true);
        expect(verdict.avertissements).toEqual([]);
        expect(verdict.packageNettoye.entites.echelles[0]).not.toHaveProperty('seuilMaitrise');
    });

    it('A.b SA SIGNATURE SE VÉRIFIE ENCORE — et une altération la casse toujours', async () => {
        chargerScript('js/signature.js', {}, w);
        const ok = await w.signaturePartage.verifierSignaturePackage(paquetDeJuin());
        expect(ok.valide).toBe(true);
        // Témoin : le banc sait voir un refus. Ajouter un repère APRÈS la signature
        // est une altération, pas une mise à niveau.
        const altere = paquetDeJuin();
        altere.entites.echelles[0].seuilMaitrise = 'A';
        const ko = await w.signaturePartage.verifierSignaturePackage(altere);
        expect(ko.valide).toBe(false);
    });
});

describe('#583 · M — un champ inconnu dit quoi faire', () => {
    function erreursDUnChampInconnu(ou) {
        const pkg = paquet(ECHELLE);
        if (ou === 'entite') pkg.entites.echelles[0].champDuFutur = 'x';
        if (ou === 'niveau') pkg.entites.echelles[0].niveaux[0].champDuFutur = 'x';
        if (ou === 'manifeste') pkg.manifest.champDuFutur = 'x';
        if (ou === 'racine') pkg.champDuFutur = 'x';
        return w.partageValidation.validerPackage(pkg).erreurs;
    }

    it('M.a la validation marque le champ inconnu, où qu\'il soit dans le paquet', () => {
        ['entite', 'niveau', 'manifeste', 'racine'].forEach((ou) => {
            const erreurs = erreursDUnChampInconnu(ou);
            expect(erreurs.length, ou).toBeGreaterThan(0);
            expect(erreurs.some(e => e.champInconnu === true), ou).toBe(true);
        });
    });

    it('M.b le refus commence par la phrase qui dit quoi faire ; le détail technique suit', () => {
        chargerScript('js/trust-tofu.js', { db: { getSync: () => [], setSync: () => {} } }, w);
        chargerScript('js/partage-import.js', { db: { getSync: () => [], setSync: () => {} } }, w);
        const lignes = w.partageImport.formaterErreursValidation(erreursDUnChampInconnu('entite'));
        expect(lignes[0]).toBe(w.partageImport.TEXTE_VERSION_PLUS_RECENTE);
        expect(lignes[0]).toContain('version plus récente');
        expect(lignes.slice(1).join(' ')).toContain('champ inconnu (schéma fermé)');
    });

    it('M.c un autre refus (champ obligatoire absent) ne parle PAS de version', () => {
        chargerScript('js/trust-tofu.js', { db: { getSync: () => [], setSync: () => {} } }, w);
        chargerScript('js/partage-import.js', { db: { getSync: () => [], setSync: () => {} } }, w);
        const pkg = paquet(ECHELLE);
        delete pkg.entites.echelles[0].nom;
        const erreurs = w.partageValidation.validerPackage(pkg).erreurs;
        expect(erreurs.length).toBeGreaterThan(0);
        const lignes = w.partageImport.formaterErreursValidation(erreurs);
        expect(lignes).not.toContain(w.partageImport.TEXTE_VERSION_PLUS_RECENTE);
    });
});

// Relecture de Cowork (25 sept., § 1) — LE LOT NE DOIT PAS FERMER UN CHEMIN QUI MARCHAIT.
// Avant #680, une description trop longue TOMBAIT à la projection et le partage passait.
// Déclarer le champ avec une borne étroite faisait échouer l'auto-contrôle de l'export
// (`partage-export.js` passe le paquet à `validerPackage` et s'interrompt) : TOUT le
// partage de l'échelle était refusé. L'éditeur ne limite pas la longueur de ces textes.
describe('#583 · L — un texte libre long ne bloque pas le partage', () => {
    const long = (n) => 'Texte fictif. '.repeat(Math.ceil(n / 14)).slice(0, n);

    function echelleLongue() {
        return {
            ...ECHELLE,
            description: long(3000),
            discipline: long(300),
            niveaux: ECHELLE.niveaux.map((n, i) => (i === 0 ? { ...n, description: long(2500) } : n))
        };
    }

    it('L.a l\'auto-contrôle de l\'export passe (même chemin que partage-export.js)', () => {
        const verdict = w.partageValidation.validerPackage(paquet(echelleLongue()));
        expect(verdict.erreurs).toEqual([]);
        expect(verdict.valide).toBe(true);
    });

    it('L.b et le texte arrive ENTIER : aucune troncature silencieuse', () => {
        const recue = w.partageValidation.validerPackage(paquet(echelleLongue())).packageNettoye.entites.echelles[0];
        expect(recue.description).toHaveLength(3000);
        expect(recue.discipline).toHaveLength(300);
        expect(recue.niveaux[0].description).toHaveLength(2500);
    });
});
