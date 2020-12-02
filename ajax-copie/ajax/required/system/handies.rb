# encoding: UTF-8


# Pour requérir un module dans le dossier module
def require_module modname
  require_relative "../../module/#{modname}"
end
