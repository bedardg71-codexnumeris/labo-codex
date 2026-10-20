import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'echelles.js'), 'utf8');

// SENTINELLE #542 lot 2 — le niveau d'échelle porte son étiquette SOLO.
//
// LA QUESTION DE DÉPART (Grégoire, 26 août 2026) : « pourquoi la taxonomie SOLO
// est-elle associée aux critères plutôt qu'à l'échelle ? »
//
// L'intuition était juste sur le fond — SOLO est une taxonomie de résultats
// OBSERVÉS — mais elle ratait un fait : l'échelle portait DÉJÀ la correspondance
// SOLO, dans le champ `description`, en prose libre. Le vrai constat n'était
// donc pas « SOLO est du mauvais côté », c'était : d'un côté SOLO est un champ
// structuré que le calcul sait lire, de l'autre c'est de la prose qu'il ne peut
// pas lire.
//
// CE QUE CE LOT AJOUTE, ET CE QU'IL NE TOUCHE PAS :
//   · un menu SOLO à CINQ valeurs + « aucun », FACULTATIF, dans les DEUX
//     éditeurs d'échelle ;
//   · les étiquettes sur le SEED livré ;
//   · la `description` reste intacte — elle part dans les PDF remis aux élèves
//     (`export-pdf.js`), les cartouches et le comparateur. La remplacer
//     priverait toute échelle non SOLO du seul endroit où dire ce que son
//     niveau signifie.
//
// ⚠ AUCUNE REPRISE AUTOMATIQUE sur les échelles existantes. Deviner l'étiquette
// depuis la prose serait exactement le défaut B9 du plan : `obtenirNiveauSOLO()`
// (`trimestres.js`) REDEVINE SOLO depuis le nom d'un critère et contredit le
// champ que l'utilisateur configure. Ce lot ne recrée pas ce défaut ailleurs.

let win;

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, d) => (d !== undefined ? d : null),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        afficherNotification: () => {},
        afficherSection: () => {},
        genererIdUnique: (p) => (p || '') + 'X',
        travauxOutils: { renderPickerCouleur: () => '<input>' },
        // Les éditeurs écrivent leur rendu dans un conteneur du DOM. On leur en
        // fournit un : ce test porte sur ce qui est ÉCRIT dans le modèle, pas
        // sur le DOM — mais le rendu doit pouvoir aboutir pour que l'écriture
        // ait lieu.
        document: {
            addEventListener: () => {},
            removeEventListener: () => {},
            querySelector: () => null,
            querySelectorAll: () => [],
            getElementById: () => ({ innerHTML: '', value: '', style: {}, classList: { add() {}, remove() {} } }),
            createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
            body: { appendChild: () => {} }
        },
        // Les deux éditeurs re-rendent leur liste après chaque modification :
        // ces stubs ne servent qu'à laisser le rendu aboutir dans le bac à
        // sable. Ils ne participent à aucune assertion.
        boutonsReordonnerBloc: () => '',
        marquerChampRefuseEchelle: () => {},
        obtenirPlaceholderNiveau: () => ({ code: '', nom: '' })
    };
    win = chargerScript('js/echelles.js', stubs);
    // Les deux éditeurs appellent ces helpers via `window.` au moment du RENDU,
    // pas au chargement : il faut donc les poser sur le sandbox, pas seulement
    // parmi les globaux injectés.
    win.boutonsReordonnerBloc = () => '';
    win.marquerChampRefuseEchelle = () => {};
    win.travauxOutils = { renderPickerCouleur: () => '<input>' };
});

