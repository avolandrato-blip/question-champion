# Architecture multijoueur

Le jeu ne dépend pas d'un serveur multijoueur dédié. Chaque joueur ouvre le même lien, saisit le code à 6 chiffres de la salle et choisit un pseudo.

Supabase fournit :

- la banque de questions et la règle de réutilisation après 24 heures ;
- les salles temporaires et leur code ;
- les joueurs, pseudos et scores ;
- les réponses et la validation automatique à l'expiration du timer ;
- Supabase Realtime pour synchroniser l'état de la salle entre téléphones.

Les états de manche et les délais sont stockés avec des horodatages absolus (`question_started_at`, `question_deadline_at`). Chaque téléphone calcule l'affichage du compte à rebours depuis ces horodatages. Les écritures de réponse utilisent une contrainte d'unicité par joueur et question afin d'empêcher les doubles validations.

Les règles de scoring doivent être appliquées par une fonction transactionnelle ou une Edge Function Supabase, pas uniquement par le navigateur : 3 points pour la bonne réponse la plus rapide, 2 pour la deuxième, 1 pour une bonne réponse ultérieure, puis 0 si la réponse est fausse ou absente.
