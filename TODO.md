# TODO — Question Champion

## Accueil et accès aux salles
- [ ] Afficher une page d’accueil familiale permettant de créer une salle ou de rejoindre une salle existante avec un code temporaire à 6 chiffres.
- [ ] Permettre à l’hôte de choisir un nombre de joueurs autorisés entre 4 et 8 avant de créer la salle.
- [ ] Demander un pseudo de 2 à 20 caractères avant l’entrée dans la salle.

## Lobby synchronisé
- [ ] Afficher en temps réel le code de salle, le nombre de places configuré et la liste des joueurs connectés.
- [ ] Utiliser Supabase Realtime pour synchroniser la salle, les joueurs, les réponses, les scores et les états de manche sans serveur multijoueur dédié.
- [ ] Autoriser le lancement de la partie uniquement lorsque le nombre de joueurs requis est atteint.

## Déroulement du quiz
- [ ] Afficher des questions à choix unique avec quatre réponses issues des catégories connaissance générale, sport, musique, géographie et familial.
- [ ] Appliquer un timer de 30 secondes à l’étape 1, 20 secondes à l’étape 2 et 10 secondes à l’étape 3.
- [ ] Valider automatiquement la réponse sélectionnée à l’expiration ; enregistrer une absence de réponse si aucune option n’est sélectionnée.
- [ ] Attribuer 3 points à la bonne réponse la plus rapide, 2 points à la deuxième et 1 point aux autres bonnes réponses.
- [ ] Afficher le score de chaque joueur après chaque question et un récapitulatif à la fin de chaque étape.
- [ ] Qualifier la première moitié des joueurs atteignant 9 points ; réserver l’étape 3 aux deux premiers qualifiés ; déclarer gagnant le premier joueur à atteindre 12 points.

## Banque de questions
- [ ] Ne pas reproposer une question utilisée avant 24 heures.
- [ ] Utiliser Supabase pour stocker les catégories, questions, choix et historique d’utilisation.
