# encoding: UTF-8

# JOUER CMD-i dans Atom (ou Cmd-r dans TextMate) pour lancer cette application

THIS_APP_FOLDER = File.basename(File.expand_path('.'))
BROWSER = 'Safari'

`open -a #{BROWSER} "http://localhost/#{THIS_APP_FOLDER}"`
