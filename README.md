# Rest'O Bar La Varine — site web

Refonte complète du site du **Rest'O Bar La Varine**, restaurant et chambres d'hôtes
à Saint-Laurent-la-Roche (39570 La Chailleuse, Jura).

Cuisine française **et** africaine faite maison, fondues du Jura, pizzas à emporter,
quatre chambres d'hôtes et formule soirée étape.

🔗 **Démo en ligne : https://boyernathan39000-max.github.io/la-varine/**

---

## Ce qui change par rapport à l'ancien site

L'ancien site (`restobarlavarine.eatbu.com`) reposait sur un gabarit DISH Digital.

| Avant | Maintenant |
|---|---|
| Aucun appel à l'action avant le 3ᵉ écran | Bouton d'appel visible en permanence, barre fixe sur mobile |
| Formulaire de commande à 12 champs | Demande de réservation en 4 champs |
| Menus en PDF, illisibles sur téléphone | Carte en HTML, onglets, vrais prix |
| Titre de galerie en italien (« Le nostre specialità ») | Contenu entièrement en français, relu |
| Deux numéros concurrents, sans hiérarchie | Un numéro principal, le fixe en secondaire |
| 47 photos en vrac | 13 photos choisies, en mosaïque avec visionneuse |
| Six activités présentées à plat | Un récit : deux cuisines, une table, des chambres |
| Aucune donnée structurée | JSON-LD `Restaurant` + `BedAndBreakfast`, OpenGraph, sitemap |

## Points techniques

- **Zéro dépendance** : pas de framework, pas de CDN, pas d'étape de build.
  Ouvrir `index.html` suffit.
- **Statut d'ouverture en direct** — « Ouvert jusqu'à 22h00 » / « Fermé · ouvre demain
  à 12h00 », calculé sur le fuseau `Europe/Paris` quel que soit celui du visiteur.
  Le jour courant est surligné dans le tableau des horaires.
- **Polices auto-hébergées** (Fraunces, licence SIL OFL) — aucun appel externe,
  donc aucun traceur tiers.
- **Accessibilité** : contrastes AA, navigation clavier complète, onglets avec
  flèches gauche/droite, `prefers-reduced-motion`, lien d'évitement, textes alternatifs.
- **Sans JavaScript**, la page reste entièrement lisible (les animations sont
  conditionnées à la classe `js`).
- Poids total ≈ 6 Mo dont 5 Mo d'images, chargées à la demande (`loading="lazy"`).

## Structure

```
index.html              Page unique
assets/css/style.css    Feuille de style (variables CSS en tête)
assets/js/main.js       Statut d'ouverture, onglets, visionneuse, formulaire
assets/fonts/           Fraunces (woff2)
assets/img/             Photos optimisées (1600 px et 700 px)
menus/                  PDF d'origine du restaurant
bump.py                 Régénère les empreintes de cache après édition
```

---

## ⚠️ À compléter avant mise en ligne réelle

Le site ne contient **aucune donnée inventée**. Les informations manquantes sont
marquées `[À COMPLÉTER]` et visibles à l'écran. À renseigner par le restaurant :

- [ ] **Tarifs des 4 chambres** (section « Dormir sur place »)
- [ ] **Tarif de la formule soirée étape**
- [ ] **Prix des plats africains** (onglet « Afrique » de la carte)
- [ ] **Suggestions de la semaine** (onglet « Du moment »)
- [ ] **Noms des chambres** — « La champêtre » et « L'africaine » proviennent de
      l'ancien site ; « La grise » et « La familiale » sont des noms provisoires
      donnés d'après les photos, à valider.
- [ ] **Avis clients** — aucun n'était récupérable ; une section témoignages
      renforcerait nettement la conversion.

Chercher `[À COMPLÉTER]` dans `index.html` pour tout localiser.

## Modifier le site

Toutes les modifications se font dans `index.html` (contenu) et
`assets/css/style.css` (apparence). Les couleurs et espacements sont regroupés
en variables CSS au début de la feuille de style.

Après avoir modifié le CSS ou le JS, lancer :

```bash
python3 bump.py
```

Cela met à jour les empreintes de cache (`?v=…`) pour que les visiteurs
reçoivent bien la nouvelle version.

### Horaires

Les horaires existent à **deux endroits** qu'il faut garder synchronisés :

1. `assets/js/main.js` → objet `HORAIRES` (pilote le badge « Ouvert / Fermé »)
2. `index.html` → tableau `#hrs` et le bloc `openingHoursSpecification` du JSON-LD

### Brancher un vrai envoi de formulaire

Le formulaire de réservation ouvre aujourd'hui la messagerie du visiteur
(`mailto:`), ce qui fonctionne sans serveur. Pour un envoi côté serveur, créer un
formulaire sur [Formspree](https://formspree.io) puis, dans `index.html` :

```html
<form class="resa__f" id="form-resa" action="https://formspree.io/f/VOTRE_ID" method="POST">
```

et supprimer le bloc `/* Formulaire de réservation */` de `assets/js/main.js`.

## Aperçu local

```bash
python3 -m http.server 4173
```

Puis ouvrir http://localhost:4173

---

## Crédits et licence

- Photographies et contenus : **Rest'O Bar La Varine** — tous droits réservés.
- Police *Fraunces* : licence SIL Open Font License 1.1.
- Conception et développement : **OBT Agency**.

Le code est fourni pour le compte du client. Les médias ne sont pas réutilisables
sans l'accord du restaurant.
