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

set @dataset=8;
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





#---------------------------------
#import ROAM Values

#Load data into ztemp from log
LOAD DATA INFILE '/tmp/rssi_extracted/myRoams.log' INTO TABLE ztemp 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n' STARTING BY ':'
IGNORE 0 LINES 
(@dummy, @dummy, @dummy, collect_time, x, y, ap, rssi, br, @dummy);

#populate dataset table
set @currentDate = concat(MONTH(NOW()),'-',DAY(NOW()),'-',YEAR(NOW()));
INSERT IGNORE INTO datasets (name,logdate) 
	VALUES (@currentDate, NOW());
set @dataset = LAST_INSERT_ID();

#populate ap table
INSERT IGNORE INTO aps (mac,channel) 
	SELECT DISTINCT(ap),0 FROM ztemp;

#merge temp into rssi
INSERT IGNORE INTO rssi (x,y,ap_id,rssi_val, br_val,record_count, dataset_id) 
	SELECT t.x,t.y,t.ap,avg(t.rssi), avg(t.br), count(t.rssi),@dataset FROM ztemp t GROUP BY t.x, t.y, t.ap;

DROP TABLE ztemp;