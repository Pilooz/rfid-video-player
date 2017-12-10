#!/usr/bin/python

import serial, time, json
from MediaAssoc import MediaAssoc

# Loading media database
videoDB = json.load(open('data/videolist.json'))

# Init of the mediaAssoc Class
db = MediaAssoc(videoDB)

# initialization and open the serial port
ser = serial.Serial()
ser.port = "/dev/ttyACM0"
ser.baudrate = 115200

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

def extract_reader(line):
  patterns = ["<READER:", ">"]
  # See if enclosure is correct and return tag
  if (line.find(patterns[0]) > 0 and line.find(patterns[1]) > -1):
    return line.split(patterns[0], 1)[1].split(patterns[1])[0]
  return None
  

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
      print("Waiting for tags...")
      
      while True:
        try:
          response = ""
          tag = ""
          reader = ""

          # Waiting for Serial inputs (some tags!)
          response = ser.readline()

          # Analysing message
          tag = extract_tag(response)
          reader = extract_reader(response)
          print("Tag {} on reader #{}" . format(tag, reader))

          # 1. if tag is not NONE, seek media database to see if a meddia is associated
          if (tag != None):
            if (db.needWaiting(tag)):
              print("Waiting for another tag bites the dust...")
            else:
              media = db.getFile(tag)
              print("------------> {}".format(media))
              if ( media != None ):
                # 1.1. Media Found
                print(media)
              else:
                # 1.2. Media not found
                print("No media associated ! ")

                # 2. See if we need to wait for another tag
                  # 2.1. No need to wait : print the TagId and say we have to add media
                  # 2.2. waiting for another tag, so say it with a little message


          else:
            # Tag has not been sent correctly... Don't care...
            print("Tag has not been sent correctly... Don't care...")


        except KeyboardInterrupt:
          ser.close()
          print "\nBye bye... Get in touch !"
          break

      ser.close()
  except Exception, e1:
    print "error communicating...: " + str(e1)

else:
  print "cannot open serial port "

