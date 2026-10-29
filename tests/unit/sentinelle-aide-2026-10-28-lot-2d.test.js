import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — #1152, lot 2d de la refonte de l'Aide (28 oct. 2026) : le Labo, Codex et archives et la Référence disent
// vrai, en moins de mots.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md (verdicts finals) ; remesure du 27 oct.
// (REMESURE-2026-10-27.md, sections Labo, Codex et archives, Référence) ; consigne
// CONSIGNE-LOT-2026-10-28-aide-lot-2d-labo-codex-reference.md (§2, §4).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · les entrées de chaque partie ⟷ la décision, dans l'ordre ; `modelisation` et `criteres`, absorbées, absentes ;
//     `glossaire-statique` intacte au lot 2d, à l'empreinte près, puis partie au lot 3 ;
//   · le texte visible des trois parties ⟷ les mots de l'ancien écran et les affirmations que le dossier a dites fausses ;
//   · chaque libellé cité entre « » dans `codex`, `export-import`, `partage` et `collaboration` ⟷ l'écran, lu dans
//     index.html (hors de l'Aide, attributs compris) et dans js/ ;
//   · les sous-onglets du Labo, le seuil de défi, les six paramètres, la fenêtre du codex, le chemin d'archivage d'un
//     trimestre, les trois dates du calendrier ⟷ le code, LUS, jamais recopiés ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const html = lire('index.html');
const doc = new JSDOM(html).window.document;

const net = (s) => String(s).replace(/[’‘]/g, '\'').replace(/\s+/g, ' ').trim();
const aide = doc.getElementById('section-aide');
const entree = (id) => doc.getElementById(`accordeon-aide-${id}`);
const texteDe = (id) => net(entree(id).textContent);
const titreDe = (id) => net(entree(id).querySelector('h3').textContent).replace(/^▼ /, '');
const idsDe = (partie) => [...doc.getElementById(`aide-${partie}`).querySelectorAll(':scope > .carte.accordeon')]
    .map((c) => c.id.replace('accordeon-aide-', ''));

// Côté écran : la page sans la section Aide (texte rendu ET source, pour les libellés posés en attribut) et le code de js/
// (apostrophes échappées, entités et échappements \uXXXX ramenés).
const { pageHorsAide, sourceHorsAide } = (() => {
    const d = new JSDOM(html).window.document;
    d.getElementById('section-aide').remove();
    return { pageHorsAide: net(d.body.textContent), sourceHorsAide: net(d.body.innerHTML.replace(/&nbsp;/g, ' ')) };
})();
const fichiersJs = (d) => readdirSync(path.join(racine, d)).flatMap((n) => {
    const r = path.join(d, n);
    return statSync(path.join(racine, r)).isDirectory() ? fichiersJs(r) : (r.endsWith('.js') ? [r] : []);
});
const codeJs = net(fichiersJs('js').map((f) => lire(f)).join('\n')
    .replace(/\\'/g, '\'')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16))));
const aLEcran = (libelle) => pageHorsAide.includes(libelle) || sourceHorsAide.includes(libelle) || codeJs.includes(libelle);

// La décision (consigne §2 et demande de relecture du lot) : la vue d'ensemble du Labo en tête, puis les entrées dans l'ordre
// des sous-onglets de js/config.js, chacune à côté de l'écran qui porte son réglage (Outils d'observation : `rai-solo`,
// `grille-depistage` ; Exploration des pratiques : `pan` ; Bilan réflexif : `bilan-reflexif`). Codex et archives et la
// Référence gardent leur ordre.
const PARTIES = {
    labo: ['labo', 'rai-solo', 'grille-depistage', 'pan', 'bilan-reflexif'],
    // ↻ #1152, lot 4 (29 oct. 2026) : `ce-qui-sort`, neuve, après `export-import` (consigne CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md, §1, trou 6).
    'codex-archives': ['codex', 'export-import', 'ce-qui-sort', 'partage', 'collaboration'],
    // ↻ #1152, lot 3 (28 oct. 2026) : `glossaire-statique` est partie (consigne du lot 3, §1).
    reference: ['glossaire', 'faq', 'problemes', 'ressources'],
};
const DU_LOT = Object.values(PARTIES).flat();

