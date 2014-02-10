module.exports = function(grunt) {
  grunt.registerTask('default', 'Log an Helloworld', function() {
    grunt.log.write('Helloworld').ok();
  });
};