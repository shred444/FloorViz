var filter = new Object();
		filter.timeRange = new Object();
		rawData = new Object(); 
		//var timeRange = new Object();
		filter.timeRange.now = new Date();
		filter.timeRange.min = new Date();
		filter.timeRange.max = new Date();
		filter.duration = new Object();
		filter.duration.min = 1;
		filter.duration.max = 60;
		filter.dataColumn = "rssi_val";
		filter.roams = new Object();
		filter.roams.enabled = true;
		filter.roams.atoa = true;
		filter.roams.atob = true;
		filter.roams.where = "0";
		filter.timeouts = new Object();
		filter.timeouts.fatalcomms = true;
		
	function filterRefresh(){
		if(filter.roams.atob && !filter.roams.atoa)
			var dest = "AND origin_ap <> dest_ap";
		else if(filter.roams.atoa && !filter.roams.atob)
			var dest = "AND origin_ap = dest_ap";
		else
			var dest = "";
			
		filter.timeRange.where = ' roam_time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" ';
		filter.roams.where = ' duration BETWEEN ' + filter.duration.min + ' AND ' + filter.duration.max + ' AND roam_time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" ' + dest + ' ';
		
		if(filter.roams.du_id)
			filter.roams.where += ' AND du_id=' + filter.roams.du_id + ' ';
			
		if(filter.timeouts.fatalcomms)	
			filter.timeouts.where = ' error = 2002 AND time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" ';
		else
			filter.timeouts.where = ' 0 ';
		if(filter.roams.du_id)
			filter.timeouts.where += ' AND du_id=' + filter.roams.du_id + ' ';
			
		if(typeof pieRefresh == 'function') pieRefresh();
		if(typeof roamRefresh == 'function') roamRefresh();
		if(typeof drawRoams == 'function') drawRoams();
		if(typeof histRefresh == 'function') histRefresh();
		if(typeof drawTimeouts == 'function') drawTimeouts();
	}
	
	function roamCheck(){
		filter.roams.enabled = document.getElementById('roam-checkbox').checked;
		filter.roams.atoa = document.getElementById('AtoA-checkbox').checked;
		filter.roams.atob = document.getElementById('AtoB-checkbox').checked;
		document.getElementById('AtoA-checkbox').disabled = !filter.roams.enabled;
		document.getElementById('AtoB-checkbox').disabled = !filter.roams.enabled
		
			
		filterRefresh();
	}
	
	function timeoutCheck(){
		
		filter.timeouts.fatalcomms = document.getElementById('fatalcomms-checkbox').checked;
		
		filterRefresh();
	}