describe('#542 lot 2 · le menu SOLO du niveau d\'échelle', () => {

    it('offre les CINQ niveaux canoniques — une réponse peut être préstructurelle', () => {
        // Cinq, et non trois comme sur le critère : le critère porte une VISÉE
        // (on ne vise jamais l'unistructurel), le niveau porte un CONSTAT.
        const html = win.optionsNiveauSOLOEchelle('');
        for (const attendu of ['prestructurel', 'unistructurel', 'multistructurel', 'relationnel', 'abstrait_etendu']) {
            expect(html, 'niveau SOLO manquant : ' + attendu).toContain('value="' + attendu + '"');
        }
    });

    it('est FACULTATIF : « aucun » existe, et c\'est le défaut', () => {
        // Toutes les échelles n'ont pas de lecture SOLO — une échelle en
        // pourcentages, une échelle A/B/C/D. « aucun » est une réponse
        // légitime, pas un champ à remplir.
        const html = win.optionsNiveauSOLOEchelle('');
        expect(html).toContain('<option value="" selected>');
        expect(html).toMatch(/value=""[^>]*>— aucun —/);
    });

    it('une valeur enregistrée est bien re-sélectionnée', () => {
        const html = win.optionsNiveauSOLOEchelle('relationnel');
        expect(html).toContain('<option value="relationnel" selected>');
        expect(html).not.toContain('<option value="" selected>');
    });

    it('une valeur inconnue ne sélectionne RIEN plutôt que de deviner', () => {
        // Un champ venu d'un import ou d'une version future ne doit pas être
        // rabattu en silence sur une étiquette voisine.
        const html = win.optionsNiveauSOLOEchelle('quelque_chose_dautre');
        expect(html).not.toContain(' selected');
    });

    it('les libellés sont ceux de la taxonomie, accentués', () => {
        const html = win.optionsNiveauSOLOEchelle('');
        expect(html).toContain('>Préstructurel<');
        expect(html).toContain('>Abstrait étendu<');
    });
});

