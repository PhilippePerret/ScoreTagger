# encoding: UTF-8
=begin
  Pour faire des essais
=end
require 'uri'
require 'net/http'

# POD_PRODUCT_ID
POD_PACKAGE_ID = (
  "0827X1169" + # A4
  "BW"        + # NOIR & BLANC ('FC' pour couleur)
  "SDT"       + # print type standard ('PRE' pour premium)
  "CO"        + # reliure (coilm)
  "080CW444"  + # qualité papier 80# coated white (pourrait être aussi 060UW444)
  "444"       + # PPI
  "M"         + # Finition (Mat)
  'X'         + # linen type (dos ?) aucun
  'X'           # transparent ? aucun
  ).freeze

=begin
RELIURES
case binding            Reliure livre           CW
perfect binding         Thermocollée            PB
saddle stitch           Aggrafé                 SS
Comb, spiral, thermal   Réglette
Coil                    Réglette plastique      CO
Wire O                  Réglette métale         WO
Linen wrap ?
=end

API_LULU = 'https://api.lulu.com'
API_LULU_SANDBOX = 'https://api.sandbox.lulu.com'

def calcul_de_prix

  # url = URI("#{API_LULU_SANDBOX}/print-job-cost-calculations/")
  url = URI("#{API_LULU}/print-job-cost-calculations/")
  http = Net::HTTP.new(url.host, url.port)

  request = Net::HTTP::Post.new(url)
  request["Content-Type"] = 'application/json'
  request["Authorization"] = 'Check Authentication menu'
  request["Cache-Control"] = 'no-cache'

  request.body = <<-EOB
{
  "line_items": [
    {
      "page_count":32,
      "pod_package_id": "#{POD_PACKAGE_ID}",
      "quantity":20
    },
    {
      "page_count": 324,
      "pod_package_id": "#{POD_PACKAGE_ID}",
      "quantity": 1
    }
  ],
  "shipping_address": {
    "city":"AUBAGNE",
    "country_code":"FR",
    "postcode":"13400",
    "street1":"295, impasse des Fauvettes"
  },
  "shipping_level": "EXPRESS"
}
  EOB

  response = http.request(request)
  response.read_body

end

begin

  # ESSAI CRÉATION LULU

  require File.join(APP_FOLDER,'ajax','secret','lulu')

  # cmd = <<-EOC
  # curl -X POST #{API_LULU_SANDBOX}/auth/realms/glasstree/protocol/openid-connect/token \
  #   -d 'grant_type=client_credentials' \
  #   -H 'Content-Type: application/x-www-form-urlencoded' \
  #   -H 'Authorization: #{DATA_LULU[:basic]}'
  # EOC
  #
  # log("COMMANDE:#{RC}#{cmd}")
  # res = `#{cmd.strip}`
  #

  res = calcul_de_prix
  log("res:#{res.inspect}")

  Ajax << {message: "#{res.inspect}"}
  # Ajax << {
  #   message:"Le script essai.rb a été joué avec succès."
  # }
rescue Exception => e
  Ajax.error(e)
end
