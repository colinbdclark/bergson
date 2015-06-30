/*
* Bergson Scheduler
* http://github.com/colinbdclark/bergson
*
* Copyright 2015, Colin Clark
* Dual licensed under the MIT and GPL Version 2 licenses.
*/
(function () {
    "use strict";

    fluid.defaults("berg.scheduler", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],

        members: {
            queue: "@expand:berg.priorityQueue()"
        },

        components: {
            clock: {
                type: "berg.clock.offline" // Should be supplied by the user.
            }
        },

        invokers: {
            /**
             * Causes the scheduler to evaluate its
             * queue of scheduled callback and fire those that
             * are appropriate for the current clock time.
             *
             * @param {Number} time - the current clock time
             */
            tick: "berg.scheduler.tick({arguments}.0, {arguments}.1, {that}.queue)",

            /**
             * Schedules one or more score specifications.
             *
             * @param {Object||Array} scoreSpecs - the score specifications to schedule
             */
            schedule: "berg.scheduler.schedule({arguments}.0, {that}.clock)",

            /**
             * Schedules a callback to be fired once at the specified time.
             *
             * @param {Number} time - the time from now, in seconds, to schedule the callback
             * @param {Function} callback - the callback to schedule
             */
            once: "berg.scheduler.once({arguments}.0, {arguments}.1, {that})",

            /**
             * Schedules a callback to be fired repeatedly at the specified interval.
             *
             * @param {Number} interval - the interval to repeat at
             * @param {Function} callback - the callback to schedule
             */
            repeat: "berg.scheduler.repeat({arguments}.0, {arguments}.1, {that})",

            /**
             * Clears a scheduled event,
             * causing it not to be evaluated by this scheduler
             * if it hasn't already fired or is repeating.
             *
             * @param {Object} eventSpec - the event spec
             */
            clear: "{that}.queue.remove({arguments}.0)",


            /**
             * Clears all scheduled events.
             */
            clearAll: "{that}.queue.clear()"
        }
    });

    // Unsupported, non-API function.
    berg.scheduler.expandRepeatingEventSpec = function (now, eventSpec) {
        if (typeof eventSpec.time !== "number") {
            eventSpec.time = 0;
        }

        eventSpec.endTime = typeof eventSpec.endTime !== "number" ?
            Infinity : eventSpec.endTime + now;
    };

    // Unsupported, non-API function.
    berg.scheduler.scheduleEvent = function (eventSpec, that) {
        var now = that.clock.time;

        if (eventSpec.type === "repeat") {
            berg.scheduler.expandRepeatingEventSpec(now, eventSpec);
        }

        eventSpec.priority = now + eventSpec.time;
        that.queue.push(eventSpec);

        return eventSpec;
    };

    // Unsupported, non-API function.
    berg.scheduler.scheduleEvents = function (eventSpecs, that) {
        eventSpecs.forEach(function (eventSpec) {
            berg.scheduler.scheduleEvent(eventSpec, that);
        });

        return eventSpecs;
    };

    berg.scheduler.schedule = function (eventSpec, that) {
        if (fluid.isArrayable(eventSpec)) {
            berg.scheduler.scheduleEvents(eventSpec, that);
        }

        return berg.scheduler.scheduleEvent(eventSpec, that);
    };

    berg.scheduler.once = function (time, callback, that) {
        var eventSpec = {
            type: "once",
            time: time,
            callback: callback
        };

        return berg.scheduler.scheduleEvent(eventSpec, that);
    };

    berg.scheduler.repeat = function (interval, callback, that) {
        var eventSpec = {
            type: "repeat",
            freq: interval,
            time: 0,
            endTime: Infinity,
            callback: callback
        };

        return berg.scheduler.scheduleEvent(eventSpec, that);
    };

    berg.scheduler.tick = function (time, interval, queue) {
        var next = queue.peek(),
            maxTime = time + interval;

        // Check to see if this event fits within the current tick
        // (or if it's from an earlier tick in the case of a delay).
        while (next && next.priority <= maxTime) {
            // Take it out of the queue and invoke its callback.
            queue.pop();
            next.callback(time);

            // If it's a repeating event, queue it back up.
            if (next.type === "repeat" && next.endTime > time) {
                next.priority = time + next.freq;
                queue.push(next);
            }

            next = queue.peek();
        }
    };

}());
