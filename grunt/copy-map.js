/* */
'use strict';

module.exports = function ( grunt ) {

    var mapFolder = './tiled_map',
        deatpathRoot = './app/games/';

    function copyMapfiles(abspath, rootdir, subdir, filename) {
        var destpath = deatpathRoot + subdir + '/' + filename;

        if (grunt.file.exists(abspath)) {
            if (!grunt.file.isMatch({matchBase: true}, '*.tsx', destpath) && !grunt.file.isMatch({matchBase: true}, '*.tmx', destpath)) {
                
                grunt.file.copy(abspath, destpath);

                if (grunt.file.isMatch({matchBase: true}, '*.json', destpath)) {
                    
                    var jsonFileContent = grunt.file.readJSON(destpath);

                    if (jsonFileContent.tilesets) {

                        if (jsonFileContent.tilesets.length >= 0) {
                
                            for (var i = 0; i < jsonFileContent.tilesets.length; i++) {
                
                                if (grunt.file.isFile(jsonFileContent.tilesets[i].image.replace('../',deatpathRoot))) {
                                    jsonFileContent.tilesets[i].image = jsonFileContent.tilesets[i].image.replace('../',deatpathRoot).replace('app/','');
                                }
                            }
                        }
                    }
                    
                    //grunt.file.write(destpath+'.bak', JSON.stringify(jsonFileContent,null, 2));
                    grunt.file.write(destpath+'.bak', JSON.stringify(jsonFileContent) );
                    grunt.file.copy(destpath+'.bak', destpath);
                    grunt.file.delete(destpath+'.bak');

                    console.log('All tilesets.image.path changed.');
                } 
                else {
                    console.log('destpath = ', destpath, '; isMatch = false');
                }
            }
        } 
        else {
            console.error('File ' + abspath + ' not exists!');
        }
    }

    grunt.registerTask('copy-map', 'copy game map', function() {
        
        if (grunt.file.exists(mapFolder)) {
            grunt.file.recurse(mapFolder, copyMapfiles);
        }
    });
} 