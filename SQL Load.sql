use quid_gou;
#Create RSSI Table
#delimiter $$
CREATE TABLE IF NOT EXISTS`rssi` (
  `rssi_id` int(11) NOT NULL auto_increment,
  `x` int(11) NOT NULL default '0',
  `y` int(11) NOT NULL default '0',
  `ap_id` varchar(50) NOT NULL,
  `rssi_val` float NOT NULL default '50',
  `record_count` int(11) default '0',
  PRIMARY KEY  (`x`,`y`,`ap_id`),
  UNIQUE KEY `cell_id_UNIQUE` (`rssi_id`),
  KEY `fk_rssi_aps_idx` (`ap_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21850 DEFAULT CHARSET=latin1;#$$
TRUNCATE rssi;

#Create AP Table
#delimiter $$

CREATE TABLE IF NOT EXISTS `aps` (
  `mac` varchar(45) NOT NULL,
  `channel` int(11) default NULL,
  PRIMARY KEY  (`mac`),
  UNIQUE KEY `mac_UNIQUE` (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;#$$
TRUNCATE aps;

#Create Roams Table
#delimiter $$

CREATE TABLE IF NOT EXISTS `roams` (
  `roam_id` int(11) NOT NULL auto_increment,
  `roam_time` datetime NOT NULL,
  `du_id` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `duration` float default NULL,
  `origin_ap` int(11) default NULL,
  `dest_ap` int(11) default NULL,
  PRIMARY KEY  (`roam_time`,`du_id`),
  UNIQUE KEY `roam_id_UNIQUE` (`roam_id`),
  KEY `fk_roams_aps_idx` (`origin_ap`),
  KEY `fk_origin_aps_idx` (`origin_ap`),
  KEY `fk_dest_aps_idx` (`dest_ap`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;#$$
TRUNCATE roams;

#Create temp table
#delimiter $$

CREATE TABLE IF NOT EXISTS `ztemp` (
  `id` int(11) NOT NULL auto_increment,
  `du_id` int(11) default NULL,
  `collect_time` datetime default NULL,
  `x` int(11) default NULL,
  `y` int(11) default NULL,
  `rssi` int(11) default NULL,
  `ap` varchar(45) default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6286812 DEFAULT CHARSET=latin1;#$$
TRUNCATE ztemp;


#Load data into ztemp from log
LOAD DATA INFILE '/tmp/myMoves.log' INTO TABLE ztemp 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n' STARTING BY ':'
IGNORE 0 LINES 
(@dummy, @dummy, @dummy, collect_time, x, y, ap, rssi, @dummy, @dummy);


#populate ap table
INSERT IGNORE INTO aps (mac,channel) 
	SELECT DISTINCT(ap),5 FROM ztemp;

#merge temp into rssi
INSERT IGNORE INTO rssi (x,y,ap_id,rssi_val,record_count) 
	SELECT t.x,t.y,t.ap,avg(t.rssi), count(t.rssi) FROM ztemp t GROUP BY t.x, t.y, t.ap;