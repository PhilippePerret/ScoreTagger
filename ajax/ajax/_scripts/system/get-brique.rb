# encoding: UTF-8

begin
  path = File.join(APP_FOLDER,'html', Ajax.param(:rpath))
  path << '.htm' unless File.exists?(path)
  path << 'l' unless File.exists?(path)
  raise "Impossible de trouver la brique #{Ajax.param(:rpath)}" unless File.exists?(path)
  Ajax << {
    message: '',
    error: nil,
    brique: File.read(path).force_encoding('utf-8')
  }
rescue Exception => e
  Ajax.error(e)
end
