        (function() {
            'use strict';
            var devtools = {
                open: false,
                orientation: null
            };
            var threshold = 160;
            var emitEvent = function(state, orientation) {
                window.dispatchEvent(new CustomEvent('devtoolschange', {
                    detail: {
                        open: state,
                        orientation: orientation
                    }
                }));
            };

            setInterval(function() {
                var widthThreshold = window.outerWidth - window.innerWidth > threshold;
                var heightThreshold = window.outerHeight - window.innerHeight > threshold;
                var orientation = widthThreshold ? 'vertical' : 'horizontal';

                if (!(heightThreshold && widthThreshold) &&
                    ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
                    if (!devtools.open || devtools.orientation !== orientation) {
                        emitEvent(true, orientation);
                    }

                    devtools.open = true;
                    devtools.orientation = orientation;
                } else {
                    if (devtools.open) {
                        emitEvent(false, null);
                    }

                    devtools.open = false;
                    devtools.orientation = null;
                }
            }, 500);

            if (typeof module !== 'undefined' && module.exports) {
                module.exports = devtools;
            } else {
                window.devtools = devtools;
            }
        })();

        // check if it's open
        //console.log('is DevTools open?', window.devtools.open);
        // check it's orientation, null if not open
        //console.log('and DevTools orientation?', window.devtools.orientation);

        // get notified when it's opened/closed or orientation changes
        /*window.addEventListener('devtoolschange', function(e) {
            console.log('changed');
            console.log('is DevTools open?', e.detail.open);
            console.log('and DevTools orientation?', e.detail.orientation);
        });*/