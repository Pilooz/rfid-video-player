#!/usr/bin/env python

import serial, time, json
from MediaAssoc import MediaAssoc

# Loading media database
videoDB = json.load(open('data/videolist.json'))

# Init of the mediaAssoc Class
media = MediaAssoc(videoDB, "./videos")

# initialization and open the serial port
ser = serial.Serial()
ser.port =  "/dev/ttyACM0" # "/dev/ttyACM0" #"/dev/ttyAMA0" #"/dev/ttyS0"
ser.baudrate = 115200

# To know on which reader was read the last tag
lastReader = ""

#-----------------------------------------------------------------------------
# Extract_tag : Verifying tag format, and extracting value
#               <TAG:xxxxxxxxxx>
#-----------------------------------------------------------------------------
def extract_tag(line):
  patterns = ["<TAG:", ">"]
  # See if enclosure is correct and return tag
  if (line.find(patterns[0]) == 0 and line.find(patterns[1]) > -1):
    return line.split(patterns[0], 1)[1].split(patterns[1])[0]
  return None

#-----------------------------------------------------------------------------
# extract_reader : Verifying reader format, and extracting value
#               <READER:xx>
#-----------------------------------------------------------------------------
def extract_reader(line):
  patterns = ["<READER:", ">"]
  # See if enclosure is correct and return tag
  if (line.find(patterns[0]) > 0 and line.find(patterns[1]) > -1):
    return line.split(patterns[0], 1)[1].split(patterns[1])[0]
  return None

#-----------------------------------------------------------------------------
# Displaying some JSON string in console to help in configuring 
# media <-> tag association
#-----------------------------------------------------------------------------
def displaysCoeInConsole(tag):
  print ""
  print "=========================================================="
  print "This tag is not associated with a video..."
  print "Please edit data/videolist.json and add an association : "
  print ""
  print "{"
  print ("  \"tag\": [\"{}\"]".format(tag))
  print "  \"media\": \"videos/myNewVideo.mp4\""
  print "},"
  print "=========================================================="
  print ""    


##############################################################################
#   M A I N 
##############################################################################
try: 
  ser.open()
except Exception, e:
  print "error open serial port: " + str(e)
  exit()

if ser.isOpen():

  try:
      ser.flushInput() #flush input buffer, discarding all its contents
      ser.flushOutput()#flush output buffer, aborting current output 

      print("Serial intialized : {}, at {} bds." .format(ser.port, ser.baudrate))
      print "Waiting for tags..." 
      
      while True:
        try:
          response = ""
          tag = ""
          reader = ""
          okForPlayingMedia = False 

          # Waiting for Serial inputs (some tags!)
          response = ser.readline()
          print(response)

          # Analysing message
          tag = extract_tag(response)
          reader = extract_reader(response)
          print("Tag {} on reader #{}" . format(tag, reader))

          # 1. if tag is not NONE, seek media database to see if a meddia is associated
          if (tag != None):
            # See if we have to stop precendent media.
            if(media.isPlaying()):
              print "A video is allready playing, cleaning up..." 
              media.stop()

            # Complex scenario that needs 2 tags
            if (media.needWaiting(tag)):
              # Second Tag on second reader
              if(lastReader != reader and lastReader != ""):
                # Ok for this combination of two tags : play media
                lastReader = ""
                okForPlayingMedia = True
              else:  
                print "Tag combination ! Waiting for another tag..."
                lastReader = reader

            else:
              okForPlayingMedia = True

            # Playing media now
            if (okForPlayingMedia):
              mediaFile = media.getFile(tag)
              if ( mediaFile != None ):
                # 1.1. Media Found
                print("Playing '{}'...".format(mediaFile))
                media.play(mediaFile)
              else:
                # 1.2. Media not found
                media.displayError("noTagAssociation")
                # Print error in console
                displaysCoeInConsole(tag)

          else:
            # Tag has not been sent correctly... Don't care...
            print "Tag has not been sent correctly... Don't care..."


        except KeyboardInterrupt:
          ser.close()
          print "\nBye bye... Get in touch !"
          break

      ser.close()
  except Exception, e1:
    print "Fatal error : " + str(e1)

else:
  print "cannot open serial port "

