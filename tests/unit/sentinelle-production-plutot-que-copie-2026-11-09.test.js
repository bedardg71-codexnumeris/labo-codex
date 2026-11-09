/**
 * SENTINELLE — 9 nov. 2026 · « COPIE » NE DÉSIGNE PLUS CE QUE L'ÉTUDIANT·E REMET
 *
 * Lot « Production plutôt que copie, dans l'interface », étape 2. Décisions de Grégoire
 * (9 nov. 2026, 10 h 14 à 10 h 17, en Cowork), sur le relevé de la nuit
 * (`plans de travail/RAPPORT-2026-11-09-production-plutot-que-copie.md`) :
 *   (a) ce que l'étudiant·e remet devient « production » ; EV (la note, le niveau, le verrou)
 *       devient « évaluation » ; FI (le fichier déposé) devient « fichier » ;
 *   (b) une sauvegarde ou un double, et (c) autre chose (le verbe « copier », le presse-papier),
 *       ne changent pas.
 *
 * ▣ CE QUE CETTE SENTINELLE TIENT. Le même relevé que la nuit, refait à chaque passage : toutes
 * les chaînes et gabarits de `js/` (tokeniseur acorn : les commentaires n'y sont pas ; ni
 * `js/_archives`, ni `js/changelog-data.js`, les Nouvelles publiées restant telles quelles) et
 * les textes et attributs lus d'`index.html` (parse5 : sans scripts, styles ni commentaires).
 * Chaque « copie » ou « copies » qui y reste est rangé ci-dessous : b, c, ou n (jamais affiché :
 * identifiant, classe, message de console, commentaire dans un gabarit). Une occurrence NEUVE
 * fait rougir le premier essai : range-la (b, c, n) ou écris « production ». Une entrée de la
 * liste qui n'existe plus fait rougir le second : retire-la.
 *
 * Une entrée = « fichier ¦ 30 caractères avant, le mot, 30 après » (espaces réduits) : la
 * liste survit aux numéros de ligne qui bougent.
 *
 * BREAK-TESTS (9 nov. 2026) : remettre « Réunir en une copie » (travaux-ui.js), « Note de la
 * copie : » (synthese-retroaction-rendu.js) ou « Importer des copies » (accueil.js) → le premier
 * essai rougit en nommant l'occurrence.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { parse } from 'parse5';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MOT = /\bcopies?\b/gi;

function releve() {
    const out = [];
    const ctx = (v, i, n) => v.slice(Math.max(0, i - 30), i + n + 30).replace(/\s+/g, ' ').trim();
    const ajouter = (f, v) => { for (const m of String(v).matchAll(MOT)) out.push(f + ' ¦ ' + ctx(String(v), m.index, m[0].length)); };
    const fichiersJs = (d) => {
        let r = [];
        for (const n of readdirSync(d)) {
            const p = path.join(d, n);
            if (statSync(p).isDirectory()) { if (n !== '_archives') r = r.concat(fichiersJs(p)); }
            else if (n.endsWith('.js') && n !== 'changelog-data.js') r.push(p);
        }
        return r;
    };
    for (const f of fichiersJs(path.join(racine, 'js')).sort()) {
        const src = readFileSync(f, 'utf8');
        for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true })) {
            if (t.type.label === 'string' || t.type.label === 'template') ajouter(path.relative(racine, f).split(path.sep).join('/'), t.value);
        }
    }
    const ATTR = new Set(['title', 'placeholder', 'aria-label', 'alt', 'value', 'label', 'data-confirm']);
    (function marcher(n) {
        if (n.nodeName === 'script' || n.nodeName === 'style' || n.nodeName === '#comment') return;
        if (n.nodeName === '#text') ajouter('index.html', n.value);
        for (const a of (n.attrs || [])) if (ATTR.has(a.name)) ajouter('index.html', a.value);
        for (const c of (n.childNodes || [])) marcher(c);
        if (n.content) marcher(n.content);
    })(parse(readFileSync(path.join(racine, 'index.html'), 'utf8')));
    return out;
}

// b : une sauvegarde ou un double (à garder) · c : autre chose, le verbe « copier », le presse-papier
// (à garder) · n : jamais affiché (identifiant, classe CSS, message de console, commentaire d'un gabarit,
// description interne d'un champ).
const RESTENT = [
    ["c", "js/accompagnement-contenu-hover.js ¦ ifie le texte au besoin, puis copie dans le presse-papier."],
    ["b", "js/accompagnement-contenu-hover.js ¦ ion. Pratique pour garder une copie d'une évaluation complète."],
    ["c", "js/accompagnement-contenu-hover.js ¦ Copie toutes les grilles de ce trim"],
    ["c", "js/accompagnement-contenu-hover.js ¦ Copie toutes les échelles de ce tri"],
    ["c", "js/accompagnement-contenu-hover.js ¦ Copie toutes les cartouches de ce t"],
    ["c", "js/accompagnement-contenu-hover.js ¦ Copie toutes les productions de ce"],
    ["c", "js/accompagnement-contenu-hover.js ¦ Copie toutes les pratiques de ce tr"],
    ["c", "js/accompagnement-contenu-hover.js ¦ che les sections à inclure et copie dans le presse-papier."],
    ["b", "js/accompagnement-contenu-hover.js ¦ Crée une copie INDÉPENDANTE de ce bloc : la"],
    ["c", "js/accompagnement-contenu-hover.js ¦ une séquence ou une leçon se copie toujours à l'indépendant."],
    ["b", "js/accompagnement-contenu-hover.js ¦ Crée une copie du groupe-cours dans tes arch"],
    ["n", "js/accompagnement-contenu-hover.js ¦ reserve-ouvrir-toggle-copie"],
    ["b", "js/accompagnement-contenu-hover.js ¦ identifiant et le suffixe « — copie »."],
    ["c", "js/accompagnement-contenu-popup.js ¦ Copie ta grille depuis son fichier"],
    ["c", "js/accompagnement-contenu-popup.js ¦ rder dans ma bibliothèque → » copie un élément de ce trimestre da"],
    ["c", "js/accompagnement-contenu-popup.js ¦ Utiliser dans ce trimestre » copie un élément de ta bibliothèque"],
    ["c", "js/accompagnement-contenu-popup.js ¦ rder dans ma bibliothèque → » copie un tampon de ta palette dans"],
    ["b", "js/accompagnement-contenu-popup.js ¦ Une <strong>copie</strong> et un <strong>clone<"],
    ["b", "js/accompagnement-contenu-popup.js ¦ e sont pas la même chose. Une copie est indépendante : la modifie"],
    ["b", "js/accompagnement-contenu-popup.js ¦ es : <strong>sans ⇧ c’est une copie, avec ⇧ c’est un clone</stron"],
    ["b", "js/accompagnement-contenu-popup.js ¦ n, ma pratique) et renomme la copie. Elle reste dans la démo : un"],
    ["b", "js/accompagnement-contenu-popup.js ¦ version du pack l'efface. Une copie de grille peut te suivre : qu"],
    ["b", "js/accompagnement-contenu-popup.js ¦ er pour créer ma grille ». Ta copie porte la ligne « Inspiré de G"],
    ["b", "js/accompagnement-contenu-popup.js ¦ e-le d'abord, puis choisis ta copie."],
    ["b", "js/accompagnement-contenu-popup.js ¦ Archiver, c'est déposer une copie d'un groupe-cours terminé dan"],
    ["b", "js/accompagnement-contenu-popup.js ¦ e travail — c'est une <strong>copie</strong>, pas un déplacement."],
    ["n", "js/accompagnement-contenu-popup.js ¦ . Réimporter, c'est faire une copie."],
    ["n", "js/accompagnement-contenu-popup.js ¦ reserve-copie-double"],
    ["n", "js/accompagnement-contenu-popup.js ¦ reserve-copie-double"],
    ["n", "js/accompagnement-contenu-popup.js ¦ reserve-copie-double"],
    ["b", "js/accompagnement-contenu-popup.js ¦ identifiant et le suffixe « — copie » dans le nom. Tu auras alors"],
    ["b", "js/accompagnement-contenu-popup.js ¦ tomatiquement sur la nouvelle copie de la grille — pas sur la gri"],
    ["b", "js/accompagnement-contenu-popup.js ¦ aut. L’archive, elle, est une copie de sécurité figée."],
    ["b", "js/accompagnement-contenu-popup.js ¦ /strong> Une maquette est une copie d'essai d'une de tes pratique"],
    ["b", "js/accompagnement-contenu-popup.js ¦ Importer crée une copie. Le modèle d'origine reste in"],
    ["b", "js/accompagnement-contenu-popup.js ¦ dans son trimestre ; c'est la copie, dans ton trimestre actif, qu"],
    ["b", "js/accompagnement-contenu-popup.js ¦ <strong>Ce qui change sur la copie.</strong> Une pratique copiée"],
    ["b", "js/accompagnement-contenu-popup.js ¦ e retirer. La carte de chaque copie dit de quel modèle elle vient"],
    ["b", "js/accompagnement-contenu-terme.js ¦ s'ouvre rempli, et « Créer la copie » l'enregistre."],
    ["b", "js/accompagnement-contenu-terme.js ¦ e : l’application en crée une copie dans ton trimestre actif, et"],
    ["b", "js/accompagnement-contenu-terme.js ¦ Une copie d’essai d’une de tes pratique"],
    ["c", "js/atelier-algo.js ¦ Reprendre une collection copie ses paliers et sa limite dans"],
    ["n", "js/atelier-algo.js ¦ <div class=\"apercu-algo-copie apercu-algo-detail\">"],
    ["n", "js/atelier-algo.js ¦ <span class=\"apercu-algo-copie-titre\">"],
    ["n", "js/atelier-algo.js ¦ [data-calcul-copie-texte]"],
    ["n", "js/bibliotheque-ui.js ¦ .bandeau-demo-copie"],
    ["n", "js/bibliotheque-ui.js ¦ .bandeau-demo-copie"],
    ["n", "js/bibliotheque-ui.js ¦ bandeau-demo-copie"],
    ["b", "js/bibliotheque-ui.js ¦ au-demo-readonly-texte\">Cette copie reste dans la démo. Quand ell"],
    ["n", "js/bibliotheque-ui.js ¦ copie"],
    ["n", "js/bibliotheque-ui.js ¦ Copies"],
    ["n", "js/bibliotheque-ui.js ¦ biblio-doublon-groupe--copie"],
    ["c", "js/bilan-reflexif-editeur.js ¦ <li><strong>Copie les questions</strong> — Cliq"],
    ["c", "js/bilan-reflexif-parcours.js ¦ <li><strong>Copie le formulaire</strong> — Cliq"],
    ["b", "js/cartouches.js ¦ Changer de grille crée une copie de cette cartouche pour la gr"],
    ["b", "js/cartouches.js ¦ tères communs passent dans la copie. Continuer ?"],
    ["b", "js/cartouches.js ¦ Copie impossible : dans la grille c"],
    ["b", "js/cartouches.js ¦ Créer une copie"],
    ["n", "js/codex.js ¦ avertissement des copies manquantes"],
    ["n", "js/codex.js ¦ [Codex] Marquage des copies manquantes non écrit pour"],
    ["b", "js/codex.js ¦ s changé : garde-le, c'est ta copie hors de"],
    ["n", "js/codex.js ¦ avertissement des copies manquantes refusé par l'usage"],
    ["n", "js/codex.js ¦ avertissement des copies manquantes refusé par l'usage"],
    ["b", "js/codex.js ¦ egistre efface pour de bon sa copie et ses résultats ultérieurs."],
    ["c", "js/codex.js ¦ Copie automatique refusée"],
    ["n", "js/composeur-calcul.js ¦ <p class=\"calc-copie\"><span class=\"calc-legende\">"],
    ["n", "js/composeur-calcul.js ¦ </span><span data-composeur-copie></span></p>"],
    ["n", "js/composeur-calcul.js ¦ [data-composeur-copie]"],
    ["n", "js/comptes-erreurs-stock.js ¦ (s) réparé(s). Les PDF de ces copies sont à refaire."],
    ["n", "js/contexte-qualification.js ¦ aucune-copie"],
    ["n", "js/correction-da.js ¦ copies"],
    ["n", "js/correction-da.js ¦ copies"],
    ["n", "js/db.js ¦ fichiers copies. L'ancienne base est PRESERVE"],
    ["n", "js/demo-activation.js ¦ .bandeau-demo-copie"],
    ["n", "js/demo-activation.js ¦ bandeau-demo-retirer-copies"],
    ["b", "js/donnees-v2.js ¦ it de la Bibliothèque. Aucune copie n'a été trouvée dans une gril"],
    ["n", "js/echelles-bibliotheque.js ¦ · copies dans les trimestres :"],
    ["n", "js/echelles-bibliotheque.js ¦ inaires] désignent une de ces copies — évaluations :"],
    ["b", "js/echelles.js ¦ Créer une copie"],
    ["n", "js/evaluation-calcul.js ¦ : le panneau porte encore la copie de"],
    ["n", "js/evaluation-retroaction.js ¦ Erreur de copie:"],
    ["c", "js/evaluation-retroaction.js ¦ Erreur lors de la copie. Utilise Cmd+A puis Cmd+C man"],
    ["n", "js/evaluation-retroaction.js ¦ Erreur de copie:"],
    ["c", "js/evaluation-retroaction.js ¦ Erreur lors de la copie."],
    ["n", "js/evaluation-sauvegarde.js ¦ copie-non-recevable"],
    ["n", "js/evaluation.js ¦ [Évaluer sans copie]"],
    ["n", "js/evaluation.js ¦ eval-navigation-sans-copie"],
    ["n", "js/evaluation.js ¦ Erreur lors de la copie TSV:"],
    ["b", "js/grilles.js ¦ Créer une copie"],
    ["n", "js/grilles.js ¦ <p class=\"calc-copie\" data-calcul-copie><span clas"],
    ["n", "js/grilles.js ¦ lass=\"calc-copie\" data-calcul-copie><span class=\"calc-legende\">Su"],
    ["n", "js/grilles.js ¦ ve : </span><span data-calcul-copie-texte></span></p>"],
    ["b", "js/guidage-demo.js ¦ éer ma grille » t'en fait une copie."],
    ["b", "js/guidage-demo.js ¦ r mon échelle » t'en fait une copie."],
    ["n", "js/identite-item.js ¦ copie"],
    ["n", "js/identite-item.js ¦ (copie)"],
    ["n", "js/identite-item.js ¦ (copie"],
    ["n", "js/import-export.js ¦ ransporter ferait répondre la copie à l'identifiant de la source"],
    ["n", "js/import-export.js ¦ copies"],
    ["n", "js/main.js ¦ copie(s)"],
    ["c", "js/materiel.js ¦ ible dans ce que tu as collé. Copie le tableau de ta grille dans"],
    ["b", "js/modal-backup-reminder.js ¦ garde une copie complète, productions de tes"],
    ["b", "js/objectifs.js ¦ ;\" title=\"Créer une copie de cet ensemble\">"],
    ["b", "js/objectifs.js ¦ - Copie"],
    ["b", "js/objectifs.js ¦ u peux maintenant modifier la copie."],
    ["b", "js/partage-import.js ¦ Confirmer remplacera la copie existante par cette version."],
    ["b", "js/partage-import.js ¦ Seule la copie importée est retirée — tes pr"],
    ["b", "js/partage-import.js ¦ Retirer cette copie importée (tes documents ne so"],
    ["n", "js/partage-schemas.js ¦ ransporter ferait répondre la copie à l'identifiant de la source"],
    ["n", "js/partage-schemas.js ¦ copie à la racine de metadata_cc.in"],
    ["b", "js/partage-section.js ¦ Seule la copie importée est retirée : tes pr"],
    ["b", "js/partage-section.js ¦ s ici. « Dupliquer » crée une copie"],
    ["b", "js/partage-section.js ¦ à un collègue ou supprime la copie importée ;"],
    ["b", "js/partage-section.js ¦ Créer une copie modifiable dans tes documents"],
    ["b", "js/partage-section.js ¦ Supprimer cette copie importée (tes documents ne so"],
    ["b", "js/planification-bibliotheque.js ¦ Créer une copie dans ce trimestre"],
    ["b", "js/planification-carte.js ¦ né à une session précédente — copie indépendante, la source reste"],
    ["b", "js/planification-carte.js ¦ Copie indépendante créée — une leço"],
    ["b", "js/planification-carte.js ¦ Copie indépendante créée — modifie-"],
    ["b", "js/planification-carte.js ¦ Copie indépendante créée — modifie-"],
    ["b", "js/planification-carte.js ¦ copies créées — elles sont sélection"],
    ["b", "js/planification-carte.js ¦ Nom de la copie :"],
    ["n", "js/planification-carte.js ¦ (copie)"],
    ["n", "js/planification-carte.js ¦ (copie)"],
    ["b", "js/planification-carte.js ¦ Carte reprise — copie indépendante, celle du trimes"],
    ["b", "js/planification-carte.js ¦ Dupliquer la sélection (copie indépendante)"],
    ["b", "js/planification-carte.js ¦ Dupliquer en déplaçant (copie indépendante)"],
    ["n", "js/planification-donnees.js ¦ [Planification] Copie des notes de séance échouée :"],
    ["n", "js/planification-export.js ¦ (copie)"],
    ["b", "js/pratiques-gestion.js ¦ Créer une copie"],
    ["b", "js/pratiques.js ¦ Copie de pratique"],
    ["b", "js/pratiques.js ¦ Nom de la copie:"],
    ["b", "js/productions-bibliotheque-ui.js ¦ Créer une copie"],
    ["n", "js/profil-etudiant-calculs.js ¦ aucune-copie-evaluee"],
    ["n", "js/profil-etudiant-calculs.js ¦ aucune-copie"],
    ["c", "js/profil-etudiant-rapport.js ¦ lle part : si tu le modifies, copie-le avant de quitter l'écran."],
    ["c", "js/profil-etudiant-rapport.js ¦ au bas du rapport quand tu le copies."],
    ["c", "js/profil-etudiant-rapport.js ¦ La copie a échoué. Sélectionne le text"],
    ["c", "js/profil-etudiant-rapport.js ¦ La copie a échoué. Sélectionne le text"],
    ["n", "js/profil-etudiant-rapport.js ¦ Erreur copie:"],
    ["c", "js/profil-etudiant-rapport.js ¦ La copie a échoué. Sélectionne le text"],
    ["n", "js/rapport-bug.js ¦ copie"],
    ["c", "js/rapport-bug.js ¦ Erreur lors de la copie. Sélectionne manuellement le"],
    ["b", "js/registre-longitudinal.js ¦ 'un trimestre à l'autre : une copie figée de leur dossier, et les"],
    ["b", "js/registre-longitudinal.js ¦ Refaire la copie"],
    ["b", "js/registre-longitudinal.js ¦ Refaire la copie du dossier de"],
    ["b", "js/registre-longitudinal.js ¦ La copie du"],
    ["b", "js/registre-longitudinal.js ¦ La copie précédente"],
    ["b", "js/registre-longitudinal.js ¦ Copie du"],
    ["b", "js/registre-longitudinal.js ¦ non calculé au moment de la copie"],
    ["b", "js/registre-longitudinal.js ¦ Indices au moment de la copie"],
    ["b", "js/registre-longitudinal.js ¦ le à calculer au moment de la copie"],
    ["b", "js/registre-longitudinal.js ¦ Aucune évaluation dans cette copie."],
    ["b", "js/registre-longitudinal.js ¦ Sa copie"],
    ["n", "js/reserve-copies.js ¦ [Archives] Archivage des copies interrompu :"],
    ["n", "js/reserve-copies.js ¦ [Archives] Archivage des copies impossible :"],
    ["n", "js/reserve-copies.js ¦ [Archives] Archivage des copies (dossier) échoué :"],
    ["n", "js/reserve-emprunter.js ¦ copies"],
    ["n", "js/reserve-emprunter.js ¦ [Archives] Copie non retirée :"],
    ["n", "js/reserve-emprunter.js ¦ copies"],
    ["n", "js/reserve-emprunter.js ¦ copies"],
    ["n", "js/reserve-ouvrir.js ¦ reserve-ouvrir-toggle-copie"],
    ["b", "js/reserve-ouvrir.js ¦ — copie"],
    ["n", "js/reserve-ouvrir.js ¦ reserve-ouvrir-toggle-copie"],
    ["b", "js/reserve-ouvrir.js ¦ copie(s) en double"],
    ["b", "js/reserve-ouvrir.js ¦ ence(s) rebranchée(s) sur les copies"],
    ["n", "js/reserve-renvoyer.js ¦ [Archives] Marque des copies non levée :"],
    ["n", "js/reserve-revenir.js ¦ [Archives] Copie non écrite :"],
    ["n", "js/reserve-revenir.js ¦ [Archives] Retour des copies échoué :"],
    ["n", "js/reserve-revenir.js ¦ [Archives] Retour des copies (dossier) échoué :"],
    ["b", "js/reserve-trimestre.js ¦ Déposer une copie complète de ce trimestre hors"],
    ["n", "js/reserve.js ¦ copies"],
    ["b", "js/reserve.js ¦ Copie mise de côté incomplète :"],
    ["n", "js/travaux-reference.js ¦ [Travaux-Reference] Copie illisible :"],
    ["n", "js/travaux-stockage.js ¦ : copie non exportée"],
    ["n", "js/travaux-ui.js ¦ 9 (4 nov. 2026) : une seconde copie, en lecture seule, à côté de"],
    ["n", "js/travaux-ui.js ¦ il prenait de la place sur la copie. -->"],
    ["n", "js/travaux-ui.js ¦ class=\"pipeline-confirmation-copies\">"],
    ["n", "js/travaux-ui.js ¦ [Réparation] Copie réparée, réouverture échouée"],
    ["b", "js/trimestre-v2-cours.js ¦ Créer la copie"],
    ["n", "js/trimestre-v2-cours.js ¦ (copie)"],
    ["n", "js/trimestres.js ¦ données) — résidu purgé sans copie."],
    ["n", "js/trimestres.js ¦ éjà des données) — purgé sans copie."],
    ["c", "js/wizard-pratique-v2.js ¦ Adopter un modèle copie sa configuration dans une nou"],
    ["b", "js/wizard-pratique-v2.js ¦ ourras renommer et ajuster ta copie ensuite."],
    ["c", "index.html ¦ Copie ton tableau"],
    ["c", "index.html ¦ mais bien le tableau –, puis copie-le. Le texte copié d’un PDF e"],
    ["b", "index.html ¦ Créer une copie de cette production"],
    ["b", "index.html ¦ Créer une copie de cette grille"],
    ["b", "index.html ¦ Créer une copie de cette échelle"],
    ["b", "index.html ¦ Créer une copie de cette cartouche"],
    ["c", "index.html ¦ rder dans ma bibliothèque → » copie un élément de ce trimestre da"],
    ["c", "index.html ¦ Utiliser dans ce trimestre » copie un élément de ta bibliothèque"],
    ["b", "index.html ¦ r ton propre calcul » sur une copie du calcul choisi ; l'original"],
    ["b", "index.html ¦ ouche enregistrée en fait une copie pour la nouvelle grille, aprè"],
    ["b", "index.html ¦ scrire au registre » fige une copie datée du dossier d'un·e étudi"],
    ["c", "index.html ¦ « Copier les questions » les copie pour le formulaire en ligne d"],
    ["c", "index.html ¦ stre », dans la même fenêtre, copie le matériel d'un trimestre pr"],
    ["b", "index.html ¦ trimestre », qui en fait une copie : au pied de « Dans ce trimes"],
    ["b", "index.html ¦ les et les productions, où la copie arrive."],
    ["b", "index.html ¦ ur une cartouche) en fait une copie que tu adaptes, et l'attribut"],
    ["b", "index.html ¦ « — copie »."],
];

function compter(liste) {
    const m = new Map();
    for (const e of liste) m.set(e, (m.get(e) || 0) + 1);
    return m;
}

describe('Production plutôt que copie — ce qui reste « copie » est rangé (b, c, n)', () => {
    const vu = compter(releve());
    const attendu = compter(RESTENT.map(([, e]) => e));

    it('aucune occurrence neuve : chaque « copie » qui reste est une sauvegarde, un double, le verbe, ou n\'est pas affiché', () => {
        const neuves = [];
        for (const [e, n] of vu) if (n > (attendu.get(e) || 0)) neuves.push(e);
        expect(neuves).toEqual([]);
    });

    it('la liste ne garde rien qui a disparu', () => {
        const parties = [];
        for (const [e, n] of attendu) if (n > (vu.get(e) || 0)) parties.push(e);
        expect(parties).toEqual([]);
    });

    it('chaque entrée porte b, c ou n', () => {
        for (const [t, e] of RESTENT) expect(['b', 'c', 'n'], e).toContain(t);
    });
});

describe('Production plutôt que copie — les libellés validés sont posés', () => {
    const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
    it('« Réunir en une production », « Production de référence », « Production fictive »', () => {
        expect(lire('js/travaux-ui.js')).toContain('Réunir en une production');
        expect(lire('js/travaux-ui.js')).toContain('Production de référence');
        expect(lire('js/travaux-reference.js')).toContain('Production de référence');
        expect(lire('js/atelier-algo.js')).toContain('Production fictive');
    });
    it('le rappel du codex : « productions de tes étudiant·es comprises »', () => {
        // Le gabarit coupe la phrase sur plusieurs lignes : lu aplati (même lecture que la sentinelle du 9 nov. au matin).
        expect(lire('js/modal-backup-reminder.js').replace(/\s+/g, ' ')).toContain('Ton codex en garde une copie complète, productions de tes étudiant·es comprises, que tu rouvres sur n\'importe quel appareil.');
    });
});
