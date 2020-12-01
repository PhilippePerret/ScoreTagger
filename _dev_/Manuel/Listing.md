# (super) LISTING<br>Manuel utilisateur

## Introduction

La class `Listing` est une classe permettant de gérer de façon très profonde les listes de données. « Profonde » signifie qu'on peut :

* afficher la liste des éléments,
* afficher les données de chaque élément (dans un panneau latéral à côté de la liste),
* créer/supprimer/modifier les valeurs des éléments,
* filtrer des éléments (par valeur).

<a name="prerequis"></a>

## Pré-requis

Pour pouvoir fonctionner, la classe `Listing` a besoin :

* du module `Listing.js`,
* du module CSS `Listing.css`,
* d'un propriétaire conforme (cf. [conformité du propriétaire du listing](ownerconfirmite)),
* une méthode générale `error(msg)` qui traite les messages d'erreur,
* une méthode générale `message(msg)` qui traite les messages notice,

<a name="instanciation"></a>

## Instanciation du listing

```javascript

class MaClasse {

  static get listing(){
    return this._listing || ( this._listing = new Listing({
        titre: 'Le titre du listing'
      , id: '<identifiant du listing>'
      // Optionnel
      , height: <Number Hauteur> // hauteur de la fenêtre
      , top:    <Number> // décalage vertical
      , left:   <Number> // Décalage horizontal
      , sortable: true/false  // Si true, la liste est "sortable"
      // Si la méthode propriétaire qui doit être appelée après une sélection
      // n'est pas onSelect, on peut la définir ici : (elle reçoit en premier
      // argument l'item sélectionné)
      , onSelect: this.maFonctionOnSelect.bind(this)
      // Idem pour la fonction de désélection
      , onDeselect: this.maFonctionDeDeselection.bind(this)
      // Si la méthode propriétaire qui doit être appelée après une création
      // n'est pas onAdd, on peut la définir ici (elle reçoi en premier
      // argument l'item créé)
      , onAdd: this.maFonctionOnAdd.bind(this)
    	// Pour définir des boutons propres (cf. ci-dessous)
    	, buttons: [
  				{id:'...', on:'selected', picto:'0', onclick:this.method.bind(this), title:'...'}      
	      ]
    }) )
  }
}

```



### Définir des boutons propres

On utilise la propriété `buttons` à l’instanciation du listing pour définir des boutons propres qui seront ajoutés dans la fenêtre.

~~~
id			Sera mis en class, en fait, avec `listing-` devant
on			Si la valeur est 'selected', le bouton n'apparait que s'il y a une sélection
				courante.
picto
text		Les deux permettent de définir le contenu du bouton. 'picto' est plus sémantique.
title		Pour définir le texte qui doit s'afficher lorsqu'on survole le bouton avec la
				souris.
onclick	La function/méthode qui doit être appelée quand on clique sur le bouton. C'est une
				fonction du owner, vraisemblablement.
~~~



<a name="ownerlisting"></a>

## Propriétaire du listing

On appelle « propriétaire du listing » la CLASSE quelconque du programme qui utilise la classe `Listing` pour afficher ses données. Ce sont les instances de cette classe qui seront utilisés comme items du listing.

<a name="ownerconfirmite"></a>

### Conformité du propriétaire de listing

**Pour être conforme**, ce propriétaire doit répondre aux exigences suivantes :

