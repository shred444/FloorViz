#Define variables
TARFILE="" #"efcrssi.tar.gz"
EXTRACTDIR="/tmp/rssi_extracted"
GREPFILE="myRSSI.log"
ROAMFILE="myRoams.log"
PYTHONSCRIPT="/tmp/extract_rssi_logs.py"
SITE="" #"amz_bfi1"
DATASET="DATASET3"
SQLFILE="/home/jcohn/sqlInit.sql"


function printUsage
{
    echo " Usage: $0 [-t <location of tar>] [-s <site name>] [driveID] ..."
    echo "      First argument specifies the info to retrieve"
    echo "      Any arguments relevant to the info follow"
    echo "      1 or more driveID may be specified (using the drive number digits)"
    echo "      If no driveID are specified, all active drives are polled"
    echo "      This script fetches from info from all drives in parallel, but limits"
    echo "      the number of parallel sub processes to argument of -maxFork (default $maxFork)"
    echo ""
    echo " Arguments for each info:"
    echo ""
    echo " VERSION: [GOOD|BAD|ALL] "
    echo "      GOOD - Only shows the drives that have the current release "
    
}

if [ $# -lt 1 ]; then
	printUsage;
	exit
fi


# Options:
while (( "$#" )); do

    if [ "$1" == 'BAD' -o "$1" == 'bad' -o "$1" == 'b' -o "$1" == 'B' ]; then
        SHOW_GOOD=0;
    elif [ "$1" == 'GOOD' -o "$1" == 'good' -o "$1" == 'g' -o "$1" == 'G' ]; then
        SHOW_BAD=0;
    elif [ "$1" == '-help' -o "$1" == 'h' -o "$1" == 'help' -o "$1" == 'h' ]; then
        printUsage
        exit
    elif [ $1 == '-s' ]; then
	#get site location for db
	shift
	SITE=$1;
	#echo " site=$SITE";
    elif [ `echo $1 | grep "^[0-9]*$"` ]; then
        DRIVES="$DRIVES $1"
    elif [ "$1" == "-maxFork" -a $# -gt 1 ]; then
        shift
        maxFork=$1
    elif [ $1 == '-t' ]; then
	#get tar ball location
        shift
        TARFILE=$1
	if ! [ -f "$TARFILE" ]; then
		echo "ERROR: tar file = $TARFILE  <DOES NOT EXIST>"
		exit
	fi
    fi
    shift
done


#check all arguements before continuing
if [ "$SITE" == "" -o "$TARFILE" == "" ]; then
	echo "ERROR: Missing arguement"
	printUsage;
	exit
fi

#Display all variables
echo "--- Variables ---"
echo "	SITE = $SITE"
echo "	TARFILE = $TARFILE"



#Perform unarchiving
cd /tmp

#setup mysql
MYSQL=`echo mysql -h hwtest -u jonathan -padmin`

#remove extract folder
echo "Removing old data"
rm $EXTRACTDIR -f -r

#create extracted folder
mkdir $EXTRACTDIR
echo "$EXTRACTDIR Created"

#copy tar to extracted folder
cp $TARFILE $EXTRACTDIR

#move into folder
cd $EXTRACTDIR

#untar file
tar -xzvf $TARFILE
echo "Untar Complete"

#unarchive all drives
python $PYTHONSCRIPT -s $EXTRACTDIR -l $EXTRACTDIR
echo "Drive Unarchive Complete"

#grep 'OK'
grep -r --include "rssi.log.*" --exclude "my*" "OK" . > $GREPFILE
echo "OKs Grep Complete"

#grep 'Roam'
grep -r --include "rssi.log.*" --exclude "my*" "Roam" . > $ROAMFILE
echo "Roams Grep Complete"


#Select database and run sql script
echo "use $SITE; source $SQLFILE;" | $MYSQL

echo "script complete";
