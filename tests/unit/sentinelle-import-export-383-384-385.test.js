import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLES — #383 + #384 + #385 (audit qualité 5 août 2026, rapports A2/A3/A4)
//
// #383 : cocher « Cartouches » dans l'import sélectif n'importait JAMAIS rien —
// la modale génère des ids AGRÉGÉS (`cartouches_0`…) que le filtre comparait
// aux ids INDIVIDUELS des cartouches. Verrou : la modale porte désormais
// data-item-id = clé réelle `cartouches_<grilleId>` et le filtre est PAR CLÉ.
//
// #384 : export ZIP et restauration ne traitaient qu'UNE clé fichiersTravaux
// (`find`) — backup multi-trimestre sans les blobs des autres trimestres,
// perte découverte à la restauration. Verrou : boucle sur TOUTES les clés.
//
// #385 : les blobs restaurés du ZIP entraient dans le store SANS
// validerMagicBytes, alors que le chemin codex (codex.js) a le garde.
// Règle CLAUDE.md : magic bytes sur TOUT blob importé.
//
// Sentinelles source-level (le couplage modale/FileReader/JSZip rend le
// fonctionnel disproportionné) — break-testées par réintroduction de chaque
// ancien motif.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

/** Corps d'une fonction, accolades appariées, commentaires retirés. */
function corpsSansCommentaires(src, signature) {
    const debut = src.indexOf(signature);
    if (debut === -1) throw new Error(`signature introuvable : ${signature}`);
    let i = src.indexOf('{', debut);
    let profondeur = 0;
    let fin = i;
    for (; fin < src.length; fin++) {
        if (src[fin] === '{') profondeur++;
        else if (src[fin] === '}' && --profondeur === 0) { fin++; break; }
    }
    return src.slice(i, fin)
        .split('\n')
        .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
        .join('\n');
}

const corpsRestauration = corpsSansCommentaires(source, 'async function _restaurerBlobsDepuisZip');

describe('#383 · import sélectif des cartouches par clé de grille', () => {
    it('la modale porte la clé réelle en data-item-id', () => {
        expect(source).toMatch(/id: 'cartouches_' \+ c\.grilleId/);
    });

    it('le filtre d\'import est PAR CLÉ (selectedIds contient des clés cartouches_<grilleId>)', () => {
        // Lot 3 (#655) : la variable de boucle s'appelle `cleFichier` — nommée `cle`, elle
        // masquait la fonction `cle()` et les cartouches tombaient sous la clé nue.
        expect(source).toMatch(/cleFichier\.startsWith\('cartouches_'\) && selectedIds\.includes\(cleFichier\)/);
    });

    it('ne réintroduit pas le filtre par id individuel (jamais matché par les ids agrégés)', () => {
        expect(source).not.toMatch(/selectedIds\.includes\(c\.id\)/);
    });
});

describe('#384 · blobs travaux de TOUTES les clés fichiersTravaux', () => {
    // RETIRÉ au lot I bis (D9, 30 sept. 2026) : « l'export ZIP boucle sur toutes les clés
    // sélectionnées ». L'export qu'il jugeait (la fenêtre des clés) n'existe plus. La
    // restauration, elle, reste : ci-dessous, et par exécution sur un vrai fichier dans
    // tests/integration/lot-i-bis-anciens-fichiers-s-ouvrent.spec.js.
    it('la restauration boucle sur toutes les clés du fichier', () => {
        expect(source).toMatch(/Object\.keys\(donnees\)\.filter\(c => c\.includes\('fichiersTravaux'\)\)/);
        expect(source).not.toMatch(/Object\.keys\(donnees\)\.find\(c => c\.includes\('fichiersTravaux'\)\)/);
    });
});