* définir les propriétés de ses éléments dans la propriété de classe `PROPERTIES` (cf. [ci-dessous](#defineproperties))
* définir une méthode de classe `get` qui reçoit en argument l'identifiant d'un item et retourne son instance,
* définir la méthode de classe `create` pour la création d'un nouvel item (la méthode doit recevoir les valeurs, dont `id` qui vaudra `null`),
* définir la méthode de classe `update` pour la modification de l'item (la méthode doit recevoir les valeurs, dont `id` qui possède la valeur de l'identifiant)

Les instances doivent :

* définir la méthode `li` qui retournera la balise `LI` à afficher dans le listing,
* ce `LI` doit contenir la classe `listing-item` (dans le cas contraire le filtrage ne sera pas possible — l'erreur sera signalée),
* ce `LI` doit impérativement avec un attribut `id` constitué par `<type élément>-<id>` et le `<type-element>` ne doit comporter aucun tiret (moins) (par exemple `projet-12`),
* définir la propriété `id` qui devra retourner l'identifiant de l'item


<a name="defineproperties"></a>

### Définir `PROPERTIES`

```javascript

class MaClasse {
  static get PROPERTIES(){
    if (undefined === this._properties){
      this._properties = [
        // Liste des propriétés
        {name: '<prop name>', hname: '<prop Human Name>', type: '<prop type' }
      ]
    }; return this._properties
  }
}

```

Chaque définition de propriété peut posséder les attributs :

```

name        Le nom "technique" de la propriété              prenom
hname       Le nom "humain" de la propriété, qui sera       Prénom
            affiché dans le formulaire.
            Si null, la propriété ne sera pas visible dans
            le formulaire. Son type est souvent 'hidden'.
type        Le type de la propriété. Par défaut, c’est le   textarea
            type 'text' (inutile de l’indiquer). Les types
            traités sont :
              'hidden'      Une valeur cachée, comme l’ID
              'textarea'    Une textarea
              'checkbox'    Une case à cocher

vtype       Type de la valeur. Par défaut, c'est string.      number
            Peut être :
                'number'    Transforme la valeur en nombre
                'string'    Par défaut, en string

required    Si cet attribut est true, la donnée ne peut être
            vide (donc null).

max         Longueur maximale de la donnée (ou nombre max)    255
            Ne pas oublier de mettre le vtype à 'number'
            pour que la valeur soit étudiée comme un nombre

min         Longueur minimale de la donnée (ou nombre min)
            Ne pas oublier de mettre le vtype à 'number'
            pour que la valeur soit étudiée comme un nombre

default     Valeur par défaut de la propriété.                Philippe
            Pour un type=checkbox, c'est true/false

form        Si la propriété ne se définit pas par un champ
            simple, on peut définir ici le NOM de la fonction
            qui doit servir à construire le champ. Par exem-
            ple, imaginons des sociétés qui traitent diffé-
            rente matière (bois, métal, papier, etc.). La
            propriété 'matieres' est définie par :
            {
                name:'matieres'
              , hname:null
              , type: 'hidden'
              , form:'buildCbMatieres'
              , setter:'setMatieresValue'
              , getter:'getMatieresValue'
            }
            Listing produira alors une rangée avec un champ
            caché pour mettre la valeur finale de 'matieres'
            et la méthode 'buildCbMatieres' du propriétaire
            construira la liste des checkbox à cocher.
            Cette méthode 'buildCbMatieres' reçoit en premier
            argument le div.row contenant déjà le champ défi-
            ni dans PROPERTIES.
            Les méthodes 'setter' et 'getter' permettent res-
            pectivement de définir et de récupérer les valeurs
            de la propriété 'matieres'.

setter      Pour définir les valeurs d'un champ complexe
            cf. 'form' ci-dessus
            Le setter reçoit la valeur de la propriété et doit
            se débrouiller avec en fonction de ce qu'elle est
            et de la construction des champs de formulaire. Par
            exemple, si on a affaire aux matières ci-dessus et
            que la valeur ressemble à "0011001" avec 1 utilisé
            lorsqu'une matière est choisie. Donc les matières
            3, 4 et 7 seront sélectionnée.

getter      Pour récupérer les valeurs d'un champ complexe
            cf. 'form' ci-dessus
            La méthode de getter reçoit le div contenant les
            élément de formulaire construits avec la méthode
            définie par 'form'.
            Elle doit retourner la valeur à donner à la pro-
            priété concernée.

```

## Méthodes utiles

### `listing#deselectAll()`

Pour retirer toutes les sélections du listing.

### `listing#displayedItems()`

Retourne la liste des instances (du propriétaire) qui sont affichés. Sert particulièrement lorsqu'on filtre la liste.

### `Listing#selectedItems()` ou `Listing#getSelection()`

Retourne la liste des instances (du propriétaire) qui sont sélectionnées.

### `Listing#setSelectionTo(...)`

Met la sélection à la valeur envoyée ou aux valeurs envoyées en premier argument. Le second argument permet de définir des options.

```javascript

<Listing>#setSelectionTo([<...désignants items...>], {<options>})

```

La désignation des items peut avoir plusieurs formes :

* un identifiant d'[instance propriétaire],
* l'[instance propriétaire] elle-même,
* un array des identifiants des instances à sélectionner,
* un array des instances propriétaire à séletionner,
* un array d'arrays contenant [`<identifiant/instance>`, `<class CSS>`].

La dernière méthode permet de mettre des sélections dans un style personnalisé. À la déselection, tous ces styles seront supprimés.

Les options :

~~~

keep: true        Garde la sélection actuelle
                  Sinon, tous les éléments sélectionnés sont désélectionnés.

~~~





<a name="ownerinstance"></a>

## Instances propriétaires

Une « instance de propriétaire » désigne l'instance de la classe qui possède le listing.

Cette instance est soumise à certaines contraintes qu'on peut trouver dans la partie [Conformité du propriétaire du listing](#ownerconfirmite).

Dès qu'elles sont introduites dans le listing, on leur colle une nouvelle propriété `listingItem` qui contient leur instance `{ListingItem}` dans le listing. Cela permet d'effectuer des opérations directement sur ces items de liste.



## Nouvelle méthodes/propriétés propriétaire (classe)

### `<owner>.selectedOne`

Retourne l’item sélectionné dans le listing, mais seulement s’il est unique.

## Nouvelles méthodes propriétaire (instances)

Quand on lie un listing à un propriétaire, ce listing ajoute aussi de nouvelles méthodes (cf. la méthode d’instance `Listing#prepareOwner`)

### `<item owner>.select()`

Permet de sélectionner l’instance du propriétaire `<item owner>` dans le listing.



### `<item owner>.deselect()`

Désélectionne l’instance propriétaire dans le listing.



## Nouvelles propriétés du propriétaire (instances)



### `<item owner>.listingItem`

Retourne l’instance `Listing::ListingItem` de l’objet du listing associé à l’instance du propriétaire.

### `<item owner>.listingItem.addClass('<class css>')`

Pour ajouter une class CSS à un item de liste.

### `<item owner>.listingItem.removeClass('<class css>')`

Pour retirer une class CSS à un item de liste.



## Méthodes propriétaire utiles

### Méthode appelée quand on sélectionne un élément dans le listing

Par défaut, cette méthode est `Propriétaire#onSelect(item)`.

Mais on peut définir une méthode propre dans l'[instanciation du listing][] avec la propriété `onSelect`.

### Méthode propriétaire appelée quand on déselectionne un item

Par défaut, cette méthode est `Propriétaire#onDeselect(item)`.

Mais on peut définir une méthode propre dans l'[instanciation du listing][] avec la propriété `onDeselect`.

### Appelée quand on désélectionne tout

~~~javascript
<owner>.onDeselectAll(){
  
}
~~~




### Méthode appelée quand on ajoute un élément dans le listing

Par défaut, cette méthode est `Propriétaire#onAdd(item)`.

Mais on peut définir une méthode propre au cours de l'[instanciation du listing][] avec la propriété `onAdd`.


[propriétaire du listing]: #ownerlisting
[instance de propriétaire]: #ownerinstance
[instances de propriétaire]: #ownerinstance
[Instanciation du listing]: #instanciation
[instanciation du listing]: #instanciation
