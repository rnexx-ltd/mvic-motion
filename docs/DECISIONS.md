# Décisions — chantier vidéo Mvic Money

> Journal des décisions validées. Ce qui n'est pas ici n'est pas décidé.

## Outils et organisation (26/11/2026)

- **Vidéo :** Remotion. **Images :** Nano Banana. **Voix :** voix off IA. **Musique et effets :** fournis par l'utilisateur, libres de droits.
- **Dépôt :** `rnexx-ltd/mvic-motion`, séparé de l'application. Rien ne touche au dépôt `mvic-money`.
- **Marque à l'écran :** « Mvic Money », sans slogan.
- **Appel à l'action :** « Tape Mvic Money sur Google », puis installation de la PWA.

## Règles de vérité (confiance)

- Aucune comparaison de prix avec l'interopérabilité ou avec les agents.
- Aucune promesse de remboursement « frais compris sous 24 h ».
- **Aucune promesse de délai à l'écran** (« 30 secondes », « une demi-minute »…). On montre la simplicité, sans chronomètre.
- Ne jamais laisser entendre une exclusivité qui n'existe pas. Le nom du titulaire est un argument de **tranquillité** : l'USSD des opérateurs l'affiche souvent aussi.
- **Aucune urgence médicale ni détresse** comme moteur. Environ 30 % des tentatives échouent : un film ne doit jamais devenir une promesse trahie au pire moment.
- **Les agents ne sont jamais ridiculisés.** Ce sont des relais d'opinion, et ils sont la cible du produit Zola. La galère vient de la *situation* (réseau, pluie, file), pas d'eux.
- **Aucun opérateur n'est dénigré.** La rivalité Orange / MTN reste affectueuse, façon supporters de foot.
- On montre toujours **la validation par le code PIN sur son propre téléphone**, ce qui éduque contre les échecs.
- Les numéros affichés sont **partiellement masqués**, pour ne jamais exposer le numéro d'une vraie personne.

## Faits vérifiés (données du 16/11 et code)

| Fait | Source |
|---|---|
| Nom du titulaire affiché dans 99,7 % des tentatives (1 875 / 1 880) | Base, sauvegarde du 16/11 |
| Fonctionne la nuit : 22 h–6 h, 285 tentatives, 66 % de réussite (71 % en journée) | Base |
| Maximum réglé à 450 000 FCFA ; seuls 4 transferts réussis dépassent 50 000 | Base |
| Le nom affiché est le **nom officiel du titulaire** (en majuscules, fourni par l'opérateur), jamais un surnom du répertoire | Code (`holder_info`) |
| **Frais de retrait inclus :** voir ci-dessous | Code |

### L'option « Inclure les frais de retrait », vérifiée dans le code

- **Interface :** un interrupteur « Inclure les frais de retrait » sous le montant. Quand il est activé, le récapitulatif ajoute deux lignes : « Frais de retrait + X FCFA » et « **Le destinataire reçoit** Y FCFA ».
- **Fonctionnement :** l'expéditeur paie en plus une estimation des frais de retrait chez l'agent. Le destinataire reçoit donc `montant + frais de retrait` (`TransferService::resolveAmounts`).
- **Grille appliquée** (identique MTN et Orange, `WithdrawalFeeTierSeeder`) :
  - 1 à 3 333 FCFA : 54 FCFA fixes ;
  - 3 334 à 266 666 FCFA : 4 FCFA + 1,5 % ;
  - au-delà : 4 004 FCFA fixes.
- **Exemple :** 10 000 FCFA → frais de retrait 154 → la maman reçoit **10 154 FCFA**. Une fois les frais de l'agent payés, il lui reste ses 10 000 en espèces.
- ⚠️ **À vérifier avant de l'affirmer à l'écran :** la grille correspond-elle aux frais de retrait actuels des deux opérateurs ? Si elle est juste, on peut montrer la maman qui retire exactement 10 000. Sinon, on montre seulement la ligne « Le destinataire reçoit ».

## Programme des films (validé le 26/11)

| Ordre | Film | Rôle | Statut |
|---|---|---|---|
| 1 | **« Le nom »** | Scène test, puis premier film | Script v1 à valider |
| 2 | **« La traversée »** | Film principal | Corrections intégrées, à scénariser |
| 3 | **« Minuit »** (ex-« 23 h 47 ») | Émotion | Cadre positif à choisir (concours qui ferme à minuit, ou car de 5 h pour un mariage) |
| 4 | **« Le quartier »** | Pilote de série | Arrive quand le monde existe déjà |

- **Univers commun dès le film 1 :** tous les personnages vivent dans le même quartier. Chaque film enrichit la troupe : Mami Nyanga, Junior et sa mère, le moto-taximan…
- **Fin en boucle dans chaque film :** la dernière image s'enchaîne naturellement sur la première, pour pousser à revoir.
- **« La traversée » :** l'odyssée est racontée en **cases de BD et en images fixes animées**, comme Higordo le fait lui-même, pas en animation complète.
