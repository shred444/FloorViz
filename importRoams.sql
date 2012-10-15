#create temporary table
DROP TABLE TempRoam;
CREATE TABLE TempRoam (
	roamtime datetime,
	du_id INT(11),
	x INT(11),
	y INT(11),
	duration FLOAT,
	destAP varchar(25)
);


#Load data into ztemp from log
LOAD DATA INFILE '/tmp/rssi_extracted/myRoams.log' INTO TABLE TempRoam 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
IGNORE 0 LINES 
(x,y,roamtime,@dummy,destAP, duration, du_id);
#set dataset_id=1;

Select * from TempRoam;

#get most recent dataset
set @dataset=(select data_id from datasets order by logdate desc limit 1);
select @dataset;

#merge temp into roams
INSERT IGNORE INTO roams (roam_time,du_id,x,y,duration,origin_ap,dest_ap,dataset_id) 
	SELECT 	t.roamtime, 
			t.du_id, 
			t.x, 
			t.y, 
			t.duration, 
			(SELECT destAP from TempRoam where du_id=t.du_id AND destAP <> t.roamtime order by roamtime desc limit 1), 
			t.destAP, 
			@dataset 
	FROM TempRoam t;


