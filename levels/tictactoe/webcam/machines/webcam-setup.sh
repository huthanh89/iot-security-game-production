mkdir -p downloads
#wget "http://[[gc]]:[[gc_port]]/files?mission=Webcam&file=webcam.zip&machine=webcam" --content-disposition -O downloads/webcam.zip
wget "http://localhost:8080/files?mission=Webcam&file=webcam.zip&machine=webcam" --content-disposition -O downloads/webcam.zip
mkdir -p runtime/webcam
unzip -o downloads/webcam.zip -d runtime/webcam
cd runtime/webcam
nohup ./run.sh &
