'use strict';

$(document).ready(function(){
  Prefs.load() // chargement des préférences
  App.initialisation()
  .then(App.start.bind(App))
  .catch(onError)
})
