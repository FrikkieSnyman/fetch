/* eslint-env mocha */
/* globals WHATWGFetch */

var preservedGlobals = {}
var keepGlobals = ['fetch', 'Headers', 'Request', 'Response']
var exercise = ['polyfill']

// If native fetch implementation exists, replace it with the polyfilled
// version at first. The native implementation will be restored before the
// additional `native` pass of the test suite.
if (!self.fetch.polyfill) {
  keepGlobals.forEach(function(name) {
    preservedGlobals[name] = self[name]
    self[name] = WHATWGFetch[name]
  })
  exercise.push('native')
}

exercise.forEach(function(exerciseMode) {
    suite(exerciseMode, function() {
        if (exerciseMode === 'native') {
            suiteSetup(function() {
                keepGlobals.forEach(function(name) {
                self[name] = preservedGlobals[name]
                })
            })
        }
        suite('Response.json() performance', function() {
            var iterations = 100
            var url = '/json/random/'
            var sizes = ['small', 'medium', 'large']
            
            sizes.forEach(function(size) {
                suite(size, function() {
                    var jsonTime = 0
                    var nonJsonTime = 0
                    var sizeUrl = url + size;
                    test("fetching " + iterations + " times (w accept header)", async function () {
                        for (var i = 0; i < iterations + 50; i++) {
                            var start = performance.now()
                            var response = await fetch(sizeUrl, {
                                headers: {
                                    Accept: "application/json"
                                }
                            })
                            await response.json()
                            if (i > 50) {
                                jsonTime += performance.now() - start
                            }
                        }
                    })
                    test("fetching " + iterations + " times", async function () {
                        for (var i = 0; i < iterations + 50; i++) {
                            var start = performance.now()
                            var response = await fetch(sizeUrl)
                            await response.json()
                            if (i > 50) {
                                nonJsonTime += performance.now() - start
                            }
                        }
                    })
                    test('average time', function() {
                        console.log(`${size}: Average time`);
                        console.log(`no header: ${nonJsonTime / iterations} 'ms`)
                        console.log(`w accept header: ${jsonTime / iterations} 'ms`)
                        console.log(`improvement: ${(nonJsonTime / iterations) - (jsonTime / iterations)} 'ms`)
                    })
                })
            })
        })    
    })
})

