use quid_gou;

#Create AP Table
#delimiter $$

CREATE TABLE IF NOT EXISTS `aps` (
  `mac` varchar(45) NOT NULL,
  `channel` int(11) default NULL,
  PRIMARY KEY  (`mac`),
  UNIQUE KEY `mac_UNIQUE` (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;#$$
#TRUNCATE aps;

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
#TRUNCATE roams;

#Create temp table
#delimiter $$

CREATE TABLE IF NOT EXISTS `ztemp` (
  `id` int(11) NOT NULL auto_increment,
  `du_id` int(11) default NULL,
  `collect_time` datetime default NULL,
  `x` int(11) default NULL,
  `y` int(11) default NULL,
  `rssi` float default NULL,
  `br` float default NULL,
  `ap` varchar(45) default NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6286812 DEFAULT CHARSET=latin1;#$$
#TRUNCATE ztemp;

#Create dataset table
#delimiter $$

CREATE TABLE IF NOT EXISTS `datasets` (
  `data_id` int(11) NOT NULL auto_increment,
  `name` varchar(45) default NULL,
  `logdate` datetime default NULL,
  PRIMARY KEY  (`data_id`),
  UNIQUE KEY `data_id_UNIQUE` (`data_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;#$$



#Create RSSI Table
#delimiter $$

CREATE TABLE IF NOT EXISTS `rssi` (
  `rssi_id` int(11) NOT NULL auto_increment,
  `x` int(11) NOT NULL default '0',
  `y` int(11) NOT NULL default '0',
  `ap_id` varchar(50) NOT NULL,
  `rssi_val` float NOT NULL default '50',
  `br_val` float NOT NULL default '50',
  `record_count` int(11) default '0',
  `dataset_id` int(11) default NULL,
  PRIMARY KEY  (`x`,`y`,`ap_id`),
  UNIQUE KEY `cell_id_UNIQUE` (`rssi_id`),
  KEY `fk_rssi_aps_idx` (`ap_id`),
  KEY `rssi_dataset_idx` (`dataset_id`),
  CONSTRAINT `rssi_dataset` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`data_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30540 DEFAULT CHARSET=latin1;#$$



#Load data into ztemp from log
LOAD DATA INFILE '/tmp/rssi_extracted/myRSSI.log' INTO TABLE ztemp 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n' STARTING BY ':'
IGNORE 0 LINES 
(@dummy, @dummy, @dummy, collect_time, x, y, ap, rssi, br, @dummy);

#populate dataset table
INSERT IGNORE INTO datasets (name,logdate) 
	VALUES ("Dataset1", NOW());
set @dataset = LAST_INSERT_ID();

#populate ap table
INSERT IGNORE INTO aps (mac,channel) 
	SELECT DISTINCT(ap),0 FROM ztemp;

#merge temp into rssi
INSERT IGNORE INTO rssi (x,y,ap_id,rssi_val, br_val,record_count, dataset_id) 
	SELECT t.x,t.y,t.ap,avg(t.rssi), avg(t.br), count(t.rssi),@dataset FROM ztemp t GROUP BY t.x, t.y, t.ap;

DROP TABLE ztemp;