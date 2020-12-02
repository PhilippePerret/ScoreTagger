# encoding: UTF-8
require 'cgi'
require 'json'

class Ajax
  class << self

    def treate_request
      STDOUT.write "Content-type: application/json; charset:utf-8;\n\n"

      # Le script doit exister
      self << {
        script: param(:script)
      }
      script_fullpath = File.expand_path(File.join('.','ajax','_scripts',param(:script)))
      if File.exists?(script_fullpath)
          begin
            require_relative "./_scripts/#{param(:script)}"
          rescue Exception => e
            raise e # pour le moment
          end
      else
        self << {error: "Le script '#{script_fullpath}' est introuvable…"}
      end

      # On ajoute au retour, le script joué et les clés envoyés en
      # paramètres CGI
      self << {
        # 'ran_script': script,
        'transmited_keys': cgi.params.keys.join(', '),
        'APP_FOLDER': APP_FOLDER
      }
      # Débug : pour voir ce que reçoit
      # self << {
      #   # params: cgi.params.inspect,
      #   script: script,
      #   args: args,
      #   message: message
      # }
      STDOUT.write data.to_json+"\n"
    rescue Exception => e
      error = Hash.new
      error.merge!(error: Hash.new)
      error[:error].merge!(message: e.message)
      error[:error].merge!(backtrace: e.backtrace)
      STDOUT.write error.to_json
    end

    # # Retourne l'argument de clé +key+
    # def arg key
    #   args[key.to_s]
    # end
    #
    # # ---------------------------------------------------------------------
    # Pour ajouter des données à renvoyer
    # Utiliser : Ajax << {ma: "data"}
    def << hashdata
      @data ||= {}
      @data.merge!(hashdata)
    end
    def data
      @data ||= {}
    end

    # Pour mettre dans le rescue des scripts (cf. manuel)
    def error e
      log("ERREUR: #{e.message}")
      log("BACTRACE ERREUR: #{e.backtrace.join(RC)}")
      self << {error: e.message, backtrace: e.backtrace}
    end

    def param key
      # v = cgi.params[key.to_s]
      # v = v[0] if v.count == 1

      # cf. mode d'emploi
      return nil if cgi.params[key.to_s].empty?
      # log("cgi.params[#{key.inspect}.to_s] = #{cgi.params[key.to_s].inspect}")
      v, typeV = JSON.parse(cgi.params[key.to_s][0])
      # log("v,typeV de #{key.inspect} = #{v.inspect}, #{typeV.inspect}")
      return case typeV
      when 'number' then v = v.to_i
      when 'boolean'  then v = v
      when 'json'     then v = JSON.parse(v)
      else v
      end
    end
    def cgi
      @cgi ||= CGI.new('html4')
    end

  end #/ << self
end
