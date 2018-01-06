module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      build: {
        src: ['library/StyleInliner.js'],
        dest: 'build/StyleInliner.js'
      }
    },
    uglify: {
      build: {
        files: {
          'build/StyleInliner.min.js' : ['build/StyleInliner.js'],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat','uglify']);
};
