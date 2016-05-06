/**
 * Created by chenjianhui on 16/5/2.
 */
require.config({
    baseUrl: '../../js',
    shim: {
        'lib/jquery-ui': {
            deps: ['lib/jquery']
        },
        'lib/jquery.htmlClean': {
            deps: ['lib/jquery']
        },
        'lib/bootstrap': {
            deps: ['lib/jquery']
        },
        'lib/jquery.ztree.core': {
            deps: ['lib/jquery']
        }
    }
});

require(['lib/bootstrap'],function(bootstrap){
        consle.log("test");
})