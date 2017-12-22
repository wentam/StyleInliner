module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      build: {
        src: ['library/styleInliner.js'],
        dest: 'build/styleInliner.js'
      }
    },
    uglify: {
      build: {
        files: {
          'build/styleInliner.min.js' : ['build/styleInliner.js'],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat','uglify']);
};
