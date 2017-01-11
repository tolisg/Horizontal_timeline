;(function ($, window, document, undefined) {

    var pluginName = "horizontal_timeline",
    dataKey = "plugin_" + pluginName;
    var Plugin = function (element, options) {
        this.element = element;
        var eventsMinDistance = options ? options : 90;
        this.initTimeline(this.element, options);
    };

    Plugin.prototype = {
        initTimeline: function (timelines , options) {
            var eventsMinDistance = options;
            var self=this;
            timelines.each(function(){
                var timeline = $(this),
                timelineComponents = {};
                //cache timeline components 
                timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
                timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
                timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
                timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
                timelineComponents['timelineDates'] = self.parseDate(timelineComponents['timelineEvents']);
                timelineComponents['eventsMinLapse'] = self.minLapse(timelineComponents['timelineDates']);
                timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
                timelineComponents['eventsContent'] = timeline.children('.events-content');

                //assign a left postion to the single events along the timeline
                self.setDatePosition(timelineComponents, eventsMinDistance);
                //assign a width to the timeline
                var timelineTotWidth = self.setTimelineWidth(timelineComponents, eventsMinDistance);
                //the timeline has been initialize - show it
                timeline.addClass('loaded');

                //detect click on the next arrow
                timelineComponents['timelineNavigation'].on('click', '.next', function(event){
                    event.preventDefault();
                    self.updateSlide(timelineComponents, timelineTotWidth, 'next', eventsMinDistance);
                });
                //detect click on the prev arrow
                timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
                    event.preventDefault();
                    self.updateSlide(timelineComponents, timelineTotWidth, 'prev', eventsMinDistance);
                });
                //detect click on the a single event - show new event content
                timelineComponents['eventsWrapper'].on('click', 'a', function(event){
                    event.preventDefault();
                    timelineComponents['timelineEvents'].removeClass('selected');
                    $(this).addClass('selected');
                    self.updateOlderEvents($(this));
                    self.updateFilling($(this), timelineComponents['fillingLine'], timelineTotWidth);
                });
            });
        },

        updateSlide: function (timelineComponents, timelineTotWidth, string, eventsMinDistance) {
            //retrieve translateX value of timelineComponents['eventsWrapper']
            var self = this;
            var translateValue = self.getTranslateValue(timelineComponents['eventsWrapper']),
            wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
            //translate the timeline to the left('next')/right('prev') 
            if(string == 'next'){
                this.translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
            }
            else {
                this.translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);
            }
        },

        updateTimelinePosition: function (string, event, timelineComponents) {
            //translate timeline to the left/right according to the position of the selected event
            var eventStyle = window.getComputedStyle(event.get(0), null),
            eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
            timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
            timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', '')),
            self = this;
            var timelineTranslate = self.getTranslateValue(timelineComponents['eventsWrapper']);
            if( (string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < - timelineTranslate) ) {
               self.translateTimeline(timelineComponents, - eventLeft + timelineWidth/2, timelineWidth - timelineTotWidth);
            }
        },

        translateTimeline: function (timelineComponents, value, totWidth) {
            var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
            value = (value > 0) ? 0 : value; //only negative translate value
            value = ( !(typeof totWidth === 'undefined') &&  value < totWidth ) ? totWidth : value; //do not translate more than timeline width
            this.setTransformValue(eventsWrapper, 'translateX', value+'px');
            //update navigation arrows visibility
            (value == 0 ) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
            (value == totWidth ) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');
        },

        updateFilling: function (selectedEvent, filling, totWidth) {
            //change .filling-line length according to the selected event
            var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
            eventLeft = eventStyle.getPropertyValue("left"),
            eventWidth = eventStyle.getPropertyValue("width");
            eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', ''))/2;
            var scaleValue = eventLeft/totWidth;
            this.setTransformValue(filling.get(0), 'scaleX', scaleValue);
        },

        setDatePosition: function (timelineComponents, min) {
            toret =[];
            toret[0] = 0;
            sum = 0;
            var self=this;
            for (i = 0; i < timelineComponents['timelineDates'].length; i++) { 
                var distance = self.daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][i]),
                    /*================================Custome Code===================================================*/
                    //to reduce tha max distance between 2 events we set tha max distance
                    distanceNorm = Math.round(distance/timelineComponents['eventsMinLapse']);
                    toret[i+1] = distanceNorm;
                    var diff= toret[i+1]- toret[i];
                    if (diff > 4){ sum += 5; }
                    else if ((diff == 0) && (i > 0)) { sum += 1; }
                    else { sum += diff; }
                    /*================================================================================================*/
                    timelineComponents['timelineEvents'].eq(i).css('left', sum*min+'px');
            }
        },

        setTimelineWidth: function (timelineComponents, width) {
            var timeSpan = this.daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][timelineComponents['timelineDates'].length-1]),
            timeSpanNorm = timeSpan/timelineComponents['eventsMinLapse'],
            timeSpanNorm = Math.round(timeSpanNorm) + 4,
            totalWidth = timeSpanNorm*width,
            self= this;
            timelineWraperWidth = timelineComponents['timelineWrapper'].width();
            /* ===========custom max width not the original ============================== */
            var eventleft = parseInt(timelineComponents['timelineEvents'].eq(timelineComponents['timelineDates'].length-1).css('left').replace('px', ''));
            var eventwidth = parseInt(timelineComponents['timelineEvents'].eq(timelineComponents['timelineDates'].length-1).css('width').replace('px', ''));
            totalWidth = eventleft +eventwidth;
            if (totalWidth < timelineWraperWidth) { totalWidth = timelineWraperWidth; }
            /* =========================================================================== */
            timelineComponents['eventsWrapper'].css('width', totalWidth+'px');
            self.updateFilling(timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents['fillingLine'], totalWidth);
            self.updateTimelinePosition('next', timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents);

            return totalWidth;
        },

        updateOlderEvents: function (event) {
            event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
        },

        getTranslateValue: function (timeline) {
            var timelineStyle = window.getComputedStyle(timeline.get(0), null),
            timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
            timelineStyle.getPropertyValue("-moz-transform") ||
            timelineStyle.getPropertyValue("-ms-transform") ||
            timelineStyle.getPropertyValue("-o-transform") ||
            timelineStyle.getPropertyValue("transform");

            if( timelineTranslate.indexOf('(') >=0 ) {
                var timelineTranslate = timelineTranslate.split('(')[1];
                    timelineTranslate = timelineTranslate.split(')')[0];
                    timelineTranslate = timelineTranslate.split(',');
                    var translateValue = timelineTranslate[4];
                } else {
                    var translateValue = 0;
                }

                return Number(translateValue);
        },

        setTransformValue: function (element, property, value) {
            element.style["-webkit-transform"] = property+"("+value+")";
            element.style["-moz-transform"] = property+"("+value+")";
            element.style["-ms-transform"] = property+"("+value+")";
            element.style["-o-transform"] = property+"("+value+")";
            element.style["transform"] = property+"("+value+")";
        },

        //based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
        parseDate: function (events) {
            var dateArrays = [];
            events.each(function(){
                var singleDate = $(this),
                dateComp = singleDate.data('date').split('T');
                if( dateComp.length > 1 ) { //both DD.MM.YEAR and time are provided
                    var dayComp = dateComp[0].split('.'),
                    timeComp = dateComp[1].split(':');
                } else if( dateComp[0].indexOf(':') >=0 ) { //only time is provide
                    var dayComp = ["2000", "0", "0"],
                    timeComp = dateComp[0].split(':');
                } else { //only DD.MM.YEAR
                    var dayComp = dateComp[0].split('.'),
                    timeComp = ["0", "0"];
                }
                var newDate = new Date(dayComp[2], dayComp[1]-1, dayComp[0], timeComp[0], timeComp[1]);
                dateArrays.push(newDate);
            });
            return dateArrays;
        },

        daydiff: function (first, second) {
            return Math.round((second-first));
        },

        minLapse: function (dates) {
            //determine the minimum distance among events
            var dateDistances = [];
            var self = this;
            for (i = 1; i < dates.length; i++) { 
                var distance = self.daydiff(dates[i-1], dates[i]);
                dateDistances.push(distance);
            }
            return Math.min.apply(null, dateDistances);
        }, 

        destroy: function () {
            this.unbindEvents();
        },

        unbindEvents: function () {
            this.element.find('.cd-timeline-navigation').off('click', '.next');
            this.element.find('.cd-timeline-navigation').off('click', '.prev');
            this.element.find('.events-wrapper').children('.events').off('click', 'a');
        }
    };

    /*
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
    */
    $.fn[pluginName] = function (options) {
        
        var plugin = this.data(dataKey);
        // has plugin instantiated ?
        if (plugin instanceof Plugin) {
            // if have options arguments, call plugin.init() again
            if (typeof options !== 'undefined') {
                plugin.initTimeline(options);
            }
        } else {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };
}(jQuery, window, document));