describe('#385 · magic bytes sur les blobs restaurés du ZIP', () => {
    it('_restaurerBlobsDepuisZip valide les magic bytes AVANT stockerBlob (patron codex)', () => {
        // Borné par le CORPS de la fonction, commentaires retirés : une borne
        // en caractères sur la source brute rougit au premier commentaire ajouté
        // entre les deux appels, et verdit si on en retire un ailleurs.
        expect(corpsRestauration).toMatch(/validerMagicBytes\(blob\)[\s\S]*?stockerBlob\(f\.id, blob/);
        expect(corpsRestauration.indexOf('validerMagicBytes(blob)')).toBeLessThan(corpsRestauration.indexOf('stockerBlob(f.id, blob'));
    });

    it('un blob refusé est sauté (continue), pas stocké', () => {
        expect(corpsRestauration).toMatch(/Blob refusé \(magic bytes invalides\)[\s\S]*?continue;/);
    });
});

// SENTINELLE — #613 (audit chaîne d'importation 30 août 2026, constat S8)
//
// La restauration d'un ZIP avalait les échecs de blobs : un blob refusé aux
// magic bytes, absent du ZIP ou perdu sur QuotaExceededError sortait par un
// `continue` / un `catch` muet, et l'import s'annonçait « Import réussi »
// quand même — avec, en prime, une notification de quota PAR blob (avalanche).
// Verrou : compter les manquants, marquer leurs métadonnées `blobStatut:
// 'manquant'`, appeler stockerBlob avec notifier:false, rendre un OBJET
// { restaures, manquants } et dire « partiel » dès qu'il en manque un.
//
// Garde reprise de codex.js:688 : un fichier `blobStatut: 'exporte'` n'a
// LÉGITIMEMENT pas de blob dans le ZIP (le blob avait quitté l'app avant
// l'export). Sans cette garde, un import complet s'annoncerait « partiel ».

describe('#613 · la restauration ZIP compte, marque et ne ment plus sur le résultat', () => {
    it('rend un objet { restaures, manquants } — et plus aucun retour numérique nu', () => {
        expect(corpsRestauration).toMatch(/return \{ restaures:[^}]*manquants:[^}]*\}/);
        expect(corpsRestauration).not.toMatch(/return 0;/);
        expect(corpsRestauration).not.toMatch(/return nbRestores;/);
    });

    it('les DEUX sorties anticipées rendent la même forme que le retour final', () => {
        // Un retour numérique nu converti à un seul endroit laisse les chemins
        // « rien à faire » rendre un nombre : l'appelant y lit `.restaures`
        // et obtient `undefined`, qui s'affiche comme un zéro silencieux.
        expect(corpsRestauration).toMatch(/!donnees\._zipTravaux[^\n]*return \{ restaures: 0, manquants: 0 \}/);
        expect(corpsRestauration).toMatch(/metadonnees\.length === 0\) return \{ restaures: 0, manquants: 0 \}/);
        expect(corpsRestauration.match(/return \{ restaures:/g) || []).toHaveLength(3);
    });

    it('appelle stockerBlob avec notifier:false (une notification agrégée, pas une par blob)', () => {
        expect(corpsRestauration).toMatch(/stockerBlob\(f\.id, blob,[^)]*\{ notifier: false \}\)/);
    });

    it('garde codex : un fichier « exporte » n\'est pas compté manquant', () => {
        expect(corpsRestauration).toMatch(/blobStatut !== 'exporte'/);
    });

    it('les trois chemins d\'échec sont comptés (magic bytes, absent du ZIP, exception)', () => {
        // magic bytes refusés
        expect(corpsRestauration).toMatch(/magic bytes invalides[\s\S]*?idsManquants\.push\(f\.id\)[\s\S]*?continue;/);
        // exception (quota ou autre) : comptée dans le catch, pas avalée —
        // et gardée, comme les deux autres portes. Un invariant dont une
        // branche sur trois ne le respecte pas n'est qu'une régularité.
        expect(corpsRestauration).toMatch(/catch \(e\) \{[\s\S]*?if \(blobAttendu\) idsManquants\.push\(f\.id\)/);
        // au moins trois sites de comptage
        expect(corpsRestauration.match(/idsManquants\.push\(f\.id\)/g) || []).toHaveLength(3);
    });

    it('marque blobStatut manquant et réécrit les clés fichiersTravaux', () => {
        expect(corpsRestauration).toMatch(/blobStatut = 'manquant'/);
        // #522 lot 7 (11 oct. 2026) : la réécriture passe par la file de la clé ; elle rend la liste lue.
        expect(corpsRestauration).toMatch(/await db\.modifier\(cleFT, \(liste\) => \{[\s\S]*?return liste;/);
    });

    it('n\'écrase JAMAIS un « exporte » par « manquant » au marquage', () => {
        // La garde gouverne les DEUX gestes : ne pas compter, ET ne pas marquer.
        // Écraser 'exporte' perdrait l'information que le blob a quitté l'app.
        expect(corpsRestauration).toMatch(/manquants\.has\(f\.id\) && f\.blobStatut !== 'exporte'/);
        expect(corpsRestauration).toMatch(/else if \(blobAttendu\)/);
    });

    it('ne réintroduit pas le bloc vide qui masquait le bilan', () => {
        expect(corpsRestauration).not.toMatch(/if \(nbRestores > 0\) \{\s*\}/);
    });
});

describe('#613 · les appelants n\'annoncent plus « réussi » sur un import partiel', () => {
    const corpsImportBrut = corpsSansCommentaires(source, 'async function executerImportLocalStorageBrut');

    it('l\'import complet dit « partiel » dès qu\'un blob manque', () => {
        expect(corpsImportBrut).toMatch(/resBlobs\.manquants \? 'partiel' : 'réussi'/);
        expect(corpsImportBrut).not.toMatch(/Import réussi !/);
    });

    it('les deux appelants lisent le champ restaures, jamais le retour nu', () => {
        expect(source).not.toMatch(/const nbRestores = await _restaurerBlobsDepuisZip/);
        expect(source).not.toMatch(/var nbBlobs = await _restaurerBlobsDepuisZip\(donneesBlobs\);\s*\n\s*if \(nbBlobs > 0\)/);
    });

    it('l\'import sélectif rapporte aussi les fichiers non restaurés', () => {
        // Borné par la BRANCHE et par l'INSTRUCTION, pas par une distance en
        // caractères — le défaut même que #616 recense ailleurs dans la suite.
        const corpsSelectif = corpsSansCommentaires(source, 'async function executerImportSelectif');
        // L'INSTRUCTION entière, de la déclaration à son point-virgule : la
        // ternaire tient sur trois lignes, un filtre ligne à ligne n'en voit
        // qu'une et ment sur ce qu'il vérifie.
        const debut = corpsSelectif.indexOf('var suffixeManquants');
        expect(debut).toBeGreaterThan(-1);
        const instruction = corpsSelectif.slice(debut, corpsSelectif.indexOf(';', debut) + 1);
        expect(instruction).toMatch(/= resBlobs\.manquants/);
        expect(instruction).toMatch(/non restauré\(s\), marqué\(s\) « manquant »/);
        // employé dans les DEUX branches de details.push, pas une seule
        expect(corpsSelectif.match(/\+ suffixeManquants\)/g) || []).toHaveLength(2);
    });
});
