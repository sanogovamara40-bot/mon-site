# Démarchage Unanime

**Objectif** : 3 équipes payantes à 29 €/mois en 30 jours.
**Méthode** : 15 prospects par semaine, 10 minutes de démo, zéro publicité.

## 1. Cible exacte

Ne visez pas « les entreprises ». Visez :

- agences digitales ou studios produit de 5 à 50 personnes ;
- travaillant avec des clients ou des équipes dans au moins 3 fuseaux ;
- avec un décideur joignable : fondateur, COO, directeur de projet.

Signaux qui indiquent un besoin :

- offres d'emploi « remote » dans plusieurs pays ;
- page « équipe » avec des villes différentes ;
- site en français **et** en anglais ;
- mention « clients en Europe / US » ;
- équipes Afrique de l'Ouest + Europe, ou Europe + US : c'est là que le calcul
  mental coûte le plus cher.

À éviter : entreprises d'un seul pays, freelances seuls, grands groupes (cycle de
vente trop long).

## 2. Trouver 15 prospects en 30 minutes

Recherches LinkedIn :

1. `agence digitale remote` — filtre « Entreprises », 11–50 employés.
2. `studio produit` — filtres « Paris », puis « Abidjan », « Dakar »,
   « Casablanca ».
3. `remote-first agency` — filtre « Publications », puis ouvrir les profils des
   auteurs.
4. `agence web clients internationaux`.

Pour chaque prospect, notez dans `sales/prospects.csv` : entreprise, site,
décideur, rôle, LinkedIn, villes repérées, statut, dernier contact, prochaine
action.

Règle : **15 nouveaux contacts par jour maximum**. Une phrase personnalisée sur
leur équipe vaut mieux que 50 messages identiques.

## 3. Séquence LinkedIn

### 3.1 Demande de connexion (300 caractères max)

Variante A — observation :

> Bonjour [Prénom], je vois que [Entreprise] travaille avec des équipes sur
> plusieurs fuseaux. J'ai construit un outil gratuit qui trouve le créneau commun
> en 10 secondes. Je vous l'envoie ?

Variante B — problème :

> Bonjour [Prénom], chez [Entreprise], trouver une heure de réunion entre
> [ville 1] et [ville 2] prend combien de messages ? J'ai fait un outil gratuit
> pour ça, je peux vous montrer.

Pas de lien dans la demande de connexion : LinkedIn le pénalise.

### 3.2 Message après acceptation (J0)

> Merci [Prénom]. En deux mots : Unanime affiche les horaires de bureau de chaque
> ville sur une même grille et surligne le créneau où tout le monde est
> disponible. Plus de calcul mental, plus de réunion à 23 h.
>
> C'est gratuit, sans compte : https://getunanime.vercel.app
>
> Dix minutes pour vous montrer avec vos vraies villes ? Mardi 14 h ou jeudi 10 h
> (heure de Paris) ?

### 3.3 Relance J+3

> [Prénom], je pensais à votre équipe : le cas qui revient le plus souvent, c'est
> [ville 1] – [ville 2]. Sur Unanime, le recouvrement 9 h–18 h donne [exemple
> concret].
>
> Si ce n'est pas un sujet chez vous, dites-le-moi et je n'insiste pas.

Faites le vrai calcul dans l'app avant d'envoyer.

### 3.4 Dernier message J+8

> Je clôture mon suivi, [Prénom]. Le lien reste ouvert si le sujet revient :
> https://getunanime.vercel.app — et si vous connaissez une équipe sur 3 fuseaux,
> je prends l'introduction avec plaisir.

## 4. Séquence e-mail

Objet (en choisir un) :

- « L'heure de réunion entre [ville 1] et [ville 2] »
- « La réunion de 15 h qui tombe à 3 h du matin »
- « [Entreprise] — le créneau commun en 10 secondes »

Corps :

> Bonjour [Prénom],
>
> Chez [Entreprise], trouver une heure qui convient à [ville 1], [ville 2] et
> [ville 3] demande quelques échanges et un peu de calcul mental.
>
> Unanime superpose les horaires de bureau des villes et met en évidence le
> créneau où tout le monde est disponible. On peut ensuite exporter la réunion
> dans Google Agenda ou Outlook.
>
> C'est gratuit et sans compte : https://getunanime.vercel.app
>
> Dix minutes pour vous montrer avec vos villes ? Je suis disponible [créneau 1]
> ou [créneau 2].
>
> [Prénom]
> [Téléphone / LinkedIn]

Relance J+3, dans le même fil :

> Je remonte ce message, [Prénom] — si le sujet est déjà réglé chez vous,
> ignorez-le. Sinon, le lien prend 30 secondes à tester :
> https://getunanime.vercel.app

Relance J+7 :

> Dernier message de ma part. Si un jour une réunion doit réunir [ville 1] et
> [ville 2], l'outil est là. Bonne continuation.

## 5. Réponses aux objections

**« On utilise Google Agenda / Calendly. »**

> Ce sont des outils de calendrier : ils trouvent un trou dans un agenda, pas
> l'heure qui respecte les horaires de bureau de trois pays. Unanime ne remplace
> rien, il se fait avant l'invitation. Aucune installation.

**« World Time Buddy est gratuit. »**

> Oui, et c'est un bon outil. La différence : Unanime met en avant le
> recouvrement des horaires de bureau et exporte l'invitation avec le nom et la
> durée. Si World Time Buddy vous suffit, gardez-le — je ne veux pas vous vendre
> un doublon.

**« Pas de budget. »**

> La version actuelle est gratuite et le restera. L'offre équipe, c'est pour les
> structures qui veulent une mise en place, une facture et un support. On peut
> commencer gratuitement, sans carte.

**« On est tous dans le même fuseau. »**

> Alors ce n'est pas pour vous, en effet. Si vous avez un client ou un partenaire
> dans un autre fuseau, c'est là que ça devient utile.

**« Envoyez-moi une documentation. »**

> Pas de PDF : le lien EST la démo. https://getunanime.vercel.app — 30 secondes
> pour ajouter vos villes. Je peux aussi vous montrer en visio.

## 6. Démo de 10 minutes

1. **(1 min)** Question : « Quelles villes sont dans vos réunions cette
   semaine ? »
2. **(2 min)** Ajouter les villes en direct, montrer les décalages et la grille.
3. **(2 min)** Ajuster les horaires de bureau, montrer le créneau commun.
4. **(2 min)** Nommer la réunion, choisir 45 min, exporter le `.ics`, montrer
   l'URL partageable.
5. **(2 min)** Offre : « 29 €/mois par équipe, 14 jours d'essai, sans engagement.
   Je vous mets en place cette semaine. »
6. **(1 min)** Prochaine étape datée : « Je vous envoie la facture aujourd'hui,
   vous testez avec votre équipe, on fait un point vendredi. »

Ne montrez pas tout. Le but est qu'ils voient **leur** réunion dans l'outil.

## 7. Après le oui

- Envoyer une facture simple : numéro, date, prestation, montant, IBAN ou numéro
  Orange Money.
- Client hors zone CFA : virement Wise ou PayPal, facture en euros.
- Encaissement : Orange Money (Côte d'Ivoire), virement bancaire, Wise.
- Ne pas attendre Stripe pour encaisser les trois premiers clients.

## 8. Suivi

Statuts : `à contacter` → `contacté` → `a répondu` → `démo planifiée` →
`démo faite` → `gagné` / `perdu`.

Objectif hebdomadaire : 15 nouveaux contacts, 5 réponses, 2 démos, 1 proposition.

Si après 30 contacts personne n'a répondu : changer le segment (villes, taille),
pas le message.
