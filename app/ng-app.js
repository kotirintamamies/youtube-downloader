var youtube = angular.module('youtube', []);

youtube.controller('main', function($rootScope, $http, $scope) 
{
    var converter = require('video-converter');
    var fs = require('fs')
    
    var youtubedl = require('youtube-dl');
    
    converter.setFfmpegPath(
        require('path').dirname(require.main.filename)+"\\ffmpeg.exe", function(err) {
        if (err) throw err
    });
    
    $rootScope.file={};
    $rootScope.mp3=true
    $rootScope.saveFolder = process.env.USERPROFILE+'\\Downloads'
    
    fs.readFile(require('path').dirname(require.main.filename)+'\\settings.json',
               'utf8', function(err, data){
        if (err)
        {
            $rootScope.saveSettings()
        }
        if (data.length)
        {
            var sett = JSON.parse(data)
            if (sett.saveFolder) $rootScope.saveFolder = sett.saveFolder
            if (sett.mp3) $rootScope.mp3 = sett.mp3
            }
        else
        {
            $rootScope.saveSettings()
        }
    })
    
    $rootScope.videos = []
    $rootScope.current=""
    
    $rootScope.saveSettings = function()
    {
        fs.writeFile(require('path').dirname(require.main.filename)+
            '\\settings.json',
            JSON.stringify(
            {
                saveFolder: $rootScope.saveFolder,
                mp3: $rootScope.mp3
            }),
            function(err){})
    }
    
    $scope.folderChange = function()
    {
        $rootScope.saveFolder = document.getElementById('folderSelect').value
    }
    
    

    
    $rootScope.check = function(url){ 
        $http.get(url)
        .success(function(){
            var yti = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)

        $rootScope.videos.push({img: 'http://i3.ytimg.com/vi/'+yti[1]+'/default.jpg', url: url})
        })
        
    }
    $rootScope.del = function (index)
    {
        $rootScope.videos.splice(index, 1)
        $rootScope.$apply
    }
    
    
    
    $rootScope.downloadVideos = function(){
        let i = 0
        $rootScope.videos.forEach(function(obj){
            obj.working=true
            let video = youtubedl(obj.url,
          ['--format=18'],
          { cwd: __dirname })
          let output = ""
          video.on('info', function(info) {
            output = $rootScope.saveFolder+"\\" + info.title.replace(/\W/g, ' ')
            video.pipe(fs.createWriteStream(output + ".mp4"))
          })

          video.on('end', function () {
            if ($rootScope.mp3) converter.convert(output + ".mp4", output + ".mp3", function(err) {
                if (err) throw err
                fs.unlinkSync(output + ".mp4")
                obj.finished=true
                i++
                $rootScope.$apply()
                if (i==$rootScope.videos.length) 
                {
                    $rootScope.videos=[]
                    $rootScope.$apply()
                }
                })
              else
              {
                obj.finished=true
                i++
                $rootScope.$apply()
                if (i==$rootScope.videos.length) 
                {
                    $rootScope.videos=[]
                    $rootScope.$apply()
                }
              }
          })
    })
    }
    

    
})