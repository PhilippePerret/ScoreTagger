# Web App Scaffold

Échaffaudage pour créer une application HTML/JS/CSS/AJAX simple.

## Utilisation

* Dupliquer ce dossier et renommez-le,
* utiliser l'adresse `http://localhost/<nouveau nom>` pour charger la nouvelle application,
* lire la suite,
* jouer les boutons présents pour tester le bon fonctionnement.

## Base de données

Si une base de données MySql est utilisée, il faut définir les donnnées dans `./ajax/secret/mysql.rb`.

## Requête ajax

~~~javascript

Ajax.send({<data>})

~~~

Dans les scripts `ajax/ajax/_scripts/` on récupère les données par :

~~~ruby

valeur = Ajax.param(:<key>)

~~~

Par exemple :

~~~javascript
// Dans le fichier .js

Ajax.send({script: "mon_script.rb", maValue:"Ceci est une valeur transmise"})

~~~

~~~ruby
# Dans le script

valeur = Ajax.param(:maValue)
# valeur = "Ceci est une valeur transmise"

~~~

### Pour retourner une valeur :

~~~ruby
# Dans le script ruby want_retour.rb

Ajax << {retour: "Ceci est mon retour"}

~~~

~~~javascript
// Dans le fichier javascript

function fonctionRetour(rdata){

  console.log(rdata.retour)
  // Écrit en console : "Ceci est mon retour"

}

Ajax.send({script: "exemple-retour.rb"}, fonctionRetour)

~~~

## Construction de la page index.html

Pour le moment, elle doit être construite en dur. Par exemple, lorsqu'un script est ajouté, ou une feuille CSS, il faut coder son inclusion à la main (en s'inspirant des codes déjà présents).

## Librairie jQuery

Par défaut, on a accès aux librairies jQuery (ui et min) pour ces applications rapides.