describe('#542 lot 2 · le champ est posé dans les DEUX éditeurs, par le MÊME producteur', () => {

    it('les deux éditeurs portent le champ `niveauSOLO`', () => {
        // `echelles.js` porte deux copies du même formulaire — échelle neuve et
        // échelle existante. Un lot qui n'en sert qu'une laisse la moitié des
        // utilisateurs sans le champ.
        // ↻ 19 oct. 2026 (#1117) : le champ sort dans `champPalierSOLONiveau` (qui le masque quand
        // l'observation SOLO est désactivée) ; les DEUX éditeurs l'appellent.
        const occurrences = SRC.match(/data-champ="niveauSOLO"/g) || [];
        expect(occurrences.length, 'un seul producteur du champ').toBe(1);
        const appels = SRC.match(/\$\{champPalierSOLONiveau\(niveau, /g) || [];
        expect(appels.length, 'le champ doit être dans les DEUX éditeurs').toBe(2);
    });

    it('chaque éditeur câble SON propre handler', () => {
        expect(SRC).toMatch(/champPalierSOLONiveau\(niveau, `data-on-change="modifierNiveauTempHandler"/);   // ↻ #1117
        // ↻ 11 oct. 2026 (#574) : la ligne de l'échelle enregistrée est une fonction partagée
        // avec le niveau en attente ; le handler lui est passé par l'appelant.
        expect(SRC).toMatch(/\$\{attrs\} data-champ="niveauSOLO"/);
        expect(SRC).toMatch(/\$\{champPalierSOLONiveau\(niveau, attrs\)\}/);   // ↻ #1117 : la ligne enregistrée passe ses attributs
        expect(SRC).toMatch(/ligneNiveauEchelleHtml\(\s*niveau,\s*`data-on-change="modifierNiveauEchelleHandler"/);
        expect(SRC).toMatch(/`data-on-change="modifierNiveauEnAttenteHandler"/);
    });

    it('les options viennent d\'UN SEUL producteur — pas de liste dupliquée', () => {
        // Deux listes d'options en dur finiraient par diverger : c'est le patron
        // que #529 a eu à défaire (deux replis aux valeurs différentes selon le
        // chemin), et que #542 a rejoué dans la conversion des niveaux.
        const appels = SRC.match(/optionsNiveauSOLOEchelle\(/g) || [];
        // ↻ 19 oct. 2026 (#1117) : la définition + l'appel de `champPalierSOLONiveau`, qui sert les deux éditeurs.
        expect(appels.length, 'la définition + le producteur du champ').toBeGreaterThanOrEqual(2);
        const listesEnDur = SRC.match(/<option value="multistructurel"/g) || [];
        expect(listesEnDur.length, 'aucune liste d\'options SOLO écrite en dur dans un formulaire').toBe(0);
    });

    it('le handler générique accepte le champ : il n\'y a rien à câbler de plus', () => {
        // `modifierNiveauTemp` écrit `niveaux[index][champ] = valeur` : tout
        // champ nouveau persiste sans code supplémentaire. Ce test l'ancre —
        // si quelqu'un passait un jour à une liste blanche de champs, le menu
        // SOLO deviendrait inerte EN SILENCE.
        win._niveauxNouvelleEchelle = [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 79.5 }];
        win.modifierNiveauTemp(0, 'niveauSOLO', 'relationnel');
        expect(win._niveauxNouvelleEchelle[0].niveauSOLO).toBe('relationnel');
    });

    it('« aucun » se ré-enregistre : on peut RETIRER une étiquette posée', () => {
        // Le champ est facultatif ; un facultatif qu'on ne peut pas vider n'est
        // pas facultatif. `refusChampNiveau` ne doit pas refuser la valeur vide
        // sur ce champ-là (elle la refuse sur code, nom, min, max, valeurCalcul).
        win._niveauxNouvelleEchelle = [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 79.5, niveauSOLO: 'relationnel' }];
        const r = win.modifierNiveauTemp(0, 'niveauSOLO', '');
        expect(r && r.refuse, 'vider une étiquette facultative ne doit pas être refusé').toBeFalsy();
        expect(win._niveauxNouvelleEchelle[0].niveauSOLO).toBe('');
    });
});

describe('#542 lot 2 · le SEED est étiqueté, les données existantes ne le sont pas', () => {

    it('les quatre niveaux du seed portent leur étiquette', () => {
        // Un seed est une échelle LIVRÉE, que l'utilisateur voit et modifie —
        // pas une valeur qu'un calcul invente. C'est la règle posée par
        // Grégoire le 26 août, et elle autorise ceci.
        expect(SRC).toMatch(/description: 'Préstructurel, unistructurel',\s*\n\s*niveauSOLO: 'unistructurel',/);
        expect(SRC).toMatch(/description: 'Multistructurel',\s*\n\s*niveauSOLO: 'multistructurel',/);
        expect(SRC).toMatch(/description: 'Relationnel',\s*\n\s*niveauSOLO: 'relationnel',/);
        expect(SRC).toMatch(/description: 'Abstrait étendu',\s*\n\s*niveauSOLO: 'abstrait_etendu',/);
    });

    it('« I » reçoit UNE étiquette, pas un composite', () => {
        // Sa description dit « Préstructurel, unistructurel ». Le menu ne prend
        // qu'une valeur : chaque lecteur du champ n'a qu'une étiquette à
        // traiter. La nuance reste dans la prose, qui est faite pour ça.
        expect(SRC).not.toMatch(/niveauSOLO: '[a-z_]+,[a-z_ ]+'/);
        expect(SRC).not.toMatch(/niveauSOLO: \[/);
    });

    it('les `description` du seed sont INTACTES — elles partent dans les PDF des élèves', () => {
        // D3 du plan : `description` alimente la colonne « Description » des
        // exports remis aux élèves. La remplacer priverait toute échelle non
        // SOLO du seul endroit où dire ce que son niveau signifie.
        expect(SRC).toContain("description: 'Préstructurel, unistructurel'");
        expect(SRC).toContain("description: 'Multistructurel'");
        expect(SRC).toContain("description: 'Relationnel'");
        expect(SRC).toContain("description: 'Abstrait étendu'");
    });

    it('AUCUNE reprise automatique : le champ ne se devine pas depuis la prose', () => {
        // Le défaut B9 du plan, à ne pas recréer ici : `obtenirNiveauSOLO()`
        // redevine SOLO depuis un NOM et contredit le champ configuré. Ce lot
        // ne doit contenir aucune inférence du même genre.
        expect(SRC).not.toMatch(/niveauSOLO\s*=\s*[^;]*description/);
        expect(SRC).not.toMatch(/description[^;\n]*\.(includes|indexOf|match)\([^)]*structurel/i);
    });

    it('un niveau neuf naît SANS étiquette — facultatif veut dire vide par défaut', () => {
        win._niveauxNouvelleEchelle = [];
        win.ajouterNiveauTemp();
        expect(win._niveauxNouvelleEchelle[0].niveauSOLO).toBeUndefined();
    });
});
