module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    coffee:
      compile:
        files:
          'lib/coffee_machine.js': 'src/coffee_machine.coffee'

    watch:
      coffee:
        files: ['src/coffee_machine.coffee']
        tasks: ["coffee", "uglify"]

    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= pkg.version %> */\n"

      dist:
        src: 'lib/coffee_machine.js'
        dest: 'lib/coffee_machine.min.js'

    vows:
      all:
        src: "test/*",
        options:
          reporter : "spec"

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-vows-runner'

  grunt.registerTask 'default', ['coffee', 'uglify']
  grunt.registerTask 'build', ['vows', 'coffee', 'uglify']
  grunt.registerTask 'test', ['vows']