describe('#1152 lot 2d · la forme des trois parties', () => {
    it('chaque partie a les entrées de la décision, dans cet ordre ; `modelisation` et `criteres` n\'existent plus nulle part', () => {
        for (const [partie, ids] of Object.entries(PARTIES)) expect(idsDe(partie), partie).toEqual(ids);
        expect(html).not.toContain('accordeon-aide-modelisation');
        expect(html).not.toContain('accordeon-aide-criteres');
    });

    // ↻ #1152, lot 3 (28 oct. 2026) : ce lot ne touchait pas `glossaire-statique` (empreinte de sa tranche à `0e8da317` :
    // 55cfac01…07cf8) ; elle est partie au lot 3 (consigne du lot 3, §1), dont le banc vérifie ce qui en a été versé.
    it('`glossaire-statique` est partie au lot 3', () => {
        expect(html).not.toContain('accordeon-aide-glossaire-statique');
    });

    it('les entrées du Labo qui nomment un sous-onglet (« Navigation : Labo → … ») suivent l\'ordre de config.js', () => {
        const onglets = [...lire('js', 'config.js').match(/'labo': \[([\s\S]*?)\]/)[1].matchAll(/label: (["'])(.*?)\1/g)].map((m) => m[2]);
        expect(onglets).toHaveLength(7);
        const rangs = idsDe('labo').map((id) => texteDe(id).match(/Navigation : Labo → (.+?)(?:,|$| [A-ZÀ-Ý«])/))
            .filter(Boolean)
            .map((m) => onglets.findIndex((o) => m[1].startsWith(o)));
        expect(rangs).toHaveLength(4);
        expect(rangs).not.toContain(-1);
        expect(rangs).toEqual([...rangs].sort((x, y) => x - y));
    });

    it('aucune entrée des trois parties ne parle de l\'ancien écran ni ne redit ce que le dossier a dit faux', () => {
        const interdits = /sidebar|barre latérale|dropdown|Enregistrer les réglages|4 niveaux IDME|préservé à jamais|une seule zone de dépôt|Régénérer|glisser-déposer|Google Forms|LICENSE\.md|Tu dois utiliser cette même grille|même grille pour toutes tes évaluations|export de configuration|en développement/i;
        const fautives = DU_LOT.map((id) => [id, texteDe(id)])
            .filter(([, t]) => interdits.test(t))
            .map(([id, t]) => `${id} : ${t.match(interdits)[0]}`);
        expect(fautives).toEqual([]);
    });

    it('chaque libellé cité entre « » (codex, export-import, partage, collaboration) existe à l\'écran, hors de l\'Aide', () => {
        // Un renvoi à une autre entrée de l'Aide n'est pas un libellé d'écran : les titres sont lus dans la page. Une valeur
        // coupée s'écrit « … », un compte « (n) » : chaque morceau fixe est cherché.
        const titresAide = new Set([...aide.querySelectorAll('.carte.accordeon h3')].map((h) => net(h.textContent).replace(/^▼ /, '')));
        const absents = [];
        let cites = 0;
        for (const id of ['codex', 'export-import', 'partage', 'collaboration']) {
            for (const m of texteDe(id).matchAll(/« ([^»]+?) »/g)) {
                if (titresAide.has(m[1]) || m[1] === 'i') continue;
                for (const libelle of m[1].replace(/ \(n\)$/, '').split('…').map((x) => x.trim()).filter(Boolean)) {
                    cites++;
                    if (!aLEcran(libelle)) absents.push(`${id} : ${libelle}`);
                }
            }
        }
        expect(cites).toBeGreaterThan(35);
        expect(absents).toEqual([]);
    });

    it('chaque renvoi (« voir « … » ») des trois parties nomme un titre de l\'Aide', () => {
        const titresAide = new Set([...aide.querySelectorAll('.carte.accordeon h3')].map((h) => net(h.textContent).replace(/^▼ /, '')));
        const renvois = DU_LOT.flatMap((id) => [...texteDe(id).matchAll(/[Vv]oir « ([^»]+?) »/g)].map((m) => m[1]));
        expect(renvois.length).toBeGreaterThanOrEqual(8);
        expect(renvois.filter((r) => !titresAide.has(r))).toEqual([]);
    });
});

describe('#1152 lot 2d · ce que les entrées affirment, lu dans le code', () => {
    it('labo : les sept sous-onglets, dans l\'ordre de config.js ; « + Ouvrir » et ses formats ; la palette sans les codes', () => {
        const onglets = [...lire('js', 'config.js').match(/'labo': \[([\s\S]*?)\]/)[1].matchAll(/label: (["'])(.*?)\1/g)].map((m) => m[2]);
        const dits = [...entree('labo').querySelectorAll('li > strong')].map((s) => net(s.textContent).replace(/^« | »$/g, ''));
        expect(dits).toEqual(onglets);
        const mod = lire('js', 'modelisation.js');
        expect(mod).toContain('>+ Ouvrir</button>');
        expect(mod).toContain('input.accept = \'.pdf,.jpg,.jpeg,.png,.heic\';');
        expect(mod).toMatch(/afficherCodes: false/);
        const t = texteDe('labo');
        expect(t).toContain('« + Ouvrir » charge un document de ton appareil (PDF, JPG, PNG ou HEIC)');
        expect(t).toContain('sans les codes d\'erreurs');
        // Les Études : ce que leurs notes « i » ne disent pas, et aucune lecture causale.
        expect(lire('js', 'correlations-longitudinales.js')).toMatch(/var SEUIL_MIN_ETUDIANTS = 5;/);
        expect(lire('js', 'impact-jetons.js')).toMatch(/if \(donnees\.nbAvecJetons === 0\) \{\s*if \(carte\) carte\.style\.display = 'none';/);
        expect(t).toContain('ne calcule aucune corrélation sous 5 étudiant·es');
        expect(lire('js', 'accompagnement-contenu-popup.js')).toContain('Ce sont des pistes de réflexion, pas des preuves');
        expect(t).toContain('Ce sont des pistes de réflexion, pas des preuves.');
        expect(t).not.toMatch(/signal encourageant|diverge positivement|corrélation fiable/);
        // Le Suivi longitudinal : les mots de l'écran.
        const registre = lire('js', 'registre-longitudinal.js');
        for (const mot of ['Inscrire au registre', 'Résultats ultérieurs', 'Le registre voyage dans ton codex ; pas dans l\'archive d\'un groupe-cours.']) {
            expect(registre).toContain(mot.replace(/'/g, '\\\''));
        }
        expect(t).toContain('Le registre voyage dans ton codex, pas dans l\'archive d\'un groupe-cours.');
    });

    it('rai-solo : les deux libellés exacts, à l\'écran ; la carte SOLO suit les niveaux de l\'échelle, sans en nommer', () => {
        const t = texteDe('rai-solo');
        for (const libelle of ['Appliquer une adaptation du modèle de la Réponse à l\'intervention', 'Activer l\'observation de la structure des résultats d\'apprentissage']) {
            expect(pageHorsAide).toContain(libelle);
            expect(t).toContain(`« ${libelle} »`);
        }
        expect(lire('js', 'profil-etudiant-sections-affichage.js')).toContain('UN BLOC PAR NIVEAU DE L\'ÉCHELLE');
        expect(t).toContain('un bloc par niveau de l\'échelle, sous le nom que tu lui donnes');
        expect(t).not.toMatch(/IDME|Préstructurel|Incomplet|Défis \(I\/D\)|forces et défis identifiés/);
        expect(pageHorsAide).toContain('active la catégorie « Compréhension » (tampons SOLO) dans la palette d\'annotation');
        expect(t).toContain('la catégorie « Compréhension » de la palette d\'annotation');
    });

    it('grille-depistage : le rapprochement par le nom, les points d\'abord, le seuil de défi et le départage, lus dans le calcul', () => {
        const calculs = lire('js', 'profil-etudiant-calculs.js');
        const normaliser = tranche(calculs, 'function _normaliserNomCritere(', '\n}');
        expect(normaliser).toMatch(/toLowerCase\(\)/);
        expect(normaliser).toMatch(/normalize\('NFD'\)/);
        expect(normaliser).toMatch(/replace\(\/\\s\+\/g, ''\)/);
        expect(calculs).toMatch(/nomRef === nomEval \|\| nomRef\.startsWith\(nomEval\) \|\| nomEval\.startsWith\(nomRef\)/);
        expect(calculs).toContain('#739 : les points d\'abord, le\n * niveau sinon');
        // La pondération ne sert qu'au second tri, à un point près.
        expect(calculs).toMatch(/if \(Math\.abs\(b\.score - a\.score\) > 0\.01\) return b\.score - a\.score;\s*\/\/ Tri secondaire : par pondération[^\n]*\n\s*return b\.ponderation - a\.ponderation;/);
        const defi = Math.round(parseFloat(lire('js', 'interpretation-config.js').match(/\bdefiSpecifique:\s*([0-9.]+)/)[1]) * 100);
        const champ = doc.getElementById('v2-seuil-defi');
        expect(Number(champ.getAttribute('value'))).toBe(defi);
        const t = texteDe('grille-depistage');
        expect(t).toContain(`« Seuil de défi spécifique » (${defi} % par défaut, de ${champ.getAttribute('min')} à ${champ.getAttribute('max')} %`);
        expect(t).toContain('par son nom, égal ou qui commence de même, sans tenir compte des accents, de la casse ni des espaces');
        expect(t).toContain('il prend les points, le niveau à défaut');
        expect(t).toContain('la pondération ne départage que deux critères de même score');
        // Le choix s'écrit au changement (lot E3) ; la création, par les libellés de l'écran.
        expect(doc.getElementById('v2-pref-grille-reference').getAttribute('data-on-change')).toBe('sauvegarderPreferencesV2');
        expect(t).toContain('le choix s\'écrit dès que tu le changes');
        expect(pageHorsAide).toContain('+ Nouvelle grille');
        expect(lire('js', 'grilles.js')).toContain('geste: isCreation ? \'Créer la grille\'');
        // « Aucun » n'écarte un critère que si l'observation SOLO est cochée (#1117 suite).
        expect(lire('js', 'profil-etudiant-helpers.js')).toMatch(/if \(!etiquettesSOLOLuesParDepistage\(\)\) return true;\s*return critere\.niveauSOLO !== 'aucun';/);
        expect(lire('js', 'grilles.js')).toContain('Complexité SOLO du critère');
        expect(t).toContain('un critère dont la « Complexité SOLO du critère » est « Aucun » n\'est pas surveillé ; décochée, tous les critères le sont.');
    });

    it('pan : les six paramètres sont ceux que l\'Exploration affiche, dans l\'ordre ; les familles ne sont plus redites', () => {
        const attributs = tranche(lire('js', 'pratiques', 'construction-attributs.js'), 'var PARAMETRES = [', '];');
        const libelles = [...attributs.matchAll(/libelle: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, '\''));
        expect(libelles).toHaveLength(6);
        expect(lire('js', 'comparateur-pratiques.js')).toMatch(/ConstructionAttributs\.PARAMETRES/);
        expect([...entree('pan').querySelectorAll('ol > li')].map((li) => net(li.textContent))).toEqual(libelles);
        const t = texteDe('pan');
        expect(t).toContain('Navigation : Labo → Exploration des pratiques');
        expect(t).not.toMatch(/Quatre familles|Les trois dernières sont des PAN|PAN – Spécifications|PAN – Dénotation/);
    });

    it('bilan-reflexif : #1054 n\'est pas corrigée, l\'import et le rapport restent hors de l\'Aide ; les mots de l\'écran', () => {
        // Le jour où le module CSV déclare `genId` et `CLE_RESULTATS`, ce banc rougit : c'est le moment de rendre l'import et le
        // rapport à l'Aide (audit du 24 oct., verdict final : « retirer l'import des résultats jusqu'au correctif »).
        const csv = lire('js', 'bilan-reflexif-csv.js');
        expect(csv).toContain('genId()');
        expect(csv).not.toMatch(/var genId\b|function genId\b|genId\s*=/);
        expect(csv).toContain('CLE_RESULTATS()');
        expect(csv).not.toMatch(/var CLE_RESULTATS\b|function CLE_RESULTATS\b|CLE_RESULTATS\s*=/);
        const t = texteDe('bilan-reflexif');
        expect(t).not.toMatch(/Importer les résultats|Rapport d'analyse|CSV|glisser/);
        const nav = lire('js', 'bilan-reflexif.js');
        for (const [vue, onglet] of [['editeur', 'Questionnaire'], ['parcours', 'Parcours'], ['reflexion', 'Auto-r\\u00e9flexion']]) {
            expect(nav).toContain(`data-param="${vue}">${onglet}</button>`);
        }
        expect([...entree('bilan-reflexif').querySelectorAll('li > strong')].map((s) => net(s.textContent))).toEqual(['« Questionnaire »', '« Parcours »', '« Auto-réflexion »']);
        expect(lire('js', 'bilan-reflexif-editeur.js')).toContain('>Copier les questions</button>');
        expect(t).toContain('« Copier les questions »');
        expect(lire('js', 'bilan-reflexif-editeur.js')).toContain('ne collecte pas le nom ni le courriel');
        expect(t).toContain('L\'anonymat des réponses dépend de ce formulaire');
    });

    it('codex : la fenêtre d\'aperçu, l\'écriture à part avant une suppression, l\'archive d\'un trimestre clos', () => {
        const codex = lire('js', 'codex.js');
        expect(codex).toContain('const MOTS_APERCU_CODEX = { titre: \'Mettre à jour le codex\', texteConfirmer: \'Mettre à jour\' };');
        expect(lire('js', 'accompagnement-contenu-popup.js')).toMatch(/'modal-export-preview': \{\s*titre: "Ce que contient le fichier"/);
        const t = texteDe('codex');
        expect(t).toContain('ouvre d\'abord une fenêtre d\'aperçu du même nom, où tu confirmes par « Mettre à jour » ou annules ; son « i » mène à « Ce que contient le fichier »');
        expect(t).not.toMatch(/sans fenêtre/);
        // L'écriture à part : quatre gestes l'appellent, et aucun ne supprime sans elle.
        expect(codex).toContain('const MOTS_APERCU_CODEX_A_PART = { titre: \'Écrire le codex à part\'');
        const appelants = ['trimestre-v2-liste.js', 'trimestre-v2-groupes-cours.js', 'trimestre-v2-etudiants.js', 'import-export.js']
            .filter((f) => lire('js', f).includes('Codex.ecrireAPartAvantSuppression('));
        expect(appelants).toHaveLength(4);
        // ↻ #1152, lot 4 (29 oct. 2026) : le paragraphe « Avant une suppression » est remplacé par le trou 1 validé (consigne CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md, §1) ; « plutôt ».
        expect(t).toContain('Supprimer un trimestre, un groupe-cours ou des étudiant·es, ou tout réinitialiser, commence plutôt par « Écrire le codex à part »');
        // « Archiver… » : un groupe-cours ; le trimestre clos, par le ⋮ de sa rangée.
        expect(sourceHorsAide).toContain('Archive d\'un groupe-cours.');
        expect(lire('js', 'reserve-trimestre.js')).toContain('menu: \'Archiver le trimestre…\'');
        const liste = lire('js', 'trimestre-v2-liste.js');
        expect(liste).toMatch(/if \(estClos\) \{[\s\S]*?ReserveTrimestre\.MOTS\.menu/);
        expect(liste).toContain('repli: { titre: \'Clos\'');
        expect(t).toContain('« Archiver… » archive un groupe-cours');
        expect(t).toContain('repli « Clos (n) », ⋮ › « Archiver le trimestre… »');
        // Les quatre items qui n'existent qu'avec un codex ouvert.
        for (const id of ['codex-menu-details', 'codex-menu-fusionner', 'codex-menu-comparer', 'codex-menu-fermer']) {
            expect(doc.getElementById(id).classList.contains('u-hide'), id).toBe(true);
            expect(codex).toContain(`getElementById('${id}')`);
        }
    });

    it('export-import : entre trimestres, la bibliothèque ; l\'encadré Loi 25 est toujours là', () => {
        const t = texteDe('export-import');
        expect(t).toContain('« Garder dans ma bibliothèque → »');
        expect(t).toContain('« ← Utiliser dans ce trimestre »');
        expect(t).toContain('« Importer depuis un autre trimestre »');
        expect(t).not.toMatch(/Exporter ma config|Snapshots|Captures de progression/);
        expect(t).toContain('Important — les données de tes étudiant·es et la Loi 25.');
    });

    it('partage et collaboration : cinq ressources, les deux entrées de l\'import, un seul maillon d\'attribution', () => {
        const exportFenetres = ['grilles.js', 'echelles.js', 'cartouches.js', 'productions-bibliotheque-ui.js', 'pratiques-gestion.js']
            .filter((f) => lire('js', f).includes('{ label: \'Exporter pour partager\''));
        const importFenetres = ['grilles.js', 'echelles.js', 'cartouches.js', 'productions-bibliotheque-ui.js', 'pratiques-gestion.js']
            .filter((f) => lire('js', f).includes('{ label: \'Importer le partage d\\\'une ou d\\\'un collègue\''));
        expect(exportFenetres).toHaveLength(5);
        expect(importFenetres).toHaveLength(5);
        expect(doc.getElementById('partage-zone-depot')).not.toBeNull();
        const c = texteDe('collaboration');
        expect(c).toContain('dans chacune des cinq fenêtres, ou la carte « Partage entre collègues » de Réglages › Données');
        expect(texteDe('partage')).toContain('Cinq ressources se partagent entre collègues : grilles, échelles, cartouches, productions et pratiques de notation.');
        // L'attribution : un seul maillon (partage-format.js) ; « Exporter pour partager » ne demande aucun nom.
        expect(lire('js', 'partage-format.js')).toContain('Chaîne d\'attribution minimale v1 : un seul maillon');
        expect(lire('js', 'partage-export.js')).toContain(', attribué à : \' + (identite ||');
        expect(c).toContain('Le fichier crédite une seule personne');
        expect(c).toContain('Aucun nom ne t\'est demandé');
        expect(c).not.toMatch(/entre ton nom|trois personnes|contributeurs/i);
        // L'import .txt : sans casse, accents ni ponctuation, puis par inclusion.
        const cart = lire('js', 'cartouches.js');
        expect(cart).toMatch(/return nom\.toUpperCase\(\)\s*\.normalize\('NFD'\)\.replace\(\/\[\\u0300-\\u036f\]\/g, ''\)[^\n]*\n\s*\.replace\(\/\[\^A-Z0-9\]\/g, ''\);/);
        expect(cart).toMatch(/normaliserNom\(c\.nom\)\.includes\(rechercheNorm\)/);
        expect(c).toContain('sans tenir compte de la casse, des accents ni de la ponctuation, puis par inclusion');
        // Gardé (sentinelle du 15 oct.).
        expect(c).toContain('Ressources partageables (.lcz signé)');
    });

    it('glossaire : titre sans nombre, phrase sans la liste des étapes', () => {
        expect(titreDe('glossaire')).toBe('Glossaire du parcours');
        expect(texteDe('glossaire')).not.toMatch(/\d|Numérisation|Croisement/);
    });

    it('les mots de Grégoire (28 oct. 2026, 13 h 14, « on garde ») : le titre du glossaire, les deux phrases de `pan`', () => {
        expect(titreDe('glossaire')).toBe('Glossaire du parcours');
        const t = texteDe('pan');
        expect(t).toContain('Une pratique alternative de notation laisse le droit à l\'erreur sans pénalité sur la note finale, par des occasions multiples de démontrer sa compétence, et compose cette note à partir des traces les plus récentes ou les plus représentatives.');
        expect(t).toContain('Deux pratiques de la même famille peuvent y répondre différemment : c\'est là que se lit une pratique, plus que dans son étiquette.');
        for (const id of ['pan', 'glossaire']) {
            const avant = html.slice(0, html.indexOf(`id="accordeon-aide-${id}"`));
            expect(avant.slice(avant.lastIndexOf('<!--')), id).toContain('validé par Grégoire le 28 oct. 2026 à 13 h 14');
        }
    });

    it('faq : les questions qui doublaient une carte voisine sont parties ; l\'abandon et la pondération disent l\'écran', () => {
        const questions = [...entree('faq').querySelectorAll('summary')].map((s) => net(s.textContent));
        expect(questions).toEqual([
            'Mes données s\'enregistrent-elles toutes seules ?',
            'Puis-je utiliser l\'application sur plusieurs appareils ?',
            'Comment gérer un·e étudiant·e qui abandonne en cours de trimestre ?',
            'Que faire si la pondération totale n\'est pas 100 % ?',
            'Puis-je modifier les seuils des indices A et C ?',
        ]);
        // Retouche du 28 oct. (verdict de Cowork) : pas d'indice M ; « M » est le nom interne du filtre « A ou C ».
        expect(texteDe('faq')).not.toMatch(/indices? (A, C, M|A\/C\/M)/);
        const etudiants = lire('js', 'trimestre-v2-etudiants.js');
        expect(etudiants).toContain('<th>Remarque</th>');
        expect(etudiants).toMatch(/<option value="">[^<]*Aucune<\/option>|>Aucune<\/option>/);
        expect(etudiants).toContain('>Inactivité</option>');
        expect(etudiants).toContain('>Décrochage</option>');
        const t = texteDe('faq');
        expect(t).toContain('choisis « Inactivité » ou « Décrochage » dans la colonne « Remarque » de sa rangée');
        expect(t).not.toMatch(/«Actif»|«Abandon»|exactement 100 %|présence physique et cognitive/);
        const productions = lire('js', 'productions.js');
        expect(productions).toMatch(/\.filter\(p => p && p\.type !== 'artefact-portfolio'\)/);
        expect(productions).toMatch(/en trop`/);
        expect(productions).toMatch(/manquant`/);
        expect(t).toContain('affiche le total et dit ce qui manque ou ce qui est en trop, sans bloquer');
    });

    it('problemes : le calendrier se construit à partir des trois dates obligatoires, à chaque changement', () => {
        const init = lire('js', 'trimestre-v2-init.js');
        const sauver = tranche(init, 'function sauvegarderCadreCalendrierV2(', '\n}');
        expect(sauver).toMatch(/if \(cadre\.dateDebut && cadre\.finCours && cadre\.finTrimestre\) \{\s*if \(typeof genererCalendrierComplet === 'function'\) \{\s*genererCalendrierComplet\(\);/);
        const libelles = ['v2-debutTrimestre', 'v2-finCours', 'v2-finTrimestre'].map((id) => {
            const champ = doc.getElementById(id);
            expect(champ.hasAttribute('required'), id).toBe(true);
            expect(champ.getAttribute('data-on-change'), id).toBe('sauvegarderCadreCalendrierV2');
            return net(champ.closest('.groupe-form').querySelector('label').textContent).replace(/\s*\*\s*:$/, '');
        });
        expect(libelles).toEqual(['Début du trimestre', 'Fin des cours réguliers', 'Fin du trimestre']);
        const t = texteDe('problemes');
        expect(t).toContain(`« ${libelles[0]} », « ${libelles[1]} » et « ${libelles[2]} »`);
        expect(t).not.toMatch(/Bug connu|Régénérer/);
        expect(lire('js', 'saisie-presences.js')).toContain('« Confirmer la séance » : tout le monde est là');
        expect(t).toContain('« Confirmer la séance » si tout le monde était là');
    });

    it('ressources : la bibliographie seule, entière ; ses liens s\'ouvrent sans donner accès à la page', () => {
        const t = texteDe('ressources');
        expect(t).not.toMatch(/Double licence|AGPL|LICENSE|Approche systémique|codexnumeris\.org\/apropos/);
        expect(entree('ressources').querySelectorAll('.text-09-lh16-pl20-indent > p')).toHaveLength(14);
        const liens = [...entree('ressources').querySelectorAll('a[target="_blank"]')];
        expect(liens.length).toBe(4);
        expect(liens.filter((a) => a.getAttribute('rel') !== 'noopener noreferrer')).toEqual([]);
        // Le renvoi aux licences suit la carte.
        expect(net(doc.getElementById('aide-renvoi-a-propos').textContent)).toContain('Réglages › À propos');
    });
});
