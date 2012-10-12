<?php
class php_query {

/* Member functions and variables go here */
	var $query;
	var $result;
	var $starttime, $endtime, $queryDuration, $totalDuration;
	var $fieldCount, $rowCount;
	var $JSON_data = array();
	
	function convertToJSON(){
		//json encoding
		$json_temp = array();
		
		//only do this if there is at least one row in the results
		if($this->rowCount>0){
			mysql_data_seek( $this->result, 0);
			
			while($r = mysql_fetch_assoc($this->result)) {
				$json_temp[] = $r;
			}
			$this->JSON_data = $json_temp;
		}
		return $json_temp;
	}
	
	function runQuery($queryString){
		
		global $debug;
		//$myQuery = new php_query;
		$this->query = $queryString;
		$this->starttime = microtime(true);
		//$this->result = mysql_unbuffered_query($queryString);
		$this->result = mysql_query($queryString);
		$this->endtime = microtime(true);
		$this->queryDuration = $this->endtime - $this->starttime;
		$this->fieldCount = mysql_num_fields($this->result);
		$this->rowCount = mysql_num_rows($this->result);
				
		//convert the sql response to JSON
		$this->convertToJSON();
		$this->endtime = microtime(true);
		$this->totalDuration = $this->endtime - $this->starttime; 
				
		//output if debug is enabled
		if($debug){
			echo "<b>Query</b>";
			echo "<br>Query: " . $this->query;
			echo "<br>Total Fields: " . $this->fieldCount;
			echo "<br>Total Rows: " . $this->rowCount;
			echo "<br>Query Duration: " . number_format($this->queryDuration, 2) . " sec";
			echo "<br>Total Duration: " . number_format($this->totalDuration, 2) . " sec";
			echo "<br>";
		}
		
		return $this;
	}
	
	function createJSVar($varName){
		
		global $debug;
		echo "<script>{$varName} = " . json_encode($this->JSON_data) . ";</script>";
		
		return $this;
	}
	
	
}
?>