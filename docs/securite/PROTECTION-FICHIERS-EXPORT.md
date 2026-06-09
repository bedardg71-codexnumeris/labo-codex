# Protection des fichiers d'export — Labo Codex

> **Document autonome** — première version : 6 mai 2026.
>
> **Question initiale (Grégoire)** : « Comment peut-on protéger un fichier texte contre toute modification ? Doit-il être "verrouillé" ? Si je l'ouvre dans TextEdit, que je tape n'importe quoi par mégarde et que je sauvegarde, le fichier sera-t-il encore fonctionnel ? »
>
> **Statut** : analyse technique + recommandations pratiques. Indépendant de `MODELE-MENACES.md` mais cohérent avec lui — les défenses proposées ici sont compatibles avec le plan du modèle de menaces.
>
> **Périmètre** : les fichiers d'export produits par Labo Codex (JSON de bibliothèques, ZIP de codex complets, futurs codex data partagés). N'aborde pas la protection en transit (courriel, transfert) qui dépend des outils tiers utilisés.

---

## Table des matières

1. [Que se passe-t-il vraiment si on modifie un fichier d'export ?](#1-que-se-passe-t-il-vraiment-si-on-modifie-un-fichier-dexport-)
2. [Le piège TextEdit (et autres éditeurs « gentils »)](#2-le-piège-textedit-et-autres-éditeurs-gentils)
3. [Niveaux de protection possibles](#3-niveaux-de-protection-possibles)
4. [Verrouillage au niveau du système d'exploitation](#4-verrouillage-au-niveau-du-système-dexploitation)
5. [Verrouillage au niveau du fichier — hash d'intégrité](#5-verrouillage-au-niveau-du-fichier--hash-dintégrité)
6. [Verrouillage au niveau de l'auteur — signature cryptographique](#6-verrouillage-au-niveau-de-lauteur--signature-cryptographique)
7. [Verrouillage par conteneur — ZIP signé avec manifeste](#7-verrouillage-par-conteneur--zip-signé-avec-manifeste)
8. [Recommandation pour Labo Codex](#8-recommandation-pour-labo-codex)
9. [Que faire avec un fichier déjà reçu ?](#9-que-faire-avec-un-fichier-déjà-reçu-)
10. [Recommandations aux utilisateurs](#10-recommandations-aux-utilisateurs)
11. [Limites et zones d'incertitude](#11-limites-et-zones-dincertitude)

---

## 1. Que se passe-t-il vraiment si on modifie un fichier d'export ?

Pour répondre directement à ta question : **dans la plupart des cas, modifier un export Labo Codex par mégarde le casse — mais pas toujours**. Le détail dépend de **où** tu tapes et de **quoi** tu tapes.

Un export Labo Codex est du JSON, c'est-à-dire un format structuré rigide. Voici un extrait simplifié d'un export de grilles :

```json
{
  "version": "1.0",
  "type": "grilles",
  "dateExport": "2026-09-12T14:23:00-04:00",
  "nombreGrilles": 1,
  "grilles": [
    {
      "id": "GRILLE1759243306842",
      "nom": "Dissertation littéraire",
      "discipline": "Littérature québécoise",
      "criteres": [
        {
          "id": "C1",
          "nom": "Cohérence argumentative",
          "description": "Évalue la solidité du raisonnement.",
          "ponderation": 30
        }
      ]
    }
  ]
}
```

### Cas 1 — Tu tapes au milieu d'une valeur texte

Tu transformes `"Dissertation littéraire"` en `"Dissertation lzittéraire"`. Le JSON reste **valide structurellement** (les guillemets, accolades, virgules sont intacts). Labo Codex va parser le fichier sans erreur et importer une grille avec un nom légèrement bizarre. C'est invisible au parsing, visible seulement à l'œil humain qui relit le nom.

**Résultat** : le fichier reste fonctionnel mais le contenu est corrompu.

### Cas 2 — Tu tapes au milieu d'une structure

Tu poses ton curseur entre deux clés et tapes la lettre `x`. Tu obtiens quelque chose comme `"id": "GRILLE1759243306842",x  "nom":...`. Le `x` traîne au milieu des accolades. À l'import, `JSON.parse()` échoue avec une erreur du type `Unexpected token 'x' at position 234`. Labo Codex affichera probablement un message d'erreur (selon ce que fait `previsualiserConfigComplete` dans `import-export.js`).

**Résultat** : le fichier est cassé. C'est paradoxalement la **protection accidentelle** du format JSON — toute modification de structure casse le parsing de manière visible.

### Cas 3 — Tu supprimes une accolade ou un guillemet

Idem cas 2 : le JSON ne parse plus. Erreur explicite à l'import.

**Résultat** : fichier cassé, détection certaine.

### Cas 4 — Tu tapes uniquement dans les espaces, sauts de ligne, ou en dehors des valeurs

Si tu ajoutes des espaces ou des sauts de ligne **entre** les éléments (à des endroits où JSON autorise du whitespace), le fichier reste valide. Si tu tapes à la fin du fichier après l'accolade fermante, certains parseurs tolèrent (avec un avertissement), d'autres pas.

**Résultat** : variable selon le parseur de Labo Codex. Probablement valide.

### Cas 5 — Tu sauvegardes le fichier dans TextEdit avec les options par défaut

C'est le cas le plus piégeux et celui qui motive ta question. Voir §2.

### Synthèse cas 1-4

| Type de modification | JSON parsable ? | Fichier fonctionnel ? | Détection ? |
|---|---|---|---|
| Modification dans une valeur texte | Oui | Oui (mais contenu corrompu) | **Aucune** au parsing |
| Modification dans la structure | Non | Non | Erreur explicite à l'import |
| Suppression d'accolade/guillemet | Non | Non | Erreur explicite |
| Modification dans les espaces | Oui | Oui | Aucune (sans effet) |

**Conclusion clé** : le JSON nu n'a aucun mécanisme **interne** pour détecter une modification accidentelle dans les valeurs textuelles. C'est la première raison pour laquelle un hash d'intégrité (§5) ou une signature (§6) sont nécessaires.

---

## 2. Le piège TextEdit (et autres éditeurs « gentils »)

C'est la partie la plus contre-intuitive de ta question. Tu pourrais croire qu'ouvrir un fichier `.json` dans TextEdit, ne rien taper, et sauvegarder est sans risque. **Ce n'est pas le cas avec les options par défaut.**

### Le problème des guillemets typographiques

TextEdit, par défaut sur macOS récents (Sequoia 15.5 compris), a des **substitutions intelligentes** activées. Quand tu tapes une apostrophe droite `'`, il la transforme automatiquement en apostrophe typographique `'`. Pareil pour les guillemets : `"` devient `"` ou `"`.

**Conséquence pour un JSON** : si tu ouvres `bibliotheque.json` dans TextEdit, que tu tapes un seul caractère (même par accident — pression de touche sans le vouloir) **dans un endroit qui contient des guillemets**, TextEdit peut convertir tous les guillemets droits voisins en guillemets typographiques. Un `"nom"` devient `"nom"`. Visuellement, c'est presque identique. Pour le parseur JSON, c'est invalide — le caractère `"` n'est pas un guillemet JSON.

À l'import : `JSON.parse()` échoue avec une erreur cryptique du type `Unexpected token '"' at position X`. L'utilisateur ne comprend pas pourquoi parce qu'il « n'a rien modifié ».

### Le problème des sauvegardes automatiques

TextEdit propose parfois de sauvegarder en format Rich Text (`.rtf`) si le contenu paraît être du texte mis en forme. Sur un fichier `.json` ce comportement ne devrait pas se déclencher, mais des cas marginaux existent.

### Le problème de l'encodage

TextEdit peut, dans certains cas, ré-encoder un fichier UTF-8 en MacRoman ou autre lors de la sauvegarde, si l'option « Utiliser le codage propre au Mac » est activée. Cela corrompt les caractères accentués (`é`, `à`, `ç`) dans les noms français de tes grilles.

### Désactiver les pièges TextEdit

Si tu dois éditer un JSON dans TextEdit (ce que je déconseille — voir §10), désactive d'abord :

- **TextEdit › Paramètres › Nouveau document**
  - « Substitutions intelligentes des guillemets » → décocher
  - « Substitutions intelligentes des tirets » → décocher
- **TextEdit › Paramètres › Ouvrir et enregistrer**
  - « Codage des fichiers texte simple » → toujours « Unicode (UTF-8) »
  - « Ouvrir les fichiers HTML en tant que code formaté plutôt qu'en HTML formaté » → vérifier l'option similaire pour JSON

### Autres éditeurs et leur comportement

| Éditeur | Smart quotes par défaut ? | Risque d'altération silencieuse |
|---|---|---|
| TextEdit | **Oui** | Élevé |
| Notes.app | **Oui** | Élevé (et conversion implicite en RTF) |
| Pages | **Oui** | Très élevé (format propriétaire) |
| Mail (composition) | **Oui** | Si tu colles le JSON dans un courriel et le rouvres |
| VS Code | Non | Aucun pour `.json` |
| BBEdit | Non | Aucun |
| Sublime Text | Non | Aucun |
| nano (Terminal) | Non | Aucun |
| vim (Terminal) | Non | Aucun |

**Règle** : pour inspecter un fichier d'export Labo Codex sans risquer de l'altérer, utiliser un éditeur de code (VS Code, BBEdit, Sublime Text), pas un traitement de texte ou un éditeur grand public.

---

## 3. Niveaux de protection possibles

Pour protéger un fichier d'export contre la modification, il existe quatre niveaux distincts, qui répondent à des menaces différentes. Chacun a sa pertinence ; on peut en combiner plusieurs.

| Niveau | Mécanisme | Protège contre | Faiblesse |
|---|---|---|---|
| 1 | Verrouillage OS (Finder, chflags) | Modification accidentelle locale (mégarde de l'auteur lui-même) | Local seulement, ne survit pas au transit. Le propriétaire peut déverrouiller. |
| 2 | Hash d'intégrité (SHA-256) | Détection de toute modification après création | Ne dit pas qui a modifié. Un attaquant peut modifier ET recalculer le hash. |
| 3 | Signature cryptographique (ECDSA) | Détection + authentification de l'auteur | Demande une infrastructure de clés publiques. |
| 4 | Conteneur ZIP avec manifeste signé | Combinaison des trois + fichier moins facilement éditable à la main | Plus complexe à produire et vérifier. |

Les sections §4 à §7 développent chacun de ces niveaux. La §8 propose une combinaison pour Labo Codex.

---

## 4. Verrouillage au niveau du système d'exploitation

C'est le niveau le plus simple et le plus immédiatement accessible. Il **n'empêche pas** la modification au sens cryptographique — il pose un garde-fou interactif contre la mégarde.

### 4.1 Via Finder (le plus simple)

1. Sélectionner le fichier dans Finder.
2. `Cmd+I` ou clic droit › « Lire les informations ».
3. Cocher la case **« Verrouillé »** dans la section Général.

Effet : si tu tentes d'ouvrir le fichier dans un éditeur et de sauvegarder, macOS affiche un dialogue « Le fichier est verrouillé. Voulez-vous le déverrouiller ? ». L'utilisateur a une chance d'annuler.

Pour déverrouiller : décocher la case dans le même panneau.

**Limites** :
- Anti-mégarde uniquement. Un utilisateur peut décocher et modifier.
- Local : le verrou est un attribut de fichier macOS (« uchg » dans la terminologie BSD), il ne voyage pas. Si tu envoies le fichier par courriel, le destinataire reçoit un fichier non verrouillé.
- Ne protège pas contre la modification automatique par un script ou par un éditeur qui ignore le flag (rare mais possible).

### 4.2 Via le Terminal (équivalent ligne de commande)

```bash
# Verrouiller
chflags uchg /chemin/vers/fichier.json

# Vérifier
ls -lO /chemin/vers/fichier.json
# La sortie contiendra "uchg" dans les flags

# Déverrouiller
chflags nouchg /chemin/vers/fichier.json
```

`uchg` signifie « user immutable » — verrou utilisateur. Il existe aussi `schg` (system immutable, requiert mode mono-utilisateur pour être retiré, trop fort pour ce cas d'usage).

### 4.3 Via les permissions Unix (alternative)

```bash
# Lecture seule pour tout le monde
chmod 444 /chemin/vers/fichier.json

# Remettre lecture-écriture pour le propriétaire
chmod 644 /chemin/vers/fichier.json
```

Différence avec `chflags` : les permissions Unix sont contournables par `sudo`. Le flag `uchg` est plus strict.

### 4.4 Pour quoi utiliser ce niveau ?

Pertinent si tu veux protéger **ta propre copie locale** d'un export que tu veux garder intact (une version « de référence » d'une grille publiée). Inutile pour les exports que tu envoies à d'autres — ils ne reçoivent pas le verrou.

Pour les utilisateurs en général : recommandation d'inclure cette pratique dans la documentation d'usage Labo Codex (« quand vous archivez un export important, verrouillez-le dans Finder »).

---

## 5. Verrouillage au niveau du fichier — hash d'intégrité

C'est la première vraie protection cryptographique. Le principe : à la création du fichier, on calcule une **empreinte numérique** unique de son contenu (un hash). Cette empreinte est publiée séparément. À la réception, on recalcule le hash et on compare. Si les deux empreintes diffèrent, le fichier a été modifié.

### 5.1 Comment ça fonctionne

Le hash SHA-256 transforme un contenu de taille arbitraire en une chaîne de 64 caractères hexadécimaux. Propriétés :

- **Déterministe** : le même contenu produit toujours le même hash.
- **Sensible** : changer un seul caractère du fichier change complètement le hash.
- **À sens unique** : on ne peut pas retrouver le contenu à partir du hash.
- **Résistant aux collisions** : pour un fichier donné, il est mathématiquement impossible (avec les calculateurs actuels et prévisibles) de fabriquer un autre fichier différent ayant le même hash.

Exemple : le hash SHA-256 du texte `"bonjour"` est `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`. Change un seul caractère, par exemple `"Bonjour"` (majuscule), et le hash devient complètement différent.

### 5.2 Mise en œuvre dans Labo Codex

**À l'export** (à coder dans `js/import-export.js`, `js/grilles-bibliotheque.js`) :

```javascript
async function calculerHashExport(contenuJson) {
    const encoder = new TextEncoder();
    const data = encoder.encode(contenuJson);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function exporterAvecHash(donnees) {
    // 1. Sérialiser les données sans le champ integrite
    const contenuSansHash = JSON.stringify(donnees);
    // 2. Calculer le hash
    const hash = await calculerHashExport(contenuSansHash);
    // 3. Ajouter le hash dans une structure conteneur
    return {
        format: 'labo-codex-export',
        contenu: donnees,
        integrite: {
            algorithme: 'SHA-256',
            hash: hash,
            date_calcul: new Date().toISOString()
        }
    };
}
```

**À l'import** :

```javascript
async function verifierIntegrite(exportRecu) {
    if (!exportRecu.integrite || !exportRecu.integrite.hash) {
        return { valide: false, raison: 'Pas de hash d\'intégrité dans le fichier' };
    }
    // Recalculer le hash sur le contenu, sans le champ integrite
    const contenuOriginal = JSON.stringify(exportRecu.contenu);
    const hashRecalcule = await calculerHashExport(contenuOriginal);
    if (hashRecalcule !== exportRecu.integrite.hash) {
        return { valide: false, raison: 'Le hash ne correspond pas — le fichier a été modifié après export' };
    }
    return { valide: true };
}
```

### 5.3 Limites du hash d'intégrité

**Limite fondamentale** : le hash est dans le fichier lui-même. Un attaquant qui modifie le fichier peut aussi **recalculer le hash** et le mettre à jour. La protection ne fonctionne que si :

- Soit le hash est transmis **par un canal séparé** (l'auteur publie le hash sur son site web, dans un courriel signé, dans un répertoire central) et le destinataire compare manuellement.
- Soit le hash est **signé cryptographiquement** par l'auteur, et le destinataire peut vérifier la signature avec la clé publique de l'auteur (c'est la signature ECDSA — §6).

**Sans canal séparé ni signature, le hash protège seulement contre la corruption involontaire** (disque qui se dégrade, transfert raté qui produit un fichier tronqué, modification accidentelle dans TextEdit qui change un guillemet). Il ne protège pas contre la modification volontaire par un attaquant compétent.

C'est quand même utile — la modification involontaire est **fréquente**, la signature est plus complexe à mettre en place. Le hash est un bon premier pas.

### 5.4 Effort de mise en œuvre

1 jour de code pour intégrer le hash à la chaîne export/import. Coût ergonomique faible (transparence pour l'utilisateur — l'app affiche « fichier vérifié » ou « avertissement, fichier modifié »).

---

## 6. Verrouillage au niveau de l'auteur — signature cryptographique

C'est le niveau au-dessus du hash. La signature combine **détection de modification** ET **authentification de l'auteur**.

### 6.1 Comment ça fonctionne

Le mécanisme s'appuie sur la cryptographie asymétrique :

- Chaque enseignant possède une **paire de clés** : une privée (qu'il garde secrète sur sa machine) et une publique (qu'il diffuse librement).
- À l'export, le fichier est signé avec la clé privée. La signature est une chaîne mathématique liée au contenu et à la clé.
- À l'import, n'importe qui peut vérifier la signature avec la clé publique de l'auteur prétendu. Si la signature est valide, deux choses sont prouvées :
  - Le contenu n'a pas été modifié depuis la signature.
  - Le contenu vient bien de la personne qui possède la clé privée correspondante.

### 6.2 Mise en œuvre dans Labo Codex

Web Crypto API native du navigateur permet ECDSA P-256 sans dépendance externe. Pseudo-code :

```javascript
// Génération de la paire de clés (une fois, à la création du compte)
const cles = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true, // extractable pour pouvoir exporter la clé publique
    ['sign', 'verify']
);

// Signature à l'export
async function signerExport(contenu, clePrivee) {
    const donnees = new TextEncoder().encode(JSON.stringify(contenu));
    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        clePrivee,
        donnees
    );
    return arrayBufferToBase64(signature);
}

// Vérification à l'import
async function verifierSignature(contenu, signatureBase64, clePubliqueAuteur) {
    const donnees = new TextEncoder().encode(JSON.stringify(contenu));
    const signatureBuffer = base64ToArrayBuffer(signatureBase64);
    return await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        clePubliqueAuteur,
        signatureBuffer,
        donnees
    );
}
```

Le fichier exporté contient :

```json
{
  "format": "labo-codex-export-signe",
  "contenu": { ... },
  "signature": {
    "algorithme": "ECDSA-P-256-SHA256",
    "valeur": "base64...",
    "auteur": "Grégoire Bédard",
    "cle_publique_id": "fingerprint-cle-publique-..."
  }
}
```

### 6.3 La question de la clé publique

La signature ne sert à rien si tu n'as pas la clé publique de l'auteur prétendu pour vérifier. Trois modèles possibles :

**(a) Annuaire centralisé Voûte.** Chaque enseignant inscrit publie sa clé publique dans la Voûte. À l'import, l'app interroge l'annuaire pour récupérer la clé. Problème : nécessite que la Voûte soit en ligne et fiable.

**(b) Clé publique incluse dans le fichier (modèle TOFU).** « Trust On First Use ». La première fois que tu reçois un fichier de Marie-Hélène, tu acceptes sa clé publique. Si elle change plus tard, alerte. C'est le modèle SSH. Simple mais ne protège pas contre l'usurpation lors du premier contact.

**(c) Web of trust (modèle PGP).** Les enseignants signent mutuellement leurs clés publiques. Tu fais confiance à une clé inconnue si elle a été contre-signée par une clé que tu connais déjà. Robuste mais complexe à utiliser.

**Recommandation pragmatique pour Labo Codex** : commencer par (b) TOFU. Évoluer vers (a) quand la Voûte sera en service.

### 6.4 Limites de la signature

- **Auteur authentique malveillant** : si Marie-Hélène elle-même signe une grille empoisonnée, la signature dit « c'est bien Marie-Hélène », pas « c'est sain ». La signature ne remplace pas l'audit du contenu.
- **Vol de la clé privée** : si la clé privée de Marie-Hélène est volée (Mac compromis), l'attaquant peut signer en son nom. Mitigation : la clé privée peut être protégée par un mot de passe local (Web Crypto le permet via `wrapKey`).
- **Révocation** : si Marie-Hélène perd sa clé, elle doit pouvoir la révoquer. Nécessite un mécanisme de listes de révocation (CRL ou OCSP, ou simplement une « kill list » dans l'annuaire).

### 6.5 Effort de mise en œuvre

2-3 semaines de code pour le cœur (génération, signature, vérification, stockage local des clés). Plus 1 semaine pour l'UI (gestion des clés, dialogue de confiance, alertes). Plus l'effort organisationnel pour l'annuaire si on choisit le modèle (a).

---

## 7. Verrouillage par conteneur — ZIP signé avec manifeste

C'est l'approche que je recommande pour Labo Codex. Plutôt qu'un simple JSON, le format d'export devient un ZIP qui contient le JSON **et** un manifeste de sécurité.

### 7.1 Structure proposée

Un fichier `bibliotheque-grilles.lcz` (extension propriétaire pour le distinguer, mais c'est un ZIP standard) contiendrait :

```
bibliotheque-grilles.lcz/
├── donnees.json          (le contenu réel)
├── manifeste.json        (métadonnées d'intégrité et signature)
└── README.txt            (lisibilité humaine — explique le format)
```

Le `manifeste.json` contient :

```json
{
  "format": "labo-codex-conteneur",
  "version_format": "1.0",
  "date_export": "2026-09-12T14:23:00-04:00",
  "auteur_declare": "Grégoire Bédard",
  "integrite": {
    "donnees_json_sha256": "a1b2c3...",
    "algorithme": "SHA-256",
    "taille_octets": 12453
  },
  "signature": {
    "algorithme": "ECDSA-P-256-SHA256",
    "valeur": "base64...",
    "cle_publique_id": "fingerprint-..."
  }
}
```

Le `README.txt` est un fichier texte lisible expliquant ce qu'est le conteneur, comment vérifier l'intégrité manuellement, et où trouver l'app Labo Codex. Cela rend le format **auto-descriptif** (cf. `SKILL_Securite_donnees.md` §4 sur la pérennité du format).

### 7.2 Pourquoi le ZIP est plus protecteur qu'un JSON nu

1. **Plus difficile à éditer par mégarde.** TextEdit n'ouvre pas un `.lcz` ou un `.zip` en édition. Pour modifier le contenu, il faut activement décompresser, éditer, recompresser. Plusieurs étapes, donc moins de chance d'accident.
2. **Le manifeste détecte toute altération.** Si quelqu'un modifie `donnees.json` après création, le hash dans le manifeste ne correspond plus. Détection immédiate à l'import.
3. **La signature dans le manifeste authentifie l'auteur.** Si l'attaquant modifie le manifeste pour recalculer le hash, il casse la signature (parce qu'elle est calculée sur le hash original).
4. **Lisibilité conservée.** Décompresser un ZIP est trivial sur tous les OS. Le contenu reste du JSON consultable.
5. **Extensibilité.** On peut ajouter d'autres fichiers au conteneur sans changer la spec — par exemple `licence.txt` pour le texte CC BY-NC-SA, ou `previsualisation.png` pour un aperçu visuel.

### 7.3 Comparaison avec les formats existants similaires

Cette approche est analogue à :

- **JAR** (Java) — un ZIP avec un manifeste, signature optionnelle.
- **EPUB** — un ZIP avec une structure standardisée et un manifeste OPF.
- **DOCX/XLSX** — Office Open XML, un ZIP avec plusieurs fichiers XML et un manifeste.
- **APK** (Android) — un ZIP signé.

Tous ces formats sont conçus précisément pour ce que tu décris : un conteneur structuré qui protège contre la modification accidentelle et permet la vérification cryptographique.

### 7.4 Mise en œuvre dans Labo Codex

JSZip est déjà dans la stack (utilisé pour les imports/exports actuels selon `import-export.js`). Donc pas de nouvelle dépendance.

Le code de production d'un `.lcz` :

```javascript
async function produireConteneur(donnees, clePrivee, auteur) {
    const zip = new JSZip();
    
    // 1. Ajouter le JSON
    const donneesJsonStr = JSON.stringify(donnees, null, 2);
    zip.file('donnees.json', donneesJsonStr);
    
    // 2. Calculer le hash
    const hash = await calculerHashSHA256(donneesJsonStr);
    
    // 3. Construire le manifeste sans la signature
    const manifeste = {
        format: 'labo-codex-conteneur',
        version_format: '1.0',
        date_export: new Date().toISOString(),
        auteur_declare: auteur,
        integrite: {
            donnees_json_sha256: hash,
            algorithme: 'SHA-256',
            taille_octets: new Blob([donneesJsonStr]).size
        }
    };
    
    // 4. Signer le manifeste
    const signature = await signerECDSA(
        JSON.stringify(manifeste),
        clePrivee
    );
    manifeste.signature = {
        algorithme: 'ECDSA-P-256-SHA256',
        valeur: signature,
        cle_publique_id: await empreinteClePublique(clePrivee)
    };
    
    // 5. Ajouter le manifeste et le README
    zip.file('manifeste.json', JSON.stringify(manifeste, null, 2));
    zip.file('README.txt', construireReadme());
    
    // 6. Produire le blob
    return await zip.generateAsync({ type: 'blob' });
}
```

La vérification à l'import :

```javascript
async function verifierConteneur(blob) {
    const zip = await JSZip.loadAsync(blob);
    
    // 1. Lire le manifeste
    const manifesteStr = await zip.file('manifeste.json').async('string');
    const manifeste = JSON.parse(manifesteStr);
    
    // 2. Lire les données
    const donneesStr = await zip.file('donnees.json').async('string');
    
    // 3. Vérifier le hash
    const hashRecalcule = await calculerHashSHA256(donneesStr);
    if (hashRecalcule !== manifeste.integrite.donnees_json_sha256) {
        return { valide: false, raison: 'Hash invalide — données altérées' };
    }
    
    // 4. Vérifier la signature (si présente et clé publique connue)
    if (manifeste.signature) {
        const clePubliqueAuteur = await recupererClePublique(
            manifeste.signature.cle_publique_id
        );
        const manifesteSansSignature = { ...manifeste };
        delete manifesteSansSignature.signature;
        const signatureValide = await verifierECDSA(
            JSON.stringify(manifesteSansSignature),
            manifeste.signature.valeur,
            clePubliqueAuteur
        );
        if (!signatureValide) {
            return { valide: false, raison: 'Signature invalide' };
        }
    }
    
    return { valide: true, donnees: JSON.parse(donneesStr), auteur: manifeste.auteur_declare };
}
```

### 7.5 Compatibilité avec le format actuel

Phase de transition : l'app accepte à l'import les deux formats (JSON nu et conteneur `.lcz`). À l'export, par défaut produire le conteneur. Garder l'export JSON nu en option « avancée » pour compatibilité.

---

## 8. Recommandation pour Labo Codex

Voici ma proposition concrète, en trois phases compatibles avec le plan du `MODELE-MENACES.md` §8.

### 8.1 Phase A — Hash d'intégrité (1 jour de code)

Ajouter à chaque export JSON actuel un champ `integrite.hash_sha256`. À l'import, vérifier et alerter en cas de discordance.

**Effet** : détection immédiate de la modification accidentelle (TextEdit smart quotes, corruption disque, modification involontaire). Pas de protection contre l'attaquant malveillant qui recalcule, mais c'est déjà une amélioration majeure de la robustesse.

**Bonus** : aucune migration nécessaire — les exports antérieurs (sans hash) sont juste affichés comme « non vérifiables » à l'import.

### 8.2 Phase B — Conteneur `.lcz` (2-3 jours de code)

Passer du format JSON nu au conteneur ZIP avec manifeste (sans signature pour l'instant). Le hash est dans le manifeste. Migration progressive : exports anciens (JSON) toujours acceptés à l'import, exports nouveaux (`.lcz`) par défaut.

**Effet** : protection contre la modification par mégarde (le ZIP est moins éditable que le JSON nu), structure auto-descriptive, place pour les évolutions futures (signature, métadonnées, prévisualisation).

### 8.3 Phase C — Signature ECDSA (2-3 semaines de code + gouvernance)

Ajouter la signature dans le manifeste. Gestion locale des clés (génération, stockage chiffré, sauvegarde). Annuaire des clés publiques (au minimum, modèle TOFU pour les premiers utilisateurs).

**Effet** : protection contre la modification malveillante avec recalcul de hash. Authentification de l'auteur. Couvre les scénarios U-01 (usurpation) et D-02 (corruption silencieuse) du modèle de menaces.

### 8.4 Ordre suggéré

Si tu veux démarrer dès cette semaine, prends la Phase A — 1 jour de code, gain immédiat sur la détection de modification accidentelle. C'est le rapport coût/bénéfice le plus favorable.

La Phase B peut suivre dans les semaines suivantes. La Phase C s'aligne avec l'ouverture de la Voûte.

---

## 9. Que faire avec un fichier déjà reçu ?

Tu as reçu une grille par courriel d'un collègue, tu veux vérifier qu'elle n'a pas été altérée en route. Trois options selon ce qui est en place.

### 9.1 Si le fichier est un JSON nu (état actuel)

Pas de mécanisme intégré. Vérification possible :

- **Visuelle** : ouvrir le fichier dans BBEdit ou VS Code et inspecter le contenu pour repérer des anomalies évidentes (champs vides, caractères bizarres, payloads HTML).
- **Comparative** : si l'auteur t'a aussi envoyé le hash par un autre canal (message texte, courriel signé, page web), tu peux le recalculer toi-même :

```bash
# Dans Terminal
shasum -a 256 /chemin/vers/bibliotheque.json
# Comparer la sortie au hash communiqué par l'auteur
```

### 9.2 Si le fichier est un conteneur `.lcz` (Phase B implémentée)

L'app vérifie le hash automatiquement à l'import. Tu peux aussi vérifier manuellement :

```bash
# Décompresser
unzip /chemin/vers/bibliotheque.lcz -d /tmp/verif

# Lire le hash déclaré
cat /tmp/verif/manifeste.json

# Recalculer le hash réel
shasum -a 256 /tmp/verif/donnees.json

# Comparer
```

### 9.3 Si le fichier est signé (Phase C implémentée)

L'app vérifie hash + signature automatiquement. Affichage clair : « Cette grille a été signée par <auteur> le <date>. Signature vérifiée. » ou « Avertissement : la signature ne correspond pas. »

---

## 10. Recommandations aux utilisateurs

Une partie de la protection est technique, l'autre est comportementale. Pratiques à diffuser dans la communauté Labo Codex :

### 10.1 Ne jamais éditer un export Labo Codex à la main

Sauf nécessité technique imposée et avec connaissance du format. Toute modification doit passer par l'app, qui sait préserver la structure et recalculer les hashes.

### 10.2 Si tu dois inspecter un export, utiliser le bon éditeur

- **À utiliser** : VS Code (gratuit), BBEdit (gratuit en version limitée), Sublime Text, `cat` dans Terminal, ou directement la fonction « Aperçu rapide » de Finder (espace sur le fichier).
- **À éviter** : TextEdit (smart quotes), Notes.app, Pages, Mail (composition).

### 10.3 Verrouiller les exports importants en local

Pour tes propres archives de référence (la grille canonique que tu as publiée, le pack pédagogique de ton département), verrouiller via Finder (Cmd+I › Verrouillé). Anti-mégarde local efficace.

### 10.4 Conserver le hash dans un canal séparé

Si tu envoies un export à un collègue par courriel, mentionne dans le corps du courriel : « Hash SHA-256 du fichier : a1b2c3... ». Le destinataire peut vérifier avec `shasum -a 256` dans Terminal. C'est la version manuelle du mécanisme automatisé décrit en §5.

### 10.5 Ne pas faire confiance aveuglément aux exports reçus

Indépendamment de toute défense technique, garder une vigilance humaine : auteur connu ? Canal de réception attendu ? Contenu cohérent avec ce qu'on attend ? Ces questions valent même pour des fichiers signés — la signature dit qui a écrit, pas si c'est sain.

### 10.6 Garder une copie de sauvegarde indépendante

Avant d'importer un export potentiellement suspect, faire un backup de son codex et de sa bibliothèque. La sauvegarde Codex sur clé USB recommandée dans `SKILL_Securite_donnees.md` §5.2 sert exactement à ça.

---

## 11. Limites et zones d'incertitude

### 11.1 Limites du modèle de protection

1. **Aucune protection cryptographique ne protège contre un auteur malveillant signant son propre contenu hostile.** La signature dit « c'est bien Marie-Hélène », pas « c'est sain ». Combiner avec audit du contenu (modération humaine pour la Voûte, sandbox iframe pour l'aperçu — cf. `MODELE-MENACES.md` §8.1 Défense A).
2. **Aucune protection ne survit au vol de la machine.** Si quelqu'un a accès physique au Mac de l'auteur, il peut signer en son nom (clé privée présente). Protection complémentaire : mot de passe sur la clé privée, FileVault sur macOS, verrouillage de session.
3. **Le verrouillage OS n'est pas portable.** Un fichier verrouillé sur ton Mac arrive non verrouillé chez ton collègue. Le verrouillage protège uniquement ta copie locale.
4. **Les hashs sans canal séparé ni signature ne protègent que de la corruption involontaire**, pas de la modification volontaire compétente.
5. **Le format conteneur ne devient sûr que si l'écosystème l'adopte.** Tant qu'on accepte aussi le JSON nu à l'import (compatibilité ascendante), un attaquant utilisera le JSON nu pour contourner les vérifications du conteneur.

### 11.2 Zones d'incertitude techniques

1. **Comportement exact de JSZip face à un ZIP modifié.** Si quelqu'un édite un fichier dans le ZIP avec un outil tiers, JSZip à la lecture détecte-t-il une incohérence d'archive ? À tester.
2. **Performance du calcul de hash sur de gros codex.** Un codex complet peut peser plusieurs centaines de Mo. Le hash SHA-256 sur cette taille via Web Crypto API prend combien de secondes sur Mac M3 ? À mesurer.
3. **Stockage des clés privées dans le navigateur.** IndexedDB peut stocker des `CryptoKey` non-extractables. Comment les sauvegarder pour migration de machine ? Solution probable : export protégé par mot de passe.
4. **Compatibilité Safari iPad M1** pour les APIs concernées. ECDSA P-256 et SHA-256 sont supportés depuis longtemps, mais à confirmer pour les options spécifiques (`wrapKey`, `unwrapKey`).

### 11.3 Questions ouvertes pour Grégoire

1. **Format d'extension** : `.lcz` te convient ? Autre suggestion ? `.labocodex` ? `.lc-grilles` ?
2. **Choix du modèle de clé publique** : TOFU pour démarrer (simple), annuaire centralisé plus tard ? Ou autre approche ?
3. **Compatibilité ascendante** : garder l'import JSON nu indéfiniment ou imposer le conteneur à terme ? Si oui, sous combien de temps ?
4. **UX de la vérification** : afficher systématiquement le statut (« vérifié », « non signé », « signature invalide ») ou seulement en cas de problème ?

---

## Synthèse en une page

**Question** : peut-on protéger un fichier d'export contre la modification accidentelle ou volontaire ?

**Réponse courte** : oui, à plusieurs niveaux combinables. Aucune méthode seule n'est parfaite.

**Comportement du fichier modifié dans TextEdit aujourd'hui** : risque élevé de corruption silencieuse à cause des substitutions intelligentes (guillemets typographiques). Le fichier peut devenir non-importable sans qu'on s'en rende compte. Recommandation immédiate : ne jamais ouvrir un export Labo Codex dans TextEdit.

**Niveaux de protection** :

1. Verrouiller dans Finder (Cmd+I) — anti-mégarde local, gratuit, 5 secondes.
2. Hash SHA-256 inclus dans le fichier — détection automatique de toute modification involontaire, 1 jour de code.
3. Conteneur ZIP signé — protection structurelle + signature de l'auteur, 2-3 semaines de code + infrastructure de clés.

**Prochaine étape concrète recommandée** : implémenter la Phase A (hash dans chaque export JSON actuel). 1 jour de travail, gain immédiat. Pas d'urgence avec la signature complète tant que la Voûte n'est pas en production.

---

## Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-06 | 1.0 | Création. Analyse du comportement JSON face aux modifications, piège TextEdit, quatre niveaux de protection (OS, hash, signature, conteneur), recommandations en trois phases, recommandations aux utilisateurs. |

---

**Fin du document.**
