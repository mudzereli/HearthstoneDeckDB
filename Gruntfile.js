module.exports = function(grunt) {
 
  // configure the tasks
  grunt.initConfig({
 
   'gh-pages': {
      options: {
        base: 'build'
      },
      src: ['**']
    },
    
    copy: {
      build: {
        cwd: 'source',
        src: [ '**', '!**/*.less', '!**/*.coffee', '!**/*.jade'],
        dest: 'build',
        expand: true
      },
    },

   clean: {
      build: {
        src: [ 'build' ]
      },
      stylesheets: {
        src: [ 'build/**/*.css', 'build/css/**', '!build/stylesheet.min.css', '!build/bootstrap-3.3.4-dist/**', '!build/hearthstonejson-dist/**', '!build/deckdb-dist/**' ]
      },
      scripts: {
        src: [ 'build/**/*.js', 'build/js/**', '!build/javascript.min.js', '!build/bootstrap-3.3.4-dist/**', '!build/hearthstonejson-dist/**', '!build/deckdb-dist/**' ]
      }
    },

    less: {
      development: {
        files: {"build/stylesheet.css": "source/css/main.less"}
      },
      production: {
        options: {
          cleancss: true
        },
        files: {"build/stylesheet.css": "source/css/main.less"}
      }
    },

    autoprefixer: {
      build: {
        expand: true,
        cwd: 'build',
        src: [ '**/*.css' ],
        dest: 'build'
      }
    },

    cssmin: {
      build: {
        files: {
          'build/stylesheet.min.css': [ 'build/**/*.css', '!build/bootstrap-3.3.4-dist/**', '!build/hearthstonejson-dist/**', '!build/deckdb-dist/**' ]
        }
      }
    },

    coffee: {
      build: {
        expand: true,
        cwd: 'source',
        src: [ '**/*.coffee' ],
        dest: 'build',
        ext: '.js'
      }
    },

    uglify: {
      build: {
        options: {
          mangle: false
        },
        files: {
          'build/javascript.min.js': ['source/js/decks.js', 'source/js/main.js', 'source/js/app.js', '!build/bootstrap-3.3.4-dist/**', '!build/hearthstonejson-dist/**', '!build/deckdb-dist/**' ]
        }
      }
    },

    jade: {
      compile: {
        options: {
          data: {}
        },
        files: [{
          expand: true,
          cwd: 'source',
          src: [ '**/*.jade' ],
          dest: 'build',
          ext: '.html'
        }]
      }
    },

    watch: {
      stylesheets: {
        files: ['source/**/*.less', 'source/**/*.css'],
        tasks: [ 'stylesheets' ]
      },
      scripts: {
        files: ['source/**/*.coffee', 'source/**/*.js'],
        tasks: [ 'scripts' ]
      },
      jade: {
        files: 'source/**/*.jade',
        tasks: [ 'jade' ]
      },
      copy: {
        files: [ 'source/**', '!source/**/*.less', '!source/**/*.coffee', '!source/**/*.jade', '!source/**/*.css', '!source/**/*.js' ],
        tasks: [ 'copy' ]
      }
    },

    connect: {
      server: {
        options: {
          port: 3333,
          base: 'build',
          hostname: '*'
        }
      }
    }
  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-gh-pages');

  // define the tasks
  grunt.registerTask(
    'stylesheets',
    'Compiles the stylesheets.',
    [ 'less', 'autoprefixer', 'cssmin', 'clean:stylesheets' ]
  );
   
  grunt.registerTask(
    'scripts',
    'Compiles the JavaScript files.',
    [ 'coffee', 'uglify', 'clean:scripts' ]
  );

  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    [ 'clean:build', 'copy', 'stylesheets', 'scripts', 'jade' ]
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically builds them and runs a server.',
    [ 'build', 'connect', 'watch' ]
  );

  grunt.registerTask('deploy', ['gh-pages']);
};