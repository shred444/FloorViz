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
        TAR_FILE=$1
	if ! [ -f "$TAR_FILE" ]; then
		echo "ERROR: tar file = $TAR_FILE  <DOES NOT EXIST>"
		exit
	fi
    fi
    shift
done

if [ "$SITE" == "" -o "$TAR_FILE" == "" ]; then
	echo "ERROR: Missing arguement"
	printUsage;
	exit
fi

