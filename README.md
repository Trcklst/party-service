# Party service

Service permettant la gestion de la 'party': 
- création de party
- récupération une party
- modification de party
- suppression de party
- ajout de track
- vote track
- rejoindre party
- quitter la party
- gestion du track joué

## Routes
- Post /party : création de party (body: {name}) : 201 obj party
- Get /party/:id : récupération une party : 200 obj party
- Delete /party/:id : suppression une party : 204
- Put /party/:id : modification d'une party (body: {name}) : 200 obj party
- Patch /party/:id/join : joindre une party : 200 obj party
- Patch /party/:id/leave : quitter une party : 200 obj party
- Post /party/:id/add-track : ajout d'un track (body: {name, id}) : 200 obj party
- Patch /party/:id/vote-track/:trackId : vote pour un track : 200 obj party
- Put /party/:id/next-track : gestion du track joué : 200 obj party
- Patch /party/:id/play : play le track courant : 204
- Patch /party/:id/pause : pause le track courant : 204

## Events sent
- party-deleted {partyId}
- party-joined {party, userId}
- party-leaved {party, userId}
- party-updated {party}

## TODO
- Ajout mutex pour les requetes faites sur la meme party (ex: vote)
- Transaction en cas d'erreur revert
- Gerer les erreurs rabbit mq (si event non recu)
- s'enregistrer sur eureka
- ameliorer la gestion erreur mongodb (filter exception)
- Proteger next song tant que le currentTrack n'est pas fini
