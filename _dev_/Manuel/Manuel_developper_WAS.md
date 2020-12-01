# Scaffold WebApp<br>Manuel développeur



## Introduction

Ce manuel décrit l’utilisation de « Scaffold WebApp » qui permet de construire très rapidement une application en `HTML/CSS/JAVASCRIPT/AJAX/RUBY`. En front-end, on utilise `HTML/CSS/JS` et en back-end on utilise `AJAX/RUBY`. Cela permet de faire rapidement une application avec toutes les ressources possibles et très facilement.

Pour l’exemple, on peut voir `Publishing-html` qui a servi de base pour faire cet échafaudage.



## Construction de la page

### Briques

Les « briques » sont des composants `html` qui se trouvent dans le dossier  `./html` et qui peuvent être insérés à la volée très simplement dans la page index. Il suffit pour ça d’utiliser la méthode promesse :

~~~javascript
UI.insert('<nom brique>', <container>)
.then( () => {
  // ...
})
.catch(onError)
~~~

> `<nom brique>` peut être fourni avec `.htm[l]` ou pas.



### Méthodes pratiques

#### DCreate

Pour créer un élément quelconque.

~~~javascript
DCreate('<tag>', {<attributs>})
~~~

Par exemple :

~~~javascript
DCreate('DIV', {class:'mondiv', id:'iddiv', inner: DCreate('DIV')})
DCreate('SPAN', {text:"Mon texte en dur"})
~~~



#### DCreateDivLV

Construction d’une ligne avec libellé et valeur formatée.

~~~javascript
DCreateDivLV("Mon libelle", "Ma valeur", {id:'maRangee', libelleSize:'120px'})
~~~

Produit :

~~~html
<div id="maRangee">
  <span class="libelle" style="width:120px">Mon libellé</span>
  <span class="value">Ma valeur</span>
</div>
~~~



## Aspect de l'interface

Tous les modules `CSS` se trouve dans le dossier général `./css`.  Dans ce dossier, le dossier `./css/system` contient les classes du scaffold utilisables partout.

Voici quelques classes à noter, souvent incontournables (pour une liste complète, le mieux est de voir dans les fichiers eux-mêmes).

~~~bash
.right					Pour aligner à droite
.fright					Flottant à droite
.fleft					Flottant à gauche

.mt1
.mt2						Pour laisser des marges au-dessus (de 1em ou 2em)

button.main			Pour un bouton principal
~~~



<a name="observedocument"></a>

## Méthodes d’observation du document



### `UI.listenClick(element, methode)`

Pour écouter le clic de souris sur un élément quelconque.

### `UI.unlistenClick(element, methode)`

Pour ne plus écouter le clic précédent.

### `UI.listen(element, typeEvent, methode)`

La même chose que les méthodes précédentes, mais pour tous les autres types d'évènement.

Par exemple :

~~~javascript
const monMenu = DGet('#monMenu')
UI.listen(monMenu, 'change', this.onChange.bind(this))
~~~

### `UI.unlisten(element, typeEvent, methode)`

Pour ne plus écouter l'évènement précédent.



## Requêtes Ajax

Une requête ajax fonctionne avec un script ruby.

~~~javascript
Ajax.send('mon-script.rb', {ma:donnee, autres:donnees})
.then(ret => {
  if ( ret.error ) return erreur(ret.error)
  if ( ret.message) message(ret.message)
  //... sinon traitement ici ...
})
.catch(onError)
~~~

> Noter que toutes les méthodes ci-dessous, `erreur`, `onErreur` sont implémentées dans le scaffold.

Les données envoyées (second argument de `Ajax.send`) peuvent être de tout type — sauf des instances complexes. Noter que leur type sera transmis dans la requête, donc il est inutile de remettre des entiers en entiers, des tables en tables, etc.

#### Traitement d’un retour simple

Dans le premier catch, on peut utiliser la méthode `onAjaxSuccess` qui permet de ne traiter que les éventuels retours et l’éventuel message renvoyé dans la propriété `message` (par `Ajax << {message: "Mon message"}` en ruby).

Par exemple :

~~~javascript
Ajax.send('mon-script-a-jouer.rb')
.then(onAjaxSuccess)
.catch(onError)
~~~

> Le mieux est de le mettre en une seule ligne, mais ici on le dispatch pour la visibilité.



**Le script `mon-script.rb`** doit se trouver dans le dossier :

~~~bash
./ajax/ajax/_scripts/
~~~

Pour récupérer les données dans le script il suffit d’utiliser la méthode `Ajax.param(<key>)`. Par exemple, pour récupérer les données `ma` et `autres` envoyées ci-dessus :

~~~ruby

begin
  ma = Ajax.param(:ma)
  autres = Ajax.param(:autres)

  donnee_trouvee = <opération avec ma et autres>

  Ajax << {message: "L'opération s'est bien passées."} # sera affiché
  Ajax << {retour: donnee_trouvee}

rescue Exception => e

  Ajax << {'valeur de ma' => ma, 'valeur de autres' => autres}
  Ajax.error(e)

end
~~~





## Suivi du programme

On peut utiliser la méthode `suivi(<message>, <niveau debug>)` pour afficher des messages de suivi en console en fonction du niveau de débuggage.

Ce niveau de débuggage se définit dans le fichier `js/_config.js` par la constante `DEBUG_LEVEL`.

Plus ce niveau est élevé plus les messages profonds sont affichés. Un suivi avec un niveau de debuggage de 0 ou de 1 sera toujours affiché. Un suivi avec un niveau de débuggage de 9 ne sera affiché que si `DEBUG_LEVEL` vaut au moins 9.

En théorie, il n’y a pas de limite pour le niveau de débuggage.



## Messages



### Simple notification

Pour un message simple, utiliser la méthode `message("<message> »)`.

> Un second argument est utilisé mais pas encore appliqué, qui permet d’envoyer des options.

### Messages d'erreur

On peut utiliser la méthode `erreur(<message>)` pour écrire des messages à l’utilisateur.

Si `<message>` est un objet qui répond à `message`, l’erreur est écrite en console et c’est seulement le message qui est donné à l’utilisateur.



## Méthodes pratiques

Ces méthodes sont définies dans `./js/Handies.js`.

### `humanDateFor(<time>)`

Retourne la date dans un format humain.

`<time>` doit être en secondes (attention : la date javascript est en millième de secondes par défaut). Si `<time>` n’est pas défini, c’est le temps courant qui est pris, donc la date du jour.

> Cette méthode est utilisée pour traiter les temps tels qu’ils sont donnés par défaut avec ruby.
