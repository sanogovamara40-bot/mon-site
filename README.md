# Unanime

**Le bon créneau, pour tout le monde.**

Unanime est un planificateur de réunion entre fuseaux horaires. Il superpose les
horaires de bureau de chaque participant sur une même grille de 24 heures, met en
évidence les créneaux qui conviennent à tout le monde, et propose les heures les
moins contraignantes quand aucun recouvrement parfait n'existe.

## Fonctionnalités

- **Grille horaire** : une colonne par heure UTC de la journée du premier
  participant (23 au passage à l'heure d'été, 25 à l'heure d'hiver), une ligne par
  ville, avec les changements de jour (`+1j` / `−1j`) et les décalages à la
  demi-heure (Inde, Népal…).
- **Recouvrement** : les heures où tout le monde est dans ses horaires de bureau
  sont surlignées, et le meilleur créneau — assez long pour la durée choisie — est
  mis en avant.
- **Suggestions** : trois créneaux classés par « gêne » minimale sur toute la durée
  de la réunion, même sans recouvrement parfait.
- **Horaires personnalisables** (par défaut 9h–18h), appliqués dans l'heure locale
  de chaque ville.
- **Réunion nommée et durée** : nom libre et durée (30 min à 1 h 30) reprises dans
  le récapitulatif et l'invitation.
- **Export agenda** : un fichier `.ics` du créneau sélectionné, avec l'heure locale
  de chaque participant dans la description, compatible Google Agenda, Outlook et
  Apple Calendrier.
- **Partage** : l'URL encode les villes, la date, les horaires, le nom et la durée ;
  les participants et les réglages sont aussi conservés en `localStorage`.
- **Installable** : manifeste et service worker — l'app s'ajoute à l'écran d'accueil
  et reste consultable hors ligne après la première visite.
- **100 % local** : aucun serveur, aucune donnée envoyée, aucun compte.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # tests unitaires (Vitest)
npm run build    # build de production
```

## Comment ça marche

Le calcul des fuseaux s'appuie uniquement sur `Intl.DateTimeFormat` (base ICU du
navigateur) : aucun package de dates, aucune table d'offsets à maintenir. La
conversion « heure murale → instant UTC » itère l'offset pour rester juste lors des
changements d'heure.

Pour chaque instant UTC de la journée, on calcule l'heure locale de chaque
participant, puis un score de gêne : 0 si la personne est dans ses horaires, sinon
la distance (en minutes) au bord le plus proche. Le créneau recommandé est le
milieu du plus long intervalle où le score total est nul **et qui contient toute la
durée de la réunion** ; à défaut, on minimise la gêne cumulée sur cette durée.

## Structure

```
src/
  App.tsx                 état, persistance, partage
  components/
    CityPicker.tsx        recherche de ville (combobox accessible)
    PlannerGrid.tsx       grille horaire et défilement vers le créneau choisi
    SlotCard.tsx          détail du créneau sélectionné
    Icons.tsx             icônes SVG
  data/cities.ts          villes + zones IANA
  lib/
    time.ts               conversions et formatage des fuseaux
    planner.ts            colonnes, recouvrement, suggestions
    ics.ts                génération du fichier agenda (.ics)
    *.test.ts             tests unitaires
```

## Stack

React 19, TypeScript, Vite, Vitest. Thème sombre, responsive, sans dépendance UI.
