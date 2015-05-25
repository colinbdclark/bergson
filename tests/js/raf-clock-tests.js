(function () {

    "use strict";

    QUnit.module("requestAnimationFrame clock");

    fluid.defaults("flock.test.clock.rafClockTestSuite", {
        gradeNames: ["flock.test.clock.testSuite", "autoInit"],

        dynamicComponents: {
            tester: {
                type: "flock.test.clock.realtimeExternal.tester",
                options: {
                    components: {
                        clock: {
                            type: "flock.clock.raf"
                        }
                    }
                }
            }
        },

        tests: [
            {
                name: "Initial state, default options",
                initOnly: true
            },
            {
                name: "Initial state, 30 fps",
                initOnly: true,
                expected: {
                    rate: 30
                }
            },
            {
                name: "tick() time update"
            }
        ]
    });

    var testSuite = flock.test.clock.rafClockTestSuite();
    testSuite.run();

}());
