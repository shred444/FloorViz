<?php
class php_query {

/* Member functions and variables go here */
	var $query;
	var $result;
	var $starttime, $endtime, $duration;
	var $fieldCount, $rowCount;
	var $JSON_data = array();
	
	function convertToJSON(){
		//json encoding
		mysql_data_seek( $this->result, 0);
		$json_temp = array();
		while($r = mysql_fetch_assoc($this->result)) {
			$json_temp[] = $r;
		}
		$this->JSON_data = $json_temp;
		return $json_temp;
	}
	
	function runQuery($queryString){
		
		global $debug;
		//$myQuery = new php_query;
		$this->query = $queryString;
		$this->starttime = microtime(true);
		$this->result = mysql_query($queryString);
		$this->endtime = microtime(true);
		$this->duration = $this->endtime - $this->starttime;
		$this->fieldCount = mysql_num_fields($this->result);
		$this->rowCount = mysql_num_rows($this->result);
		
		//output if debug is enabled
		if($debug){
			echo "<b>Query</b>";
			echo "<br>Query: " . $this->query;
			echo "<br>Total Fields: " . $this->fieldCount;
			echo "<br>Total Rows: " . $this->rowCount;
			echo "<br>Duration: " . number_format($this->duration, 2) . " ms";
			echo "<br>";
		}
		
		//convert the sql response to JSON
		$this->convertToJSON();
		
		return $this;
	}
	
	
	
}
?>