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

OBSOLÈTE. Utiliser plutôt [SmartDebug](#smartdebug)

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



---

<a id="smartdebug"></a>

## Smart Debug

C’est un système de débuggage intelligent. En fait, il est très simple à la base et fonctionne sur deux principes :

* chaque passage dans une méthode peut être enregistré dans la trace, avec ses données intéressantes/sensibles
* à tout moment dans une méthode on peut sortir ce suivi.

#### Lexique

Avant toute chose, un lexique des termes employés.

<dl markdown="1">
<dt>trace</dt>
	<dd>On appelle "trace" tous les messages qui sont enregistrés dans SmartDebug, principalement les entrées et sorties de méthode, avec des arguments ou des valeurs.</dd>
  <dd>On peut aussi l'appeler "collecteur de trace".</dd>
<dt>Ligne de trace</dt>
	<dd markdown="1">Une "ligne de trace" est une ligne qui est enregistrée par une des méthodes __out, __in, __add.</dd>
<dt>segment de programme</dt>
	<dd>Un "segment de programme" est une suite continue et cohérente de fonctions qui sont exécutées dans le but d'un objectif déterminé. On part d'une fonction A pour aller jusqu'à une fonction Z qui marque la fin de l'exécution.</dd>
	<dd>Le démarrage de l'application, par exemple, peut débuter dans `main.js` quand le document est prêt et se terminer lorsque l'interface est prête et attend une action de l'utilisateur</dd>
	<dd>Un "segment de programme" peut commencer lorsque l'utilisateur clique un bouton de l'interface et se terminer lorsque l'action demandée est achevée.</dd>
</dl>



#### Exemple

Imaginons qu’un bouton permette de sauver le document courant par Ajax. Le programme ressemble à ça :

~~~javascript
function onClickButton(ev){
  saveDocument()
}

function saveDocument(){
	var text = getDocument()
  Ajax.send("save_document.rb", {document: text})
  .then(window.displayRetour.bind(window))
}

function displayRetour(retour){
  message(retour.message)
}

function getDocument(){
  return $('#document').val()
}
~~~



Si on veut suivre cette opération, on ajoute ce code :

~~~javascript
function onClickButton(ev){
  __start("Un clic sur le bouton “Enregistrer le document”") // <======== init
  __in('onClickButton', {x: ev.clientX}) // pour conserver la valeur x du clic
  var res = saveDocument()
  __out('onClickButton', {res: res})
}

function saveDocument(){
  __in('saveDocument')
	var text = getDocument()
  Ajax.send("save_document.rb", {document: text})
  .then(window.displayRetour.bind(window))
  __out('saveDocument', {text: text})
  return true
}

function displayRetour(retour){
  __in('displayRetour', arguments)
  message(retour.message)
  __out('displayRetour')
  __end("C'est la fin du click sur le bouton “Enregistrer le document”")
}

function getDocument(){
  __in('getDocument')
  var text = $('#document').val()
  __out('getDocument', {text: text})
  return text
}
~~~



Si maintenant on veut obtenir l’état du programme dans une des méthodes données, il suffit d’utiliser la méthode `__d` avec les options voulues (cf. ci-dessous). Par exemple :

~~~javascript
function saveDocument(){
  __in('saveDocument')
	var text = getDocument()
  __d() // <============== écrira tout le suivi en console
  Ajax.send("save_document.rb", {document: text})
  .then(window.displayRetour.bind(window))
  __out('saveDocument', {text: text})
  return true
}
~~~

#### Placement de la méthode de sortie `__d`

Concrètement, pour tester efficacement le problème en cas d'erreur, il suffit de placer ce `__d()` juste avant la ligne où cette erreur se produit.

> Noter que si le module `ErrorHandling` est utilisé — qui définit `window.onerror`, la méthode `__d()` est appelée automatiquement, donc on peut suivre le programme jusqu’à cette erreur.
>
> Mais pour un lecture optimale, il faut bien placer les `__start` et les `__end` qui délimitent des segments de programme. Sinon, le backtrace contiendra d’autres segments que le segment seul ayant provoqué l’erreur.

#### Utilisation classique de SmartDebug

L’utilisation la plus utile de `SmartDebug` peut consister à repérer par ses méthodes tous les « segments de programme » (cf. plus haut ce terme) de l’application. On commence avec `__start("<description>")` par marquer le début du segment et on termine en utilisant `__end("<description>")` pour marquer la fin du segment (quand l’action demandée est achevée).

Ensuite, en cours de débuggage, il suffit d’ajouter `output: true` à la méthode `__end` pour afficher le segment de programme en question.

#### Utilisation dans les méthodes asynchrones

Exemple d’utilisation dans les méthodes asynchrone :

~~~javascript
__start("Démarrage du segment de programme : mon action")
maMethode()
.then(o.monAutreMethode.bind(o))
.then(b.autreAction.bind(b))
.then(window.__end.bind(window, "Fin du segment 'mon action'", "main.js"))
~~~

Pour une sortie de méthode en fin du suite de then, utiliser :

~~~javascript
function main(){
	__in("main")
	maMethode
	.then(o.autre.bind(o))
	.then(b.encore.bind(b))
	.then(ASync_out("maMethode" /* on peut mettre des paramètres aussi */))  
}
~~~



#### Sortie dans les méthodes in, out et end

Dans le deuxième paramètre des méthodes `__in`, `__out` et `__end`, on peut définir la propriété `:output` à true pour provoquer l’affichage de la trace. Par exemple :

~~~javascript
function maMethode(){
  __in("maMethode")
  // elle fait quelque chose
  __out("maMethode", {output: true})
}
~~~

> Bien sûr, si on laisse cette propriété à true, un affichage se fera toujours à ce niveau.

#### Reset à partir d’un point

Si on veut effacer la trace avant un certain point pour se concentrer sur une portion du segment de programme, on peut ajouter la propriété `reset` à `true` provisoirement. Par exemple :

~~~javascript
function maMethode(indata){
  __in("maMathode", {args:indata, reset:true})
  // elle fait quelque chose
  autreMethode()
  __out("maMathode")
}

function autreMethode(){
  __in("autreMethode")
  // elle fait quelque chose
  __out("autreMethode", {output:true})
}
~~~

Dans l’exemple ci-dessus, à l’entrée de la méthode `maMethode`, la trace sera remise à zéro et sera affichée à la fin de `autreMethode`. Le traceur renvoyé ne contiendra donc que :

~~~
 -i-> maMathode
>{args}
<-o- maMathode
 -i-> autreMethode
<-o- autreMethode
~~~

#### Sauter une ligne de trace

Pour sauter des lignes de trace, on ajoute la propriété `skip: true` à ces lignes. Par exemple :

~~~javascript
function maMethode(){
  __in("maMethode")
  // ce qu'elle fait
  __out("maMethode", {skip: true})
}
~~~

Dans l’exemple ci-dessus, la ligne de trace `__out` ne sera pas écrite dans le rapport.

En revanche, elle est quand même mémorisée et peut être visualisée avec l’option `force: true`, par exemple si l’on tape dans la console :

~~~javascript
SmartDebug.output({force: true})
~~~

> Noter cependant que si un `__end` a été utilisé (ou un `reset: true` en paramètres), il n’y aura rien dans le collecteur de ligne de trace.



---

### Méthode(s) d’affichage de la trace

La méthode `__d` peut recevoir en premier argument les options, à savoir une table (`Object`) contenant :

~~~
no_out			Si true, on ne marque pas les sorties de méthode (les "__out")
no_in				Si true, on ne renvoie pas les entrées dans les méthodes (les "__in")
no_args			Si true, on ne marque pas les arguments passés (deuxième paramètres de __in et __out)
~~~

> Comme nous l’avons vu plus haut, il est aussi possible d’obtenir la trace à l’aide de la propriété `{output: true}` placé dans une des méthodes `__in`, `__out` ou `__end`.



#### Affichage après l’exécution du programme

Noter qu’on peut afficher le contenu actuel de la trace en jouant en console :

~~~javascript
SmartDebug.output()
~~~





---



## Méthodes pratiques

Ces méthodes sont définies dans `./js/Handies.js`.

### `humanDateFor(<time>)`

Retourne la date dans un format humain.

`<time>` doit être en secondes (attention : la date javascript est en millième de secondes par défaut). Si `<time>` n’est pas défini, c’est le temps courant qui est pris, donc la date du jour.

> Cette méthode est utilisée pour traiter les temps tels qu’ils sont donnés par défaut avec ruby.
