'use strict';

$(document).ready(function(){
  demarrerApplication().then( () => {
    CURRENT_ANALYSE && openAnalyse(CURRENT_ANALYSE)
  })
})
