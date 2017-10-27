$(document).ready(function(){
	InitTimeline();
	ractive.set(data);
});
function InitTimeline(){
	window.ractive = new Ractive({
		el: 'body',
		template: '#template',
		append: true,
		data : {},
		init_timeline: function(){
			this.timeline = $(this.el).find('.cd-horizontal-timeline');
			this.timeline.horizontal_timeline(80);
		},
		destroy_timeline: function(){
			this.timeline.horizontal_timeline().destroy();
		},
		oncomplete: function(){

			this.init_timeline();
		},
		onunrender: function(){
			this.destroy_timeline();
		}
	});
}
var data = {
	"TIMELINE_DATA": [
	{
		"DATE": "21.12.2016",
		"TIME": "17:15:48",
		"STATUS": "Active",
		"VERSION": 1,
		"CURRENT": true
	},
	{
		"DATE": "22.12.2016",
		"TIME": "18:15:48",
		"STATUS": "Active",
		"VERSION": 2,
		"CURRENT": false
	},
	{
		"DATE": "23.12.2016",
		"TIME": "17:15:48",
		"STATUS": "Active",
		"VERSION": 3,
		"CURRENT": false
	},
	{
		"DATE": "24.12.2016",
		"TIME": "17:15:48",
		"STATUS": "Active",
		"VERSION": 4,
		"CURRENT": false
	},
	{
		"DATE": "25.12.2016",
		"TIME": "17:15:48",
		"STATUS": "Active",
		"VERSION": 5,
		"CURRENT": false
	},
	{
		"DATE": "26.12.2017",
		"TIME": "17:15:48",
		"STATUS": "Active",
		"VERSION": 6,
		"CURRENT": false
	},
	{
		"DATE": "27.12.2018",
		"TIME": "17:15:48",
		"STATUS": "Active",
		"VERSION": 7,
		"CURRENT": false
	}
	]
};