# Template Node API


## Description

Template d'une API simple en nodeJS utilisant le framework Express et l'authentification JWT.


## Initialisation


Créer un fichier ```.env``` à la racine du dossier. 

```
//.env

PORT=8080
ORIGIN_URL=http://localhost:1234

JWT_KEY=private_key

EXAMPLE_FOLDER=datas/examples/
EXAMPLE_FILE=examples.json

USER_FOLDER=datas/users/
USER_FILE=users.json
```

Créer les fichiers ```users/users.json``` et ```examples/examples.json``` dans un dossier ```datas/```.

```
//users/users.json

[
	{
        "id": 1,
		"pseudo": "test",
		"password": "$2b$10$ldgZEtKRGO/BLHQ5xY1Fs.zjLl7owZnOuxr9tgx987GL5H5V/a0Ka",
		"role": "user"
	}
]
```
```
//examples/examples.json

[
	{
		"id": 1,
		"date": "2021-05-26T16:52:14.660Z"
	}
]
```

**Commandes :**
```
$ npm install
```