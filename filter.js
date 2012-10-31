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
		filter.rssi = new Object();
		filter.rssi.aps = [];
		
	function filterRefresh(){
		if(filter.roams.atob && !filter.roams.atoa)
			var dest = "AND origin_ap <> dest_ap";
		else if(filter.roams.atoa && !filter.roams.atob)
			var dest = "AND origin_ap = dest_ap";
		else
			var dest = "";
			
		filter.timeRange.where = ' roam_time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" ';
		filter.roams.where = ' duration BETWEEN ' + filter.duration.min + ' AND ' + filter.duration.max + ' AND roam_time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" ' + dest + ' ';
		
		//filter out certain du-ids
		//filter.roams.where += ' AND du_id <> 5517 AND du_id <> 5519 AND du_id <> 5552 AND du_id <> 5610 AND du_id <> 5612 AND du_id <>5627 AND du_id <> 5659 AND du_id <> 5670 AND du_id <> 5683 AND du_id <> 5687 AND du_id <> 5720 AND du_id <> 5736 ';
		
		if(filter.roams.du_id)
			filter.roams.where += ' AND du_id=' + filter.roams.du_id + ' ';
			
		if(filter.timeouts.fatalcomms)	
			filter.timeouts.where = ' error = 2002 AND time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" ';
		else
			filter.timeouts.where = ' 0 ';
		if(filter.roams.du_id)
			filter.timeouts.where += ' AND du_id=' + filter.roams.du_id + ' ';
			
			
		//rssi filtering
		filter.rssi.where = ' (';
		for (x in filter.rssi.aps){
			if(filter.rssi.aps[x])
				filter.rssi.where += ' ap_id = \"' + x + '\" OR ';
		}
		filter.rssi.where += ' 0) ';
		//alert(filter.rssi.where);
		
		if(typeof pieRefresh == 'function') pieRefresh();
		if(typeof roamRefresh == 'function') roamRefresh();
		if(typeof drawRoams == 'function') drawRoams();
		if(typeof histRefresh == 'function') histRefresh();
		if(typeof drawTimeouts == 'function') drawTimeouts();
		if(typeof redraw == 'function') redraw();
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