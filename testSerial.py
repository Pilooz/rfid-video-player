#!/usr/bin/python

import serial, time, json

# Loading media database
videoDB = json.load(open('data/videolist.json'))

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
  return "NONE"

def extract_reader(line):
  patterns = ["<READER:", ">"]
  # See if enclosure is correct and return tag
  if (line.find(patterns[0]) > 0 and line.find(patterns[1]) > -1):
    return line.split(patterns[0], 1)[1].split(patterns[1])[0]
  return "NONE"

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
          #
          # Waiting for Serial inputs (some tags!)
          #
          response = ser.readline()
          # Analysing message
          tag = extract_tag(response)
          reader = extract_reader(response)
          print("Tag {} on reader #{}" . format(tag, reader))

          #
          # Seeking in media database
          #
#          if (media.select()):
#            media.play()
#          else:
            # no media associated, saying it should !

          #
          # 
          #
        except KeyboardInterrupt:
          ser.close()
          print "\nBye bye... Get in touch !"
          break

      ser.close()
  except Exception, e1:
    print "error communicating...: " + str(e1)

else:
  print "cannot open serial port "

