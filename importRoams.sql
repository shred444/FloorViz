#Load data into ztemp from log
LOAD DATA INFILE '/tmp/myRoams.log' INTO TABLE roams 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
IGNORE 0 LINES 
(x, y, roam_time, origin_ap, dest_ap, duration, du_id,2);